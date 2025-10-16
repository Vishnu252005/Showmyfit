import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BannerSlide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
}

const SlidingBanner: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: BannerSlide[] = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop&crop=center',
      title: 'New Collection',
      subtitle: 'TRENDING NOW'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=400&fit=crop&crop=center',
      title: 'Premium Style',
      subtitle: 'ELEGANT FASHION'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=400&fit=crop&crop=center',
      title: 'Exclusive Deals',
      subtitle: 'LIMITED TIME'
    }
  ];

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => 
        prevSlide === slides.length - 1 ? 0 : prevSlide + 1
      );
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (slideIndex: number) => {
    setCurrentSlide(slideIndex);
  };

  const goToPrevious = () => {
    setCurrentSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1);
  };

  const goToNext = () => {
    setCurrentSlide(currentSlide === slides.length - 1 ? 0 : currentSlide + 1);
  };

  return (
    <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800">
      {/* Slide Container */}
      <div className="flex transition-transform duration-500 ease-in-out h-full" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
        {slides.map((slide) => (
          <div key={slide.id} className="w-full h-full flex-shrink-0 relative">
            {/* Background Image */}
            <div 
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
              
              {/* Content */}
              <div className="relative h-full flex items-center">
                <div className="px-4 md:px-8 lg:px-12 max-w-2xl">
                  {/* Text Content */}
                  <div className="text-white mb-4">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 drop-shadow-lg">
                      {slide.title}
                    </h2>
                    <p className="text-lg md:text-xl lg:text-2xl font-semibold text-yellow-300 drop-shadow-md">
                      {slide.subtitle}
                    </p>
                  </div>

                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 md:p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-4 h-4 md:w-6 md:h-6" />
      </button>
      
      <button
        onClick={goToNext}
        className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 md:p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
        aria-label="Next slide"
      >
        <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white scale-125' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* AD Badge */}
      <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs font-medium backdrop-blur-sm">
        AD
      </div>
    </div>
  );
};

export default SlidingBanner;
