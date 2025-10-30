import { useState } from 'react';

interface Criterion {
  id: number;
  category: string;
  maxPoints: number;
}

interface Rubric {
  id: number;
  subject: string;
  name: string;
  description: string;
  criteria: Criterion[];
  isDefault: boolean;
}

function Rubrics() {
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [subject, setSubject] = useState('English');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [criteria, setCriteria] = useState<Criterion[]>([{ id: 0, category: '', maxPoints: 10 }]);
  const [isDefault, setIsDefault] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRubric: Rubric = {
      id: Date.now(),
      subject,
      name,
      description,
      criteria,
      isDefault,
    };
    setRubrics(prev => [...prev, newRubric]);
    resetForm();
  };

  const handleDelete = (id: number) => {
    setRubrics(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Rubrics Manager</h2>
      <form onSubmit={handleSubmit} className="border p-4 bg-gray-50 rounded mb-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">Subject</label>
            <select value={subject} onChange={e => setSubject(e.target.value)} className="border p-2 w-full">
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
          {criteria.map((c, index) => (
            <div key={c.id} className="flex flex-col sm:flex-row gap-2 mb-2 items-center">
              <input
                className="border p-2 flex-1"
                placeholder="Criterion category (e.g. Grammar)"
                value={c.category}
                onChange={e => handleCriterionChange(c.id, 'category', e.target.value)}
                required
              />
              <input
                className="border p-2 w-24"
                type="number"
                min="1"
                value={c.maxPoints}
                onChange={e => handleCriterionChange(c.id, 'maxPoints', e.target.value)}
                required
              />
              {criteria.length > 1 && (
                <button type="button" onClick={() => removeCriterion(c.id)} className="text-red-600">
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
      <h3 className="text-xl font-bold mb-2">Existing Rubrics</h3>
      <div className="space-y-4">
        {rubrics.map(rubric => (
          <div key={rubric.id} className="border p-4 rounded bg-white shadow-sm">
            <h4 className="font-semibold text-lg">{rubric.name} ({rubric.subject}) {rubric.isDefault && <span className="text-sm text-blue-600">[Default]</span>}</h4>
            {rubric.description && <p className="text-gray-600">{rubric.description}</p>}
            <ul className="list-disc pl-5 mt-2">
              {rubric.criteria.map(c => (
                <li key={c.id}>{c.category} — {c.maxPoints} pts</li>
              ))}
            </ul>
            <button onClick={() => handleDelete(rubric.id)} className="text-red-600 mt-2">Delete</button>
          </div>
        ))}
        {rubrics.length === 0 && <p className="text-gray-500">No rubrics created yet.</p>}
      </div>
    </div>
  );
}

export default Rubrics;