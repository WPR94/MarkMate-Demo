import { useEffect, useMemo, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import notify from '../utils/notify';
import Navbar from '../components/Navbar';
import ErrorBoundary from '../components/ErrorBoundary';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardSkeleton, ChartSkeleton } from '../components/LoadingSkeleton';
import { useKeyboardShortcuts, KeyboardShortcutsHelp } from '../hooks/useKeyboardShortcuts';
import { OnboardingTour, useOnboardingTour } from '../components/OnboardingTour';

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

type FeedbackData = {
  created_at: string;
  overall_score: number;
};

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentFeedback, setRecentFeedback] = useState<RecentFeedback[]>([]);
  const [feedbackData, setFeedbackData] = useState<FeedbackData[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);
  const cacheKey = user ? `dashboard:snapshot:${user.id}` : undefined;
  const hasFetchedRef = useRef(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Onboarding tour
  const { showTour, completeTour, skipTour } = useOnboardingTour('simple-rubriq-dashboard-tour');

  const tourSteps = [
    {
      target: '[data-tour="stats"]',
      title: '👋 Welcome to Simple Rubriq!',
      content: 'Save hours by grading essays against your own rubrics. Your dashboard gives you an at-a-glance view of all your grading activity—track essays, rubrics, and AI-generated feedback in one place.',
      placement: 'bottom' as const,
    },
    {
      target: '[data-tour="essay-feedback"]',
      title: '✍️ Start Grading Essays',
      content: 'Click here to upload and grade essays. You can paste text directly, or upload PDF/DOCX files. Our AI will analyze the content and provide detailed feedback based on your rubrics.',
      placement: 'top' as const,
    },
    {
      target: '[data-tour="rubrics"]',
      title: '📋 Create Custom Rubrics',
      content: 'Manage your grading criteria here. Upload rubrics from files or create custom scoring categories. Each rubric can be reused across multiple assignments.',
      placement: 'top' as const,
    },
    {
      target: '[data-tour="students"]',
      title: '👥 Manage Your Students',
      content: 'Keep track of your student roster. Import students from CSV files or add them individually. Link essays to students for better organization and tracking.',
      placement: 'top' as const,
    },
    {
      target: '[data-tour="analytics"]',
      title: '📊 View Insights & Analytics',
      content: 'See detailed performance trends, score distributions, and export your data to CSV. Track student progress over time and identify areas for improvement.',
      placement: 'top' as const,
    },
  ];

  // Memoized chart datasets
  const trendChartData = useMemo(() => feedbackData.slice(0, 10).reverse(), [feedbackData]);
  const scoreDistributionData = useMemo(() => ([
    { range: '0-20', count: feedbackData.filter(f => f.overall_score >= 0 && f.overall_score < 20).length },
    { range: '20-40', count: feedbackData.filter(f => f.overall_score >= 20 && f.overall_score < 40).length },
    { range: '40-60', count: feedbackData.filter(f => f.overall_score >= 40 && f.overall_score < 60).length },
    { range: '60-80', count: feedbackData.filter(f => f.overall_score >= 60 && f.overall_score < 80).length },
    { range: '80-100', count: feedbackData.filter(f => f.overall_score >= 80 && f.overall_score <= 100).length },
  ]), [feedbackData]);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'e',
      ctrl: true,
      callback: () => navigate('/essay-feedback'),
      description: 'New Essay Feedback',
    },
    {
      key: 'r',
      ctrl: true,
      callback: () => navigate('/rubrics'),
      description: 'Manage Rubrics',
    },
    {
      key: 'h',
      ctrl: true,
      callback: () => navigate('/feedback-history'),
      description: 'View History',
    },
    {
      key: '?',
      callback: () => setShowShortcuts(true),
      description: 'Show Keyboard Shortcuts',
    },
  ]);

  useEffect(() => {
    if (!user) return;

    // Only clear cache on first mount to ensure fresh data after navigation
    if (!hasFetchedRef.current && cacheKey) {
      localStorage.removeItem(cacheKey);
    }
    hasFetchedRef.current = true;

    const fetchDashboardData = async () => {
      try {
        // Show cached snapshot immediately if available
        if (cacheKey) {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (parsed?.stats) setStats(parsed.stats);
              if (parsed?.recentFeedback) setRecentFeedback(parsed.recentFeedback);
              setLoading(false);
            } catch {}
          }
        }

        // Always revalidate
        let useRPC = true;

        try {
          // Prefer single RPC to reduce roundtrips
          const { data, error } = await supabase.rpc('get_teacher_dashboard', { p_teacher_id: user.id });
          if (error) throw error;
          if (data && Array.isArray(data) && data.length > 0) {
            const row: any = data[0];
            const newStats = {
              essaysCount: Number(row.essays_count) || 0,
              rubricsCount: Number(row.rubrics_count) || 0,
              feedbackCount: Number(row.feedback_count) || 0,
            };
            const recentArray: any[] = Array.isArray(row.recent) ? row.recent : [];
            const recent: RecentFeedback[] = recentArray.map((r: any) => ({
              id: r.id,
              created_at: r.created_at,
              essay_title: r.essay_title || 'Untitled Essay',
            }));
            setStats(newStats);
            setRecentFeedback(recent);
            setLoading(false);
            if (cacheKey) localStorage.setItem(cacheKey, JSON.stringify({ stats: newStats, recentFeedback: recent, ts: Date.now() }));
          }
        } catch (e) {
          useRPC = false;
        }

        if (!useRPC) {
          // Fallback: Fetch counts + recent first for fastest first paint
          const [essaysResult, rubricsResult, feedbackResult, recentResult] = await Promise.all([
            supabase
              .from('essays')
              .select('id', { count: 'exact', head: true })
              .eq('teacher_id', user.id),
            supabase
              .from('rubrics')
              .select('id', { count: 'exact', head: true })
              .eq('teacher_id', user.id),
            supabase
              .from('feedback')
              .select('id, essays!inner(id,teacher_id)', { count: 'exact', head: true })
              .eq('essays.teacher_id', user.id),
            supabase
              .from('feedback')
              .select('id, created_at, essays!inner(title,teacher_id)')
              .eq('essays.teacher_id', user.id)
              .order('created_at', { ascending: false })
              .limit(5),
          ]);

          if (essaysResult.error) throw essaysResult.error;
          if (rubricsResult.error) throw rubricsResult.error;
          if (feedbackResult.error) throw feedbackResult.error;
          if (recentResult.error) throw recentResult.error;

          const newStats = {
            essaysCount: essaysResult.count ?? 0,
            rubricsCount: rubricsResult.count ?? 0,
            feedbackCount: feedbackResult.count ?? 0,
          };
          setStats(newStats);

          const recent = (recentResult.data ?? []).map((item: any) => ({
            id: item.id,
            created_at: item.created_at,
            essay_title: item.essays?.title || 'Untitled Essay',
          }));
          setRecentFeedback(recent);
          setLoading(false);
          if (cacheKey) localStorage.setItem(cacheKey, JSON.stringify({ stats: newStats, recentFeedback: recent, ts: Date.now() }));
        }

        // Reveal page content now
        if (loading) setLoading(false);

        // Defer charts fetch until after first paint/idle
        const schedule = (cb: () => void) => {
          // @ts-ignore
          if (typeof window !== 'undefined' && window.requestIdleCallback) {
            // @ts-ignore
            window.requestIdleCallback(cb, { timeout: 1000 });
          } else {
            setTimeout(cb, 0);
          }
        };

        schedule(async () => {
          try {
            setChartsLoading(true);
            const { data, error } = await supabase
              .from('feedback')
              .select('created_at, overall_score, essays!inner(teacher_id)')
              .eq('essays.teacher_id', user.id)
              .order('created_at', { ascending: false })
              .limit(30);
            if (error) throw error;
            setFeedbackData(data || []);
          } catch (e) {
            console.error('Failed to load chart data:', e);
          } finally {
            setChartsLoading(false);
          }
        });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        notify.error('Failed to load dashboard data');
      } finally {
        // loading set earlier to show stats quickly
      }
    };

    fetchDashboardData();

    // Subscribe to realtime feedback inserts to auto-refresh
    const channel = supabase
      .channel('dashboard-feedback-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'feedback' }, () => {
        // Invalidate cache and refetch when new feedback is added
        if (cacheKey) localStorage.removeItem(cacheKey);
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <>
      <Navbar />
      <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Teacher Dashboard</h2>
            {user?.email && <p className="text-sm sm:text-base text-gray-600">Logged in as {user.email}</p>}
          </div>

          {loading ? (
            <DashboardSkeleton />
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" data-tour="stats">
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

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Feedback Trend Chart */}
                <div className="bg-white rounded-lg shadow p-4 sm:p-6 overflow-hidden">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Feedback Trend (Last 30)</h3>
                  {chartsLoading ? (
                    <ChartSkeleton />
                  ) : feedbackData.length > 0 ? (
                    <div className="w-full overflow-x-auto">
                      <ResponsiveContainer width="100%" height={250} minWidth={300}>
                        <LineChart data={trendChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="created_at"
                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            fontSize={12}
                          />
                          <YAxis domain={[0, 100]} fontSize={12} />
                          <Tooltip
                            labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            formatter={(value: any) => [`${value}/100`, 'Score']}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="overall_score" stroke="#3B82F6" strokeWidth={2} name="Score" dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-10">No feedback data yet</div>
                  )}
                </div>

                {/* Score Distribution Chart */}
                <div className="bg-white rounded-lg shadow p-4 sm:p-6 overflow-hidden">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Score Distribution</h3>
                  {chartsLoading ? (
                    <ChartSkeleton />
                  ) : feedbackData.length > 0 ? (
                    <div className="w-full overflow-x-auto">
                      <ResponsiveContainer width="100%" height={250} minWidth={300}>
                        <BarChart data={scoreDistributionData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="range" fontSize={12} />
                          <YAxis fontSize={12} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" fill="#10B981" name="Essays" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-10">No distribution data yet</div>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow mb-8">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Recent Feedback</h3>
                  {recentFeedback.length > 0 && (
                    <Link
                      to="/feedback-history"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View All →
                    </Link>
                  )}
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
                      data-tour="essay-feedback"
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
                      data-tour="rubrics"
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
                      data-tour="students"
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
                      data-tour="analytics"
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
      </ErrorBoundary>

      <KeyboardShortcutsHelp
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
        shortcuts={[
          { keys: 'Ctrl+E', description: 'New Essay Feedback' },
          { keys: 'Ctrl+R', description: 'Manage Rubrics' },
          { keys: 'Ctrl+H', description: 'View History' },
          { keys: '?', description: 'Show Keyboard Shortcuts' },
        ]}
      />

      {showTour && (
        <OnboardingTour
          steps={tourSteps}
          onComplete={completeTour}
          onSkip={skipTour}
        />
      )}
    </>
  );
}

export default Dashboard;