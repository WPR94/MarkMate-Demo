import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

function Navbar() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };  return (
    <nav className="bg-white dark:bg-gray-800 shadow mb-6 transition-colors overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between min-w-max">        <div className="flex items-center space-x-3 md:space-x-6">
          <Link to="/dashboard" className="font-bold text-base md:text-lg text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 whitespace-nowrap">Simple Rubriq</Link>
          <Link to="/dashboard" className="text-sm md:text-base text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap">Dashboard</Link>
          <Link to="/rubrics" className="text-sm md:text-base text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap">Rubrics</Link>
          <Link to="/students" className="text-sm md:text-base text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap">Students</Link>
          <Link to="/essay-feedback" className="text-sm md:text-base text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap hidden sm:inline">Essay Feedback</Link>
          <Link to="/analytics" className="text-sm md:text-base text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap">Analytics</Link>
          <Link to="/batch" className="text-sm md:text-base text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap">Batch</Link>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>
          <Link 
            to="/settings" 
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-xs md:text-sm font-medium whitespace-nowrap"
          >
            Settings
          </Link>
          {user && <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 hidden lg:inline truncate max-w-[120px]">{user.email}</span>}
          <button onClick={handleLogout} className="bg-red-500 text-white px-2 md:px-3 py-1 rounded hover:bg-red-600 transition-colors text-xs md:text-sm whitespace-nowrap">Logout</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
