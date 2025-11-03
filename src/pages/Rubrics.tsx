import { useEffect, useMemo, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import notify from '../utils/notify';
import { parseRubricFile, parseRubricText, criteriaToCriteriaState } from '../utils/rubricParser';

interface Criterion {
  id: number;
  category: string;
  maxPoints: number;
}

interface RubricRow {
  id: string; // uuid
  subject: string | null;
  name: string;
  description?: string | null;
  criteria: any; // jsonb
  isDefault?: boolean;
  created_at?: string;
}

function Rubrics() {
  const { user } = useAuth();
  const [rubrics, setRubrics] = useState<RubricRow[]>([]);
  const [subject, setSubject] = useState('English');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [criteria, setCriteria] = useState<Criterion[]>([{ id: 0, category: '', maxPoints: 10 }]);
  const [isDefault, setIsDefault] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const criteriaJson = useMemo(() => (
    criteria.map(c => ({ category: c.category, maxPoints: c.maxPoints }))
  ), [criteria]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data, error } = await supabase
        .from('rubrics')
        .select('id, name, subject, criteria, created_at')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });
      if (error) {
        console.error(error);
        notify.error('Failed to load rubrics');
      } else {
        setRubrics(data as RubricRow[]);
      }
    };
    load();
  }, [user]);

  const handleCriterionChange = (idx: number, field: keyof Criterion, value: string | number) => {
    setCriteria(prev => prev.map(c => (c.id === idx ? { ...c, [field]: field === 'maxPoints' ? Number(value) : value } : c)));
  };

  const addCriterion = () => {
    const newId = criteria.length > 0 ? Math.max(...criteria.map(c => c.id)) + 1 : 0;
    setCriteria(prev => [...prev, { id: newId, category: '', maxPoints: 10 }]);
  };

  const removeCriterion = (id: number) => {
    setCriteria(prev => prev.filter(c => c.id !== id));
  };

  const resetForm = () => {
    setSubject('English');
    setName('');
    setDescription('');
    setCriteria([{ id: 0, category: '', maxPoints: 10 }]);
    setIsDefault(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      notify.error('Please sign in to save rubrics');
      return;
    }
    const { data, error } = await supabase
      .from('rubrics')
      .insert([
        {
          name,
          subject,
          criteria: criteriaJson,
          teacher_id: user.id,
        },
      ])
      .select('id, name, subject, criteria, created_at')
      .single();
    if (error) {
      console.error(error);
      notify.error('Failed to save rubric');
      return;
    }
    setRubrics(prev => [data as RubricRow, ...prev]);
    notify.success('Rubric saved');
    resetForm();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Parse the file
      const text = await parseRubricFile(file);
      
      // Parse text into structured criteria
      const parsed = parseRubricText(text);
      
      if (parsed.length === 0) {
        notify.error('No criteria found in file. Please check the format.');
        return;
      }

      // Convert to form state
      const newCriteria = criteriaToCriteriaState(parsed);
      setCriteria(newCriteria);
      
      // Auto-fill name from filename if not set
      if (!name) {
        const baseName = file.name.replace(/\.(txt|docx|pdf)$/i, '');
        setName(baseName);
      }

      notify.success(`Loaded ${parsed.length} criteria from ${file.name}`);
    } catch (error) {
      console.error('File upload error:', error);
      notify.error(error instanceof Error ? error.message : 'Failed to parse rubric file');
    } finally {
      setUploading(false);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Placeholder delete (not wired yet)
  // const handleDelete = (id: string) => {
  //   setRubrics(prev => prev.filter(r => r.id !== id));
  // };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Rubrics Manager</h2>
      <form onSubmit={handleSubmit} className="border p-4 bg-gray-50 rounded mb-6 space-y-4">
        {/* File Upload Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-blue-900">Upload Rubric File</h3>
              <p className="text-sm text-blue-700">Import criteria from .txt, .docx, or .pdf files</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <label htmlFor="rubric-file-upload" className="sr-only">Upload rubric file</label>
            <input
              type="file"
              id="rubric-file-upload"
              ref={fileInputRef}
              accept=".txt,.docx,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? (
                <>
                  <span className="animate-spin">⚡</span>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <span>📄</span>
                  <span>Choose File</span>
                </>
              )}
            </button>
            <p className="text-xs text-gray-600">
              Supported formats: .txt, .docx (PDF coming soon)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">Subject</label>
            <select aria-label="Subject" value={subject} onChange={e => setSubject(e.target.value)} className="border p-2 w-full">
              <option>English</option>
              <option>Math</option>
              <option>Science</option>
              <option>History</option>
              <option>Geography</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Rubric Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="border p-2 w-full" placeholder="Name" required />
          </div>
          <div className="sm:col-span-2">
            <label className="block font-semibold mb-1">Description</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="border p-2 w-full"
              placeholder="Short description"
            />
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-2">Criteria</label>
          {criteria.map((c) => (
            <div key={c.id} className="flex flex-col sm:flex-row gap-2 mb-2 items-center">
              <input
                className="border p-2 flex-1"
                placeholder="Criterion category (e.g. Grammar)"
                value={c.category}
                onChange={e => handleCriterionChange(c.id, 'category', e.target.value)}
                required
              />
              <label className="sr-only" htmlFor={`maxPoints-${c.id}`}>Max points</label>
              <input
                id={`maxPoints-${c.id}`}
                className="border p-2 w-24"
                type="number"
                min="1"
                value={c.maxPoints}
                onChange={e => handleCriterionChange(c.id, 'maxPoints', e.target.value)}
                required
              />
              {criteria.length > 1 && (
                <button type="button" aria-label="Remove criterion" onClick={() => removeCriterion(c.id)} className="text-red-600">
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addCriterion} className="text-blue-600">Add Criterion</button>
        </div>
        <div className="flex items-center space-x-2">
          <input type="checkbox" id="default" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} />
          <label htmlFor="default">Set as default rubric for this subject</label>
        </div>
        <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded">Save Rubric</button>
      </form>
      <h3 className="text-xl font-bold mb-2">Your Rubrics</h3>
      <div className="space-y-4">
        {rubrics.map(r => (
          <div key={r.id} className="border p-4 rounded bg-white shadow-sm">
            <h4 className="font-semibold text-lg">{r.name} {r.subject ? `(${r.subject})` : ''}</h4>
            {Array.isArray(r.criteria) && (
              <ul className="list-disc pl-5 mt-2">
                {r.criteria.map((c: any, idx: number) => (
                  <li key={idx}>{c.category} — {c.maxPoints} pts</li>
                ))}
              </ul>
            )}
            {/* Optional: add delete wired to Supabase later */}
          </div>
        ))}
        {rubrics.length === 0 && <p className="text-gray-500">No rubrics created yet.</p>}
      </div>
    </div>
  );
}

export default Rubrics;