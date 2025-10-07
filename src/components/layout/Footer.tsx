import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Youtube, Facebook } from 'lucide-react';

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
              className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-200 shadow-md hover:shadow-lg"
              aria-label="Follow us on Instagram"
              title="Follow us on Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            
            <a 
              href="https://youtube.com/@showmyfit?si=RO9OiJLBUUXiOFJX" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-200 shadow-md hover:shadow-lg"
              aria-label="Subscribe to our YouTube channel"
              title="Subscribe to our YouTube channel"
            >
              <Youtube className="w-5 h-5" />
            </a>
            
            <a 
              href="https://www.facebook.com/showmyfitofficial?mibextid=ZbWKwL" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-200 shadow-md hover:shadow-lg"
              aria-label="Like us on Facebook"
              title="Like us on Facebook"
            >
              <Facebook className="w-5 h-5" />
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