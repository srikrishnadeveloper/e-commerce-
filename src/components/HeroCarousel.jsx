import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import siteConfig from '../data/siteConfig.json';

const HeroCarousel = () => {
  const slides = siteConfig.hero.slides;
  const [activeIndex, setActiveIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const slidesRef = useRef([]);
  const contentRef = useRef([]);
  const imageRef = useRef([]);
  const buttonRef = useRef(null);

  // GSAP Timeline for animations
  const tl = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Initialize GSAP timeline
    tl.current = gsap.timeline();
    
    // Animate active slide content
    animateActiveSlide();
  }, [activeIndex, windowWidth]);

  const animateActiveSlide = () => {
    if (tl.current) {
      tl.current.clear();
      
      // Get visible slides for current state
      const visibleSlides = getVisibleSlides();
      
      // Animate slide cards with position transitions
      visibleSlides.forEach(({ slide, index, position }) => {
        const slideElement = slidesRef.current[index];
        if (slideElement) {
          if (index === activeIndex) {
            // Active card: animate to center with full opacity and scale
            gsap.to(slideElement, {
              scale: 1,
              opacity: 1,
              duration: 0.8,
              ease: "power2.out"
            });
          } else {
            // Inactive cards: animate to side positions with reduced opacity and scale
            gsap.to(slideElement, {
              scale: 0.9,
              opacity: 0.4,
              duration: 0.8,
              ease: "power2.out"
            });
          }
        }
      });

      // Animate content elements for active slide
      const activeContent = contentRef.current[activeIndex];
      const activeImage = imageRef.current[activeIndex];
      
      if (activeContent) {
        const heading = activeContent.querySelector('h2');
        const subheading = activeContent.querySelector('p');
        const button = activeContent.querySelector('button');

        // Reset and animate heading
        if (heading) {
          gsap.fromTo(heading, 
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.3 }
          );
        }

        // Reset and animate subheading
        if (subheading) {
          gsap.fromTo(subheading,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.5 }
          );
        }

        // Reset and animate button
        if (button) {
          gsap.fromTo(button,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.7 }
          );
        }
      }

      // Animate image
      if (activeImage) {
        gsap.fromTo(activeImage,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.9 }
        );
      }
    }
  };

  const prevSlide = () => {
    // Add a smooth transition animation before changing slides
    const visibleSlides = getVisibleSlides();
    const visibleElements = visibleSlides.map(({ index }) => slidesRef.current[index]).filter(Boolean);
    
    gsap.to(visibleElements, {
      x: 20,
      duration: 0.15,
      ease: "power2.out",
      onComplete: () => {
        setActiveIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
        gsap.to(visibleElements, {
          x: 0,
          duration: 0.15,
          ease: "power2.out"
        });
      }
    });
  };

  const nextSlide = () => {
    // Add a smooth transition animation before changing slides
    const visibleSlides = getVisibleSlides();
    const visibleElements = visibleSlides.map(({ index }) => slidesRef.current[index]).filter(Boolean);
    
    gsap.to(visibleElements, {
      x: -20,
      duration: 0.15,
      ease: "power2.out",
      onComplete: () => {
        setActiveIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
        gsap.to(visibleElements, {
          x: 0,
          duration: 0.15,
          ease: "power2.out"
        });
      }
    });
  };

  const getSlideClass = (index) => {
    const baseClass = "relative flex flex-col items-center justify-center bg-[#f5f5f7] rounded-2xl";
    const sizeClass = index === activeIndex ? "carousel-card-active" : "carousel-card-inactive";
    
    if (index === activeIndex) {
      return `${baseClass} ${sizeClass} z-20`;
    } else {
      return `${baseClass} ${sizeClass} z-10`;
    }
  };

  const getSlideStyle = (index) => {
    const isMobile = windowWidth <= 768;
    const isTablet = windowWidth > 768 && windowWidth <= 1024;
    
    let marginValue = '-1100px'; // Show only ~200px of side cards
    if (isMobile) {
      marginValue = '-280px'; // Show only ~70px of side cards on mobile
    } else if (isTablet) {
      marginValue = '-500px'; // Show only ~100px of side cards on tablet
    }

    // For active card, no margins
    if (index === activeIndex) {
      return {
        fontFamily: "'Albert Sans', sans-serif",
        boxSizing: 'border-box',
        marginLeft: '0',
        marginRight: '0'
      };
    }

    // For inactive cards, position them so only edges are visible
    const visibleSlides = getVisibleSlides();
    const currentSlide = visibleSlides.find(slide => slide.index === index);
    
    if (currentSlide?.position === 'left') {
      // Left card: show only right edge
      return {
        fontFamily: "'Albert Sans', sans-serif",
        boxSizing: 'border-box',
        marginLeft: marginValue,
        marginRight: '0'
      };
    } else if (currentSlide?.position === 'right') {
      // Right card: show only left edge  
      return {
        fontFamily: "'Albert Sans', sans-serif",
        boxSizing: 'border-box',
        marginLeft: '0',
        marginRight: marginValue
      };
    }

    return {
      fontFamily: "'Albert Sans', sans-serif",
      boxSizing: 'border-box'
    };
  };

  const getVisibleSlides = () => {
    const total = slides.length;
    const prev = (activeIndex - 1 + total) % total;
    const next = (activeIndex + 1) % total;
    
    return [
      { slide: slides[prev], index: prev, position: 'left' },
      { slide: slides[activeIndex], index: activeIndex, position: 'center' },
      { slide: slides[next], index: next, position: 'right' }
    ];
  };

  return (
    <section className="relative flex justify-center items-start w-full overflow-hidden min-h-[500px] sm:min-h-[600px] lg:min-h-[800px] bg-white pt-0 pb-8">
      {/* Left Arrow */}
      <button
        className="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 z-30 bg-white hover:bg-black text-black hover:text-white transition-all duration-300 rounded-full shadow-lg w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center group"
        onClick={(e) => {
          prevSlide();
          gsap.to(e.currentTarget, { scale: 0.9, duration: 0.1, yoyo: true, repeat: 1 });
        }}
        aria-label="Previous slide"
      >
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="sm:w-5 sm:h-5"
        >
          <path d="m15 18-6-6 6-6"/>
        </svg>
      </button>

      {/* Slides Container */}
      <div className="flex items-start justify-center relative w-full overflow-hidden">
        {getVisibleSlides().map(({ slide, index, position }) => (
          <div
            key={`${slide.id}-${index}-${position}`}
            ref={el => slidesRef.current[index] = el}
            className={getSlideClass(index)}
            style={{
              ...getSlideStyle(index),
              backgroundImage: `url(${slide.image})`,
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center center',
              border: '3px solid #ef4444',
              boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
            }}
          >
            {/* Content Section - Overlaid on background */}
            <div 
              ref={el => contentRef.current[index] = el}
              className="flex flex-col items-center text-center px-4 sm:px-8 lg:px-16 py-4 sm:py-8 relative z-10 w-full h-full justify-start pt-8 sm:pt-16"
            >
              {/* Main Heading */}
              <h2 className={`font-normal mb-3 sm:mb-6 leading-tight text-red-500 ${
                index === activeIndex 
                  ? 'text-[32px] sm:text-[48px] lg:text-[68px]' 
                  : 'text-[24px] sm:text-[36px] lg:text-[48px]'
              }`}>
                {slide.heading.split('\n').map((line, lineIndex) => (
                  <React.Fragment key={lineIndex}>
                    {line}
                    {lineIndex < slide.heading.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </h2>
              
              {/* Subheading - Hidden on mobile */}
              <p className={`mb-6 sm:mb-12 max-w-xs sm:max-w-md hidden sm:block text-red-500 ${
                index === activeIndex 
                  ? 'text-[14px] sm:text-[16px] lg:text-[20px]' 
                  : 'text-[12px] sm:text-[14px] lg:text-[16px]'
              }`}>
                {slide.subheading}
              </p>
              
              {/* Button - only show on active slide */}
              {index === activeIndex && (
                <button 
                  ref={buttonRef}
                  className="inline-flex items-center border-2 border-red-500 px-4 sm:px-8 py-2 sm:py-3 rounded-full text-sm sm:text-lg font-medium transition-all duration-300 hover:bg-red-500 hover:text-white group text-red-500"
                >
                  {slide.button}
                  <svg 
                    width="12" 
                    height="12" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="ml-2 transition-transform group-hover:translate-x-1 sm:w-4 sm:h-4"
                  >
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </button>
              )}
            </div>
            
            {/* Hidden image ref for GSAP animations */}
            <img 
              ref={el => imageRef.current[index] = el}
              src={slide.image} 
              alt={slide.heading}
              className="hidden"
            />
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      <button
        className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 z-30 bg-white hover:bg-black text-black hover:text-white transition-all duration-300 rounded-full shadow-lg w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center group"
        onClick={(e) => {
          nextSlide();
          gsap.to(e.currentTarget, { scale: 0.9, duration: 0.1, yoyo: true, repeat: 1 });
        }}
        aria-label="Next slide"
      >
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="sm:w-5 sm:h-5"
        >
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </button>
    </section>
  );
};

export default HeroCarousel;
