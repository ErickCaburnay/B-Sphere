import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

export async function GET() {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Residents Template');

    // Define columns based on Resident model
    worksheet.columns = [
      { header: 'First Name*', key: 'firstName', width: 20 },
      { header: 'Middle Name', key: 'middleName', width: 20 },
      { header: 'Last Name*', key: 'lastName', width: 20 },
      { header: 'Suffix', key: 'suffix', width: 10 },
      { header: 'Birthdate* (YYYY-MM-DD)', key: 'birthdate', width: 20 },
      { header: 'Birthplace (CITY, PROVINCE)', key: 'birthplace', width: 30 },
      { header: 'Address*', key: 'address', width: 40 },
      { header: 'Citizenship*', key: 'citizenship', width: 15 },
      { header: 'Gender*', key: 'gender', width: 15 },
      { header: 'Marital Status*', key: 'maritalStatus', width: 25 },
      { header: 'Voter Status', key: 'voterStatus', width: 20 },
      { header: 'Educational Attainment', key: 'educationalAttainment', width: 25 },
      { header: 'Employment Status', key: 'employmentStatus', width: 20 },
      { header: 'Occupation', key: 'occupation', width: 20 },
      { header: 'Contact Number', key: 'contactNumber', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'TUPAD', key: 'isTUPAD', width: 15 },
      { header: 'PWD', key: 'isPWD', width: 15 },
      { header: '4Ps', key: 'is4Ps', width: 15 },
      { header: 'Solo Parent', key: 'isSoloParent', width: 15 }
    ];

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4472C4' }
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

    // Format the birthdate column (Column E - 5) to ensure YYYY-MM-DD format
    worksheet.getColumn(5).numFmt = 'yyyy-mm-dd';
    worksheet.getColumn(5).eachCell({ includeEmpty: true }, (cell, rowNumber) => {
      if (rowNumber > 1) {
        cell.numFmt = 'yyyy-mm-dd';
        cell.dataValidation = {
          type: 'date',
          allowBlank: false,
          formulae: [new Date('1900-01-01'), new Date()],
          showErrorMessage: true,
          errorStyle: 'warning',
          errorTitle: 'Invalid Date',
          error: 'Please enter a valid date. Format will auto-convert to YYYY-MM-DD'
        };
      }
    });

    // Add data validation for Gender (Column I - 9) - More flexible validation
    worksheet.getColumn(9).eachCell({ includeEmpty: true }, (cell, rowNumber) => {
      if (rowNumber > 1) {
        cell.dataValidation = {
          type: 'list',
          allowBlank: false,
          formulae: ['"Male,Female,M,F"'],
          showErrorMessage: true,
          errorStyle: 'warning',
          errorTitle: 'Gender Validation',
          error: 'Please use: Male, Female, M, or F'
        };
      }
    });

    // Add data validation for Marital Status (Column J - 10) - More flexible
    worksheet.getColumn(10).eachCell({ includeEmpty: true }, (cell, rowNumber) => {
      if (rowNumber > 1) {
        cell.dataValidation = {
          type: 'list',
          allowBlank: false,
          formulae: ['"Single,Married,Widowed,Divorced,S,M,W,D"'],
          showErrorMessage: true,
          errorStyle: 'warning',
          errorTitle: 'Marital Status Validation',
          error: 'Please use: Single, Married, Widowed, Divorced (or S, M, W, D)'
        };
      }
    });

    // Add data validation for Voter Status (Column K - 11)
    worksheet.getColumn(11).eachCell({ includeEmpty: true }, (cell, rowNumber) => {
      if (rowNumber > 1) {
        cell.dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: ['"Registered,Not Registered,Yes,No,Y,N"'],
          showErrorMessage: true,
          errorStyle: 'warning',
          errorTitle: 'Voter Status',
          error: 'Please use: Registered, Not Registered, Yes, No, Y, or N'
        };
      }
    });

    // Educational Attainment validation (Column L - 12)
    worksheet.getColumn(12).eachCell({ includeEmpty: true }, (cell, rowNumber) => {
      if (rowNumber > 1) {
        cell.dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: ['"No Formal Education,Elementary,Elementary Graduate,High School,High School Graduate,Vocational,College,College Graduate,Post Graduate"'],
          showErrorMessage: true,
          errorStyle: 'warning',
          errorTitle: 'Educational Attainment',
          error: 'Please select a valid educational level'
        };
      }
    });

    // Employment Status validation (Column M - 13)
    worksheet.getColumn(13).eachCell({ includeEmpty: true }, (cell, rowNumber) => {
      if (rowNumber > 1) {
        cell.dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: ['"Employed,Unemployed,Self-Employed,Student,Retired,OFW,Housewife/Househusband"'],
          showErrorMessage: true,
          errorStyle: 'warning',
          errorTitle: 'Employment Status',
          error: 'Please select a valid employment status'
        };
      }
    });

    // Yes/No validation for TUPAD (Column Q - 17) - More flexible
    worksheet.getColumn(17).eachCell({ includeEmpty: true }, (cell, rowNumber) => {
      if (rowNumber > 1) {
        cell.dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: ['"Yes,No,Y,N,True,False,1,0"'],
          showErrorMessage: true,
          errorStyle: 'warning',
          errorTitle: 'TUPAD Status',
          error: 'Please use: Yes, No, Y, N, True, False, 1, or 0'
        };
      }
    });

    // Yes/No validation for PWD (Column R - 18) - More flexible
    worksheet.getColumn(18).eachCell({ includeEmpty: true }, (cell, rowNumber) => {
      if (rowNumber > 1) {
        cell.dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: ['"Yes,No,Y,N,True,False,1,0"'],
          showErrorMessage: true,
          errorStyle: 'warning',
          errorTitle: 'PWD Status',
          error: 'Please use: Yes, No, Y, N, True, False, 1, or 0'
        };
      }
    });

    // Yes/No validation for 4Ps (Column S - 19) - More flexible
    worksheet.getColumn(19).eachCell({ includeEmpty: true }, (cell, rowNumber) => {
      if (rowNumber > 1) {
        cell.dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: ['"Yes,No,Y,N,True,False,1,0"'],
          showErrorMessage: true,
          errorStyle: 'warning',
          errorTitle: '4Ps Status',
          error: 'Please use: Yes, No, Y, N, True, False, 1, or 0'
        };
      }
    });

    // Yes/No validation for Solo Parent (Column T - 20) - More flexible
    worksheet.getColumn(20).eachCell({ includeEmpty: true }, (cell, rowNumber) => {
      if (rowNumber > 1) {
        cell.dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: ['"Yes,No,Y,N,True,False,1,0"'],
          showErrorMessage: true,
          errorStyle: 'warning',
          errorTitle: 'Solo Parent Status',
          error: 'Please use: Yes, No, Y, N, True, False, 1, or 0'
        };
      }
    });

    // Add multiple sample data rows to show different formats
    worksheet.addRow({
      firstName: 'MARIA',
      middleName: 'SANTOS',
      lastName: 'GARCIA',
      suffix: '',
      birthdate: '1985-03-22',
      birthplace: 'MANILA, METRO MANILA',
      address: '456 OAK STREET, BARANGAY SAMPLE',
      citizenship: 'FILIPINO',
      gender: 'Female',
      maritalStatus: 'Single',
      voterStatus: 'Registered',
      educationalAttainment: 'High School Graduate',
      employmentStatus: 'Employed',
      occupation: 'NURSE',
      contactNumber: '09987654321',
      email: 'maria.garcia@email.com',
      isTUPAD: 'No',
      isPWD: 'No',
      is4Ps: 'Yes',
      isSoloParent: 'Yes'
    });

    worksheet.addRow({
      firstName: 'JOSE',
      middleName: 'RIZAL',
      lastName: 'MERCADO',
      suffix: 'SR',
      birthdate: '1975-12-10',
      birthplace: 'CALAMBA, LAGUNA',
      address: '789 PINE AVENUE, BARANGAY SAMPLE',
      citizenship: 'FILIPINO',
      gender: 'M',
      maritalStatus: 'M',
      voterStatus: 'Y',
      educationalAttainment: 'College Graduate',
      employmentStatus: 'Self-Employed',
      occupation: 'BUSINESSMAN',
      contactNumber: '09123456789',
      email: 'jose.mercado@email.com',
      isTUPAD: 'N',
      isPWD: 'Y',
      is4Ps: 'N',
      isSoloParent: 'N'
    });

    // Style the sample rows
    const sampleRow1 = worksheet.getRow(2);
    const sampleRow2 = worksheet.getRow(3);
    
    [sampleRow1, sampleRow2].forEach(row => {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'E7E6E6' }
      };
    });

    // Add instructions in a separate worksheet
    const instructionsSheet = workbook.addWorksheet('Instructions');
    instructionsSheet.columns = [
      { header: 'BATCH UPLOAD INSTRUCTIONS', width: 100 }
    ];

    const instructions = [
      '',
      'IMPORTANT: Please read these instructions carefully before filling the template.',
      '',
      '=== REQUIRED FIELDS (marked with *) ===',
      '• First Name - Enter full first name in UPPERCASE',
      '• Last Name - Enter full last name in UPPERCASE', 
      '• Birthdate - Use YYYY-MM-DD format (Excel may auto-format, that\'s OK)',
      '• Address - Full address in UPPERCASE',
      '• Citizenship - Usually FILIPINO',
      '• Gender - Use: Male, Female, M, or F (case insensitive)',
      '• Marital Status - Use: Single, Married, Widowed, Divorced (case insensitive)',
      '',
      '=== OPTIONAL FIELDS ===',
      '• Middle Name - Can be left blank',
      '• Suffix - Jr, Sr, III, etc.',
      '• Birthplace - Format: "CITY/MUNICIPALITY, PROVINCE" (e.g., MANILA, METRO MANILA)',
      '• Voter Status - Use: Registered, Not Registered, Yes, No, Y, or N',
      '• Educational Attainment - Select from dropdown or leave blank',
      '• Employment Status - Select from dropdown or leave blank',
      '• Occupation - Job title in UPPERCASE',
      '• Contact Number - 11 digits starting with 09 (e.g., 09123456789)',
      '• Email - Valid email format (e.g., user@example.com)',
      '',
      '=== PROGRAM PARTICIPATION (Yes/No fields) ===',
      'For TUPAD, PWD, 4Ps, Solo Parent - you can use:',
      '• Yes, No',
      '• Y, N', 
      '• True, False',
      '• 1, 0',
      '• Leave blank for No',
      '',
      '=== IMPORTANT NOTES ===',
      '• CASE SENSITIVITY: Most fields are NOT case sensitive',
      '• DATE FORMAT: Excel may auto-change YYYY-MM-DD to DD-MM-YYYY - this is OK!',
      '• CLOSE EXCEL: Always close Excel before uploading the file',
      '• SAMPLE DATA: Remove sample rows (MARIA, JOSE) before uploading',
      '',
      '=== DATA VALIDATION FEATURES ===',
      '• Dropdown menus for most fields',
      '• Flexible input formats accepted',
      '• Warnings instead of strict errors',
      '• Sample data shows different acceptable formats',
      '',
      '=== BEFORE UPLOADING ===',
      '1. Remove the sample rows (rows 2 and 3)',
      '2. Fill in your actual resident data',
      '3. Check that required fields are not empty',
      '4. CLOSE EXCEL COMPLETELY before uploading',
      '5. Save the file and upload',
      '',
      '=== TROUBLESHOOTING ===',
      '• "Failed to fetch" error: Close Excel before uploading',
      '• "No data found" error: Check if you removed sample rows and added real data',
      '• Gender errors: Use Male, Female, M, or F (case doesn\'t matter)',
      '• Marital status errors: Use Single, Married, Widowed, Divorced (case doesn\'t matter)',
      '• Date errors: Any common date format works (YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY)',
      '• Contact number errors: Must be 11 digits starting with 09',
      '',
      'The system will automatically generate unique resident IDs (SF-000001, SF-000002, etc.)'
    ];

    instructions.forEach((instruction, index) => {
      instructionsSheet.addRow([instruction]);
      const row = instructionsSheet.getRow(index + 1);
      
      if (index === 1) { // Title row
        row.font = { bold: true, size: 16, color: { argb: '4472C4' } };
      } else if (instruction.startsWith('===')) { // Section headers
        row.font = { bold: true, size: 12, color: { argb: '2F5597' } };
      } else if (instruction.startsWith('•')) { // Bullet points
        row.font = { size: 10 };
      } else if (instruction.match(/^\d+\./)) { // Numbered items
        row.font = { size: 10 };
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=residents-template-flexible.xlsx',
      },
    });
  } catch (error) {
    console.error('Error generating template:', error);
    return NextResponse.json({ error: 'Failed to generate template' }, { status: 500 });
  }
} 