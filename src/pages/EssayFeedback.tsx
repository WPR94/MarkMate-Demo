import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import notify from '../utils/notify';
import { parseEssayFile, validateEssay } from '../utils/essayParser';
import { generateAiFeedback, AiFeedback } from '../utils/edgeFunctions';

function EssayFeedback() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [rubricId, setRubricId] = useState<string>('');
  const [rubrics, setRubrics] = useState<Array<{ id: string; name: string; subject: string }>>([]);
  const [feedback, setFeedback] = useState<AiFeedback | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);

  // Load teacher's rubrics on mount
  useEffect(() => {
    if (!user) return;
    const loadRubrics = async () => {
      const { data, error } = await supabase
        .from('rubrics')
        .select('id, name, subject')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Failed to load rubrics:', error);
      } else if (data) {
        setRubrics(data);
      }
    };
    loadRubrics();
  }, [user]);
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    
    try {
      const text = await parseEssayFile(file, (progress) => {
        setUploadProgress(progress);
      });
      
      setContent(text);
      
      // Auto-fill title from filename if not set
      if (!title) {
        const baseName = file.name.replace(/\.(txt|docx|pdf)$/i, '');
        setTitle(baseName);
      }
      
      notify.success(`Essay loaded from ${file.name}`);
    } catch (error) {
      console.error('File upload error:', error);
      notify.error(error instanceof Error ? error.message : 'Failed to parse essay file');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const imgFile = e.target.files?.[0];
    if (!imgFile) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      const text = await parseEssayFile(imgFile, (progress) => {
        setUploadProgress(progress);
      });
      
      setContent(text);
      notify.success('Essay scanned successfully');
    } catch (error) {
      console.error('Scan error:', error);
      notify.error(error instanceof Error ? error.message : 'Failed to scan essay');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (scanInputRef.current) {
        scanInputRef.current.value = '';
      }
    }
  };

  const handleGenerate = async () => {
    // Validate essay
    const validation = validateEssay(content);
    if (!validation.valid) {
      notify.error(validation.error || 'Invalid essay');
      return;
    }
    
    if (!title.trim()) {
      notify.error('Please enter an essay title');
      return;
    }
    
    if (!user) {
      notify.error('Please sign in to generate AI feedback');
      return;
    }
    
    if (!rubricId) {
      notify.error('Please select a rubric');
      return;
    }
    
    setGenerating(true);
    
    try {
      // Get rubric details
      const { data: rubricData, error: rubricError } = await supabase
        .from('rubrics')
        .select('criteria')
        .eq('id', rubricId)
        .single();
      
      if (rubricError || !rubricData) {
        throw new Error('Failed to load rubric');
      }
      
      // Call AI Edge Function
      const aiFeedback = await generateAiFeedback(content, { criteria: rubricData.criteria });
      
      setFeedback(aiFeedback);
      
      // Save essay and feedback to database
      const { data: essayData, error: essayError } = await supabase
        .from('essays')
        .insert([{
          title,
          content,
          teacher_id: user.id,
        }])
        .select('id')
        .single();
      
      if (essayError || !essayData) {
        console.error('Failed to save essay:', essayError);
        // Continue anyway - feedback was generated
      }
      
      if (essayData) {
        const { error: feedbackError } = await supabase
          .from('feedback')
          .insert([{
            essay_id: essayData.id,
            teacher_id: user.id,
            grammar_issues: aiFeedback.grammar_issues,
            strengths: aiFeedback.strengths,
            improvements: aiFeedback.improvements,
            suggested_feedback: aiFeedback.suggested_feedback,
            overall_score: aiFeedback.overall_score,
          }]);
        
        if (feedbackError) {
          console.error('Failed to save feedback:', feedbackError);
        }
      }
      
      notify.success('AI feedback generated successfully!');
    } catch (error) {
      console.error('Generate error:', error);
      notify.error(error instanceof Error ? error.message : 'Failed to generate feedback');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">Essay Feedback Generator</h2>
      
      {/* Essay Title */}
      <div className="mb-6">
        <label htmlFor="essay-title" className="block font-semibold text-gray-700 mb-2">
          Essay Title
        </label>
        <input
          id="essay-title"
          className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          type="text"
          placeholder="Enter essay title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </div>
      
      {/* Rubric Selection */}
      <div className="mb-6">
        <label htmlFor="rubric-select" className="block font-semibold text-gray-700 mb-2">
          Select Rubric
        </label>
        <select
          id="rubric-select"
          value={rubricId}
          onChange={e => setRubricId(e.target.value)}
          className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">-- Choose a rubric --</option>
          {rubrics.map(r => (
            <option key={r.id} value={r.id}>
              {r.name} {r.subject && `(${r.subject})`}
            </option>
          ))}
        </select>
        {rubrics.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">
            No rubrics found. <a href="/rubrics" className="text-blue-600 hover:underline">Create one</a> first.
          </p>
        )}
      </div>
      
      {/* Essay Content */}
      <div className="mb-6">
        <label htmlFor="essay-content" className="block font-semibold text-gray-700 mb-2">
          Essay Content
        </label>
        <textarea
          id="essay-content"
          className="border border-gray-300 p-3 w-full h-64 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          placeholder="Paste essay content here or upload a file..."
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-gray-600">
            Word count: {content.trim().split(/\s+/).filter(Boolean).length}
          </p>
          {content && (
            <button
              type="button"
              onClick={() => setContent('')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      
      {/* Upload Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <label htmlFor="file-upload" className="sr-only">Upload essay file</label>
        <input
          id="file-upload"
          ref={fileInputRef}
          type="file"
          accept=".txt,.docx,.pdf"
          className="hidden"
          onChange={handleFileUpload}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {uploading && uploadProgress > 0 ? (
            <>
              <span className="animate-spin">⚡</span>
              <span>Processing ({uploadProgress}%)</span>
            </>
          ) : uploading ? (
            <>
              <span className="animate-spin">⚡</span>
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <span>📄</span>
              <span>Upload File (.txt, .docx)</span>
            </>
          )}
        </button>
        
        <label htmlFor="scan-upload" className="sr-only">Scan essay image</label>
        <input
          id="scan-upload"
          ref={scanInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleScan}
        />
        <button
          type="button"
          onClick={() => scanInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center justify-center gap-2 bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {uploading && uploadProgress > 0 ? (
            <>
              <span className="animate-spin">📸</span>
              <span>Scanning ({uploadProgress}%)</span>
            </>
          ) : uploading ? (
            <>
              <span className="animate-spin">📸</span>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>📸</span>
              <span>Scan Document (OCR)</span>
            </>
          )}
        </button>
      </div>
      
      {/* Generate Button */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={generating || !content.trim() || !title.trim() || !rubricId}
        className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-6"
      >
        {generating ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⚡</span>
            <span>Generating AI Feedback...</span>
          </span>
        ) : (
          <span>✨ Generate AI Feedback</span>
        )}
      </button>
      
      {/* Feedback Display */}
      {feedback && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 space-y-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Feedback Results</h3>
          
          {/* Overall Score */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-700">Overall Score</span>
              <span className="text-3xl font-bold text-blue-600">{feedback.overall_score}/100</span>
            </div>
          </div>
          
          {/* Grammar Issues */}
          <div className="border-l-4 border-red-500 pl-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Grammar Issues</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              {feedback.grammar_issues.map((issue, idx) => (
                <li key={idx}>{issue}</li>
              ))}
            </ul>
          </div>
          
          {/* Strengths */}
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Strengths</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              {feedback.strengths.map((strength, idx) => (
                <li key={idx}>{strength}</li>
              ))}
            </ul>
          </div>
          
          {/* Improvements */}
          <div className="border-l-4 border-yellow-500 pl-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Areas for Improvement</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              {feedback.improvements.map((improvement, idx) => (
                <li key={idx}>{improvement}</li>
              ))}
            </ul>
          </div>
          
          {/* Criteria Matches */}
          {feedback.criteria_matches && feedback.criteria_matches.length > 0 && (
            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Rubric Criteria Analysis</h4>
              {feedback.criteria_matches.map((match, idx) => (
                <div key={idx} className="mb-3">
                  <p className="font-medium text-gray-800">{match.criterion}</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                    {match.examples.map((example, exIdx) => (
                      <li key={exIdx}>{example}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
          
          {/* Suggested Feedback */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Suggested Feedback Summary</h4>
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">{feedback.suggested_feedback}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default EssayFeedback;