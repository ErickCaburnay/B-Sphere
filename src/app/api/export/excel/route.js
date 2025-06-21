import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

export async function POST(request) {
  try {
    const body = await request.json();
    const isResident = !!body.residents;
    const data = isResident ? body.residents : body.complaints;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(isResident ? 'Residents' : 'Complaints');

    // Define columns
    worksheet.columns = isResident
      ? [
      { header: 'ID', key: 'id', width: 15 },
      { header: 'First Name', key: 'firstName', width: 20 },
      { header: 'Middle Name', key: 'middleName', width: 20 },
      { header: 'Last Name', key: 'lastName', width: 20 },
      { header: 'Suffix', key: 'suffix', width: 10 },
      { header: 'Address', key: 'address', width: 40 },
      { header: 'Birthdate', key: 'birthdate', width: 15 },
      { header: 'Birthplace', key: 'birthplace', width: 20 },
      { header: 'Citizenship', key: 'citizenship', width: 15 },
      { header: 'Gender', key: 'gender', width: 10 },
      { header: 'Voter Status', key: 'voterStatus', width: 15 },
      { header: 'Marital Status', key: 'maritalStatus', width: 15 },
      { header: 'Employment Status', key: 'employmentStatus', width: 20 },
      { header: 'Educational Attainment', key: 'educationalAttainment', width: 25 },
      { header: 'Occupation', key: 'occupation', width: 20 },
      { header: 'Contact Number', key: 'contactNumber', width: 15 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'TUPAD', key: 'isTUPAD', width: 10 },
      { header: 'PWD', key: 'isPWD', width: 10 },
      { header: '4Ps', key: 'is4Ps', width: 10 },
      { header: 'Solo Parent', key: 'isSoloParent', width: 15 }
    ]
    : [
      { header: 'Complaint ID', key: 'complaintId', width: 20 },
      { header: 'Type', key: 'type', width: 20 },
      { header: 'Complainant', key: 'complainant', width: 25 },
      { header: 'Respondent', key: 'respondent', width: 25 },
      { header: 'Date Filed', key: 'dateFiled', width: 20 },
      { header: 'Assigned Officer', key: 'assignedOfficer', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Resolution Date', key: 'resolutionDate', width: 20 },
    ];

    worksheet.getRow(1).font = { bold: true };

    data.forEach(entry => worksheet.addRow(entry));

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=${isResident ? 'residents' : 'complaints'}-report.xlsx`,
      },
    });
  } catch (error) {
    console.error('Error generating Excel file:', error);
    return NextResponse.json({ error: 'Failed to generate Excel file' }, { status: 500 });
  }
}