import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Home, Loader2 } from 'lucide-react';
import notFoundImage from '../assets/PNF404.png';

const NotFound = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleBackHome = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#030712] select-none flex items-center justify-center">
      {/* Loading Spinner displayed until image fully loads */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#030712] z-[10000] gap-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <span className="text-white/70 text-sm md:text-base font-medium tracking-wide animate-pulse">
            Loading...
          </span>
        </div>
      )}

      {/* Full Screen Background Image */}
      <img
        src={notFoundImage}
        alt="404 Page Not Found"
        onLoad={() => setImageLoaded(true)}
        className={`absolute inset-0 w-full h-full object-contain md:object-cover object-center transition-opacity duration-700 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Back to Home Button placed below main image text on right side for desktop, bottom center for mobile */}
      <div
        className={`absolute bottom-12 left-1/2 -translate-x-1/2 md:bottom-auto md:top-[73%] md:left-[68%] md:-translate-x-1/2 z-[9999] transition-all duration-700 ${
          imageLoaded ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <button
          onClick={handleBackHome}
          className="group inline-flex items-center justify-center gap-2.5 sm:gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-white/10 sm:bg-transparent hover:bg-white/15 text-white font-semibold text-sm sm:text-lg shadow-[0_10px_35px_rgba(0,0,0,0.7)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.9)] backdrop-blur-md border border-white/30 hover:border-white/50 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer whitespace-nowrap"
        >
          <Home className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:-translate-y-0.5 shrink-0" />
          <span>Back to Home</span>
        </button>
      </div>
    </div>
  );
};

export default NotFound;
