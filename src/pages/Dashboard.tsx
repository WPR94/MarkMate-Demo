import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import notify from '../utils/notify';

type DashboardStats = {
  essaysCount: number;
  rubricsCount: number;
  feedbackCount: number;
};

type RecentFeedback = {
  id: number;
  created_at: string;
  essay_title: string;
};

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentFeedback, setRecentFeedback] = useState<RecentFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch counts in parallel
        const [essaysResult, rubricsResult, feedbackResult, recentResult] = await Promise.all([
          supabase.from('essays').select('id', { count: 'exact', head: true }).eq('teacher_id', user.id),
          supabase.from('rubrics').select('id', { count: 'exact', head: true }).eq('teacher_id', user.id),
          supabase.from('feedback').select('id', { count: 'exact', head: true }).eq('teacher_id', user.id),
          supabase
            .from('feedback')
            .select('id, created_at, essays(title)')
            .eq('teacher_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5),
        ]);

        if (essaysResult.error) throw essaysResult.error;
        if (rubricsResult.error) throw rubricsResult.error;
        if (feedbackResult.error) throw feedbackResult.error;
        if (recentResult.error) throw recentResult.error;

        setStats({
          essaysCount: essaysResult.count ?? 0,
          rubricsCount: rubricsResult.count ?? 0,
          feedbackCount: feedbackResult.count ?? 0,
        });

        // Transform recent feedback data
        const recent = (recentResult.data ?? []).map((item: any) => ({
          id: item.id,
          created_at: item.created_at,
          essay_title: item.essays?.title || 'Untitled Essay',
        }));

        setRecentFeedback(recent);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        notify.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Teacher Dashboard</h2>
          {user?.email && <p className="text-gray-600">Logged in as {user.email}</p>}
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
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.essaysCount ?? 0}</p>
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
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.rubricsCount ?? 0}</p>
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
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.feedbackCount ?? 0}</p>
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
                {recentFeedback.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No feedback generated yet</p>
                ) : (
                  <ul className="space-y-3">
                    {recentFeedback.map((item) => (
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

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link
                    to="/essay-feedback"
                    className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
                  >
                    <div className="bg-blue-100 rounded-lg p-3 group-hover:bg-blue-200 transition-colors">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="font-semibold text-gray-900 group-hover:text-blue-600">Generate Essay Feedback</p>
                      <p className="text-sm text-gray-500">Upload and analyze essays</p>
                    </div>
                  </Link>

                  <Link
                    to="/rubrics"
                    className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors group"
                  >
                    <div className="bg-green-100 rounded-lg p-3 group-hover:bg-green-200 transition-colors">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="font-semibold text-gray-900 group-hover:text-green-600">Manage Rubrics</p>
                      <p className="text-sm text-gray-500">Create and edit grading criteria</p>
                    </div>
                  </Link>

                  <Link
                    to="/students"
                    className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors group"
                  >
                    <div className="bg-purple-100 rounded-lg p-3 group-hover:bg-purple-200 transition-colors">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="font-semibold text-gray-900 group-hover:text-purple-600">Manage Students</p>
                      <p className="text-sm text-gray-500">View and organize students</p>
                    </div>
                  </Link>

                  <Link
                    to="/analytics"
                    className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors group"
                  >
                    <div className="bg-orange-100 rounded-lg p-3 group-hover:bg-orange-200 transition-colors">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="font-semibold text-gray-900 group-hover:text-orange-600">View Analytics</p>
                      <p className="text-sm text-gray-500">Track performance and trends</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;