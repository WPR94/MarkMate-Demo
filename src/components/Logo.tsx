// Simple Rubriq logo: rubric grid + checkmark icon and wordmark
// Colors: Deep Blue #1E3A8A, Gold #FBBF24, White
interface LogoProps { className?: string; hideWordmark?: boolean; variant?: 'default' | 'mono'; }

export default function Logo({ className = 'h-9', hideWordmark = false, variant = 'default' }: LogoProps) {
  const isMono = variant === 'mono';
  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`} aria-label="Simple RubriQ brand">
      <svg
        className="shrink-0"
        width="40"
        height="40"
        viewBox="0 0 40 40"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
      >
        <defs>
          <linearGradient id="rubriqGradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isMono ? '#1E3A8A' : '#3f6fca'} />
            <stop offset="100%" stopColor={isMono ? '#1E3A8A' : '#1E3A8A'} />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="40" height="40" rx="9" fill="url(#rubriqGradient)" />
        {/* Grid rows */}
        {[11,18,25].map((y) => (
          <rect key={y} x="8" y={y} width="18" height="3" rx="1.5" fill={isMono ? '#fff' : '#ffffff'} />
        ))}
        {/* Refined checkmark with subtle rounded joints */}
        <path
          d="M23 22.5l4.2 4.3 7-9.2"
          stroke={isMono ? '#FBBF24' : '#FBBF24'}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Accent dot to balance composition */}
        <circle cx="31.8" cy="11.4" r="2" fill={isMono ? '#FBBF24' : '#FBBF24'} />
      </svg>
      {!hideWordmark && (
        <span className="font-display font-semibold text-[1.05rem] tracking-tight text-brand-700 dark:text-brand-300 leading-none">
          Simple <span className="text-accent-500">RubriQ</span>
        </span>
      )}
    </div>
  );
}
