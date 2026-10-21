import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * HoverCard component that renders a popup card on hover.
 * Uses a React Portal + position:fixed so it escapes all overflow containers.
 *
 * @param {React.ReactNode} trigger - The button/element to hover on.
 * @param {React.ReactNode} children - Content inside the popup card.
 * @param {string} width - Tailwind width class for the card (default: "w-[26rem]").
 * @param {boolean} preferTop - If true, prefer showing above the trigger (for bottom rows).
 */
const HoverCard = ({ trigger, children, width = 'w-[26rem]', preferTop = false }) => {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, direction: 'bottom' });
  const triggerRef = useRef(null);
  const cardRef = useRef(null);
  const timeoutRef = useRef(null);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const cardHeight = cardRef.current ? cardRef.current.offsetHeight : 300;

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    let direction;
    if (preferTop) {
      direction = spaceAbove >= cardHeight ? 'top' : 'bottom';
    } else {
      direction = spaceBelow >= cardHeight ? 'bottom' : 'top';
    }

    const top = direction === 'bottom' ? rect.bottom + 8 : rect.top - 8;
    const left = rect.left + rect.width / 2;

    setCoords({ top, left, direction });
  }, [preferTop]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShow(true);
    calculatePosition();
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setShow(false), 150);
  };

  const handleCardEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleCardLeave = () => {
    timeoutRef.current = setTimeout(() => setShow(false), 150);
  };

  useEffect(() => {
    if (show) calculatePosition();
  }, [show, calculatePosition]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {trigger}
      </div>
      {show &&
        createPortal(
          <div
            ref={cardRef}
            onMouseEnter={handleCardEnter}
            onMouseLeave={handleCardLeave}
            className={`fixed z-[9999] ${width} bg-white border border-slate-200/80 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.18)] rounded-2xl p-5 ring-1 ring-slate-900/[0.04]`}
            style={{
              top: coords.direction === 'bottom' ? `${coords.top}px` : undefined,
              bottom: coords.direction === 'top' ? `${window.innerHeight - coords.top}px` : undefined,
              left: `${coords.left}px`,
              transform: 'translateX(-50%)',
            }}
          >
            {/* Pointer arrow */}
            <div
              className="absolute left-1/2 w-3 h-3 bg-white border-gray-100 transform -translate-x-1/2 rotate-45"
              style={
                coords.direction === 'bottom'
                  ? { top: '-6px', borderTop: '1px solid rgb(243 244 246)', borderLeft: '1px solid rgb(243 244 246)' }
                  : { bottom: '-6px', borderBottom: '1px solid rgb(243 244 246)', borderRight: '1px solid rgb(243 244 246)' }
              }
            />
            {children}
          </div>,
          document.body
        )}
    </>
  );
};

export default HoverCard;
