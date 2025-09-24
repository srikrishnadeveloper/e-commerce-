import React, { useEffect, useRef, useState } from 'react';
import { useAnnouncementBar } from '../hooks/useSiteConfig';

const AnnouncementBar: React.FC = () => {
  const { data, loading } = useAnnouncementBar();
  // Do NOT persist dismissal so it shows again on refresh
  const [dismissed, setDismissed] = useState<boolean>(false);

  const barRef = useRef<HTMLDivElement | null>(null);
  const isActive = data?.isActive !== false; // default to true when undefined
  const showBar = !dismissed && isActive && !loading;

  // Inform layout about the bar height so content can offset accordingly
  useEffect(() => {
    const notifyHeight = () => {
      const h = showBar ? (barRef.current?.offsetHeight || 0) : 0;
      window.dispatchEvent(new CustomEvent('announcementbar:height', { detail: h }));
    };
    notifyHeight();
    if (showBar) {
      window.addEventListener('resize', notifyHeight);
    }
    return () => {
      window.removeEventListener('resize', notifyHeight);
      window.dispatchEvent(new CustomEvent('announcementbar:height', { detail: 0 }));
    };
  }, [showBar]);

  const handleClose = () => {
    setDismissed(true);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('announcementbar:height', { detail: 0 }));
    }
  };

  // Get announcement data from the correct path
  const announcementData = data?.announcementbar || data?.announcementBar;

  const announcements = (announcementData?.announcements && announcementData.announcements.length > 0)
    ? announcementData.announcements
    : [
        'Welcome to our store - Free shipping on orders over $50!',
        'Summer Sale - Up to 50% off selected items!',
        'New arrivals just landed - Shop the latest trends!'
      ];

  const backgroundColor = announcementData?.backgroundColor || '#2c3bc5';
  const textColor = announcementData?.textColor || '#ffffff';

  // After all hooks, decide to render or not
  if (!showBar) {
    return null;
  }

  return (
    <div
      ref={barRef}
      role="region"
      aria-label="Site announcements"
      className="w-full h-12 flex items-center fixed -top-px inset-x-0 z-[60] overflow-hidden relative pr-12"
      style={{
        fontFamily: "'Albert Sans', sans-serif",
        backgroundColor: backgroundColor,
        color: textColor
      }}
    >
      {/* Left gradient fade */}
      <div
        className="absolute left-0 top-0 w-20 h-full z-10 pointer-events-none"
        style={{
          background: `linear-gradient(to right, transparent, ${backgroundColor})`
        }}
      ></div>
      {/* Right gradient fade */}
      <div
        className="absolute right-0 top-0 w-20 h-full z-10 pointer-events-none"
        style={{
          background: `linear-gradient(to left, transparent, ${backgroundColor})`
        }}
      ></div>
      {/* Infinite scrolling container */}
      <div className="absolute inset-0 flex items-center">
        <div className="animate-scroll-left flex items-center space-x-16 whitespace-nowrap pl-16">
          {/* First set of announcements */}
          {announcements.map((announcement, index) => (
            <span key={`first-${index}`} className="text-sm font-medium" style={{ color: textColor }}>
              {announcement}
            </span>
          ))}
          {/* Duplicate set for seamless loop */}
          {announcements.map((announcement, index) => (
            <span key={`second-${index}`} className="text-sm font-medium" style={{ color: textColor }}>
              {announcement}
            </span>
          ))}
        </div>
      </div>

      {/* Close (X) button */}
      <button
        type="button"
        aria-label="Dismiss announcements"
        onClick={handleClose}
        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/60 z-20"
        style={{ color: textColor }}
      >
        <span aria-hidden="true" className="text-xl leading-none">×</span>
      </button>
    </div>
  );
};

export default AnnouncementBar;
