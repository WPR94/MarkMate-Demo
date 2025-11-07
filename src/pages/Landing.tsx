import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
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
      <div className="min-h-screen bg-blue-500 text-white p-4 text-center flex flex-col items-center justify-center">
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 text-white flex flex-col">
      {/* Navbar */}
      <nav className="w-full bg-white/10 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="inline-flex items-center group" aria-label="Simple Rubriq Home">
            <Logo className="h-10 transition-transform group-hover:scale-105" />
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
              to="/auth" 
              className="px-6 py-2.5 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-5xl w-full text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-8 border border-white/30">
            <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            AI-Powered Essay Grading
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Mark smarter,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400">
              not harder
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            AI-powered rubric grading that saves hours on marking while delivering 
            structured, consistent feedback students actually understand.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link 
              to="/auth" 
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-blue-50 transition-all duration-200 shadow-2xl hover:shadow-3xl hover:scale-105"
            >
              Start Free Trial →
            </Link>
            <Link 
              to="/about" 
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-lg font-bold text-lg hover:bg-white/20 transition-all duration-200"
            >
              Learn More
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-20">
            {/* Card 1 */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3">10x Faster</h3>
              <p className="text-blue-100">
                Grade essays in seconds instead of hours. AI analyzes work against your rubric automatically.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-green-400 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3">100% Consistent</h3>
              <p className="text-blue-100">
                Every essay graded fairly with the same rubric standards. No more marking fatigue bias.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-purple-400 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3">Better Feedback</h3>
              <p className="text-blue-100">
                Structured, actionable feedback that helps students improve. Aligned to your teaching goals.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Social Proof / Stats Section */}
      <section className="bg-white/5 backdrop-blur-sm border-t border-white/10 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-yellow-300 mb-2">95%</div>
              <div className="text-blue-100 text-sm">Time Saved</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-300 mb-2">500+</div>
              <div className="text-blue-100 text-sm">Teachers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-300 mb-2">50k+</div>
              <div className="text-blue-100 text-sm">Essays Graded</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-pink-300 mb-2">4.9★</div>
              <div className="text-blue-100 text-sm">Teacher Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white/5 backdrop-blur-sm border-t border-white/10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center space-y-4">
            <p className="text-white/90">© 2025 Simple Rubriq. Built with ❤️ for teachers.</p>
            <div className="flex items-center space-x-4 text-sm">
              <Link to="/privacy" className="text-white/80 hover:text-white transition-colors">Privacy Policy</Link>
              <span className="text-white/40">|</span>
              <Link to="/terms" className="text-white/80 hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;