export type AO = 'AO1' | 'AO2' | 'AO3' | 'AO4';

export type CommentSnippet = {
  id: string;
  ao: AO;
  category: 'strength' | 'improvement' | 'spag';
  text: string;
};

export const defaultCommentBank: CommentSnippet[] = [
  // AO1 – Ideas, themes, purpose
  { id: 'ao1-s-1', ao: 'AO1', category: 'strength', text: "Clear focus on the task with a well-expressed central idea." },
  { id: 'ao1-i-1', ao: 'AO1', category: 'improvement', text: "Clarify your main viewpoint earlier and sustain it through each paragraph." },
  { id: 'ao1-i-2', ao: 'AO1', category: 'improvement', text: "Link each paragraph back to the question to keep your line of argument tight." },

  // AO2 – Language, structure, form
  { id: 'ao2-s-1', ao: 'AO2', category: 'strength', text: "Effective use of vocabulary choices that create clear impact on the reader." },
  { id: 'ao2-i-1', ao: 'AO2', category: 'improvement', text: "Zoom in on specific words or phrases and explain their effect on the reader." },
  { id: 'ao2-i-2', ao: 'AO2', category: 'improvement', text: "Vary sentence structures to control pace and emphasis." },

  // AO3 – Context (where relevant)
  { id: 'ao3-s-1', ao: 'AO3', category: 'strength', text: "Relevant contextual awareness enhances your interpretation." },
  { id: 'ao3-i-1', ao: 'AO3', category: 'improvement', text: "Connect context to specific examples rather than making general statements." },

  // AO4 – SPaG
  { id: 'ao4-s-1', ao: 'AO4', category: 'strength', text: "Generally accurate spelling and punctuation support clarity." },
  { id: 'ao4-i-1', ao: 'AO4', category: 'improvement', text: "Check comma splices; split overly long sentences for clarity." },
  { id: 'ao4-i-2', ao: 'AO4', category: 'improvement', text: "Proofread for homophones (e.g., their/there/they’re) and apostrophes." },
];
