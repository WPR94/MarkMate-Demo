import { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import toast, { Toaster } from 'react-hot-toast';

import { grammarIssues, strengthTemplates, improvementTemplates, readabilityDescriptions } from '../utils/feedbackUtils';
import { gcseEnglishRubric, generateRubricScores, RubricScore } from '../utils/rubricUtils';
import { supabase } from '../lib/supabaseClient';

interface FeedbackType {
  grammar: string[];
  strengths: string[];
  improvements: string[];
  suggestedFeedback: string;
  readabilityScore: number;
  tone: string;
  rubricScores: RubricScore[];
}

// Utility function to get random items from an array
const getRandomItems = (arr: any[], count: number) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Mock feedback generator for demo purposes
const generateMockFeedback = (text: string): FeedbackType => {
  const paragraphs = text.split('\n\n');
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  const words = text.split(/\s+/);
  
  // Generate grammar issues based on actual content
  const grammarFeedback = [];
  if (sentences.length > 0) {
    const randomSentence = sentences[Math.floor(Math.random() * sentences.length)].trim();
    const randomWord = words[Math.floor(Math.random() * words.length)];
    
    grammarFeedback.push(
      grammarIssues.sentenceStructure[0].replace('{excerpt}', randomSentence),
      grammarIssues.punctuation[1].replace('{excerpt}', randomSentence),
      grammarIssues.wordChoice[0].replace('{word}', randomWord)
    );
  }

  // Calculate mock readability score based on text complexity
  const avgWordsPerSentence = words.length / sentences.length;
  const longWords = words.filter(word => word.length > 6).length;
  const readabilityScore = Math.min(10, Math.max(1, Math.round(
    (avgWordsPerSentence * 0.3 + (longWords / words.length) * 10)
  )));

  // Select tone based on vocabulary and sentence structure
  const formalityIndicators = text.match(/therefore|moreover|consequently|furthermore|thus/gi)?.length || 0;
  const tone = formalityIndicators > 2 ? 'Academic' : 'Semi-formal';

  // Generate rubric scores
  const rubricScores = generateRubricScores(text);

  // Generate feedback sections
  return {
    grammar: grammarFeedback,
    strengths: getRandomItems(strengthTemplates, 3),
    improvements: getRandomItems(improvementTemplates, 3).map(improvement => 
      improvement.replace('{n}', Math.floor(Math.random() * paragraphs.length + 1).toString())
    ),
    suggestedFeedback: `Your essay demonstrates ${readabilityScore >= 7 ? 'excellent' : readabilityScore >= 5 ? 'good' : 'fair'} command of written expression. 
    The writing style is predominantly ${tone.toLowerCase()}, which ${tone === 'Academic' ? 'suits the context well' : 'could be more formal for academic writing'}. 
    
    ${getRandomItems(strengthTemplates, 1)[0]}. However, ${getRandomItems(improvementTemplates, 1)[0].toLowerCase()}. 
    
    Focus on maintaining consistent paragraph structure and strengthening transitions between ideas. ${readabilityScore < 7 ? 'Consider varying your sentence structure and vocabulary to enhance readability.' : 'Your varied sentence structure and vocabulary choices effectively maintain reader engagement.'}
    
    Overall, your work shows ${readabilityScore >= 8 ? 'strong potential' : 'promise'} and with the suggested revisions, it will be even more impactful.`,
    readabilityScore,
    tone,
    rubricScores
  };
};

// Interfaces for rubric matching
interface RubricItem {
  id: string;
  name: string;
  description: string;
}

interface RubricMatch extends RubricItem {
  matchedSentences: string[];
  score: number;
}

// Utility function to parse rubric text into structured format
const parseRubric = (text: string): RubricItem[] => {
  return text
    .split("\n")
    .map(line => {
      const [id, desc] = line.split(":").map(s => s?.trim());
      return id && desc ? { id, name: id, description: desc } : null;
    })
    .filter((item): item is RubricItem => item !== null);
};

// Utility function to match sentences against rubric criteria
const matchSentencesToRubric = (essay: string, rubric: RubricItem[]): RubricMatch[] => {
  const sentences = essay.split(/[.!?]/).map(s => s.trim()).filter(Boolean);

  return rubric.map(criterion => {
    // Create keywords from criterion description
    const keywords = criterion.description
      .toLowerCase()
      .split(" ")
      .filter(word => word.length > 3); // Filter out short words

    // Find matching sentences
    const matched = sentences.filter(sentence =>
      keywords.some(k => sentence.toLowerCase().includes(k))
    );

    // Calculate a score based on matches
    const score = Math.min(10, Math.max(1, matched.length * 3));

    return {
      ...criterion,
      matchedSentences: matched.length ? matched : ["No clear evidence found for this criterion."],
      score
    };
  });
};

function Demo() {
  const [essayText, setEssayText] = useState('');
  const [rubricText, setRubricText] = useState('');
  const [rubric, setRubric] = useState<RubricItem[]>([]);
  const [rubricMatches, setRubricMatches] = useState<RubricMatch[]>([]);
  const [feedback, setFeedback] = useState<FeedbackType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [criteriaMatches, setCriteriaMatches] = useState<Array<{ criterion: string; examples: string[] }>>([]);

  // Map scores (0-10) to Tailwind width classes to avoid inline styles
  const widthPercentClasses = [
    'w-[0%]','w-[10%]','w-[20%]','w-[30%]','w-[40%]','w-[50%]',
    'w-[60%]','w-[70%]','w-[80%]','w-[90%]','w-[100%]'
  ];
  const widthClassFromScore = (score: number) => widthPercentClasses[Math.max(0, Math.min(10, Math.round(score)))];

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEssayText(e.target.value);
    setFeedback(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      setEssayText(text);
      toast.success('File uploaded successfully!');
    } catch (err) {
      setError('Failed to read file. Please try again.');
      toast.error('Failed to read file. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOCRScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const result = await Tesseract.recognize(file, 'eng');
      setEssayText(result.data.text);
      toast.success('Image scanned successfully!');
    } catch (err) {
      setError('Failed to scan image. Please try again.');
      toast.error('Failed to scan image. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateFeedback = async () => {
    if (!essayText.trim()) {
      setError('Please enter or upload an essay first.');
      toast.error('Please enter or upload an essay first.');
      return;
    }

    setLoading(true);
    setError(null);
    toast.loading('Analyzing your essay...', {
      id: 'analyzing',
      duration: 1500
    });

    // Generate rubric matches if rubric exists
    if (rubric.length > 0) {
      const matches = matchSentencesToRubric(essayText, rubric);
      setRubricMatches(matches);
    }

    try {
      const criteriaArray = rubric.map(r => r.description);
      const { data, error: fnError } = await supabase.functions.invoke('generate-feedback', {
        body: { essay: essayText, rubric: { criteria: criteriaArray } }
      });
      if (fnError) throw fnError;

      // Compute local readability/tone, then merge core fields with AI
      const mock = generateMockFeedback(essayText);
      const ai = (data ?? {}) as {
        grammar_issues?: string[];
        strengths?: string[];
        improvements?: string[];
        criteria_matches?: Array<{ criterion: string; examples: string[] }>;
        suggested_feedback?: string;
        overall_score?: number;
      };

      const merged: FeedbackType = {
        ...mock,
        grammar: ai.grammar_issues ?? mock.grammar,
        strengths: ai.strengths ?? mock.strengths,
        improvements: ai.improvements ?? mock.improvements,
        suggestedFeedback: ai.suggested_feedback ?? mock.suggestedFeedback,
      };

      setFeedback(merged);
      setOverallScore(typeof ai.overall_score === 'number' ? ai.overall_score : null);
      setCriteriaMatches(ai.criteria_matches ?? []);

      // Attempt to persist essay and feedback if the user is authenticated
      try {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;
        if (userId) {
          const wordCount = essayText.trim().split(/\s+/).filter(Boolean).length;
          const { data: essayInsert, error: essayErr } = await supabase
            .from('essays')
            .insert([
              {
                title: 'Untitled Essay',
                content: essayText,
                word_count: wordCount,
                teacher_id: userId,
                rubric_id: null,
              },
            ])
            .select('id')
            .single();

          if (essayErr) throw essayErr;

          const essayId = essayInsert?.id;
          if (essayId) {
            const { error: fbErr } = await supabase.from('feedback').insert([
              {
                essay_id: essayId,
                rubric_id: null,
                grammar_issues: merged.grammar,
                strengths: merged.strengths,
                improvements: merged.improvements,
                suggested_feedback: merged.suggestedFeedback,
                overall_score: typeof ai.overall_score === 'number' ? ai.overall_score : null,
              },
            ]);
            if (fbErr) throw fbErr;
            toast.success('Saved to your library');
          }
        }
      } catch (saveErr) {
        // Non-blocking: still show feedback even if save fails (likely due to auth or RLS)
        console.warn('Save skipped or failed:', saveErr);
      }
      setLoading(false);
      toast.success('Feedback generated successfully!', { id: 'analyzing' });

      // Smooth scroll to the feedback section after it's generated
      setTimeout(() => {
        const feedbackElement = document.querySelector('.space-y-8');
        if (feedbackElement) {
          feedbackElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err) {
      console.error(err);
      setError('Failed to generate feedback. Please try again.');
      toast.error('Failed to generate feedback.');
      setLoading(false);
    }
  };

  // Add slide-up animation with stagger effect
const slideUpAnimation = `
  @keyframes slideUp {
    from { 
      opacity: 0; 
      transform: translateY(30px); 
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }
  .slide-up {
    opacity: 0;
    animation: slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  }
  .slide-up-delay-1 { animation-delay: 0.1s; }
  .slide-up-delay-2 { animation-delay: 0.2s; }
  .slide-up-delay-3 { animation-delay: 0.3s; }
  .slide-up-delay-4 { animation-delay: 0.4s; }
  .slide-up-delay-5 { animation-delay: 0.5s; }

  /* Subtle fade-in animation for callouts */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .fade-in { opacity: 0; animation: fadeIn 0.6s ease-out 0.2s forwards; }
`;

  // Rotating thank-you messages for feedback toast
  const feedbackMessages = [
    'Thanks for supporting Simple Rubriq 💛 Your voice helps us improve!',
    'Thank you for helping us make marking smarter 💡',
  ];

  const FEEDBACK_FORM_URL = 'https://forms.cloud.microsoft/r/9bCiPYFz2c';

  const handleFeedbackClick = () => {
    // Show a warm, animated toast (link opens via anchor target)
    const msg = feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)];

    toast.custom(
      (t) => (
        <div
          className={[
            'pointer-events-auto',
            'bg-gradient-to-r from-amber-400 to-amber-200',
            'text-white shadow-lg rounded-lg',
            'px-4 py-3',
            'flex items-center gap-2',
            'max-w-xs sm:max-w-sm',
            'transition-all duration-300',
            t.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
          ].join(' ')}
          role="status"
          aria-live="polite"
        >
          <span className="text-lg">✅</span>
          <span className="text-sm sm:text-base font-semibold">{msg}</span>
        </div>
      ),
      {
        duration: 4500,
        position: 'bottom-right',
      }
    );
  };

return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-12">
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <style>{slideUpAnimation}</style>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Essay Feedback Demo</h1>
      
      {/* Rubric Input Area */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Paste your grading criteria (one per line, e.g. "AO1: Understanding ideas and perspectives")
          </label>
          <textarea
            className="w-full h-32 p-4 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200"
            placeholder="AO1: Understanding ideas and perspectives&#10;AO2: Analysis of language and structure&#10;AO3: Comparison of ideas and perspectives&#10;AO4: Technical accuracy in writing"
            value={rubricText}
            onChange={(e) => {
              setRubricText(e.target.value);
              setRubric(parseRubric(e.target.value));
            }}
          />
          {rubric.length > 0 && (
            <p className="text-sm text-green-600 mt-2">
              ✅ {rubric.length} criteria loaded
            </p>
          )}
        </div>
      </div>

      {/* Essay Input Area */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <textarea
            className="w-full h-64 p-4 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200"
            placeholder="Paste your essay here..."
            value={essayText}
            onChange={handleTextChange}
          />
          <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
            <p>
              Word count: {essayText.trim().split(/\s+/).filter(Boolean).length}
            </p>
            {essayText && (
              <button
                onClick={() => setEssayText('')}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear text
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Upload and Scan Buttons */}
      <div className="flex flex-wrap gap-4 mb-8">
        <label htmlFor="upload-file-input" className="sr-only">Upload essay file</label>
        <input
          type="file"
          ref={fileInputRef}
          accept=".txt,.docx,.pdf"
          id="upload-file-input"
          onChange={handleFileUpload}
          className="hidden"
        />
        <label htmlFor="scan-image-input" className="sr-only">Scan essay image</label>
        <input
          type="file"
          ref={cameraInputRef}
          accept="image/*"
          id="scan-image-input"
          onChange={handleOCRScan}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 bg-white text-gray-700 px-5 py-2.5 rounded-lg shadow-sm hover:bg-gray-50 border border-gray-200 transition-colors duration-200"
        >
          📄 Upload File
        </button>
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="flex items-center gap-2 bg-white text-gray-700 px-5 py-2.5 rounded-lg shadow-sm hover:bg-gray-50 border border-gray-200 transition-colors duration-200"
        >
          📸 Scan Essay
        </button>
        <button
          onClick={generateFeedback}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg shadow-sm hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
          disabled={loading || !essayText.trim()}
        >
          {loading ? '⚡ Analyzing...' : '✨ Generate Feedback'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center items-center mb-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Feedback Display */}
      {feedback && (
        <div className="space-y-8">
          {/* Readability and Tone Section */}
          <div className={`bg-white rounded-xl shadow-md p-6 border-t-4 slide-up slide-up-delay-1 ${
            feedback.readabilityScore <= 3 
              ? 'border-red-500' 
              : feedback.readabilityScore <= 6 
                ? 'border-yellow-500' 
                : 'border-green-500'
          }`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Readability Score */}
              <div className="space-y-3">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <span>📊</span> Readability Score
                </h2>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-3xl font-bold transition-colors duration-300 ${
                      feedback.readabilityScore <= 3 
                        ? 'text-red-600' 
                        : feedback.readabilityScore <= 6 
                          ? 'text-yellow-600' 
                          : 'text-green-600'
                    }`}>
                      {feedback.readabilityScore}/10
                    </span>
                    <span className="text-gray-600 text-sm">{readabilityDescriptions[feedback.readabilityScore as keyof typeof readabilityDescriptions]}</span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        feedback.readabilityScore <= 3 
                          ? 'bg-red-500' 
                          : feedback.readabilityScore <= 6 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                      } ${widthClassFromScore(feedback.readabilityScore)}`}
                    />
                  </div>
                </div>
              </div>

              {/* Writing Tone */}
              <div className="space-y-3">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <span>🎭</span> Writing Tone
                </h2>
                <div className="flex items-center gap-3">
                  <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                    {feedback.tone}
                  </span>
                </div>
              </div>
            </div>
          </div>

            {/* AI Overall Score */}
            {overallScore !== null && (
              <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-sky-500 slide-up slide-up-delay-2">
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <span>🤖</span> AI Overall Score
                </h2>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl font-bold text-sky-700">{overallScore}</span>
                  <span className="text-gray-600 text-sm">out of 100</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                      overallScore >= 70 ? 'bg-green-500' : overallScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    } ${widthClassFromScore(Math.round(overallScore / 10))}`}
                  />
                </div>
              </div>
            )}

          {/* Rubric Assessment */}
          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-indigo-500 slide-up slide-up-delay-2">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>📝</span> GCSE Assessment Objectives
            </h2>
            <div className="space-y-6">
              {feedback.rubricScores.map((score) => {
                const criterion = gcseEnglishRubric.find(c => c.id === score.criterionId);
                if (!criterion) return null;
                
                return (
                  <div key={score.criterionId} className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-800">{criterion.id}: {criterion.name}</h3>
                        <p className="text-sm text-gray-600">{criterion.description}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-sm font-semibold ${
                        score.score >= 7 
                          ? 'bg-green-100 text-green-800'
                          : score.score >= 4
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {score.score}/10
                      </span>
                    </div>
                    <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ${
                          score.score >= 7 
                            ? 'bg-green-500' 
                            : score.score >= 4 
                              ? 'bg-yellow-500' 
                              : 'bg-red-500'
                        } ${widthClassFromScore(score.score)}`}
                      />
                    </div>
                    <p className="text-sm text-gray-700 italic">{score.feedback}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Criteria Matches (AI) */}
          {criteriaMatches && criteriaMatches.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-emerald-500 slide-up slide-up-delay-3">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>🔎</span> Criteria Matches (AI)
              </h2>
              <div className="space-y-4">
                {criteriaMatches.map((cm, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">{cm.criterion}</h3>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                      {cm.examples.map((ex, i) => (
                        <li key={i}>{ex}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Feedback Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Grammar Issues */}
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-red-500 slide-up slide-up-delay-2">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>🔍</span> Grammar Issues
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                {feedback.grammar.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>

            {/* Strengths */}
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-green-500 slide-up slide-up-delay-3">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>💪</span> Strengths
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                {feedback.strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-yellow-500 slide-up slide-up-delay-4">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>💡</span> Areas for Improvement
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                {feedback.improvements.map((improvement, index) => (
                  <li key={index}>{improvement}</li>
                ))}
              </ul>
            </div>

            {/* Suggested Feedback */}
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-500 slide-up slide-up-delay-5">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>✍️</span> Suggested Feedback
              </h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {feedback.suggestedFeedback}
              </p>
            </div>
          </div>

          {/* Rubric-Based Assessment */}
          {rubricMatches.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-500 slide-up slide-up-delay-5">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>📚</span> Rubric-Based Assessment
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rubricMatches.map((match) => {
                  const hasMatches = !match.matchedSentences[0].includes("No clear evidence");
                  const matchCount = hasMatches ? match.matchedSentences.length : 0;
                  
                  return (
                    <div 
                      key={match.id}
                      className={`rounded-lg p-4 shadow-sm border ${
                        matchCount >= 2
                          ? 'border-green-200 bg-green-50'
                          : matchCount === 1
                            ? 'border-yellow-200 bg-yellow-50'
                            : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-800">{match.name}</h3>
                        <span className={`px-2 py-1 text-sm rounded-full font-medium ${
                          matchCount >= 2
                            ? 'bg-green-100 text-green-700'
                            : matchCount === 1
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                        }`}>
                          {matchCount} matches
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{match.description}</p>
                      <ul className="space-y-2">
                        {match.matchedSentences.map((sentence, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <span className="mt-1">
                              {sentence.includes("No clear evidence") ? "❌" : "✅"}
                            </span>
                            <span className="text-gray-700">{sentence}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Essay with Highlighted Matches */}
          {rubricMatches.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-purple-500 slide-up slide-up-delay-5">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>🔍</span> Essay Analysis
              </h2>
              <div className="prose max-w-none">
                {essayText.split(/([.!?])/).map((part, index) => {
                  const sentence = part.trim();
                  if (!sentence || /[.!?]/.test(part)) return part;
                  
                  const isMatched = rubricMatches.some(match => 
                    match.matchedSentences.some(s => s.includes(sentence))
                  );
                  
                  return isMatched ? (
                    <span key={index} className="bg-yellow-100 transition-colors duration-200 hover:bg-yellow-200">
                      {part}
                    </span>
                  ) : part;
                })}
              </div>
            </div>
          )}

          {/* Give Feedback Section */}
          <section
            aria-labelledby="give-feedback-heading"
            className="mx-auto max-w-xl w-full text-center mt-10"
          >
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 fade-in">
              <h2 id="give-feedback-heading" className="sr-only">Give Feedback</h2>
              <p className="text-gray-700 mb-4">
                Thank you for testing Simple Rubriq! Your feedback helps us make marking smarter and more supportive for teachers everywhere.
              </p>
              <a
                href={FEEDBACK_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleFeedbackClick}
                className="inline-flex items-center justify-center gap-2 bg-[#1E3A8A] hover:bg-[#1E40AF] text-white font-bold px-5 py-2.5 rounded-lg transition-colors duration-200"
              >
                <span>🙏</span>
                <span>Share Your Feedback</span>
              </a>
            </div>
          </section>

          {/* Reset Demo Button */}
          <div className="flex justify-center pt-4 slide-up slide-up-delay-6">
            <button
              onClick={() => {
                setEssayText('');
                setRubricText('');
                setRubric([]);
                setRubricMatches([]);
                setFeedback(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
                if (cameraInputRef.current) cameraInputRef.current.value = '';
                toast.success('Demo reset successfully!');
              }}
              className="text-gray-600 hover:text-gray-800 flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
            >
              <span>🔄</span> Reset Demo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Demo;