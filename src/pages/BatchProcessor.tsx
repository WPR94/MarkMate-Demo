import { useState } from 'react';

interface BatchEssay {
  title: string;
  content: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

function BatchProcessor() {
  const [essays, setEssays] = useState<BatchEssay[]>([]);
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    try {
      const text = await file.text();
      let parsed: BatchEssay[] = [];
      if (ext === 'json') {
        const jsonData = JSON.parse(text);
        if (Array.isArray(jsonData)) {
          parsed = jsonData.map(item => ({
            title: item.title ?? 'Untitled',
            content: item.content ?? '',
            status: 'pending',
          }));
        }
      } else if (ext === 'csv') {
        const lines = text.trim().split(/\r?\n/);
        const headers = lines[0].split(',');
        const titleIndex = headers.findIndex(h => h.toLowerCase() === 'title');
        const contentIndex = headers.findIndex(h => h.toLowerCase() === 'content');
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',');
          parsed.push({
            title: cols[titleIndex] ?? 'Untitled',
            content: cols[contentIndex] ?? '',
            status: 'pending',
          });
        }
      }
      setEssays(parsed);
    } catch (err) {
      console.error('Failed to parse batch file', err);
    }
  };

  const processEssays = async () => {
    setProcessing(true);
    let completed = 0;
    const updatedEssays: BatchEssay[] = [];
    for (const essay of essays) {
      updatedEssays.push({ ...essay, status: 'processing' });
      setEssays([...updatedEssays, ...essays.slice(updatedEssays.length)]);
      // Simulate asynchronous processing
      await new Promise(resolve => setTimeout(resolve, 500));
      completed++;
      setProgress(Math.round((completed / essays.length) * 100));
      updatedEssays[updatedEssays.length - 1].status = 'completed';
      setEssays([...updatedEssays, ...essays.slice(updatedEssays.length)]);
    }
    setProcessing(false);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Batch Processor</h2>
      <p className="mb-4">Upload a JSON or CSV file with multiple essays to process them sequentially.</p>
      <label className="bg-blue-500 text-white py-2 px-4 rounded cursor-pointer inline-block mb-4">
        Upload Batch File
        <input type="file" accept=".json,.csv" className="hidden" onChange={handleFileUpload} />
      </label>
      {essays.length > 0 && !processing && (
        <button onClick={processEssays} className="bg-green-600 text-white py-2 px-4 rounded ml-4">Start Processing</button>
      )}
      {processing && (
        <div className="w-full bg-gray-200 h-4 rounded mt-4 mb-4">
          <div
            className="bg-green-500 h-full rounded"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      <ul className="divide-y divide-gray-200">
        {essays.map((essay, idx) => (
          <li key={idx} className="p-2">
            <strong>{essay.title}</strong> – {essay.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BatchProcessor;