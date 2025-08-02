import React, { useState, useEffect } from 'react';
import { useAnnouncementBar } from '../hooks/useSiteConfig';

const AnnouncementBar = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { data: announcementData, loading, error } = useAnnouncementBar();

  // Use fallback data if config is not available
  const announcements = announcementData?.announcements || [
    "Welcome to our store - Free shipping on orders over $50!",
    "Summer Sale - Up to 50% off selected items!",
    "New arrivals just landed - Shop the latest trends!"
  ];

  const isActive = announcementData?.isActive ?? true;

  useEffect(() => {
    if (!isActive || announcements.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [announcements.length, isActive]);

  // Don't render if not active or loading
  if (!isActive || loading) {
    return null;
  }

  // Show error state - but still display with fallback data
  if (error) {
    console.error('AnnouncementBar config error:', error);
    // Continue with fallback data instead of returning null
  }

  return (
    <div className="bg-black text-white py-3 overflow-hidden relative">
      <div className="flex items-center justify-center animate-scroll-left whitespace-nowrap">
        {/* First set of announcements */}
        {announcements.map((announcement, index) => (
          <span 
            key={`first-${index}`} 
            className="text-sm font-medium text-white mx-8 flex-shrink-0"
          >
            {announcement}
          </span>
        ))}
        {/* Duplicate set for seamless loop */}
        {announcements.map((announcement, index) => (
          <span 
            key={`second-${index}`} 
            className="text-sm font-medium text-white mx-8 flex-shrink-0"
          >
            {announcement}
          </span>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementBar;