// Simple Rubriq logo: rubric grid + checkmark icon and wordmark
// Colors: Deep Blue #1E3A8A, Gold #FBBF24, White
export default function Logo({ className = "h-10" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-3 font-['Poppins'] ${className}`}>
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Simple Rubriq logo"
      >
        {/* Blue rounded square background */}
        <rect x="0" y="0" width="40" height="40" rx="8" fill="#1E3A8A" />
        {/* Rubric grid: three horizontal white lines */}
        <rect x="8" y="11" width="18" height="2.5" rx="1.25" fill="#FFFFFF" />
        <rect x="8" y="18" width="18" height="2.5" rx="1.25" fill="#FFFFFF" />
        <rect x="8" y="25" width="18" height="2.5" rx="1.25" fill="#FFFFFF" />
        {/* Gold checkmark at top-right */}
        <path d="M24 26 l4 4 l8 -10" stroke="#FBBF24" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-[#1E3A8A] font-semibold text-lg leading-none">
        Simple RubriQ
      </span>
    </div>
  );
}
