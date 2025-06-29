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
      { header: 'Gender* (Male/Female)', key: 'gender', width: 15 },
      { header: 'Marital Status* (Single/Married/Widowed/Divorced)', key: 'maritalStatus', width: 25 },
      { header: 'Voter Status (Registered/Not Registered)', key: 'voterStatus', width: 20 },
      { header: 'Educational Attainment', key: 'educationalAttainment', width: 25 },
      { header: 'Employment Status', key: 'employmentStatus', width: 20 },
      { header: 'Occupation', key: 'occupation', width: 20 },
      { header: 'Contact Number (09XXXXXXXXX)', key: 'contactNumber', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'TUPAD (Yes/No)', key: 'isTUPAD', width: 15 },
      { header: 'PWD (Yes/No)', key: 'isPWD', width: 15 },
      { header: '4Ps (Yes/No)', key: 'is4Ps', width: 15 },
      { header: 'Solo Parent (Yes/No)', key: 'isSoloParent', width: 15 }
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

    // Add data validation for the entire columns (rows 2 to 1000)
    const maxRows = 1000;

    // Gender validation (Column I - 9)
    worksheet.getColumn(9).eachCell({ includeEmpty: true }, (cell, rowNumber) => {
      if (rowNumber > 1) {
        cell.dataValidation = {
          type: 'list',
          allowBlank: false,
          formulae: ['"Male,Female"'],
          showErrorMessage: true,
          errorStyle: 'error',
          errorTitle: 'Invalid Gender',
          error: 'Please select either Male or Female'
        };
      }
    });

    // Marital Status validation (Column J - 10)
    worksheet.getColumn(10).eachCell({ includeEmpty: true }, (cell, rowNumber) => {
      if (rowNumber > 1) {
        cell.dataValidation = {
          type: 'list',
          allowBlank: false,
          formulae: ['"Single,Married,Widowed,Divorced"'],
          showErrorMessage: true,
          errorStyle: 'error',
          errorTitle: 'Invalid Marital Status',
          error: 'Please select Single, Married, Widowed, or Divorced'
        };
      }
    });

    // Voter Status validation (Column K - 11)
    worksheet.getColumn(11).eachCell({ includeEmpty: true }, (cell, rowNumber) => {
      if (rowNumber > 1) {
        cell.dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: ['"Registered,Not Registered"'],
          showErrorMessage: true,
          errorStyle: 'error',
          errorTitle: 'Invalid Voter Status',
          error: 'Please select Registered or Not Registered'
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
          errorStyle: 'error',
          errorTitle: 'Invalid Educational Attainment',
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
          errorStyle: 'error',
          errorTitle: 'Invalid Employment Status',
          error: 'Please select a valid employment status'
        };
      }
    });

    // Birthdate validation (Column E - 5)
    worksheet.getColumn(5).eachCell({ includeEmpty: true }, (cell, rowNumber) => {
      if (rowNumber > 1) {
        cell.dataValidation = {
          type: 'date',
          allowBlank: false,
          formulae: [new Date('1900-01-01'), new Date()],
          showErrorMessage: true,
          errorStyle: 'error',
          errorTitle: 'Invalid Date',
          error: 'Please enter a valid date in YYYY-MM-DD format'
        };
        cell.numFmt = 'yyyy-mm-dd';
      }
    });

    // Contact Number validation (Column O - 15)
    worksheet.getColumn(15).eachCell({ includeEmpty: true }, (cell, rowNumber) => {
      if (rowNumber > 1) {
        cell.dataValidation = {
          type: 'textLength',
          allowBlank: true,
          operator: 'equal',
          formulae: [11],
          showErrorMessage: true,
          errorStyle: 'error',
          errorTitle: 'Invalid Contact Number',
          error: 'Contact number must be exactly 11 digits starting with 09'
        };
      }
    });

    // Email validation (Column P - 16)
    worksheet.getColumn(16).eachCell({ includeEmpty: true }, (cell, rowNumber) => {
      if (rowNumber > 1) {
        cell.dataValidation = {
          type: 'custom',
          allowBlank: true,
          formulae: ['AND(ISERROR(FIND(" ",P' + rowNumber + '))=TRUE,LEN(P' + rowNumber + ')-LEN(SUBSTITUTE(P' + rowNumber + ',"@",""))=1,FIND("@",P' + rowNumber + ')>1,FIND("@",P' + rowNumber + ')<LEN(P' + rowNumber + '),FIND(".",P' + rowNumber + ',FIND("@",P' + rowNumber + '))>FIND("@",P' + rowNumber + ')+1)'],
          showErrorMessage: true,
          errorStyle: 'error',
          errorTitle: 'Invalid Email',
          error: 'Please enter a valid email address (e.g., user@example.com)'
        };
      }
    });

    // Yes/No validation for TUPAD (Column Q - 17)
    worksheet.getColumn(17).eachCell({ includeEmpty: true }, (cell, rowNumber) => {
      if (rowNumber > 1) {
        cell.dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: ['"Yes,No"'],
          showErrorMessage: true,
          errorStyle: 'error',
          errorTitle: 'Invalid Value',
          error: 'Please select Yes or No'
        };
      }
    });

    // Yes/No validation for PWD (Column R - 18)
    worksheet.getColumn(18).eachCell({ includeEmpty: true }, (cell, rowNumber) => {
      if (rowNumber > 1) {
        cell.dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: ['"Yes,No"'],
          showErrorMessage: true,
          errorStyle: 'error',
          errorTitle: 'Invalid Value',
          error: 'Please select Yes or No'
        };
      }
    });

    // Yes/No validation for 4Ps (Column S - 19)
    worksheet.getColumn(19).eachCell({ includeEmpty: true }, (cell, rowNumber) => {
      if (rowNumber > 1) {
        cell.dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: ['"Yes,No"'],
          showErrorMessage: true,
          errorStyle: 'error',
          errorTitle: 'Invalid Value',
          error: 'Please select Yes or No'
        };
      }
    });

    // Yes/No validation for Solo Parent (Column T - 20)
    worksheet.getColumn(20).eachCell({ includeEmpty: true }, (cell, rowNumber) => {
      if (rowNumber > 1) {
        cell.dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: ['"Yes,No"'],
          showErrorMessage: true,
          errorStyle: 'error',
          errorTitle: 'Invalid Value',
          error: 'Please select Yes or No'
        };
      }
    });

    // Birthplace format validation (Column F - 6)
    worksheet.getColumn(6).eachCell({ includeEmpty: true }, (cell, rowNumber) => {
      if (rowNumber > 1) {
        cell.dataValidation = {
          type: 'custom',
          allowBlank: true,
          formulae: ['AND(LEN(F' + rowNumber + ')>0,ISERROR(FIND(",",F' + rowNumber + '))=FALSE,LEN(F' + rowNumber + ')-LEN(SUBSTITUTE(F' + rowNumber + ',",",""))=1)'],
          showErrorMessage: true,
          errorStyle: 'error',
          errorTitle: 'Invalid Birthplace Format',
          error: 'Please use format: MUNICIPALITY/CITY, PROVINCE (e.g., DASMARINAS, CAVITE)'
        };
      }
    });

    // Add sample data row
    worksheet.addRow({
      firstName: 'JUAN',
      middleName: 'DELA',
      lastName: 'CRUZ',
      suffix: 'JR',
      birthdate: '1990-01-15',
      birthplace: 'DASMARINAS, CAVITE',
      address: '123 MAIN STREET, BARANGAY SAMPLE',
      citizenship: 'FILIPINO',
      gender: 'Male',
      maritalStatus: 'Married',
      voterStatus: 'Registered',
      educationalAttainment: 'College Graduate',
      employmentStatus: 'Employed',
      occupation: 'TEACHER',
      contactNumber: '09123456789',
      email: 'juan.delacruz@email.com',
      isTUPAD: 'No',
      isPWD: 'No',
      is4Ps: 'No',
      isSoloParent: 'No'
    });

    // Style the sample row
    const sampleRow = worksheet.getRow(2);
    sampleRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'E7E6E6' }
    };

    // Add instructions in a separate worksheet
    const instructionsSheet = workbook.addWorksheet('Instructions');
    instructionsSheet.columns = [
      { header: 'Instructions for Batch Upload', width: 80 }
    ];

    const instructions = [
      '',
      '1. Fill out the "Residents Template" sheet with resident data',
      '2. Required fields are marked with asterisk (*)',
      '3. Use the exact format shown in the sample row',
      '4. Date format: YYYY-MM-DD (e.g., 1990-01-15)',
      '5. Birthplace format: "MUNICIPALITY/CITY, PROVINCE" (e.g., DASMARINAS, CAVITE)',
      '6. Gender: Select from dropdown (Male or Female)',
      '7. Marital Status: Select from dropdown (Single, Married, Widowed, Divorced)',
      '8. Voter Status: Select from dropdown (Registered or Not Registered)',
      '9. Educational Attainment: Select from dropdown options',
      '10. Employment Status: Select from dropdown options',
      '11. Contact Number: 11 digits starting with 09 (e.g., 09123456789)',
      '12. Email: Valid format (e.g., user@example.com)',
      '13. Yes/No fields: Select from dropdown (Yes or No)',
      '14. Remove the sample row before uploading',
      '',
      'Required Fields:',
      '- First Name',
      '- Last Name', 
      '- Birthdate',
      '- Address',
      '- Citizenship',
      '- Gender',
      '- Marital Status',
      '',
      'Data Validation Features:',
      '- Dropdown menus for predefined options',
      '- Date validation for birthdate',
      '- Email format validation',
      '- Contact number length validation',
      '',
      'Note: The system will automatically generate unique IDs for each resident.'
    ];

    instructions.forEach((instruction, index) => {
      instructionsSheet.addRow([instruction]);
      if (index === 0) {
        const titleRow = instructionsSheet.getRow(index + 1);
        titleRow.font = { bold: true, size: 14 };
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=residents-template.xlsx',
      },
    });
  } catch (error) {
    console.error('Error generating template:', error);
    return NextResponse.json({ error: 'Failed to generate template' }, { status: 500 });
  }
} 