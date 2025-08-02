import React from 'react';
import siteConfig from '../data/siteConfig.json';

const AnnouncementBar = () => {
  const { announcementBar } = siteConfig;
  
  // Don't render if announcement bar is disabled
  if (!announcementBar.isActive) {
    return null;
  }

  const announcements = announcementBar.announcements;

  return (
    <div className="w-full bg-announcement text-white h-12 flex items-center relative overflow-hidden" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
      
      {/* Left gradient fade */}
      <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-announcement to-transparent z-10"></div>
      
      {/* Right gradient fade */}
      <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-announcement to-transparent z-10"></div>
      
      {/* Infinite scrolling container */}
      <div className="absolute inset-0 flex items-center">
        <div className="animate-scroll-left flex items-center space-x-16 whitespace-nowrap pl-16">
          {/* First set of announcements */}
          {announcements.map((announcement, index) => (
            <span key={`first-${index}`} className="text-sm font-medium text-red-400">
              {announcement}
            </span>
          ))}
          {/* Duplicate set for seamless loop */}
          {announcements.map((announcement, index) => (
            <span key={`second-${index}`} className="text-sm font-medium text-red-400">
              {announcement}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;