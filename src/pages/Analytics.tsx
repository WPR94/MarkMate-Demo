function Analytics() {
  // In a real app, these numbers would be derived from your database or API.
  const metrics = {
    essaysGraded: 0,
    activeStudents: 0,
    totalStudents: 0,
    rubricsCount: 0,
    averageScore: 0,
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Analytics Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="p-4 border rounded bg-white shadow">
          <h3 className="text-lg font-semibold">Essays Graded</h3>
          <p className="text-3xl font-bold">{metrics.essaysGraded}</p>
        </div>
        <div className="p-4 border rounded bg-white shadow">
          <h3 className="text-lg font-semibold">Active Students</h3>
          <p className="text-3xl font-bold">{metrics.activeStudents}</p>
        </div>
        <div className="p-4 border rounded bg-white shadow">
          <h3 className="text-lg font-semibold">Total Students</h3>
          <p className="text-3xl font-bold">{metrics.totalStudents}</p>
        </div>
        <div className="p-4 border rounded bg-white shadow">
          <h3 className="text-lg font-semibold">Rubrics</h3>
          <p className="text-3xl font-bold">{metrics.rubricsCount}</p>
        </div>
        <div className="p-4 border rounded bg-white shadow">
          <h3 className="text-lg font-semibold">Average Score</h3>
          <p className="text-3xl font-bold">{metrics.averageScore}%</p>
        </div>
      </div>
      <p className="text-gray-600">This dashboard will show trends and statistics once data is available. Connect your Supabase backend to visualize real performance insights.</p>
    </div>
  );
}

export default Analytics;