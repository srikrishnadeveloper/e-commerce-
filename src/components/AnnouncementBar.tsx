import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useAnnouncementBar } from '../hooks/useSiteConfig';

const AnnouncementBar: React.FC = () => {
  const { data, loading, error } = useAnnouncementBar();
  // Do NOT persist dismissal so it shows again on refresh
  const [dismissed, setDismissed] = useState<boolean>(false);

  const barRef = useRef<HTMLDivElement | null>(null);

  // Memoize announcement data processing for performance
  const announcementData = useMemo(() => data || {}, [data]);

  // Check if announcement bar is enabled (handle both 'enabled' and 'isActive' properties)
  const isEnabled = useMemo(() =>
    announcementData?.enabled !== false && announcementData?.isActive !== false,
    [announcementData]
  );

  const showBar = !dismissed && isEnabled && !loading && !error;

  // Optimized height notification with useCallback
  const notifyHeight = useCallback(() => {
    const h = showBar ? (barRef.current?.offsetHeight || 0) : 0;
    window.dispatchEvent(new CustomEvent('announcementbar:height', { detail: h }));
  }, [showBar]);

  // Inform layout about the bar height so content can offset accordingly
  useEffect(() => {
    notifyHeight();
    if (showBar) {
      window.addEventListener('resize', notifyHeight);
    }
    return () => {
      window.removeEventListener('resize', notifyHeight);
      window.dispatchEvent(new CustomEvent('announcementbar:height', { detail: 0 }));
    };
  }, [showBar, notifyHeight]);

  const handleClose = useCallback(() => {
    setDismissed(true);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('announcementbar:height', { detail: 0 }));
    }
  }, []);

  // Memoize announcements and styling for performance
  const announcements = useMemo(() => {
    if (announcementData?.announcements && announcementData.announcements.length > 0) {
      return announcementData.announcements.filter(announcement =>
        announcement && announcement.trim().length > 0
      );
    }
    return [
      'Welcome to our store - Free shipping on orders over $50!',
      'Summer Sale - Up to 50% off selected items!',
      'New arrivals just landed - Shop the latest trends!'
    ];
  }, [announcementData?.announcements]);

  const backgroundColor = useMemo(() =>
    announcementData?.backgroundColor || '#2c3bc5',
    [announcementData?.backgroundColor]
  );

  const textColor = useMemo(() =>
    announcementData?.textColor || '#ffffff',
    [announcementData?.textColor]
  );

  // Memoize the announcement items for better performance
  const announcementItems = useMemo(() =>
    announcements.map((announcement, index) => (
      <span
        key={`announcement-${index}`}
        className="text-sm font-medium px-8"
        style={{ color: textColor }}
      >
        {announcement}
      </span>
    )),
    [announcements, textColor]
  );

  // After all hooks, decide to render or not
  if (!showBar || announcements.length === 0) {
    return null;
  }

  return (
    <div
      ref={barRef}
      role="region"
      aria-label="Site announcements"
      aria-live="polite"
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
      {/* Optimized infinite scrolling container */}
      <div className="absolute inset-0 flex items-center">
        <div
          className="animate-scroll-left flex items-center whitespace-nowrap"
          style={{
            animationDuration: `${Math.max(20, announcements.length * 4)}s`,
            willChange: 'transform'
          }}
        >
          {/* First set of announcements */}
          {announcementItems}
          {/* Duplicate set for seamless loop */}
          {announcementItems}
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
