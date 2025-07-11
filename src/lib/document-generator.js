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
  'Barangay Certificate': 'CRT',
  'Barangay Clearance': 'CLR',
  'Barangay Indigency': 'IND',
  'Barangay ID': 'BID',
  'Business Permit': 'BBP'
};

// Control number format functions
async function getBusinessPermitCount() {
  const counterRef = adminDb.collection('counters').doc('Business Permit');
  const doc = await counterRef.get();
  return doc.exists ? doc.data().count : 0;
}

async function formatBusinessPermitControlNo() {
  const count = await getBusinessPermitCount();
  const year = new Date().getFullYear();
  const sequence = count.toString().padStart(4, '0');
  return `BBP-${year}-${sequence}`;
}

async function formatPermitNo() {
  const count = await getBusinessPermitCount();
  const prefix = Math.floor(count/1000).toString().padStart(4, '0');
  const suffix = (count % 1000).toString().padStart(3, '0');
  return `${prefix}-${suffix}`;
}

// Template name mapping
const TEMPLATE_FILES = {
  'Barangay Certificate': 'barangay_certificate_template.docx',
  'Barangay Clearance': 'barangay_clearance_template.docx',
  'Barangay Indigency': 'barangay_indigency_template.docx',
  'Business Permit': 'barangay_business_permit_template.docx'
};

// Control number field mapping for different document types
const CONTROL_NUMBER_FIELDS = {
  'Barangay Certificate': 'printCertificate',
  'Barangay Clearance': 'printClearance',
  'Barangay Indigency': 'printIndigency',
  'Barangay ID': 'printId',
  'Business Permit': 'permitNo'
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
      
      // Format based on document type
      let formattedId;
      if (documentType === 'Business Permit') {
        // Format: BBP-YYYY-0000
        const year = new Date().getFullYear();
        formattedId = `BBP-${year}-${newCount.toString().padStart(4, '0')}`;
      } else {
        // Format for other documents: PREFIX-0000-0000
        const part1 = Math.floor((newCount - 1) / 10000) + 1;
        const part2 = ((newCount - 1) % 10000) + 1;
        formattedId = `${prefix}-${part1.toString().padStart(4, '0')}-${part2.toString().padStart(4, '0')}`;
      }
      
      // Update the counter
      transaction.set(counterRef, { 
        count: newCount,
        lastUpdated: new Date(),
        documentType: documentType,
        lastGeneratedId: formattedId
      });
      
      return { formattedId, count: newCount };
    });

    return result;
  } catch (error) {
    console.error('Error generating document ID:', error);
    throw new Error('Failed to generate document ID');
  }
}

// Function to format permit number (separate from control number)
function formatPermitNumber(count) {
  // Format: 0000-000 for the actual permit number
  const prefix = Math.floor(count/1000).toString().padStart(4, '0');
  const suffix = (count % 1000).toString().padStart(3, '0');
  return `${prefix}-${suffix}`;
}

export async function generateDocument(documentType, data) {
  try {
    // Get the template file name
    const templateFileName = TEMPLATE_FILES[documentType];
    if (!templateFileName) {
      throw new Error(`No template found for document type: ${documentType}`);
    }
    
    // Read the template
    const templatePath = path.join(process.cwd(), 'public', 'templates', templateFileName);
    console.log('Attempting to read template from:', templatePath);
    
    const content = await fsPromises.readFile(templatePath, 'binary');
    console.log('Successfully read template file');
    
    // Create a PizZip instance with the template content
    const zip = new PizZip(content);
    
    // Create a new instance of Docxtemplater
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Generate unique document ID and get counter if not provided
    const { formattedId, count } = data.controlId ? 
      { formattedId: data.controlId, count: await getBusinessPermitCount() } : 
      await generateDocumentId(documentType);
    
    // Get formatted date components
    const dateComponents = formatDateComponents(data.requestedAt || new Date());

    // Get the correct control number field for this document type
    const controlNumberField = CONTROL_NUMBER_FIELDS[documentType];
    if (!controlNumberField) {
      throw new Error(`No control number field mapping for document type: ${documentType}`);
    }

    // Prepare the template data
    let templateData = {
      ...data,
      // Set the control number using the correct field name for this document type
      [controlNumberField]: formattedId,
      // Also set common field names for control numbers to ensure compatibility
      printClearance: formattedId,
      printCertificate: formattedId,
      controlNo: formattedId,
      Control_No: formattedId,
      // Date fields
      date: new Date(data.requestedAt || Date.now()).toLocaleDateString(),
      Date: new Date(data.requestedAt || Date.now()).toLocaleDateString(),
      processedAt: new Date(data.requestedAt || Date.now()).toLocaleDateString(),
      // Certificate date format fields
      day: dateComponents.day,
      month: dateComponents.month,
      year: dateComponents.year,
      // Other fields
      fullName: data.fullName?.toUpperCase() || '',
      age: data.age || '',
      address: data.address?.toUpperCase() || '',
      purpose: data.purpose?.toUpperCase() || '',
      // Officials
      chairman: data.chairman?.toUpperCase() || BARANGAY_OFFICIALS.chairman,
      secretary: data.secretary?.toUpperCase() || BARANGAY_OFFICIALS.secretary,
      treasurer: data.treasurer?.toUpperCase() || BARANGAY_OFFICIALS.treasurer,
    };

    // Add business permit specific fields
    if (documentType === 'Business Permit') {
      // Use the existing control number from the document data
      const permitControlNo = data.id || data.transactionNo || formattedId;
      
      // Format: 0000-000 for permit number
      const permitNo = data.permitNo || formatPermitNumber(count);
      
      templateData = {
        ...templateData,
        printPermit: permitControlNo, // Use the document's actual control number
        permitNo: permitNo, // Use the document's actual permit number
        ctcNo: data.ctcNumber || '', // Use the provided CTC number
        orNo: data.orNumber || '', // Use the provided OR number
        businessName: data.businessName?.toUpperCase() || '',
        businessType: data.businessType?.toUpperCase() || '',
        businessAddress: data.businessAddress?.toUpperCase() || '',
        validityPeriod: data.validityPeriod || '1 YEAR',
        amount: '₱500.00',
        brgyName: 'BRGY. SAN FRANCISCO',
        // Additional fields for business permits
        natureOfBusiness: data.businessType?.toUpperCase() || '',
        status: 'ACTIVE',
        validity: '1 YEAR',
        applicantName: data.fullName?.toUpperCase() || '',
        applicantAddress: data.address?.toUpperCase() || '',
        // Format dates
        issueDate: new Date(data.issueDate || Date.now()).toLocaleDateString(),
        expiryDate: (() => {
          const date = new Date(data.issueDate || Date.now());
          date.setFullYear(date.getFullYear() + 1);
          return date.toLocaleDateString();
        })()
      };
    }

    // Render the document with the data
    doc.render(templateData);

    // Generate the document buffer
    const buffer = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE'
    });

    return buffer;
  } catch (error) {
    console.error('Error generating document:', error);
    throw error;
  }
} 