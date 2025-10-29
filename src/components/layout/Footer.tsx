import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Youtube, Facebook } from 'lucide-react';

const Footer: React.FC = () => {
  const [showAbout, setShowAbout] = useState(false);
  return (
    <footer className="bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500 py-12 mb-16 md:mb-0 relative overflow-hidden">
      {/* Diwali Sparkles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-20 w-3 h-3 bg-yellow-300 rounded-full animate-pulse"></div>
        <div className="absolute top-20 right-32 w-2 h-2 bg-orange-300 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-32 w-4 h-4 bg-red-300 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute bottom-10 right-20 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-pulse delay-500"></div>
        <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-orange-400 rounded-full animate-pulse delay-1500"></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-red-400 rounded-full animate-pulse delay-3000"></div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <h3 className="text-2xl font-serif font-bold text-white mb-3 tracking-wide drop-shadow-lg">🪔 SHOWMYFIT 🪔</h3>
          <p className="text-white/90 text-sm mb-6 max-w-md mx-auto leading-relaxed drop-shadow-md">
            ✨ Celebrate Diwali with amazing deals from local stores! ✨<br/>
            Find your perfect festive fit, crafted with care.
          </p>
          <div className="flex justify-center space-x-8 text-sm text-white/80 mb-6">
            <Link to="/about" className="hover:text-yellow-200 uppercase tracking-wider font-medium transition-colors">About</Link>
            <Link to="/privacy" className="hover:text-yellow-200 uppercase tracking-wider font-medium transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-yellow-200 uppercase tracking-wider font-medium transition-colors">Terms</Link>
            <a href="#" className="hover:text-yellow-200 uppercase tracking-wider font-medium transition-colors">Artisans</a>
            <a href="#" className="hover:text-yellow-200 uppercase tracking-wider font-medium transition-colors">Sustainability</a>
            <a href="#" className="hover:text-yellow-200 uppercase tracking-wider font-medium transition-colors">Contact</a>
          </div>
          
          {/* Know more dropdown */}
          <div className="mb-6">
            <button
              onClick={() => setShowAbout(!showAbout)}
              className="mx-auto flex items-center justify-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-semibold transition-colors"
              aria-controls="footer-about"
            >
              {showAbout ? 'Hide about Showmyfit' : 'Know more about Showmyfit'}
            </button>
            {showAbout && (
              <div id="footer-about" className="mt-3 max-w-2xl mx-auto text-white/90 text-sm leading-relaxed bg-white/10 rounded-xl p-4">
                Showmyfit connects shoppers with nearby sellers and boutiques. Browse real inventory, reserve items you love, and pick up in-store. Our mission is to boost local commerce with a fast, delightful shopping experience.
              </div>
            )}
          </div>

          {/* Social Media Links - Diwali Theme */}
          <div className="flex justify-center space-x-6 mb-6">
            <a 
              href="https://www.instagram.com/showmyfit?utm_source=qr" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl border-2 border-yellow-300"
              aria-label="Follow us on Instagram"
              title="Follow us on Instagram"
            >
              <Instagram className="w-6 h-6" />
            </a>
            
            <a 
              href="https://youtube.com/@showmyfit?si=RO9OiJLBUUXiOFJX" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-12 h-12 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl border-2 border-orange-300"
              aria-label="Subscribe to our YouTube channel"
              title="Subscribe to our YouTube channel"
            >
              <Youtube className="w-6 h-6" />
            </a>
            
            <a 
              href="https://www.facebook.com/showmyfitofficial?mibextid=ZbWKwL" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl border-2 border-red-300"
              aria-label="Like us on Facebook"
              title="Like us on Facebook"
            >
              <Facebook className="w-6 h-6" />
            </a>
          </div>
          <p className="text-xs text-white/80 mb-2 drop-shadow-sm">
            🪔 © 2024 Showmyfit. Celebrating Diwali with you! 🪔
          </p>
          <p className="text-xs text-white/70 drop-shadow-sm">
            ✨ Contact us: showmyfitapp@gmail.com ✨
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;