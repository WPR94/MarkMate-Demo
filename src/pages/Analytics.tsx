import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import notify from '../utils/notify';
import Navbar from '../components/Navbar';
import { exportToCSV } from '../utils/csvExport';

interface FeedbackData {
  id: string;
  essay_id: string;
  overall_score: number;
  created_at: string;
  essay_title: string;
  rubric_name: string;
}

interface GradeDistribution {
  range: string;
  count: number;
  [key: string]: string | number;
}

interface TrendData {
  date: string;
  avgScore: number;
  count: number;
}

interface RubricPerformance {
  name: string;
  avgScore: number;
  count: number;
}

function Analytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [feedbackData, setFeedbackData] = useState<FeedbackData[]>([]);
  const [metrics, setMetrics] = useState({
    essaysGraded: 0,
    rubricsCount: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0,
  });
  const [gradeDistribution, setGradeDistribution] = useState<GradeDistribution[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [rubricPerformance, setRubricPerformance] = useState<RubricPerformance[]>([]);

  useEffect(() => {
    if (user?.id) {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      console.log('📊 Loading Analytics for user:', user!.id);
      
      // Load essays for this teacher
      const { data: essays, error: essaysError } = await supabase
        .from('essays')
        .select('id, title, rubric_id')
        .eq('teacher_id', user!.id)
        .order('created_at', { ascending: false });

      console.log('📊 Essays loaded:', essays?.length || 0, essays);
      if (essaysError) {
        console.error('📊 Essays error:', essaysError);
        throw essaysError;
      }

      // If no essays yet, populate minimal metrics and exit early
      if (!essays || essays.length === 0) {
        const { count: rubricsCount } = await supabase
          .from('rubrics')
          .select('*', { count: 'exact', head: true })
          .eq('teacher_id', user!.id);

        setMetrics({
          essaysGraded: 0,
          rubricsCount: rubricsCount || 0,
          averageScore: 0,
          highestScore: 0,
          lowestScore: 0,
        });
        setFeedbackData([]);
        setGradeDistribution([]);
        setTrendData([]);
        setRubricPerformance([]);
        return;
      }

      const essayIds = essays.map(e => e.id);
      const essayMap = new Map(essays.map(e => [e.id, e]));

      // Load feedback for those essays
      const { data: feedback, error: feedbackError } = await supabase
        .from('feedback')
        .select('id, essay_id, overall_score, created_at')
        .in('essay_id', essayIds)
        .order('created_at', { ascending: false });

      console.log('📊 Feedback loaded:', feedback?.length || 0, feedback);
      if (feedbackError) {
        console.error('📊 Feedback error:', feedbackError);
        throw feedbackError;
      }

      // Load rubrics for name lookup
      const { data: rubricsData, error: rubricsError } = await supabase
        .from('rubrics')
        .select('id, name')
        .eq('teacher_id', user!.id);

      if (rubricsError) throw rubricsError;
      const rubricMap = new Map((rubricsData || []).map(r => [r.id, r.name]));

      // Transform feedback data
      const transformedFeedback: FeedbackData[] = (feedback || []).map((f: any) => {
        const essay = essayMap.get(f.essay_id);
        const rubricName = essay ? rubricMap.get(essay.rubric_id) || '—' : '—';
        return {
          id: f.id,
          essay_id: f.essay_id,
          overall_score: f.overall_score,
          created_at: f.created_at,
          essay_title: essay?.title || 'Untitled Essay',
          rubric_name: rubricName,
        };
      });

      setFeedbackData(transformedFeedback);

      // Calculate metrics
      if (transformedFeedback.length > 0) {
        const scores = transformedFeedback.map(f => f.overall_score);
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        const maxScore = Math.max(...scores);
        const minScore = Math.min(...scores);

        // Rubrics count from map
        const rubricsCount = rubricMap.size;

        setMetrics({
          essaysGraded: transformedFeedback.length,
          rubricsCount: rubricsCount || 0,
          averageScore: Math.round(avgScore),
          highestScore: Math.round(maxScore),
          lowestScore: Math.round(minScore),
        });

        // Calculate grade distribution
        const distribution: { [key: string]: number } = {
          '90-100': 0,
          '80-89': 0,
          '70-79': 0,
          '60-69': 0,
          '50-59': 0,
          '0-49': 0,
        };

        transformedFeedback.forEach(f => {
          const score = f.overall_score;
          if (score >= 90) distribution['90-100']++;
          else if (score >= 80) distribution['80-89']++;
          else if (score >= 70) distribution['70-79']++;
          else if (score >= 60) distribution['60-69']++;
          else if (score >= 50) distribution['50-59']++;
          else distribution['0-49']++;
        });

        setGradeDistribution(
          Object.entries(distribution).map(([range, count]) => ({ range, count }))
        );

        // Calculate trend data (last 30 days)
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);

        const recentFeedback = transformedFeedback.filter(
          f => new Date(f.created_at) >= last30Days
        );

        // Group by date
        const dateGroups: { [key: string]: number[] } = {};
        recentFeedback.forEach(f => {
          const date = new Date(f.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });
          if (!dateGroups[date]) dateGroups[date] = [];
          dateGroups[date].push(f.overall_score);
        });

        const trend = Object.entries(dateGroups)
          .map(([date, scores]) => ({
            date,
            avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
            count: scores.length,
          }))
          .slice(-14); // Last 14 data points

        setTrendData(trend);

        // Calculate rubric performance
        const rubricGroups: { [key: string]: number[] } = {};
        transformedFeedback.forEach(f => {
          if (!rubricGroups[f.rubric_name]) rubricGroups[f.rubric_name] = [];
          rubricGroups[f.rubric_name].push(f.overall_score);
        });

        const performance = Object.entries(rubricGroups).map(([name, scores]) => ({
          name: name.length > 20 ? name.substring(0, 20) + '...' : name,
          avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
          count: scores.length,
        }));

        setRubricPerformance(performance);
      }
    } catch (error: any) {
      console.error('Error loading analytics:', error);
      notify.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    // Prepare comprehensive data for export
    const exportData = feedbackData.map(item => ({
      'Essay Title': item.essay_title,
      'Rubric Name': item.rubric_name,
      'Score': item.overall_score,
      'Date': new Date(item.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      'Essay ID': item.essay_id,
      'Feedback ID': item.id,
    }));

    // Add summary sheet data
    const summaryData = [
      { Metric: 'Total Essays Graded', Value: metrics.essaysGraded },
      { Metric: 'Total Rubrics Used', Value: metrics.rubricsCount },
      { Metric: 'Average Score', Value: metrics.averageScore.toFixed(1) },
      { Metric: 'Highest Score', Value: metrics.highestScore },
      { Metric: 'Lowest Score', Value: metrics.lowestScore },
      { Metric: '', Value: '' }, // Empty row
      { Metric: 'Export Date', Value: new Date().toLocaleDateString() },
    ];

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `markmate-analytics-${timestamp}.csv`;

    try {
      exportToCSV(exportData, filename);
      notify.success('Analytics data exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      notify.error('Failed to export data');
    }
  };

  const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

  return (
    <>
      <Navbar />
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : feedbackData.length === 0 ? (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900">Analytics Dashboard</h2>
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Yet</h3>
            <p className="text-gray-600 mb-4">
              Start grading essays to see analytics and insights here.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics Dashboard</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Track performance and trends across your graded essays</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Essays Graded</h3>
            <p className="text-3xl font-bold text-gray-900">{metrics.essaysGraded}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Rubrics Used</h3>
            <p className="text-3xl font-bold text-gray-900">{metrics.rubricsCount}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Average Score</h3>
            <p className="text-3xl font-bold text-gray-900">{metrics.averageScore}%</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Highest Score</h3>
            <p className="text-3xl font-bold text-gray-900">{metrics.highestScore}%</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Lowest Score</h3>
            <p className="text-3xl font-bold text-gray-900">{metrics.lowestScore}%</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Grade Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Grade Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gradeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8b5cf6" name="Number of Essays" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Grade Distribution Pie */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Score Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  dataKey="count"
                  nameKey="range"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.range}: ${entry.count}`}
                >
                  {gradeDistribution.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trend Over Time */}
        {trendData.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Score Trends (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="avgScore"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Average Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Rubric Performance */}
        {rubricPerformance.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Performance by Rubric</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rubricPerformance} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgScore" fill="#10b981" name="Average Score" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rubricPerformance.map((rubric, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900 truncate" title={rubric.name}>
                    {rubric.name}
                  </p>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-gray-600">Avg Score:</span>
                    <span className="font-bold text-green-600">{rubric.avgScore}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Essays:</span>
                    <span className="font-semibold">{rubric.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      )}
    </>
  );
}

export default Analytics;