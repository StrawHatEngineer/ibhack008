import { useState, useRef, useEffect } from 'react';

const Tooltip = ({ children, content, summary, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef(null);
  const targetRef = useRef(null);

  const showTooltip = (e) => {
    if (!content && !summary) return;
    
    const rect = e.target.getBoundingClientRect();
    const tooltipRect = tooltipRef.current?.getBoundingClientRect();
    
    let top = rect.top - (tooltipRect?.height || 0) - 8;
    let left = rect.left + rect.width / 2;
    
    // Adjust if tooltip would go off screen
    if (top < 0) {
      top = rect.bottom + 8;
    }
    
    if (tooltipRect) {
      if (left + tooltipRect.width / 2 > window.innerWidth) {
        left = window.innerWidth - tooltipRect.width - 16;
      } else if (left - tooltipRect.width / 2 < 0) {
        left = 16;
      } else {
        left = left - tooltipRect.width / 2;
      }
    }
    
    setPosition({ top, left });
    setIsVisible(true);
  };

  const hideTooltip = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    const target = targetRef.current;
    if (target) {
      target.addEventListener('mouseenter', showTooltip);
      target.addEventListener('mouseleave', hideTooltip);
      
      return () => {
        target.removeEventListener('mouseenter', showTooltip);
        target.removeEventListener('mouseleave', hideTooltip);
      };
    }
  }, []);

  // Only show tooltip if there's content to display
  const shouldShowTooltip = content || summary;

  return (
    <>
      <div ref={targetRef} className={className}>
        {children}
      </div>
      
      {shouldShowTooltip && isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg max-w-sm pointer-events-none"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          {content && (
            <div className="font-medium mb-1">
              {content}
            </div>
          )}
          {summary && (
            <div className="text-gray-300 text-xs">
              {summary}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Tooltip;
