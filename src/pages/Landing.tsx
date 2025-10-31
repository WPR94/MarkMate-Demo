import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import Logo from '../components/Logo';

function Landing() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkConnection() {
      try {
        // Just check if we can get the auth configuration
        const { data, error } = await supabase.auth.getSession();
        console.log('Supabase connection check:', { data, error });
        
        // Don't block on Supabase errors - just log them
        if (error) console.warn('Supabase check failed (non-blocking):', error);
        setIsLoading(false);
      } catch (e) {
        console.error('Supabase connection error (non-blocking):', e);
        // Don't show error - just continue loading the page
        setIsLoading(false);
      }
    }
    
    checkConnection();
  }, []);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#3B82F6', color: 'white', padding: '1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-500 text-white flex flex-col">
      {/* Navbar */}
      <nav className="w-full bg-blue-600 shadow-lg">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="inline-flex items-center" aria-label="Simple Rubriq Home">
            <Logo className="h-10" />
          </Link>

          {/* Navigation Buttons */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/about" 
              className="px-4 py-2 text-white hover:text-blue-100 font-medium transition-colors duration-200"
            >
              About
            </Link>
            <Link 
              to="/demo" 
              className="px-4 py-2 text-white hover:text-blue-100 font-medium transition-colors duration-200"
            >
              Try Demo
            </Link>
            <Link 
              to="/auth" 
              className="px-4 py-2 bg-white text-blue-600 rounded-md font-medium hover:bg-blue-50 transition-colors duration-200"
            >
              Teacher Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-3xl w-full px-4">
          {/* New tagline + supporting subtext (centered, responsive) */}
        <header className="mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-center">Simplify grading. Amplify teaching.</h1>
          <p className="mt-3 text-center text-gray-200 max-w-2xl mx-auto">AI-powered rubric grading assistance that keeps feedback structured, fair, and fast.</p>
        </header>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <span>🎓</span> How it works
          </h2>
          <p className="text-white/90 leading-relaxed">
            This demo shows how Simple Rubriq grades essays using your rubric criteria.
            Paste your marking scheme, upload or write a sample essay, and get instant feedback.
          </p>
        </div>

        <p className="text-center text-lg md:text-xl mb-6 text-white/90">
          Transform essay grading with AI-powered feedback. Get instant, detailed analysis on grammar,
          strengths, and areas for improvement.
        </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-blue-600">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center space-y-4">
            <p className="text-white/90">© 2025 Simple Rubriq. Built with ❤️ for teachers.</p>
            <div className="flex items-center space-x-4 text-sm">
              <a href="#" className="text-white/80 hover:text-white transition-colors">Privacy Policy</a>
              <span className="text-white/40">|</span>
              <a href="#" className="text-white/80 hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;