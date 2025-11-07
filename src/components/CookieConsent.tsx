import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('simple-rubriq-cookie-consent');
    if (!consent) {
      // Show banner after a short delay
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('simple-rubriq-cookie-consent', 'accepted');
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem('simple-rubriq-cookie-consent', 'declined');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white dark:bg-gray-800 border-t-2 border-blue-600 shadow-2xl">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              🍪 We use cookies
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              We use essential cookies to provide authentication and secure access to your account. 
              By continuing to use Simple Rubriq, you agree to our use of cookies as described in our{' '}
              <Link to="/privacy" className="text-blue-600 hover:text-blue-700 underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button
              onClick={handleDecline}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="px-6 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
