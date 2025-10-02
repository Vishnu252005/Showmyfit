import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-cream border-t border-warm-200 py-12 mb-16 md:mb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h3 className="text-2xl font-serif font-bold text-warm-900 mb-3 tracking-wide">SHOWMYFIT</h3>
          <p className="text-warm-600 text-sm mb-6 max-w-md mx-auto leading-relaxed">
            Find your perfect fit with local fashion stores and boutiques. 
            Style that fits you, crafted with care.
          </p>
          <div className="flex justify-center space-x-8 text-sm text-warm-500 mb-6">
            <Link to="/about" className="hover:text-warm-700 uppercase tracking-wider font-medium">About</Link>
            <Link to="/privacy" className="hover:text-warm-700 uppercase tracking-wider font-medium">Privacy</Link>
            <Link to="/terms" className="hover:text-warm-700 uppercase tracking-wider font-medium">Terms</Link>
            <a href="#" className="hover:text-warm-700 uppercase tracking-wider font-medium">Artisans</a>
            <a href="#" className="hover:text-warm-700 uppercase tracking-wider font-medium">Sustainability</a>
            <a href="#" className="hover:text-warm-700 uppercase tracking-wider font-medium">Contact</a>
          </div>
          
          {/* Social Media Links */}
          <div className="flex justify-center space-x-6 mb-6">
            <a 
              href="https://www.instagram.com/showmyfit?utm_source=qr" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-200"
              aria-label="Follow us on Instagram"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            
            <a 
              href="https://youtube.com/@showmyfit?si=RO9OiJLBUUXiOFJX" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-200"
              aria-label="Subscribe to our YouTube channel"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            
            <a 
              href="https://www.facebook.com/showmyfitofficial?mibextid=ZbWKwL" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-200"
              aria-label="Like us on Facebook"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          </div>
          <p className="text-xs text-warm-400 mb-2">
            © 2024 Showmyfit. Crafted with care.
          </p>
          <p className="text-xs text-warm-500">
            Contact us: showmyfitapp@gmail.com
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;