import { useState, useEffect } from 'react';

interface TourStep {
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTourProps {
  steps: TourStep[];
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingTour({ steps, onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetPosition, setTargetPosition] = useState<DOMRect | null>(null);

  useEffect(() => {
    const updatePosition = () => {
      const element = document.querySelector(steps[currentStep].target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetPosition(rect);
        
        // Scroll element into view if needed
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    // Keyboard navigation
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onSkip();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentStep, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getTooltipPosition = () => {
    if (!targetPosition) return {};

    const placement = steps[currentStep].placement || 'bottom';
    const offset = 16;
    const tooltipWidth = 400; // Approximate tooltip width
    const tooltipHeight = 300; // Approximate tooltip height
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 20; // Padding from viewport edges

    let left = targetPosition.left + targetPosition.width / 2;
    let top = targetPosition.bottom + offset;
    let transform = 'translateX(-50%)';

    // Adjust horizontal position to prevent going off-screen
    if (left - tooltipWidth / 2 < padding) {
      left = padding + tooltipWidth / 2;
    } else if (left + tooltipWidth / 2 > viewportWidth - padding) {
      left = viewportWidth - padding - tooltipWidth / 2;
    }

    // Adjust vertical position based on placement and viewport
    switch (placement) {
      case 'top':
        top = targetPosition.top - offset;
        transform = 'translate(-50%, -100%)';
        // If tooltip would go off top, show below instead
        if (top - tooltipHeight < padding) {
          top = targetPosition.bottom + offset;
          transform = 'translateX(-50%)';
        }
        break;
      case 'bottom':
        top = targetPosition.bottom + offset;
        transform = 'translateX(-50%)';
        // If tooltip would go off bottom, show above instead
        if (top + tooltipHeight > viewportHeight - padding) {
          top = targetPosition.top - offset;
          transform = 'translate(-50%, -100%)';
        }
        break;
      case 'left':
        left = targetPosition.left - offset;
        top = targetPosition.top + targetPosition.height / 2;
        transform = 'translate(-100%, -50%)';
        // If off-screen, reposition to right
        if (left - tooltipWidth < padding) {
          left = targetPosition.right + offset;
          transform = 'translateY(-50%)';
        }
        break;
      case 'right':
        left = targetPosition.right + offset;
        top = targetPosition.top + targetPosition.height / 2;
        transform = 'translateY(-50%)';
        // If off-screen, reposition to left
        if (left + tooltipWidth > viewportWidth - padding) {
          left = targetPosition.left - offset;
          transform = 'translate(-100%, -50%)';
        }
        break;
    }

    return { left, top, transform };
  };

  const getHighlightStyle = () => {
    if (!targetPosition) return {};

    return {
      left: targetPosition.left - 4,
      top: targetPosition.top - 4,
      width: targetPosition.width + 8,
      height: targetPosition.height + 8,
    };
  };

  return (
    <>
      {/* Overlay backdrop with cutout for spotlight */}
      <div className="fixed inset-0 z-40 pointer-events-none">
        <svg className="w-full h-full" style={{ animation: 'fadeIn 0.3s ease-in' }}>
          <defs>
            <mask id="spotlight-mask">
              {/* White = visible, Black = hidden */}
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {targetPosition && (
                <rect
                  x={targetPosition.left - 8}
                  y={targetPosition.top - 8}
                  width={targetPosition.width + 16}
                  height={targetPosition.height + 16}
                  rx="12"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          {/* Dark overlay with mask applied */}
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.75)"
            mask="url(#spotlight-mask)"
          />
        </svg>
      </div>

      {/* Highlight ring around target element */}
      {targetPosition && (
        <>
          {/* Outer glow */}
          <div
            className="fixed z-40 rounded-lg pointer-events-none transition-all duration-300"
            style={{
              ...getHighlightStyle(),
              boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 30px 10px rgba(59, 130, 246, 0.3)',
            }}
          />
          {/* Animated ring */}
          <div
            className="fixed z-40 border-4 border-blue-500 rounded-lg pointer-events-none animate-pulse"
            style={getHighlightStyle()}
          />
        </>
      )}

      {/* Tooltip */}
      {targetPosition && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-96 max-w-[calc(100vw-40px)] transition-all duration-300 border-2 border-blue-500"
          style={getTooltipPosition()}
        >
          {/* Arrow pointing to target */}
          <div className="absolute w-0 h-0 border-8 border-transparent">
            {/* Arrow will be positioned by CSS based on placement */}
          </div>
          {/* Progress indicator */}
          <div className="flex gap-1 mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-blue-600 scale-110'
                    : index < currentStep
                    ? 'bg-blue-300'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Badge */}
          <div className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            {currentStep === 0 ? '👋 Welcome' : `Step ${currentStep + 1} of ${steps.length}`}
          </div>

          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {steps[currentStep].title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed text-base">
            {steps[currentStep].content}
          </p>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center gap-3">
            <button
              onClick={onSkip}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium underline transition-colors"
            >
              Skip Tour
            </button>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-semibold transition-colors"
                >
                  ← Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg transform hover:scale-105"
              >
                {currentStep === steps.length - 1 ? '🎉 Finish Tour' : 'Next →'}
              </button>
            </div>
          </div>

          {/* Step counter with keyboard hint */}
          <div className="text-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Step {currentStep + 1} of {steps.length}
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500">
              Use arrow keys or click buttons to navigate
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function useOnboardingTour(storageKey: string) {
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(storageKey);
    if (!completed) {
      // Delay tour start to let page load
      const timer = setTimeout(() => setShowTour(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [storageKey]);

  const completeTour = () => {
    localStorage.setItem(storageKey, 'true');
    setShowTour(false);
  };

  const skipTour = () => {
    localStorage.setItem(storageKey, 'true');
    setShowTour(false);
  };

  const resetTour = () => {
    localStorage.removeItem(storageKey);
    setShowTour(true);
  };

  return { showTour, completeTour, skipTour, resetTour };
}
