import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';

/**
 * Parse essay content from various file formats
 */

/**
 * Extract text from .txt file
 */
async function parseTextFile(file: File): Promise<string> {
  return await file.text();
}

/**
 * Extract text from .docx file using mammoth
 */
async function parseDocxFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

/**
 * Extract text from .pdf file
 * Note: For browser-based PDF parsing, we need pdf.js or similar
 * This is a placeholder - actual implementation would require pdf.js
 */
async function parsePdfFile(_file: File): Promise<string> {
  throw new Error('PDF parsing is not yet fully supported in the browser. Please use .txt or .docx files, or use the OCR scan feature for PDF images.');
}

/**
 * Extract text from image using OCR (Tesseract.js)
 */
export async function parseImageFile(file: File, onProgress?: (progress: number) => void): Promise<string> {
  const result = await Tesseract.recognize(file, 'eng', {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });
  return result.data.text;
}

/**
 * Main parser - detects file type and extracts text
 */
export async function parseEssayFile(file: File, onProgress?: (progress: number) => void): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  
  // Check if it's an image file
  if (file.type.startsWith('image/')) {
    return await parseImageFile(file, onProgress);
  }
  
  switch (ext) {
    case 'txt':
      return await parseTextFile(file);
    case 'docx':
      return await parseDocxFile(file);
    case 'pdf':
      return await parsePdfFile(file);
    default:
      throw new Error(`Unsupported file type: ${ext}. Please upload .txt, .docx files, or use images for OCR scanning.`);
  }
}

/**
 * Validate essay content
 */
export function validateEssay(text: string): { valid: boolean; error?: string; wordCount: number } {
  const trimmed = text.trim();
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'Essay is empty', wordCount: 0 };
  }
  
  if (wordCount < 10) {
    return { valid: false, error: 'Essay is too short (minimum 10 words)', wordCount };
  }
  
  if (wordCount > 10000) {
    return { valid: false, error: 'Essay is too long (maximum 10,000 words)', wordCount };
  }
  
  return { valid: true, wordCount };
}
