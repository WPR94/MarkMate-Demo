import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import notify from '../utils/notify';
import { parseEssayFile, validateEssay } from '../utils/essayParser';
import { generateAiFeedback, AiFeedback } from '../utils/edgeFunctions';
import Navbar from '../components/Navbar';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

// Helper to create a simple text highlight based on keyword matching
function highlightEssayText(text: string, feedback: AiFeedback | null): React.ReactNode[] {
  if (!feedback) {
    return [<span key={0}>{text}</span>];
  }

  // Extract keywords from feedback for highlighting
  const sentences = text.split(/([.!?]\s+)/);
  
  return sentences.map((sentence, idx) => {
    const lowerSentence = sentence.toLowerCase();
    
    // Check for grammar issues (red highlight)
    const hasGrammarIssue = feedback.grammar_issues.some(issue => {
      const keywords = issue.toLowerCase().match(/\b\w{4,}\b/g) || [];
      return keywords.some(kw => lowerSentence.includes(kw));
    });
    
    // Check for strengths (green highlight)
    const hasStrength = feedback.strengths.some(strength => {
      const keywords = strength.toLowerCase().match(/\b\w{4,}\b/g) || [];
      return keywords.some(kw => lowerSentence.includes(kw));
    });
    
    // Check for criterion matches (purple highlight)
    const hasCriterion = feedback.criteria_matches?.some(match => {
      return match.examples.some(example => {
        const keywords = example.toLowerCase().match(/\b\w{4,}\b/g) || [];
        return keywords.some(kw => lowerSentence.includes(kw));
      });
    });
    
    // Apply highlight based on priority: grammar > criterion > strength
    if (hasGrammarIssue && sentence.trim().length > 10) {
      return (
        <span key={idx} className="bg-red-100 border-b-2 border-red-400 px-1" title="Grammar Issue">
          {sentence}
        </span>
      );
    } else if (hasCriterion && sentence.trim().length > 10) {
      return (
        <span key={idx} className="bg-purple-100 border-b-2 border-purple-400 px-1" title="Rubric Criterion Match">
          {sentence}
        </span>
      );
    } else if (hasStrength && sentence.trim().length > 10) {
      return (
        <span key={idx} className="bg-green-100 border-b-2 border-green-400 px-1" title="Strength">
          {sentence}
        </span>
      );
    }
    
    return <span key={idx}>{sentence}</span>;
  });
}

function EssayFeedback() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [rubricId, setRubricId] = useState<string>('');
  const [studentId, setStudentId] = useState<string>('');
  const [rubrics, setRubrics] = useState<Array<{ id: string; name: string; subject: string }>>([]);
  const [students, setStudents] = useState<Array<{ id: string; name: string }>>([]);
  const [feedback, setFeedback] = useState<AiFeedback | null>(null);
  const [savedEssayId, setSavedEssayId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);

  // Load teacher's rubrics and students on mount
  useEffect(() => {
    if (!user) return;
    
    const loadData = async () => {
      // Load rubrics
      const { data: rubricsData, error: rubricsError } = await supabase
        .from('rubrics')
        .select('id, name, subject')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });
      
      if (rubricsError) {
        console.error('Failed to load rubrics:', rubricsError);
      } else if (rubricsData) {
        setRubrics(rubricsData);
      }
      
      // Load students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id, name')
        .eq('teacher_id', user.id)
        .eq('active', true)
        .order('name');
      
      if (studentsError) {
        console.error('Failed to load students:', studentsError);
      } else if (studentsData) {
        setStudents(studentsData);
      }
    };
    
    loadData();
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
      console.log('💾 Saving essay to database...', {
        title,
        word_count: validation.wordCount,
        teacher_id: user.id,
        rubric_id: rubricId,
        student_id: studentId || null,
        content_length: content.length
      });
      const { data: essayData, error: essayError } = await supabase
        .from('essays')
        .insert([{
          title,
          content,
          word_count: validation.wordCount,
          teacher_id: user.id,
          rubric_id: rubricId,
          student_id: studentId || null,
        }])
        .select('id')
        .single();
      
      console.log('💾 Essay save result:', { essayData, essayError });
      
      if (essayError) {
        console.error('❌ Failed to save essay - Full error:', JSON.stringify(essayError, null, 2));
        notify.error(`Failed to save essay: ${essayError.message || 'Unknown error'}`);
        return;
      }
      
      if (!essayData) {
        console.error('❌ No essay data returned after insert');
        notify.error('Feedback generated but failed to save to database');
        return;
      }
      
      
      // Save feedback to database
      setSavedEssayId(essayData.id);
      console.log('💾 Saving feedback to database...', {
        essay_id: essayData.id,
        rubric_id: rubricId,
        overall_score: aiFeedback.overall_score
      });
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .insert([{
          essay_id: essayData.id,
          rubric_id: rubricId,
          grammar_issues: aiFeedback.grammar_issues,
          strengths: aiFeedback.strengths,
          improvements: aiFeedback.improvements,
          suggested_feedback: aiFeedback.suggested_feedback,
          overall_score: aiFeedback.overall_score,
        }])
        .select('id')
        .single();
      
      console.log('💾 Feedback save result:', { feedbackData, feedbackError });
      
      if (feedbackError) {
        console.error('❌ Failed to save feedback - Full error:', JSON.stringify(feedbackError, null, 2));
        notify.error(`Essay saved but feedback failed to save: ${feedbackError.message || 'Unknown error'}`);
      } else {
        console.log('✅ Essay and feedback saved successfully!');
        notify.success('AI feedback generated and saved successfully!');
      }
    } catch (error) {
      console.error('Generate error:', error);
      notify.error(error instanceof Error ? error.message : 'Failed to generate feedback');
    } finally {
      setGenerating(false);
    }
  };

  const handleDone = () => {
    // Clear state and scroll to top for new feedback
    setFeedback(null);
    setSavedEssayId(null);
    setTitle('');
    setContent('');
    setRubricId('');
    setStudentId('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    notify.success('Ready to grade another essay!');
  };

  const handleExportText = () => {
    if (!feedback) return;
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const maxWidth = pageWidth - margin * 2;
      let yPosition = 20;
      
      // Helper to add text with wrapping
      const addText = (text: string, fontSize = 10, isBold = false) => {
        doc.setFontSize(fontSize);
        if (isBold) doc.setFont('helvetica', 'bold');
        else doc.setFont('helvetica', 'normal');
        
        const lines = doc.splitTextToSize(text, maxWidth);
        lines.forEach((line: string) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, margin, yPosition);
          yPosition += fontSize * 0.5;
        });
        yPosition += 3;
      };
      
      // Title
      addText('ESSAY FEEDBACK REPORT', 16, true);
      yPosition += 2;
      addText(`Essay: ${title}`, 12, true);
      addText(`Date: ${new Date().toLocaleDateString()}`, 10);
      addText(`Overall Score: ${feedback.overall_score}/100`, 12, true);
      yPosition += 5;
      
      // Grammar Issues
      addText('GRAMMAR ISSUES', 12, true);
      feedback.grammar_issues.forEach((issue, i) => {
        addText(`${i + 1}. ${issue}`, 10);
      });
      yPosition += 5;
      
      // Strengths
      addText('STRENGTHS', 12, true);
      feedback.strengths.forEach((strength, i) => {
        addText(`${i + 1}. ${strength}`, 10);
      });
      yPosition += 5;
      
      // Improvements
      addText('AREAS FOR IMPROVEMENT', 12, true);
      feedback.improvements.forEach((improvement, i) => {
        addText(`${i + 1}. ${improvement}`, 10);
      });
      yPosition += 5;
      
      // Criteria Matches
      if (feedback.criteria_matches && feedback.criteria_matches.length > 0) {
        addText('RUBRIC CRITERIA ANALYSIS', 12, true);
        feedback.criteria_matches.forEach((match) => {
          addText(match.criterion, 11, true);
          match.examples.forEach((example) => {
            addText(`• ${example}`, 10);
          });
          yPosition += 2;
        });
        yPosition += 5;
      }
      
      // Suggested Feedback
      addText('SUGGESTED FEEDBACK SUMMARY', 12, true);
      addText(feedback.suggested_feedback, 10);
      yPosition += 5;
      
      // Essay Content
      addText('ESSAY CONTENT', 12, true);
      addText(content, 9);
    
      // Save PDF
      doc.save(`${title.replace(/[^a-z0-9]/gi, '_')}_feedback.pdf`);
      notify.success('Feedback exported as PDF!');
    } catch (error) {
      console.error('PDF export error:', error);
      notify.error('Failed to export PDF');
    }
  };

  const handlePrint = () => {
    if (!feedback) return;
    window.print();
  };

  const handleExportDocx = async () => {
    if (!feedback) return;
    try {
      const paragraphs: Paragraph[] = [];
      const pushHeading = (text: string, level: any = HeadingLevel.HEADING_2) => {
        paragraphs.push(new Paragraph({ text, heading: level }));
      };
      const pushText = (text: string) => {
        paragraphs.push(new Paragraph({ children: [new TextRun(text)] }));
      };

      pushHeading('Essay Feedback Report', HeadingLevel.HEADING_1);
      pushText(`Essay Title: ${title}`);
      pushText(`Date: ${new Date().toLocaleDateString()}`);
      pushText(`Overall Score: ${feedback.overall_score}/100`);

      pushHeading('Grammar Issues');
      feedback.grammar_issues.forEach((s, i) => pushText(`${i + 1}. ${s}`));

      pushHeading('Strengths');
      feedback.strengths.forEach((s, i) => pushText(`${i + 1}. ${s}`));

      pushHeading('Areas for Improvement');
      feedback.improvements.forEach((s, i) => pushText(`${i + 1}. ${s}`));

      if (feedback.criteria_matches && feedback.criteria_matches.length > 0) {
        pushHeading('Rubric Criteria Analysis');
        feedback.criteria_matches.forEach((m) => {
          paragraphs.push(new Paragraph({ text: m.criterion, heading: HeadingLevel.HEADING_3 }));
          m.examples.forEach((ex) => pushText(`• ${ex}`));
        });
      }

      pushHeading('Suggested Feedback Summary');
      pushText(feedback.suggested_feedback);

      pushHeading('Essay Content');
      feedback.suggested_feedback.split('\n').forEach((line) => pushText(line));
      pushText(content);

      const doc = new Document({ sections: [{ properties: {}, children: paragraphs }] });
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]/gi, '_')}_feedback.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      notify.success('Feedback exported as DOCX!');
    } catch (err) {
      console.error('DOCX export error:', err);
      notify.error('Failed to export DOCX');
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-900">Essay Feedback Generator</h2>
        
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
            Select Rubric <span className="text-red-500">*</span>
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
        
        {/* Student Selection */}
        <div className="mb-6">
          <label htmlFor="student-select" className="block font-semibold text-gray-700 mb-2">
            Select Student <span className="text-gray-400 text-sm">(Optional)</span>
          </label>
          <select
            id="student-select"
            value={studentId}
            onChange={e => setStudentId(e.target.value)}
            className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Unassigned --</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {students.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              No students found. <a href="/students" className="text-blue-600 hover:underline">Add students</a> to link essays.
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
            {/* Success Banner */}
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500 rounded-full p-2">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-900">✅ Feedback Generated & Saved!</h3>
                    <p className="text-green-700 text-sm mt-1">Your feedback is ready and has been saved to your history.</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleDone}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center gap-2"
                >
                  <span>✨</span>
                  <span>Grade Another Essay</span>
                </button>
                <a
                  href="/feedback-history"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
                >
                  <span>📋</span>
                  <span>View All Feedback</span>
                </a>
                <a
                  href="/dashboard"
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold flex items-center gap-2"
                >
                  <span>🏠</span>
                  <span>Go to Dashboard</span>
                </a>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900">AI Feedback Results</h3>
              <div className="flex gap-3">
                {savedEssayId && (
                  <a
                    href="/feedback-history"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    📋 View in History
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleExportDocx}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  📄 Export as DOCX
                </button>
                <button
                  type="button"
                  onClick={handleExportText}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  � Export as PDF
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  🖨️ Print
                </button>
              </div>
            </div>
            
            {/* Highlighted Essay View */}
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Essay with Highlights</h4>
              <div className="mb-3 flex gap-4 text-sm">
                <span className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 bg-red-100 border-b-2 border-red-400"></span>
                  Grammar Issues
                </span>
                <span className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 bg-purple-100 border-b-2 border-purple-400"></span>
                  Rubric Match
                </span>
                <span className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 bg-green-100 border-b-2 border-green-400"></span>
                  Strengths
                </span>
              </div>
              <div className="bg-white p-4 rounded border border-gray-200 max-h-96 overflow-y-auto text-sm leading-relaxed">
                {highlightEssayText(content, feedback)}
              </div>
            </div>
            
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
    </>
  );
}

export default EssayFeedback;