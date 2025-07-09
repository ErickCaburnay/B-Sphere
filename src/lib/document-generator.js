import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';
import { adminDb } from './firebase-admin';

const BARANGAY_OFFICIALS = {
  chairman: "Hon. CARTER P. MANZANO",
  secretary: "ROXANNE A. PADILLA",
  treasurer: "LYDIA E. AQUINO"
};

// Document type prefix mapping
const DOCUMENT_PREFIXES = {
  'barangay_certificate': 'CRT',
  'barangay_clearance': 'CLR',
  'barangay_indigency': 'IND',
  'barangay_id': 'BID',
  'business_permit': 'BBP'
};

// Template name mapping
const TEMPLATE_FILES = {
  'barangay_certificate': 'barangay_certificate_template.docx',
  'barangay_indigency': 'barangay_indigency_template.docx',
  'barangay_clearance': 'barangay_clearance_template.docx'
};

// Function to get ordinal suffix for day
function getOrdinalSuffix(day) {
  const j = day % 10,
        k = day % 100;
  if (j == 1 && k != 11) return day + "st";
  if (j == 2 && k != 12) return day + "nd";
  if (j == 3 && k != 13) return day + "rd";
  return day + "th";
}

// Function to format date components
function formatDateComponents(date) {
  const d = new Date(date);
  return {
    day: getOrdinalSuffix(d.getDate()),
    month: d.toLocaleString('default', { month: 'long' }),
    year: d.getFullYear().toString()
  };
}

// Function to generate unique document ID
async function generateDocumentId(documentType) {
  const prefix = DOCUMENT_PREFIXES[documentType];
  if (!prefix) {
    throw new Error(`Invalid document type: ${documentType}`);
  }

  // Use a transaction to safely increment the counter
  const counterRef = adminDb.collection('counters').doc(documentType);
  
  try {
    const result = await adminDb.runTransaction(async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      const currentCount = counterDoc.exists ? counterDoc.data().count : 0;
      const newCount = currentCount + 1;
      
      // Format the counter parts (0000-0000)
      const part1 = Math.floor(newCount / 10000) + 1;
      const part2 = newCount % 10000;
      const formattedId = `${prefix}-${part1.toString().padStart(4, '0')}-${part2.toString().padStart(4, '0')}`;
      
      // Update the counter
      transaction.set(counterRef, { count: newCount, lastUpdated: new Date() });
      
      return formattedId;
    });

    return result;
  } catch (error) {
    console.error('Error generating document ID:', error);
    throw new Error('Failed to generate document ID');
  }
}

export async function generateDocument(templateName, data) {
  try {
    // Map the template names to actual file names
    const templateMapping = {
      'barangay_certificate': 'barangay_certificate_template.docx',
      'barangay_indigency': 'barangay_indigency_template.docx',
      'barangay_clearance': 'barangay_clearance_template.docx'
    };

    // Get the actual template file name
    const templateFileName = templateMapping[templateName] || templateName;
    
    // Read the template
    const templatePath = path.join(process.cwd(), 'public', 'templates', templateFileName);
    console.log('Attempting to read template from:', templatePath); // Debug log
    
    const content = await fsPromises.readFile(templatePath, 'binary');
    console.log('Successfully read template file'); // Debug log
    
    // Create a PizZip instance with the template content
    const zip = new PizZip(content);
    
    // Create a new instance of Docxtemplater
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Get document type from template name
    const documentType = templateName.replace('_template.docx', '');
    
    // Generate unique document ID if not provided
    const controlId = data.controlId || await generateDocumentId(documentType);
    
    // Get formatted date components
    const dateComponents = formatDateComponents(data.requestedAt || new Date());

    // Prepare the template data
    const templateData = {
      ...data,
      // Control Number and Date fields exactly as in template
      printCertificate: controlId,
      processedAt: new Date(data.requestedAt || Date.now()).toLocaleDateString(),
      // Certificate date format fields
      day: getOrdinalSuffix(new Date(data.requestedAt || Date.now()).getDate()),
      month: new Date(data.requestedAt || Date.now()).toLocaleString('default', { month: 'long' }),
      year: new Date(data.requestedAt || Date.now()).getFullYear().toString(),
      // Other fields
      fullName: data.fullName?.toUpperCase() || 'undefined',
      age: data.age || 'undefined',
      address: data.address?.toUpperCase() || 'undefined',
      purpose: data.purpose?.toUpperCase() || 'undefined',
      // Officials
      chairman: data.chairman?.toUpperCase() || 'undefined',
      secretary: data.secretary?.toUpperCase() || 'undefined',
      treasurer: data.treasurer?.toUpperCase() || 'undefined',
    };

    console.log('Template data:', templateData); // Debug log

    // If this is a preview, add a watermark
    if (data.isPreview) {
      templateData.watermark = 'PREVIEW';
      templateData.watermarkStyle = 'color: gray; opacity: 0.5; font-size: 48pt; transform: rotate(-45deg); position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg);';
    }

    // Set the template data
    doc.setData(templateData);

    try {
      // Render the document (replace all markers with actual data)
      doc.render();
      console.log('Document rendered successfully'); // Debug log
    } catch (error) {
      console.error('Error rendering document:', error);
      throw error;
    }

    // Generate buffer
    const buffer = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE'
    });

    console.log('Document buffer generated successfully'); // Debug log
    return buffer;
  } catch (error) {
    console.error('Error generating document:', error);
    throw error;
  }
} 