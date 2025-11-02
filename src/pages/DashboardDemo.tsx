import { useEffect, useState } from 'react';

function DashboardDemo() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ essaysCount: 0, rubricsCount: 0, feedbackCount: 0 });
  const [recent, setRecent] = useState<Array<{ id: number; created_at: string; essay_title: string }>>([]);

  useEffect(() => {
    // Simulate loading and populate with mock data
    const timer = setTimeout(() => {
      setStats({ essaysCount: 18, rubricsCount: 5, feedbackCount: 64 });
      setRecent([
        { id: 1, created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), essay_title: 'Climate Change and Responsibility' },
        { id: 2, created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), essay_title: 'The Power of Rhetoric' },
        { id: 3, created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), essay_title: 'Identity in Modern Literature' },
      ]);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-1">Teacher Dashboard (Demo)</h2>
          <p className="text-gray-600">This is a public demo view using sample data. Sign in to see your real stats.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Total Essays</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.essaysCount}</p>
                  </div>
                  <div className="bg-blue-100 rounded-full p-3">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Rubrics Created</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.rubricsCount}</p>
                  </div>
                  <div className="bg-green-100 rounded-full p-3">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Feedback Generated</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.feedbackCount}</p>
                  </div>
                  <div className="bg-purple-100 rounded-full p-3">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow mb-8">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Recent Feedback</h3>
              </div>
              <div className="p-6">
                {recent.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No feedback generated yet</p>
                ) : (
                  <ul className="space-y-3">
                    {recent.map((item) => (
                      <li key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div>
                          <p className="font-medium text-gray-900">{item.essay_title}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(item.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default DashboardDemo;
