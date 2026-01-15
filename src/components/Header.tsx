import React from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  onBackToLanding?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onBackToLanding }) => {
  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-navy/10 sticky top-0 z-50 py-3">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-center relative">
          {/* Back to Landing Button */}
          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="absolute left-0 flex items-center gap-2 text-navy hover:text-blue transition-colors font-varela"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-wider">Back</span>
            </button>
          )}

          {/* Logo on the left for navigation if needed, but centering "SplashTool" as requested */}
          <div className="flex flex-col items-center">
             <div className="flex items-center space-x-2">
               <Sparkles className="w-6 h-6 text-mint animate-pulse" />
               <h1 className="text-4xl font-black font-sniglet tracking-tight">
                <span className="text-black">Splash</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue via-mint to-navy">Tool</span>
              </h1>
             </div>
             <p className="text-[10px] uppercase tracking-[0.2em] font-black text-navy/40 font-varela -mt-1">
               AI-Powered Generation
             </p>
          </div>
          
          <div className="absolute right-0 hidden md:flex items-center space-x-4">
             <a href="/" className="text-xs font-bold font-varela text-navy hover:text-blue transition-colors uppercase tracking-wider">Home</a>
             <div className="w-1 h-1 bg-mint rounded-full"></div>
             <a href="#" className="text-xs font-bold font-varela text-navy hover:text-blue transition-colors uppercase tracking-wider">Pro</a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;