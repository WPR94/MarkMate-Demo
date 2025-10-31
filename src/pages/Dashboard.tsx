import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';

function Dashboard() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserEmail(data?.user?.email ?? null);
    };
    fetchUser();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Teacher Dashboard</h2>
      {userEmail ? <p>Logged in as {userEmail}</p> : <p>Please log in.</p>}
      <ul className="list-disc pl-5 mt-4 space-y-2">
        <li>
          <Link to="/essay-feedback" className="text-blue-600 hover:underline">
            Generate Essay Feedback
          </Link>
        </li>
        <li>
          <Link to="/students" className="text-blue-600 hover:underline">
            Manage Students
          </Link>
        </li>
        <li>
          <Link to="/rubrics" className="text-blue-600 hover:underline">
            Rubrics Manager
          </Link>
        </li>
        <li>
          <Link to="/analytics" className="text-blue-600 hover:underline">
            Analytics Dashboard
          </Link>
        </li>
        <li>
          <Link to="/batch" className="text-blue-600 hover:underline">
            Batch Processor
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default Dashboard;