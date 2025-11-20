import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source for PDF.js - use unpkg for better reliability
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

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
 * Extract text from .pdf file using PDF.js
 */
async function parsePdfFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });
    
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n';
    }
    
    const trimmedText = fullText.trim();
    
    // Check if PDF has no extractable text (image-only PDF)
    if (trimmedText.length === 0) {
      throw new Error('PDF contains no extractable text. This may be a scanned document - please use OCR or convert to text first.');
    }
    
    return trimmedText;
  } catch (error) {
    console.error('PDF parsing error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to parse PDF file. The file may be corrupted, encrypted, or image-only.');
  }
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
