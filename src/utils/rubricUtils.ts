export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
}

export interface RubricScore {
  criterionId: string;
  score: number;
  feedback: string;
}

export const gcseEnglishRubric: RubricCriterion[] = [
  {
    id: "AO1",
    name: "Understanding",
    description: "Demonstrates understanding of ideas and perspectives."
  },
  {
    id: "AO2",
    name: "Analysis",
    description: "Analyses how writers use language and structure."
  },
  {
    id: "AO3",
    name: "Comparison",
    description: "Compares writers' ideas and perspectives."
  },
  {
    id: "AO4",
    name: "Technical Accuracy",
    description: "Uses accurate spelling, punctuation, and grammar."
  }
];

// Mock feedback templates for each criterion
const feedbackTemplates = {
  AO1: {
    high: [
      "Shows sophisticated understanding of the text's themes and perspectives.",
      "Demonstrates excellent grasp of complex ideas and nuanced viewpoints.",
      "Thoroughly explores the deeper meanings and implications."
    ],
    medium: [
      "Shows good understanding of main ideas and perspectives.",
      "Demonstrates clear comprehension of key themes.",
      "Generally accurate interpretation of the text."
    ],
    low: [
      "Basic understanding of main ideas.",
      "Some misinterpretation of key concepts.",
      "Limited exploration of themes and perspectives."
    ]
  },
  AO2: {
    high: [
      "Sophisticated analysis of language and structural features.",
      "Detailed examination of writing techniques and their effects.",
      "Perceptive understanding of how meaning is crafted."
    ],
    medium: [
      "Clear analysis of key language features.",
      "Some exploration of structural elements.",
      "Generally effective discussion of writing techniques."
    ],
    low: [
      "Simple comments on obvious language features.",
      "Limited analysis of structure.",
      "Basic understanding of writing techniques."
    ]
  },
  AO3: {
    high: [
      "Insightful comparison of ideas and perspectives.",
      "Sophisticated linking of themes across texts.",
      "Detailed exploration of similarities and differences."
    ],
    medium: [
      "Clear comparison of main ideas.",
      "Some effective linking of themes.",
      "Generally valid connections made."
    ],
    low: [
      "Basic comparisons made.",
      "Limited linking of ideas.",
      "Superficial connections between texts."
    ]
  },
  AO4: {
    high: [
      "Consistently accurate spelling throughout.",
      "Sophisticated range of punctuation used effectively.",
      "Complex grammatical structures handled with confidence."
    ],
    medium: [
      "Generally accurate spelling with few errors.",
      "Some variety in punctuation usage.",
      "Mostly correct grammar with occasional mistakes."
    ],
    low: [
      "Frequent spelling errors affect clarity.",
      "Basic punctuation with some errors.",
      "Limited control of grammar and sentence structure."
    ]
  }
};

// Generate mock rubric scores based on text analysis
export const generateRubricScores = (text: string): RubricScore[] => {
  const scores: RubricScore[] = [];
  const words = text.split(/\s+/).length;
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  const paragraphs = text.split('\n\n').filter(Boolean);
  
  // AO1: Understanding (based on paragraph structure and length)
  const ao1Score = Math.min(10, Math.max(1, Math.round((paragraphs.length * 2 + words / 100))));
  
  // AO2: Analysis (based on use of analytical words)
  const analyticalWords = text.match(/therefore|because|consequently|suggests|implies|shows|demonstrates|reveals|indicates/gi)?.length || 0;
  const ao2Score = Math.min(10, Math.max(1, Math.round(analyticalWords * 1.5)));
  
  // AO3: Comparison (based on comparative words)
  const comparisonWords = text.match(/however|whereas|similarly|unlike|like|contrast|compare|both|while/gi)?.length || 0;
  const ao3Score = Math.min(10, Math.max(1, Math.round(comparisonWords * 1.5)));
  
  // AO4: Technical Accuracy (based on sentence structure and length variation)
  const avgSentenceLength = words / sentences.length;
  const ao4Score = Math.min(10, Math.max(1, Math.round(
    10 - Math.abs(avgSentenceLength - 15) / 2
  )));

  const getScoreLevel = (score: number) => {
    if (score >= 7) return 'high';
    if (score >= 4) return 'medium';
    return 'low';
  };

  const getFeedback = (criterionId: string, score: number): string => {
    const level = getScoreLevel(score);
    const templates = feedbackTemplates[criterionId as keyof typeof feedbackTemplates][level];
    return templates[Math.floor(Math.random() * templates.length)];
  };

  // Generate scores with feedback
  [
    { id: 'AO1', score: ao1Score },
    { id: 'AO2', score: ao2Score },
    { id: 'AO3', score: ao3Score },
    { id: 'AO4', score: ao4Score }
  ].forEach(({ id, score }) => {
    scores.push({
      criterionId: id,
      score,
      feedback: getFeedback(id, score)
    });
  });

  return scores;
};