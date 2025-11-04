import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Parse rubric content from various file formats
 */

export interface ParsedCriterion {
  category: string;
  maxPoints: number;
  description?: string;
}

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
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
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
    
    return fullText.trim();
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF file. The file may be corrupted or encrypted.');
  }
}

/**
 * Main parser - detects file type and extracts text
 */
export async function parseRubricFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'txt':
      return await parseTextFile(file);
    case 'docx':
      return await parseDocxFile(file);
    case 'pdf':
      return await parsePdfFile(file);
    default:
      throw new Error(`Unsupported file type: ${ext}. Please upload .txt, .docx, or .pdf files.`);
  }
}

/**
 * Parse rubric text into structured criteria
 * Supports multiple formats:
 * 1. "Category: Description (X points)" or "Category (X points): Description"
 * 2. "Category - X points: Description"
 * 3. "AO1: Understanding (10 points)"
 * 4. Simple list with default points
 */
export function parseRubricText(text: string): ParsedCriterion[] {
  const lines = text
    .split(/\n+/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const criteria: ParsedCriterion[] = [];

  for (const line of lines) {
    // Skip obvious headers/titles
    if (line.toLowerCase().includes('rubric') || line.toLowerCase().includes('grading criteria')) {
      continue;
    }

    // Pattern 1: "Category: Description (X points)" or "Category (X points)"
    let match = line.match(/^(.+?)(?:\s*\((\d+)\s*(?:points?|pts?|marks?)\))?:\s*(.*)$/i);
    if (match) {
      const category = match[1].trim();
      const points = match[2] ? parseInt(match[2]) : 10;
      const description = match[3]?.trim() || '';
      
      criteria.push({
        category,
        maxPoints: points,
        description: description || undefined,
      });
      continue;
    }

    // Pattern 2: "Category - X points" or "Category - X pts"
    match = line.match(/^(.+?)\s*[-–—]\s*(\d+)\s*(?:points?|pts?|marks?)(?::\s*(.*))?$/i);
    if (match) {
      const category = match[1].trim();
      const points = parseInt(match[2]);
      const description = match[3]?.trim() || '';
      
      criteria.push({
        category,
        maxPoints: points,
        description: description || undefined,
      });
      continue;
    }

    // Pattern 3: Lines with numbers (assume format: "1. Category" or "AO1 - Description")
    match = line.match(/^(?:\d+\.|[A-Z]{2,3}\d+)[\s\-:]+(.+)$/);
    if (match) {
      const content = match[1].trim();
      // Try to extract points if present
      const pointsMatch = content.match(/\((\d+)\s*(?:points?|pts?|marks?)\)/i);
      const points = pointsMatch ? parseInt(pointsMatch[1]) : 10;
      const category = content.replace(/\(\d+\s*(?:points?|pts?|marks?)\)/i, '').trim();
      
      criteria.push({
        category,
        maxPoints: points,
      });
      continue;
    }

    // Default: treat as simple category with 10 points
    if (line.length > 3 && !line.match(/^[^a-zA-Z]+$/)) {
      criteria.push({
        category: line,
        maxPoints: 10,
      });
    }
  }

  return criteria;
}

/**
 * Convert parsed criteria to the format expected by the Rubrics form
 */
export function criteriaToCriteriaState(parsed: ParsedCriterion[]): Array<{ id: number; category: string; maxPoints: number }> {
  return parsed.map((c, idx) => ({
    id: idx,
    category: c.category,
    maxPoints: c.maxPoints,
  }));
}
