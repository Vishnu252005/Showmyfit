import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-cream border-t border-warm-200 py-12 mb-16 md:mb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h3 className="text-2xl font-serif font-bold text-warm-900 mb-3 tracking-wide">VERVE THREADS</h3>
          <p className="text-warm-600 text-sm mb-6 max-w-md mx-auto leading-relaxed">
            Curating timeless pieces from local artisans and boutiques. 
            Sustainable fashion, crafted with care.
          </p>
          <div className="flex justify-center space-x-8 text-sm text-warm-500 mb-6">
            <a href="#" className="hover:text-warm-700 uppercase tracking-wider font-medium">About</a>
            <a href="#" className="hover:text-warm-700 uppercase tracking-wider font-medium">Artisans</a>
            <a href="#" className="hover:text-warm-700 uppercase tracking-wider font-medium">Sustainability</a>
            <a href="#" className="hover:text-warm-700 uppercase tracking-wider font-medium">Contact</a>
          </div>
          <p className="text-xs text-warm-400">
            © 2024 Verve Threads. Crafted with care.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;