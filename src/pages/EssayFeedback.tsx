import { useState } from 'react';

function EssayFeedback() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [feedback, setFeedback] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      // For simplicity, read the file as text. In a production app you would parse
      // PDF or DOCX properly using pdfjs or mammoth.
      const text = await file.text();
      setContent(text);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const imgFile = e.target.files?.[0];
    if (!imgFile) return;
    setUploading(true);
    try {
      // Placeholder for OCR: you would integrate tesseract.js or call a serverless
      // function here to extract text from the image.
      setContent('Scanned text would appear here.');
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate = () => {
    // Placeholder for AI call: in a real app, invoke an edge function
    // or API to get AI-generated feedback based on the essay content.
    setFeedback(`Feedback for "${title}"\n\n${content.slice(0, 200)}...`);
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Essay Feedback</h2>
      <input
        className="border p-2 mb-2 w-full"
        type="text"
        placeholder="Essay Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <textarea
        className="border p-2 mb-2 w-full h-40"
        placeholder="Paste or upload essay content"
        value={content}
        onChange={e => setContent(e.target.value)}
      />
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <label className="bg-blue-500 text-white py-2 px-4 rounded cursor-pointer text-center">
          Upload File
          <input
            type="file"
            accept=".txt,.pdf,.docx"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>
        <label className="bg-purple-500 text-white py-2 px-4 rounded cursor-pointer text-center">
          Scan Document
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleScan}
          />
        </label>
      </div>
      {uploading && <p>Processing...</p>}
      <button
        className="bg-green-600 text-white py-2 px-4 rounded mb-4"
        onClick={handleGenerate}
      >
        Generate Feedback
      </button>
      {feedback && (
        <div className="border p-4 bg-gray-50 whitespace-pre-wrap">
          <h3 className="font-bold mb-2">AI Feedback:</h3>
          <pre>{feedback}</pre>
        </div>
      )}
    </div>
  );
}

export default EssayFeedback;