import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';

export async function POST(request) {
  try {
    const body = await request.json();
    const isResident = !!body.residents;
    const data = isResident ? body.residents : body.complaints;

    const doc = new PDFDocument();
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));

    doc.fontSize(20).text(`${isResident ? 'Residents' : 'Complaints'} Report`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });
    doc.moveDown();

    const headers = isResident
      ? ['ID', 'Name', 'Gender', 'Address']
      : ['Complaint ID', 'Type', 'Complainant', 'Respondent', 'Status'];

    const getRow = entry => isResident
      ? [
          entry.id,
          `${entry.firstName} ${entry.lastName}`,
          entry.gender,
          entry.address,
        ]
      : [
          entry.complaintId,
          entry.type,
          entry.complainant,
          entry.respondent,
          entry.status,
        ];

    doc.fontSize(12).text(headers.join(' | '));
    doc.moveDown();

    data.forEach(entry => {
      doc.text(getRow(entry).join(' | '));
      doc.moveDown();

      if (doc.y > 700) {
        doc.addPage();
        doc.y = 50;
      }
    });

    doc.end();

    const pdfBuffer = await new Promise(resolve => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=${isResident ? 'residents' : 'complaints'}-report.pdf`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF file:', error);
    return NextResponse.json({ error: 'Failed to generate PDF file' }, { status: 500 });
  }
}
