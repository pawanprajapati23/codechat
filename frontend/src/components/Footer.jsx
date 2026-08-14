import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0b141a] border-t border-[#2a3942] pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-6 h-6 text-[#25d366]" fill="currentColor" />
              <span className="font-bold text-lg text-white">CodeChat</span>
            </Link>
            <p className="text-gray-400 text-sm">
              Lightning-fast real-time chat for developers.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link to="/features" className="text-gray-400 hover:text-[#25d366] text-sm">Features</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-[#25d366] text-sm">About</Link></li>
              <li><Link to="/app" className="text-gray-400 hover:text-[#25d366] text-sm">Open App</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/founder" className="text-gray-400 hover:text-[#25d366] text-sm">Founder</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-[#25d366] text-sm">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-gray-400 hover:text-[#25d366] text-sm">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-[#25d366] text-sm">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#2a3942] pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0 text-center md:text-left">
            © 2025 CodeChat. Built with ❤️ by Pawan Prajapati
          </p>
          <div className="flex space-x-4">
            <a href="https://github.com/pawanprajapati23" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
