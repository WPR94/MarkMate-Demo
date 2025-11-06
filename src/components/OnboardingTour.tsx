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
        setTargetPosition(element.getBoundingClientRect());
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
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

    switch (placement) {
      case 'top':
        return {
          left: targetPosition.left + targetPosition.width / 2,
          top: targetPosition.top - offset,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        return {
          left: targetPosition.left + targetPosition.width / 2,
          top: targetPosition.bottom + offset,
          transform: 'translateX(-50%)',
        };
      case 'left':
        return {
          left: targetPosition.left - offset,
          top: targetPosition.top + targetPosition.height / 2,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          left: targetPosition.right + offset,
          top: targetPosition.top + targetPosition.height / 2,
          transform: 'translateY(-50%)',
        };
      default:
        return {};
    }
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
      {/* Overlay backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" />

      {/* Highlight ring around target element */}
      {targetPosition && (
        <div
          className="fixed z-40 border-4 border-blue-500 rounded-lg pointer-events-none transition-all duration-300"
          style={getHighlightStyle()}
        />
      )}

      {/* Tooltip */}
      {targetPosition && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-sm transition-all duration-300"
          style={getTooltipPosition()}
        >
          {/* Progress indicator */}
          <div className="flex gap-1 mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded ${
                  index === currentStep
                    ? 'bg-blue-600'
                    : index < currentStep
                    ? 'bg-blue-300'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {steps[currentStep].title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {steps[currentStep].content}
          </p>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={onSkip}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium"
            >
              Skip Tour
            </button>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>

          {/* Step counter */}
          <div className="text-center mt-4 text-xs text-gray-500 dark:text-gray-400">
            Step {currentStep + 1} of {steps.length}
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
