import React from 'react';
import { Github, Twitter, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
             <div className="flex items-center gap-2 mb-4">
               <div className="w-8 h-8 rounded-full bg-cpsu-green flex items-center justify-center text-white font-bold">
                 C
               </div>
               <span className="text-xl font-bold text-white tracking-tight">Health<span className="text-cpsu-gold">AI</span></span>
             </div>
            <p className="text-sm text-gray-400 mb-6 max-w-xs">
              Central Philippines State University's official AI-powered virtual health assistant. Providing accessible care for the whole campus.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Platform</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm hover:text-white transition-colors">Student Portal</a></li>
              <li><a href="#" className="text-sm hover:text-white transition-colors">Staff Dashboard</a></li>
              <li><a href="#" className="text-sm hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="text-sm hover:text-white transition-colors">Documentation</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Support</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="text-sm hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-sm hover:text-white transition-colors">Clinic Operations</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
             <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Contact Clinic</h3>
             <ul className="space-y-3">
              <li className="flex items-start text-sm">
                <MapPin className="h-5 w-5 mr-2 text-cpsu-green shrink-0" />
                <span>Kabankalan City, Negros Occidental, Philippines</span>
              </li>
              <li className="flex items-center text-sm">
                <Phone className="h-4 w-4 mr-3 text-cpsu-green" />
                <span>+63 (34) 123-4567</span>
              </li>
              <li className="flex items-center text-sm">
                <Mail className="h-4 w-4 mr-3 text-cpsu-green" />
                <span>clinic@cpsu.edu.ph</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Central Philippines State University. All rights reserved.
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Capstone Project by{' '}
              <span className="text-gray-400">Cuenca · Pausa · Sumagaysay · Talapeiro</span>
              {' '}— BSIT
            </p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-500 hover:text-white transition-colors">
              <span className="sr-only">Facebook</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors">
              <span className="sr-only">Twitter</span>
              <Twitter className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
