import React, { useMemo, useState } from 'react';
import { CommentSnippet, defaultCommentBank, AO } from '../data/commentBank';

type TargetBucket = 'strengths' | 'improvements' | 'grammar_issues';

interface CommentBankProps {
  onInsert: (text: string, target?: TargetBucket) => void;
  snippets?: CommentSnippet[];
}

export default function CommentBank({ onInsert, snippets }: CommentBankProps) {
  const [query, setQuery] = useState('');
  const [ao, setAo] = useState<AO | 'ALL'>('ALL');
  const [category, setCategory] = useState<'all' | 'strength' | 'improvement' | 'spag'>('all');
  const [target, setTarget] = useState<TargetBucket>('improvements');

  const items = snippets || defaultCommentBank;

  const filtered = useMemo(() => {
    return items.filter((s) => {
      if (ao !== 'ALL' && s.ao !== ao) return false;
      if (category !== 'all' && s.category !== category) return false;
      if (query && !s.text.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [items, ao, category, query]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg">
      <div className="flex flex-wrap gap-3 items-center p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600" htmlFor="cb-ao">AO</label>
          <select id="cb-ao" value={ao} onChange={(e) => setAo(e.target.value as AO | 'ALL')} className="text-sm border rounded px-2 py-1">
            <option value="ALL">All</option>
            <option value="AO1">AO1</option>
            <option value="AO2">AO2</option>
            <option value="AO3">AO3</option>
            <option value="AO4">AO4</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600" htmlFor="cb-cat">Type</label>
          <select id="cb-cat" value={category} onChange={(e) => setCategory(e.target.value as any)} className="text-sm border rounded px-2 py-1">
            <option value="all">All</option>
            <option value="strength">Strength</option>
            <option value="improvement">Improvement</option>
            <option value="spag">SPaG</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600" htmlFor="cb-target">Insert to</label>
          <select id="cb-target" value={target} onChange={(e) => setTarget(e.target.value as TargetBucket)} className="text-sm border rounded px-2 py-1">
            <option value="improvements">Improvements</option>
            <option value="strengths">Strengths</option>
            <option value="grammar_issues">Grammar Issues</option>
          </select>
        </div>
        <input
          aria-label="Search comment bank"
          placeholder="Search snippets..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 min-w-[160px] text-sm border rounded px-2 py-1"
        />
      </div>

      <div className="max-h-64 overflow-y-auto divide-y">
        {filtered.map((s) => (
          <div key={s.id} className="p-3 flex items-start justify-between gap-3">
            <div>
              <div className="text-xs text-gray-500 mb-1">{s.ao} • {s.category}</div>
              <div className="text-sm text-gray-800">{s.text}</div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => onInsert(s.text, target)}
                aria-label="Insert comment"
              >
                Insert
              </button>
              <button
                className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded border hover:bg-gray-200"
                onClick={() => copyToClipboard(s.text)}
                aria-label="Copy comment"
              >
                Copy
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="p-4 text-sm text-gray-500">No snippets match your filters.</div>
        )}
      </div>
    </div>
  );
}
