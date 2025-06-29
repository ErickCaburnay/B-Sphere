import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';

// Helper function to clean contact number
const cleanContactNumber = (contactNumber) => {
  if (!contactNumber) return null;
  const cleaned = contactNumber.toString().replace(/\D/g, '');
  return cleaned.length === 11 && cleaned.startsWith('09') ? cleaned : null;
};

// Helper function to parse boolean values
const parseBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    return lower === 'yes' || lower === 'true' || lower === '1';
  }
  return false;
};

// Helper function to validate date
const parseDate = (dateValue) => {
  if (!dateValue) return null;
  
  let date;
  if (dateValue instanceof Date) {
    date = dateValue;
  } else if (typeof dateValue === 'string') {
    date = new Date(dateValue);
  } else if (typeof dateValue === 'number') {
    // Excel serial date
    date = new Date((dateValue - 25569) * 86400 * 1000);
  } else {
    return null;
  }
  
  return isNaN(date.getTime()) ? null : date;
};

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json({ error: 'Please upload an Excel file (.xlsx or .xls)' }, { status: 400 });
    }

    // Read the Excel file
    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    // Get the first worksheet (should be the template)
    const worksheet = workbook.getWorksheet(1) || workbook.getWorksheet('Residents Template');
    
    if (!worksheet) {
      return NextResponse.json({ error: 'Invalid Excel file format' }, { status: 400 });
    }

    const residents = [];
    const errors = [];
    
    // Get the latest resident to determine the next ID
    const latestResident = await prisma.resident.findFirst({ 
      orderBy: { id: 'desc' } 
    });
    let lastNumber = latestResident ? parseInt(latestResident.id.split('-')[1]) : 0;

    // Process each row (skip header row)
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header
      if (rowNumber === 2 && row.getCell(1).value === 'JUAN') return; // Skip sample row
      
      // Check if row is empty
      const isEmpty = row.values.slice(1).every(cell => !cell || cell.toString().trim() === '');
      if (isEmpty) return;

      try {
        const firstName = row.getCell(1).value?.toString().trim().toUpperCase();
        const middleName = row.getCell(2).value?.toString().trim().toUpperCase() || null;
        const lastName = row.getCell(3).value?.toString().trim().toUpperCase();
        const suffix = row.getCell(4).value?.toString().trim().toUpperCase() || null;
        const birthdate = parseDate(row.getCell(5).value);
        const birthplace = row.getCell(6).value?.toString().trim().toUpperCase() || null;
        const address = row.getCell(7).value?.toString().trim().toUpperCase();
        const citizenship = row.getCell(8).value?.toString().trim().toUpperCase();
        const gender = row.getCell(9).value?.toString().trim();
        const maritalStatus = row.getCell(10).value?.toString().trim();
        const voterStatus = row.getCell(11).value?.toString().trim() || null;
        const educationalAttainment = row.getCell(12).value?.toString().trim() || null;
        const employmentStatus = row.getCell(13).value?.toString().trim() || null;
        const occupation = row.getCell(14).value?.toString().trim().toUpperCase() || null;
        const contactNumber = cleanContactNumber(row.getCell(15).value);
        const email = row.getCell(16).value?.toString().trim() || null;
        const isTUPAD = parseBoolean(row.getCell(17).value);
        const isPWD = parseBoolean(row.getCell(18).value);
        const is4Ps = parseBoolean(row.getCell(19).value);
        const isSoloParent = parseBoolean(row.getCell(20).value);

        // Validate required fields
        if (!firstName || !lastName || !birthdate || !address || !citizenship || !gender || !maritalStatus) {
          errors.push(`Row ${rowNumber}: Missing required fields`);
          return;
        }

        // Validate gender
        if (!['Male', 'Female'].includes(gender)) {
          errors.push(`Row ${rowNumber}: Gender must be 'Male' or 'Female'`);
          return;
        }

        // Validate marital status
        if (!['Single', 'Married', 'Widowed', 'Divorced'].includes(maritalStatus)) {
          errors.push(`Row ${rowNumber}: Invalid marital status`);
          return;
        }

        // Validate email format if provided
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          errors.push(`Row ${rowNumber}: Invalid email format`);
          return;
        }

        // Validate contact number format if provided
        if (contactNumber && (!/^09\d{9}$/.test(contactNumber))) {
          errors.push(`Row ${rowNumber}: Contact number must be 11 digits starting with 09`);
          return;
        }

        // Validate birthplace format if provided
        if (birthplace && !/^[A-Z\s]+,\s*[A-Z\s]+$/i.test(birthplace)) {
          errors.push(`Row ${rowNumber}: Birthplace must follow format "MUNICIPALITY/CITY, PROVINCE" (e.g., DASMARINAS, CAVITE)`);
          return;
        }

        // Generate new ID
        lastNumber++;
        const newId = `SF-${String(lastNumber).padStart(5, '0')}`;

        residents.push({
          id: newId,
          firstName,
          middleName,
          lastName,
          suffix,
          birthdate,
          birthplace,
          address,
          citizenship,
          gender,
          maritalStatus,
          voterStatus,
          educationalAttainment,
          employmentStatus,
          occupation,
          contactNumber,
          email,
          isTUPAD,
          isPWD,
          is4Ps,
          isSoloParent
        });

      } catch (error) {
        errors.push(`Row ${rowNumber}: ${error.message}`);
      }
    });

    // If there are validation errors, return them
    if (errors.length > 0) {
      return NextResponse.json({ 
        error: 'Validation errors found', 
        details: errors,
        processed: 0,
        total: residents.length + errors.length
      }, { status: 400 });
    }

    // If no residents to process
    if (residents.length === 0) {
      return NextResponse.json({ 
        error: 'No valid resident data found in the file' 
      }, { status: 400 });
    }

    // Batch insert residents
    const createdResidents = await prisma.$transaction(
      residents.map(resident => 
        prisma.resident.create({ data: resident })
      )
    );

    return NextResponse.json({
      message: 'Batch upload successful',
      processed: createdResidents.length,
      total: residents.length,
      residents: createdResidents
    });

  } catch (error) {
    console.error('Batch upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to process batch upload',
      details: error.message 
    }, { status: 500 });
  }
} 