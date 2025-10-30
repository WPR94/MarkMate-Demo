// Mock data utilities for generating realistic feedback
export const grammarIssues = {
  sentenceStructure: [
    'Consider revising the complex sentence in paragraph {n}: "{excerpt}"',
    'The sentence "{excerpt}" could be split into two for better clarity',
    'Review the word order in: "{excerpt}"'
  ],
  punctuation: [
    'Add a comma after the introductory phrase in: "{excerpt}"',
    'Consider using a semicolon instead of a comma in: "{excerpt}"',
    'Check the placement of quotation marks in: "{excerpt}"'
  ],
  wordChoice: [
    'The word "{word}" might be replaced with a more precise term',
    'Consider a more academic alternative to "{word}"',
    '"{word}" is informal; consider a more suitable synonym'
  ]
};

export const strengthTemplates = [
  'Strong thesis statement that clearly outlines the main argument',
  'Effective use of evidence to support key points',
  'Clear logical progression of ideas throughout the essay',
  'Sophisticated vocabulary choices enhance the academic tone',
  'Well-structured paragraphs with clear topic sentences',
  'Excellent integration of source material',
  'Compelling introduction that engages the reader',
  'Strong concluding paragraph that synthesizes main points',
  'Effective use of transitions between paragraphs',
  'Demonstrates deep understanding of the subject matter'
];

export const improvementTemplates = [
  'Consider developing the argument in paragraph {n} with more specific examples',
  'The transition between paragraphs {n} and {n+1} could be stronger',
  'The conclusion could more explicitly connect to the thesis',
  'Some secondary points could be better connected to the main argument',
  'Consider addressing potential counter-arguments',
  'More critical analysis of evidence would strengthen the argument',
  'Some claims would benefit from additional supporting evidence',
  'The introduction could better preview the essay\'s structure',
  'Consider varying sentence structure for better flow',
  'Key terms could be defined more precisely'
];

export const toneClassifications = ['Academic', 'Formal', 'Semi-formal', 'Analytical', 'Persuasive'];

export const readabilityDescriptions = {
  1: 'Needs significant revision for clarity',
  2: 'Challenging to follow the main ideas',
  3: 'Basic ideas present but unclear',
  4: 'Generally understandable but needs work',
  5: 'Average clarity and readability',
  6: 'Above average clarity',
  7: 'Clear and well-structured',
  8: 'Very clear and engaging',
  9: 'Excellent clarity and flow',
  10: 'Exceptional clarity and sophistication'
};