export function FeedbackButton() {
  const handleFeedbackClick = () => {
    // Open Microsoft Forms in new tab
    window.open('https://forms.cloud.microsoft/r/9bCiPYFz2c', '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* Floating Feedback Button */}
      <button
        onClick={handleFeedbackClick}
        className="fixed bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-50 group"
        style={{ 
          bottom: 'calc(1.5rem + env(safe-area-inset-bottom))',
          right: 'calc(1.5rem + env(safe-area-inset-right))'
        }}
        aria-label="Send feedback"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Send Feedback
        </span>
      </button>
    </>
  );
}
