import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// pdf-parse doesn't support ESM, so we use createRequire
let pdf;
try {
  pdf = require('pdf-parse');
} catch (e) {
  console.warn('pdf-parse not available, PDF extraction will be disabled');
  pdf = null;
}

/**
 * Extract text from a PDF buffer
 * @param {Buffer} pdfBuffer - The PDF file buffer
 * @returns {Promise<{success: boolean, text?: string, error?: string, metadata?: object}>}
 */
export async function extractTextFromPDF(pdfBuffer) {
  if (!pdf) {
    return {
      success: false,
      error: 'PDF parsing is not available'
    };
  }
  
  try {
    const data = await pdf(pdfBuffer);
    
    return {
      success: true,
      text: data.text,
      metadata: {
        pages: data.numpages,
        info: data.info,
        version: data.version
      }
    };
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Extract text from a PDF file path
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<{success: boolean, text?: string, error?: string}>}
 */
export async function extractTextFromPDFPath(filePath) {
  try {
    const fs = await import('fs');
    const pdfBuffer = fs.readFileSync(filePath);
    return extractTextFromPDF(pdfBuffer);
  } catch (error) {
    console.error('Error reading PDF file:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Clean extracted PDF text
 * @param {string} rawText - Raw extracted text from PDF
 * @returns {string} - Cleaned text
 */
export function cleanPDFText(rawText) {
  if (!rawText) return '';
  
  let cleaned = rawText
    .replace(/\n{3,}/g, '\n\n')
    .replace(/Page \d+ of \d+/gi, '')
    .replace(/\[Turn over\]/gi, '')
    .replace(/\*\w+\*/g, '')
    .replace(/[ \t]+/g, ' ')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
  
  return cleaned;
}

/**
 * Split PDF text into pages (approximate)
 */
export function splitIntoPages(text, totalPages) {
  if (totalPages <= 1) return [text];
  
  const pageBreakPatterns = [
    /\n\s*\d+\s*\n/g,
    /\f/g,
  ];
  
  let pages = [text];
  for (const pattern of pageBreakPatterns) {
    if (pages.length >= totalPages) break;
    pages = pages.flatMap(page => page.split(pattern));
  }
  
  if (pages.length < totalPages) {
    const charsPerPage = Math.ceil(text.length / totalPages);
    pages = [];
    for (let i = 0; i < text.length; i += charsPerPage) {
      pages.push(text.slice(i, i + charsPerPage));
    }
  }
  
  return pages.slice(0, totalPages).filter(p => p.trim().length > 0);
}

/**
 * Extract images from PDF (placeholder)
 */
export async function extractImagesFromPDF(pdfBuffer) {
  return {
    success: true,
    images: [],
    message: 'Image extraction not implemented'
  };
}

export default {
  extractTextFromPDF,
  extractTextFromPDFPath,
  cleanPDFText,
  splitIntoPages,
  extractImagesFromPDF
};
