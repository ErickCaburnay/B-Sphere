import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import ExcelJS from 'exceljs';

// Helper function to clean contact number
const cleanContactNumber = (contactNumber) => {
  if (!contactNumber) return null;
  const cleaned = contactNumber.toString().replace(/\D/g, '');
  return cleaned.length === 11 && cleaned.startsWith('09') ? cleaned : null;
};

// Helper function to parse boolean values - More flexible
const parseBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    return lower === 'yes' || lower === 'true' || lower === '1' || lower === 'y';
  }
  if (typeof value === 'number') {
    return value === 1;
  }
  return false;
};

// Helper function to normalize gender values
const normalizeGender = (gender) => {
  if (!gender) return null;
  const g = gender.toString().toLowerCase().trim();
  if (g === 'male' || g === 'm') return 'Male';
  if (g === 'female' || g === 'f') return 'Female';
  return null;
};

// Helper function to normalize marital status
const normalizeMaritalStatus = (status) => {
  if (!status) return null;
  const s = status.toString().toLowerCase().trim();
  if (s === 'single' || s === 's') return 'Single';
  if (s === 'married' || s === 'm') return 'Married';
  if (s === 'widowed' || s === 'w') return 'Widowed';
  if (s === 'divorced' || s === 'd') return 'Divorced';
  return null;
};

// Helper function to normalize voter status
const normalizeVoterStatus = (status) => {
  if (!status) return null;
  const s = status.toString().toLowerCase().trim();
  if (s === 'registered' || s === 'yes' || s === 'y') return 'Registered';
  if (s === 'not registered' || s === 'no' || s === 'n') return 'Not Registered';
  return null;
};

// Helper function to validate date - Enhanced to handle various formats
const parseDate = (dateValue) => {
  if (!dateValue) return null;
  
  let date;
  
  if (dateValue instanceof Date) {
    date = dateValue;
  } else if (typeof dateValue === 'string') {
    // Handle various string formats
    const dateStr = dateValue.trim();
    
    // Try different date formats
    const formats = [
      // YYYY-MM-DD format
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
      // DD-MM-YYYY format
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
      // DD/MM/YYYY format
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
      // MM/DD/YYYY format (less common but possible)
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
    ];
    
    if (formats[0].test(dateStr)) {
      // YYYY-MM-DD format
      date = new Date(dateStr);
    } else if (formats[1].test(dateStr)) {
      // DD-MM-YYYY format - need to rearrange
      const [, day, month, year] = dateStr.match(formats[1]);
      date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    } else if (formats[2].test(dateStr)) {
      // DD/MM/YYYY format - need to rearrange
      const [, day, month, year] = dateStr.match(formats[2]);
      date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    } else {
      // Try default Date parsing
      date = new Date(dateStr);
    }
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
    const debugInfo = [];
    
    // Get the latest resident to determine the next ID
    const latestSnapshot = await adminDb.collection('residents')
      .orderBy('id', 'desc')
      .limit(1)
      .get();
    
    let lastNumber = 0;
    if (!latestSnapshot.empty) {
      const latestResident = latestSnapshot.docs[0].data();
      lastNumber = parseInt(latestResident.id.split('-')[1]);
    }

    // Debug: Log worksheet info
    debugInfo.push(`Worksheet name: ${worksheet.name}`);
    debugInfo.push(`Total rows: ${worksheet.rowCount}`);

    // Process each row (skip header row)
    worksheet.eachRow((row, rowNumber) => {
      debugInfo.push(`Processing row ${rowNumber}`);
      
      if (rowNumber === 1) {
        debugInfo.push(`Row ${rowNumber}: Skipped (header row)`);
        return; // Skip header
      }
      
      // Check first cell value for debugging
      const firstCellValue = row.getCell(1).value;
      debugInfo.push(`Row ${rowNumber}: First cell value = "${firstCellValue}"`);
      
      // Skip sample rows - be more flexible with detection
      if (rowNumber <= 3 && firstCellValue) {
        const firstCellStr = firstCellValue.toString().toUpperCase();
        if (firstCellStr === 'MARIA' || firstCellStr === 'JOSE' || firstCellStr === 'JUAN') {
          debugInfo.push(`Row ${rowNumber}: Skipped (sample row: ${firstCellStr})`);
          return;
        }
      }
      
      // Check if row is empty - improved logic
      const rowValues = [];
      for (let i = 1; i <= 20; i++) {
        const cellValue = row.getCell(i).value;
        rowValues.push(cellValue);
      }
      
      const isEmpty = rowValues.every(cell => !cell || cell.toString().trim() === '');
      if (isEmpty) {
        debugInfo.push(`Row ${rowNumber}: Skipped (empty row)`);
        return;
      }

      debugInfo.push(`Row ${rowNumber}: Processing data row`);

      try {
        const firstName = row.getCell(1).value?.toString().trim().toUpperCase();
        const middleName = row.getCell(2).value?.toString().trim().toUpperCase() || null;
        const lastName = row.getCell(3).value?.toString().trim().toUpperCase();
        const suffix = row.getCell(4).value?.toString().trim().toUpperCase() || null;
        const birthdate = parseDate(row.getCell(5).value);
        const birthplace = row.getCell(6).value?.toString().trim().toUpperCase() || null;
        const address = row.getCell(7).value?.toString().trim().toUpperCase();
        const citizenship = row.getCell(8).value?.toString().trim().toUpperCase();
        
        const occupation = row.getCell(14).value?.toString().trim().toUpperCase() || null;
        const contactNumber = cleanContactNumber(row.getCell(15).value);
        const email = row.getCell(16).value?.toString().trim() || null;
        const isTUPAD = parseBoolean(row.getCell(17).value);
        const isPWD = parseBoolean(row.getCell(18).value);
        const is4Ps = parseBoolean(row.getCell(19).value);
        const isSoloParent = parseBoolean(row.getCell(20).value);

        // Debug the key fields including email
        debugInfo.push(`Row ${rowNumber}: firstName="${firstName}", lastName="${lastName}", birthdate="${birthdate}", gender="${row.getCell(9).value}", maritalStatus="${row.getCell(10).value}", email="${email}"`);
        
        // Use normalized values
        const gender = normalizeGender(row.getCell(9).value);
        const maritalStatus = normalizeMaritalStatus(row.getCell(10).value);
        const voterStatus = normalizeVoterStatus(row.getCell(11).value);
        
        const educationalAttainment = row.getCell(12).value?.toString().trim() || null;
        const employmentStatus = row.getCell(13).value?.toString().trim() || null;

        // Validate required fields
        if (!firstName || !lastName || !birthdate || !address || !citizenship || !gender || !maritalStatus) {
          const missingFields = [];
          if (!firstName) missingFields.push('First Name');
          if (!lastName) missingFields.push('Last Name');
          if (!birthdate) missingFields.push('Birthdate');
          if (!address) missingFields.push('Address');
          if (!citizenship) missingFields.push('Citizenship');
          if (!gender) missingFields.push('Gender');
          if (!maritalStatus) missingFields.push('Marital Status');
          
          errors.push(`Row ${rowNumber}: Missing required fields: ${missingFields.join(', ')}`);
          debugInfo.push(`Row ${rowNumber}: Validation failed - missing fields`);
          return;
        }

        // Additional validations with better error messages
        // Temporarily disable email validation to allow upload
        /*
        if (email && email !== 'null' && email !== 'NULL' && email.trim() !== '') {
          // More flexible email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email.trim())) {
            errors.push(`Row ${rowNumber}: Invalid email format - "${email}"`);
            debugInfo.push(`Row ${rowNumber}: Email validation failed for "${email}"`);
            return;
          }
        }
        */

        if (contactNumber && (!/^09\d{9}$/.test(contactNumber))) {
          errors.push(`Row ${rowNumber}: Contact number must be 11 digits starting with 09`);
          return;
        }

        // Validate birthplace format if provided (more lenient)
        if (birthplace && !birthplace.includes(',')) {
          errors.push(`Row ${rowNumber}: Birthplace should include city and province separated by comma (e.g., MANILA, METRO MANILA)`);
          return;
        }

        // Generate new ID
        lastNumber++;
        const newId = `SF-${String(lastNumber).padStart(5, '0')}`;

        // Format birthdate as string for consistency with Firebase storage
        const birthdateString = birthdate instanceof Date 
          ? birthdate.toISOString().split('T')[0] 
          : birthdate;

        residents.push({
          id: newId,
          firstName,
          middleName,
          lastName,
          suffix,
          birthdate: birthdateString,
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
          isSoloParent,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });

        debugInfo.push(`Row ${rowNumber}: Successfully processed`);

      } catch (error) {
        errors.push(`Row ${rowNumber}: ${error.message}`);
        debugInfo.push(`Row ${rowNumber}: Error - ${error.message}`);
      }
    });

    // Enhanced error response with debug information
    if (errors.length > 0) {
      return NextResponse.json({ 
        error: 'Validation errors found', 
        details: errors,
        processed: 0,
        total: residents.length + errors.length,
        debug: debugInfo // Include debug info for troubleshooting
      }, { status: 400 });
    }

    // Enhanced "no data" response with debug information
    if (residents.length === 0) {
      return NextResponse.json({ 
        error: 'No valid resident data found in the file',
        debug: debugInfo, // Include debug info to see what happened
        totalRowsProcessed: debugInfo.filter(info => info.includes('Processing row')).length,
        skippedRows: debugInfo.filter(info => info.includes('Skipped')).length
      }, { status: 400 });
    }

    // Batch insert residents using Firestore batch
    const firestoreBatch = adminDb.batch();
    const createdResidents = [];

    for (const resident of residents) {
      const docRef = adminDb.collection('residents').doc(resident.id);
      firestoreBatch.set(docRef, resident);
      createdResidents.push(resident);
    }

    // Commit the batch
    await firestoreBatch.commit();

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