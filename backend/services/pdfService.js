import pdf from 'pdf-parse';

/**
 * Extract text from a PDF buffer
 * @param {Buffer} pdfBuffer - The PDF file buffer
 * @returns {Promise<{success: boolean, text?: string, error?: string, metadata?: object}>}
 */
export async function extractTextFromPDF(pdfBuffer) {
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
    // Remove multiple consecutive newlines
    .replace(/\n{3,}/g, '\n\n')
    // Remove page headers/footers patterns
    .replace(/Page \d+ of \d+/gi, '')
    .replace(/\[Turn over\]/gi, '')
    .replace(/\*\w+\*/g, '') // Remove reference codes like *P12345*
    // Clean up spacing
    .replace(/[ \t]+/g, ' ')
    // Remove leading/trailing whitespace from lines
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
  
  return cleaned;
}

/**
 * Split PDF text into pages (approximate)
 * @param {string} text - Full PDF text
 * @param {number} totalPages - Total number of pages
 * @returns {string[]} - Array of page contents
 */
export function splitIntoPages(text, totalPages) {
  if (totalPages <= 1) return [text];
  
  // Split by common page break patterns
  const pageBreakPatterns = [
    /\n\s*\d+\s*\n/g, // Page numbers
    /\f/g, // Form feed characters
  ];
  
  let pages = [text];
  for (const pattern of pageBreakPatterns) {
    if (pages.length >= totalPages) break;
    pages = pages.flatMap(page => page.split(pattern));
  }
  
  // If still not enough pages, split roughly by character count
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
 * Extract images from PDF (placeholder - would need additional library like pdf2pic)
 * @param {Buffer} pdfBuffer - The PDF file buffer
 * @returns {Promise<{success: boolean, images?: Array, error?: string}>}
 */
export async function extractImagesFromPDF(pdfBuffer) {
  // Note: Full image extraction requires additional libraries like pdf2pic or pdfjs-dist
  // This is a placeholder that can be expanded
  return {
    success: true,
    images: [],
    message: 'Image extraction not implemented - images will be described textually by AI'
  };
}

export default {
  extractTextFromPDF,
  extractTextFromPDFPath,
  cleanPDFText,
  splitIntoPages,
  extractImagesFromPDF
};

