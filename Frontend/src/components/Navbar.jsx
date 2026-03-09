import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How it Works', href: '#how-it-works' },
    { name: 'FAQ', href: '#faq' },
    { name: 'About', href: '#about' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled || !isLandingPage ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <img src="/cpsu-logo.png" alt="CPSU Logo" className="h-10 w-auto" />
            <span className={`text-2xl font-extrabold tracking-tight font-outfit text-gray-900`}>
              Health<span className="text-cpsu-green">AI</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {isLandingPage && navLinks.map((link) => (
              <a key={link.name} href={link.href} className="text-sm font-medium text-gray-600 hover:text-cpsu-green transition-colors">
                {link.name}
              </a>
            ))}
            <Link to="/login" className="px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-cpsu-green hover:bg-cpsu-green-dark transition-all shadow-md shadow-cpsu-green/20 hover:shadow-lg hover:-translate-y-0.5">
              Portal Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-xl absolute w-full top-full">
          <div className="px-4 py-6 space-y-4">
            {isLandingPage && navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className="block text-base font-medium text-gray-700 hover:text-cpsu-green hover:bg-gray-50 px-3 py-2 rounded-lg" 
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4 border-t border-gray-100">
               <Link 
                 to="/login" 
                 className="block w-full text-center px-5 py-3 rounded-lg text-base font-semibold text-white bg-cpsu-green hover:bg-cpsu-green-dark shadow-md" 
                 onClick={() => setIsMobileMenuOpen(false)}
               >
                 Portal Login
               </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
