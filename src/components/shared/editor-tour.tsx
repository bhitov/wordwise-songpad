/**
 * @file Custom editor tour component compatible with React 19
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { createPortal } from 'react-dom';

interface EditorTourProps {
  className?: string;
}

interface TourStep {
  target: string;
  title: string;
  content: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    target: '.tour-title',
    title: 'Edit Your Pad Title',
    content: 'Click here to edit your pad title. Give your songwriting session a memorable name!',
    placement: 'bottom',
  },
  {
    target: '.tour-editor',
    title: 'Smart Writing Area',
    content: 'Start writing your lyrics here! 💡 Pro tip: Highlight at least 8 words and AI options will pop up to help you make it rhyme, improve flow, or enhance your writing.',
    placement: 'top',
  },
  {
    target: '.tour-ai-actions',
    title: 'AI Text Enhancement',
    content: 'Use AI actions to enhance your entire text - make it rhyme, change genres, or improve the flow.',
    placement: 'left',
  },
  {
    target: '.tour-song-settings',
    title: 'Song Settings',
    content: 'Set your song genre and description here. This helps the AI generate music that matches your vision.',
    placement: 'right',
  },
  {
    target: '.tour-generate-song',
    title: 'Generate Song',
    content: 'Turn your lyrics into a complete song with AI-generated music. Click here when your lyrics are ready!',
    placement: 'bottom',
  },
  {
    target: '.tour-generated-songs',
    title: 'Your Songs',
    content: 'All your generated songs appear here. You can play, download, and manage your musical creations.',
    placement: 'right',
  },
  {
    target: '.tour-suggestions',
    title: 'Grammar Suggestions',
    content: 'Get real-time grammar suggestions and corrections as you write. Click on any suggestion to apply it.',
    placement: 'left',
  },
];

function TourTooltip({ 
  step, 
  currentStep, 
  totalSteps, 
  onNext, 
  onPrev, 
  onClose, 
  position 
}: {
  step: TourStep;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  position: { top: number; left: number };
}) {
  return (
    <div
      className="fixed z-[1000] bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-xs"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-sm text-gray-900">{step.title}</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 ml-2"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <p className="text-sm text-gray-700 mb-4">{step.content}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {currentStep + 1} of {totalSteps}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {currentStep > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrev}
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-3 h-3 mr-1" />
              Back
            </Button>
          )}
          
          {currentStep < totalSteps - 1 ? (
            <Button
              size="sm"
              onClick={onNext}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Next
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onClose}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Finish
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function EditorTour({ className }: EditorTourProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [hasCheckedTourStatus, setHasCheckedTourStatus] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleStartTour = useCallback(() => {
    setIsActive(true);
    setCurrentStep(0);
  }, []);

  const handleCloseTour = useCallback(async () => {
    setIsActive(false);
    setCurrentStep(0);
    
    // Mark tour as seen when user closes it
    try {
      await fetch('/api/user/tour-seen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Failed to mark tour as seen:', error);
    }
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCloseTour();
    }
  }, [currentStep, handleCloseTour]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  // Calculate tooltip position based on target element
  useEffect(() => {
    if (!isActive) return;

    const currentTourStep = tourSteps[currentStep];
    const targetElement = document.querySelector(currentTourStep.target);
    
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      let top = 0;
      let left = 0;
      
      switch (currentTourStep.placement) {
        case 'bottom':
          top = rect.bottom + scrollTop + 10;
          left = rect.left + scrollLeft + (rect.width / 2) - 150; // Center tooltip
          break;
        case 'top':
          top = rect.top + scrollTop - 180; // Tooltip height estimate
          left = rect.left + scrollLeft + (rect.width / 2) - 150;
          break;
        case 'right':
          top = rect.top + scrollTop + (rect.height / 2) - 90; // Center vertically
          left = rect.right + scrollLeft + 10;
          break;
        case 'left':
          top = rect.top + scrollTop + (rect.height / 2) - 90;
          left = rect.left + scrollLeft - 320; // Tooltip width estimate
          break;
      }
      
      // Ensure tooltip stays within viewport
      const maxLeft = window.innerWidth - 320;
      const maxTop = window.innerHeight - 180;
      
      left = Math.max(10, Math.min(left, maxLeft));
      top = Math.max(10, Math.min(top, maxTop));
      
      setTooltipPosition({ top, left });
      
      // Scroll target into view if needed
      targetElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'center'
      });
    }
  }, [isActive, currentStep]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          handleCloseTour();
          break;
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          handleNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrev();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, handleCloseTour, handleNext, handlePrev]);

  // Check tour status on component mount and auto-start if needed
  useEffect(() => {
    if (hasCheckedTourStatus) return;

    const checkTourStatus = async () => {
      try {
        const response = await fetch('/api/user/tour-seen');
        if (response.ok) {
          const data = await response.json();
          
          // If user hasn't seen the tour, start it automatically
          if (!data.tourSeen) {
            // Small delay to ensure page elements are rendered
            setTimeout(() => {
              setIsActive(true);
              setCurrentStep(0);
            }, 1000);
          }
        }
      } catch (error) {
        console.error('Failed to check tour status:', error);
      } finally {
        setHasCheckedTourStatus(true);
      }
    };

    checkTourStatus();
  }, [hasCheckedTourStatus]);



  if (!isActive) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleStartTour}
        className={`flex items-center gap-2 text-muted-foreground hover:text-foreground ${className}`}
        title="Take a guided tour"
      >
        <HelpCircle className="h-4 w-4" />
        Tour
      </Button>
    );
  }

  // Get current target element for spotlight
  const currentTarget = tourSteps[currentStep].target;
  const targetElement = document.querySelector(currentTarget);
  let spotlightStyle = {};
  
  if (targetElement) {
    const rect = targetElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    spotlightStyle = {
      top: rect.top + scrollTop - 10,
      left: rect.left + scrollLeft - 10,
      width: rect.width + 20,
      height: rect.height + 20,
    };
  }

  return createPortal(
    <>
      {/* Overlay with spotlight cutout */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[999]"
        onClick={handleCloseTour}
        style={{
          background: targetElement 
            ? `radial-gradient(circle at ${(spotlightStyle as any).left + (spotlightStyle as any).width/2}px ${(spotlightStyle as any).top + (spotlightStyle as any).height/2}px, transparent ${Math.max((spotlightStyle as any).width, (spotlightStyle as any).height)/2 + 20}px, rgba(0, 0, 0, 0.7) ${Math.max((spotlightStyle as any).width, (spotlightStyle as any).height)/2 + 25}px)`
            : 'rgba(0, 0, 0, 0.7)'
        }}
      />
      
      {/* Spotlight border */}
      {targetElement && (
        <div
          className="fixed z-[1000] pointer-events-none border-2 border-purple-400 rounded"
          style={{
            top: (spotlightStyle as any).top,
            left: (spotlightStyle as any).left,
            width: (spotlightStyle as any).width,
            height: (spotlightStyle as any).height,
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)',
          }}
        />
      )}
      
      {/* Tooltip */}
      <TourTooltip
        step={tourSteps[currentStep]}
        currentStep={currentStep}
        totalSteps={tourSteps.length}
        onNext={handleNext}
        onPrev={handlePrev}
        onClose={handleCloseTour}
        position={tooltipPosition}
      />
    </>,
    document.body
  );
} 