// GCSE Rubric Templates Phase 1
export type AssessmentObjective = 'AO1' | 'AO2' | 'AO3' | 'AO4';

export interface GCSEBandDescriptor {
  band: number;
  level: string;
  descriptor: string;
}

export interface GCSEAoDefinition {
  ao: AssessmentObjective;
  title: string;
  description: string;
}

export interface GCSERubricTemplate {
  id: string;
  examBoard: string; // AQA | Edexcel | OCR | WJEC
  subject: string;
  assessmentObjectives: GCSEAoDefinition[];
  bands: GCSEBandDescriptor[];
  notes?: string;
}

export const gcseRubricTemplates: GCSERubricTemplate[] = [
  {
    id: 'aqa-english-lang-default',
    examBoard: 'AQA',
    subject: 'English Language',
    assessmentObjectives: [
      { ao: 'AO1', title: 'AO1', description: 'Identify and interpret explicit and implicit information and ideas.' },
      { ao: 'AO2', title: 'AO2', description: 'Explain, comment on and analyse writers’ methods.' },
      { ao: 'AO3', title: 'AO3', description: 'Compare writers’ ideas and perspectives.' },
      { ao: 'AO4', title: 'AO4', description: 'Evaluate texts critically and support with textual references.' }
    ],
    bands: [
      { band: 1, level: 'Limited', descriptor: 'Basic, minimal understanding; frequent errors; limited method analysis.' },
      { band: 2, level: 'Developing', descriptor: 'Some understanding; attempts analysis with uneven support.' },
      { band: 3, level: 'Secure', descriptor: 'Clear understanding; relevant analysis; generally appropriate references.' },
      { band: 4, level: 'Skilled', descriptor: 'Perceptive understanding; thoughtful analysis, well‑selected references.' },
      { band: 5, level: 'Highly Skilful', descriptor: 'Insightful, sustained analysis; precise, integrated references.' },
      { band: 6, level: 'Exceptional', descriptor: 'Assured, sophisticated analysis; consistently perceptive and judicious references.' }
    ],
    notes: 'Starter template for AQA English Language Paper responses.'
  },
  {
    id: 'edexcel-english-lit-default',
    examBoard: 'Edexcel',
    subject: 'English Literature',
    assessmentObjectives: [
      { ao: 'AO1', title: 'AO1', description: 'Articulate informed, personal response; textual references.' },
      { ao: 'AO2', title: 'AO2', description: 'Analyse language, form, structure; effects.' },
      { ao: 'AO3', title: 'AO3', description: 'Show understanding of relationships between texts and contexts.' },
      { ao: 'AO4', title: 'AO4', description: 'Use a range of accurate vocabulary and expression.' }
    ],
    bands: [
      { band: 1, level: 'Limited', descriptor: 'Basic response with little contextual or technical awareness.' },
      { band: 2, level: 'Emerging', descriptor: 'Some response; uneven technical analysis; limited context links.' },
      { band: 3, level: 'Competent', descriptor: 'Clear response; relevant analysis; some contextual integration.' },
      { band: 4, level: 'Effective', descriptor: 'Consistent analysis; secure context; purposeful references.' },
      { band: 5, level: 'Perceptive', descriptor: 'Assured, conceptualized analysis; integrated context.' },
      { band: 6, level: 'Sophisticated', descriptor: 'Nuanced, original interpretation; seamless context integration.' }
    ]
  },
  // OCR
  {
    id: 'ocr-english-lit-default',
    examBoard: 'OCR',
    subject: 'English Literature',
    assessmentObjectives: [
      { ao: 'AO1', title: 'AO1', description: 'Develop informed, personal response with textual evidence.' },
      { ao: 'AO2', title: 'AO2', description: 'Analyse writer’s craft: language, form, structure.' },
      { ao: 'AO3', title: 'AO3', description: 'Understand texts in cultural and historical contexts.' },
      { ao: 'AO4', title: 'AO4', description: 'Accurate expression and critical terminology.' }
    ],
    bands: [
      { band: 1, level: 'Limited', descriptor: 'Basic response; minimal analysis or context.' },
      { band: 2, level: 'Developing', descriptor: 'Some analysis; uneven contextual links.' },
      { band: 3, level: 'Secure', descriptor: 'Clear, supported analysis; relevant context.' },
      { band: 4, level: 'Purposeful', descriptor: 'Confident, developed analysis; integrated context.' },
      { band: 5, level: 'Assured', descriptor: 'Perceptive, conceptual approach; well-integrated context.' },
      { band: 6, level: 'Sophisticated', descriptor: 'Nuanced, original interpretation; seamless integration.' }
    ]
  },
  // WJEC / Eduqas
  {
    id: 'wjec-english-lang-default',
    examBoard: 'WJEC',
    subject: 'English Language',
    assessmentObjectives: [
      { ao: 'AO1', title: 'AO1', description: 'Select and synthesise evidence.' },
      { ao: 'AO2', title: 'AO2', description: 'Explain and analyse language effects.' },
      { ao: 'AO3', title: 'AO3', description: 'Compare ideas and perspectives.' },
      { ao: 'AO4', title: 'AO4', description: 'Evaluate critically, supported by references.' }
    ],
    bands: [
      { band: 1, level: 'Limited', descriptor: 'Basic comprehension; minimal support.' },
      { band: 2, level: 'Emerging', descriptor: 'Simple analysis; limited synthesis.' },
      { band: 3, level: 'Secure', descriptor: 'Clear analysis; relevant synthesis.' },
      { band: 4, level: 'Effective', descriptor: 'Developed analysis; thoughtful synthesis.' },
      { band: 5, level: 'Perceptive', descriptor: 'Assured analysis; insightful synthesis.' },
      { band: 6, level: 'Exceptional', descriptor: 'Sophisticated evaluation; discriminating synthesis.' }
    ]
  }
];

export function getTemplatesByBoard(board: string) {
  return gcseRubricTemplates.filter(t => t.examBoard === board);
}

export function getTemplate(id: string) {
  return gcseRubricTemplates.find(t => t.id === id);
}
