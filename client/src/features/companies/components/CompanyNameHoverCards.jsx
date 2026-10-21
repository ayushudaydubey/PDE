import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { LeadStatusCardContent, ContactPagesCardContent } from './CompanyHoverCardContent';

const CARD_BASE =
  'fixed z-[9999] bg-white border border-slate-200/80 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.18)] rounded-2xl p-4 ring-1 ring-slate-900/[0.04]';

const GAP = 6;
const BRIDGE_SIZE = 16;
const VIEWPORT_MARGIN = 12;
const DEFAULT_CARD_WIDTH = 352;
const CLOSE_DELAY = 400;

const ARROW_BORDER = '1px solid rgb(226 232 240)';

const initialLayout = {
  leadLeft: 0,
  leadTop: 0,
  leadBottom: undefined,
  leadTransform: 'translateX(-50%)',
  leadArrow: null,
  leadBridge: null,
  contactTop: 0,
  contactLeft: 0,
  contactRight: undefined,
  contactBottom: undefined,
  contactTransform: 'translateX(-50%)',
  contactArrow: null,
  contactBridge: null,
};

/**
 * Shows two separate hover cards on company name hover:
 * - Lead Status card above the trigger
 * - Contact Pages card below the trigger (or to the left when bottom space is tight)
 */
const CompanyNameHoverCards = ({
  trigger,
  status,
  updatedBy,
  contactPages,
  width = 'w-[22rem]',
}) => {
  const [show, setShow] = useState(false);
  const [positionReady, setPositionReady] = useState(false);
  const [layout, setLayout] = useState(initialLayout);
  const triggerRef = useRef(null);
  const leadCardRef = useRef(null);
  const contactCardRef = useRef(null);
  const timeoutRef = useRef(null);

  const cancelClose = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    timeoutRef.current = setTimeout(() => {
      setShow(false);
      setPositionReady(false);
    }, CLOSE_DELAY);
  }, [cancelClose]);

  const enterZone = useCallback(() => {
    cancelClose();
    setShow((prev) => {
      if (!prev) setPositionReady(false);
      return true;
    });
  }, [cancelClose]);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const leadHeight = leadCardRef.current?.offsetHeight || 110;
    const contactHeight = contactCardRef.current?.offsetHeight || 200;
    const contactWidth = contactCardRef.current?.offsetWidth || DEFAULT_CARD_WIDTH;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const spaceBelow = viewportHeight - rect.bottom - VIEWPORT_MARGIN;
    const spaceAbove = rect.top - VIEWPORT_MARGIN;
    const spaceLeft = rect.left - VIEWPORT_MARGIN;
    const spaceRight = viewportWidth - rect.right - VIEWPORT_MARGIN;

    const clampCenterX = (halfWidth) => {
      let x = centerX;
      if (x - halfWidth < VIEWPORT_MARGIN) x = VIEWPORT_MARGIN + halfWidth;
      if (x + halfWidth > viewportWidth - VIEWPORT_MARGIN) {
        x = viewportWidth - VIEWPORT_MARGIN - halfWidth;
      }
      return x;
    };

    const makeVerticalBridge = (top, height, bridgeWidth, bridgeLeft) => ({
      top,
      left: bridgeLeft,
      width: bridgeWidth,
      height: Math.max(height, BRIDGE_SIZE),
    });

    const makeHorizontalBridge = (top, left, bridgeWidth, height) => ({
      top: top - height / 2,
      left,
      width: Math.max(bridgeWidth, BRIDGE_SIZE),
      height,
    });

    // Lead status — prefer above
    let leadStyle = {
      leadLeft: clampCenterX(contactWidth / 2),
      leadTop: undefined,
      leadBottom: viewportHeight - rect.top + GAP,
      leadTransform: 'translateX(-50%)',
      leadArrow: {
        bottom: '-6px',
        borderBottom: ARROW_BORDER,
        borderRight: ARROW_BORDER,
      },
      leadBridge: makeVerticalBridge(
        rect.top - GAP - BRIDGE_SIZE,
        GAP + BRIDGE_SIZE,
        Math.max(rect.width, contactWidth),
        clampCenterX(Math.max(rect.width, contactWidth) / 2) -
          Math.max(rect.width, contactWidth) / 2
      ),
    };

    if (spaceAbove < leadHeight + GAP && spaceBelow > leadHeight + GAP) {
      leadStyle = {
        leadLeft: clampCenterX(contactWidth / 2),
        leadTop: rect.bottom + GAP,
        leadBottom: undefined,
        leadTransform: 'translateX(-50%)',
        leadArrow: {
          top: '-6px',
          borderTop: ARROW_BORDER,
          borderLeft: ARROW_BORDER,
        },
        leadBridge: makeVerticalBridge(
          rect.bottom,
          GAP + BRIDGE_SIZE,
          Math.max(rect.width, contactWidth),
          clampCenterX(Math.max(rect.width, contactWidth) / 2) -
            Math.max(rect.width, contactWidth) / 2
        ),
      };
    }

    // Contact pages — prefer below
    let contactStyle = {
      contactTop: rect.bottom + GAP,
      contactLeft: clampCenterX(contactWidth / 2),
      contactRight: undefined,
      contactBottom: undefined,
      contactTransform: 'translateX(-50%)',
      contactArrow: {
        top: '-6px',
        borderTop: ARROW_BORDER,
        borderLeft: ARROW_BORDER,
      },
      contactBridge: makeVerticalBridge(
        rect.bottom,
        GAP + BRIDGE_SIZE,
        Math.max(rect.width, contactWidth),
        clampCenterX(Math.max(rect.width, contactWidth) / 2) -
          Math.max(rect.width, contactWidth) / 2
      ),
    };

    const needsAlternateContact = spaceBelow < contactHeight + GAP;

    if (needsAlternateContact) {
      if (spaceLeft >= contactWidth + GAP) {
        const leftPos = Math.max(VIEWPORT_MARGIN, rect.left - contactWidth - GAP);
        contactStyle = {
          contactTop: centerY,
          contactLeft: leftPos,
          contactRight: undefined,
          contactBottom: undefined,
          contactTransform: 'translateY(-50%)',
          contactArrow: {
            right: '-6px',
            top: '50%',
            marginTop: '-6px',
            borderTop: ARROW_BORDER,
            borderRight: ARROW_BORDER,
          },
          contactBridge: makeHorizontalBridge(
            centerY,
            leftPos + contactWidth,
            rect.left - (leftPos + contactWidth),
            Math.max(rect.height, BRIDGE_SIZE)
          ),
        };
      } else if (spaceRight >= contactWidth + GAP) {
        const rightPos = rect.right + GAP;
        contactStyle = {
          contactTop: centerY,
          contactLeft: rightPos,
          contactRight: undefined,
          contactBottom: undefined,
          contactTransform: 'translateY(-50%)',
          contactArrow: {
            left: '-6px',
            top: '50%',
            marginTop: '-6px',
            borderBottom: ARROW_BORDER,
            borderLeft: ARROW_BORDER,
          },
          contactBridge: makeHorizontalBridge(
            centerY,
            rect.right,
            rightPos - rect.right,
            Math.max(rect.height, BRIDGE_SIZE)
          ),
        };
      } else if (spaceAbove >= contactHeight + GAP) {
        const maxHeight = Math.min(contactHeight, spaceAbove - GAP);
        contactStyle = {
          contactTop: undefined,
          contactLeft: clampCenterX(contactWidth / 2),
          contactRight: undefined,
          contactBottom: viewportHeight - rect.top + GAP,
          contactTransform: 'translateX(-50%)',
          contactMaxHeight: maxHeight,
          contactArrow: {
            bottom: '-6px',
            borderBottom: ARROW_BORDER,
            borderRight: ARROW_BORDER,
          },
          contactBridge: makeVerticalBridge(
            rect.top - GAP - BRIDGE_SIZE,
            GAP + BRIDGE_SIZE,
            Math.max(rect.width, contactWidth),
            clampCenterX(Math.max(rect.width, contactWidth) / 2) -
              Math.max(rect.width, contactWidth) / 2
          ),
        };
      }
    }

    setLayout({ ...leadStyle, ...contactStyle });
    setPositionReady(true);
  }, []);

  useEffect(() => {
    if (!show) return;

    calculatePosition();
    const raf = requestAnimationFrame(() => calculatePosition());

    const handleUpdate = () => calculatePosition();
    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    const observers = [];
    [leadCardRef, contactCardRef].forEach((ref) => {
      if (ref.current && typeof ResizeObserver !== 'undefined') {
        const observer = new ResizeObserver(handleUpdate);
        observer.observe(ref.current);
        observers.push(observer);
      }
    });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
      observers.forEach((observer) => observer.disconnect());
    };
  }, [show, calculatePosition, contactPages]);

  useEffect(() => () => cancelClose(), [cancelClose]);

  const zoneHandlers = {
    onMouseEnter: enterZone,
    onMouseLeave: scheduleClose,
  };

  const cardVisibility = positionReady
    ? 'opacity-100 pointer-events-auto'
    : 'opacity-0 pointer-events-none';

  const leadCardStyle = {
    ...(layout.leadTop != null ? { top: `${layout.leadTop}px` } : {}),
    ...(layout.leadBottom != null ? { bottom: `${layout.leadBottom}px` } : {}),
    left: `${layout.leadLeft}px`,
    transform: layout.leadTransform,
  };

  const contactCardStyle = {
    ...(layout.contactTop != null ? { top: `${layout.contactTop}px` } : {}),
    ...(layout.contactBottom != null ? { bottom: `${layout.contactBottom}px` } : {}),
    ...(layout.contactLeft != null ? { left: `${layout.contactLeft}px` } : {}),
    ...(layout.contactRight != null ? { right: `${layout.contactRight}px` } : {}),
    transform: layout.contactTransform,
    ...(layout.contactMaxHeight
      ? { maxHeight: `${layout.contactMaxHeight}px`, overflowY: 'auto' }
      : {}),
  };

  const renderArrow = (arrow) => {
    if (!arrow) return null;
    const isSide = arrow.left != null || arrow.right != null;
    return (
      <div
        className={`absolute w-3 h-3 bg-white border-slate-200/80 rotate-45 ${
          isSide ? '' : 'left-1/2 -translate-x-1/2'
        }`}
        style={{
          ...arrow,
          ...(isSide ? { transform: 'translateY(-50%) rotate(45deg)' } : {}),
        }}
      />
    );
  };

  const renderBridge = (bridge) => {
    if (!bridge || !positionReady) return null;
    return (
      <div
        className="fixed z-[9998] pointer-events-auto"
        style={{
          top: `${bridge.top}px`,
          left: `${bridge.left}px`,
          width: `${bridge.width}px`,
          height: `${bridge.height}px`,
        }}
        {...zoneHandlers}
      />
    );
  };

  return (
    <>
      <div ref={triggerRef} className="inline-block" {...zoneHandlers}>
        {trigger}
      </div>

      {show &&
        createPortal(
          <>
            {renderBridge(layout.leadBridge)}
            {renderBridge(layout.contactBridge)}

            {/* Lead Status */}
            <div
              ref={leadCardRef}
              {...zoneHandlers}
              className={`${CARD_BASE} ${width} transition-opacity duration-75 ${cardVisibility}`}
              style={leadCardStyle}
            >
              {renderArrow(layout.leadArrow)}
              <LeadStatusCardContent status={status} updatedBy={updatedBy} />
            </div>

            {/* Contact Pages */}
            <div
              ref={contactCardRef}
              {...zoneHandlers}
              className={`${CARD_BASE} ${width} transition-opacity duration-75 ${cardVisibility}`}
              style={contactCardStyle}
            >
              {renderArrow(layout.contactArrow)}
              <ContactPagesCardContent contactPages={contactPages} />
            </div>
          </>,
          document.body
        )}
    </>
  );
};

export default CompanyNameHoverCards;
