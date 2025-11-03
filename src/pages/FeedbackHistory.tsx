import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import notify from '../utils/notify';

interface FeedbackItem {
  id: number;
  created_at: string;
  essay_id: number;
  overall_score: number;
  grammar_issues: string[];
  strengths: string[];
  improvements: string[];
  suggested_feedback: string;
  essays: {
    title: string;
    content: string;
    created_at: string;
  };
}

function FeedbackHistory() {
  const { user } = useAuth();
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');

  useEffect(() => {
    if (!user) return;

    const loadFeedback = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('feedback')
          .select(`
            id,
            created_at,
            essay_id,
            overall_score,
            grammar_issues,
            strengths,
            improvements,
            suggested_feedback,
            essays (
              title,
              content,
              created_at
            )
          `)
          .eq('teacher_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setFeedbackList((data as any) || []);
      } catch (error) {
        console.error('Failed to load feedback:', error);
        notify.error('Failed to load feedback history');
      } finally {
        setLoading(false);
      }
    };

    loadFeedback();
  }, [user]);

  // Filter and sort feedback
  const filteredFeedback = feedbackList
    .filter(item => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        item.essays?.title?.toLowerCase().includes(query) ||
        item.suggested_feedback?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'score') {
        return b.overall_score - a.overall_score;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;

    try {
      const { error } = await supabase
        .from('feedback')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFeedbackList(prev => prev.filter(item => item.id !== id));
      if (selectedFeedback?.id === id) {
        setSelectedFeedback(null);
      }
      notify.success('Feedback deleted');
    } catch (error) {
      console.error('Delete error:', error);
      notify.error('Failed to delete feedback');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Feedback History</h2>
          <p className="text-gray-600">View and manage all graded essays and their AI feedback</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">Search feedback</label>
            <input
              id="search"
              type="text"
              placeholder="Search by essay title or feedback..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="sort" className="sr-only">Sort by</label>
            <select
              id="sort"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'date' | 'score')}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="score">Sort by Score</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredFeedback.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No matching feedback found' : 'No feedback history yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Start grading essays to see feedback history here'}
            </p>
            {!searchQuery && (
              <a
                href="/essay-feedback"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Grade an Essay
              </a>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Feedback List */}
            <div className="lg:col-span-1 space-y-4">
              {filteredFeedback.map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelectedFeedback(item)}
                  className={`bg-white rounded-lg shadow-sm p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedFeedback?.id === item.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
                      {item.essays?.title || 'Untitled Essay'}
                    </h3>
                    <span className={`ml-2 px-2 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${getScoreColor(item.overall_score)}`}>
                      {item.overall_score}/100
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{formatDate(item.created_at)}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{item.suggested_feedback}</p>
                </div>
              ))}
            </div>

            {/* Detailed View */}
            <div className="lg:col-span-2">
              {selectedFeedback ? (
                <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedFeedback.essays?.title || 'Untitled Essay'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Graded on {formatDate(selectedFeedback.created_at)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(selectedFeedback.id)}
                      className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded transition-colors"
                      aria-label="Delete feedback"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {/* Overall Score */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-700">Overall Score</span>
                      <span className="text-3xl font-bold text-blue-600">
                        {selectedFeedback.overall_score}/100
                      </span>
                    </div>
                  </div>

                  {/* Grammar Issues */}
                  {selectedFeedback.grammar_issues && selectedFeedback.grammar_issues.length > 0 && (
                    <div className="border-l-4 border-red-500 pl-4">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">Grammar Issues</h4>
                      <ul className="list-disc pl-5 space-y-1 text-gray-700">
                        {selectedFeedback.grammar_issues.map((issue, idx) => (
                          <li key={idx}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Strengths */}
                  {selectedFeedback.strengths && selectedFeedback.strengths.length > 0 && (
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">Strengths</h4>
                      <ul className="list-disc pl-5 space-y-1 text-gray-700">
                        {selectedFeedback.strengths.map((strength, idx) => (
                          <li key={idx}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Improvements */}
                  {selectedFeedback.improvements && selectedFeedback.improvements.length > 0 && (
                    <div className="border-l-4 border-yellow-500 pl-4">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">Areas for Improvement</h4>
                      <ul className="list-disc pl-5 space-y-1 text-gray-700">
                        {selectedFeedback.improvements.map((improvement, idx) => (
                          <li key={idx}>{improvement}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggested Feedback */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Suggested Feedback Summary</h4>
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                      {selectedFeedback.suggested_feedback}
                    </p>
                  </div>

                  {/* Essay Content */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Original Essay</h4>
                    <div className="max-h-96 overflow-y-auto">
                      <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                        {selectedFeedback.essays?.content}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <div className="text-6xl mb-4">👈</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Select Feedback to View</h3>
                  <p className="text-gray-600">Click on any feedback item to see details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FeedbackHistory;
