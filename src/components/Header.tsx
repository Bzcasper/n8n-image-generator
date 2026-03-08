import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, LogOut, User, Menu, X } from 'lucide-react';
import { useAuth } from '../lib/backendAuth';

interface HeaderProps {
  onBackToLanding?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onBackToLanding }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    navigate('/auth/login');
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-navy/10 sticky top-0 z-50 py-2 md:py-3">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between md:justify-center relative">
          {/* Back to Landing Button */}
          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 border-2 border-navy/5 rounded-lg md:rounded-xl text-navy hover:text-blue hover:border-blue/20 transition-all font-varela group"
            >
              <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] md:text-sm font-bold uppercase tracking-wider">Back</span>
            </button>
          )}

          {/* Logo - Centered on Desktop, Adaptive on Mobile */}
          <div className="flex flex-col items-center flex-grow">
            <div className="flex items-center space-x-1.5 md:space-x-2">
              <Sparkles className="w-4 h-4 md:w-6 md:h-6 text-mint animate-pulse" />
              <h1 className="text-2xl md:text-4xl font-black font-sniglet tracking-tight">
                <span className="text-black">Splash</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue via-mint to-navy">Tool</span>
              </h1>
            </div>
            <p className="hidden md:block text-[10px] uppercase tracking-[0.2em] font-black text-navy/40 font-varela -mt-1">
              AI-Powered Generation
            </p>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-navy"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Desktop Navigation / User Menu */}
          <div className="hidden md:flex absolute right-0 items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-2 text-navy font-varela">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-bold truncate max-w-[100px]">{user.username || user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-1.5 border-2 border-navy/5 rounded-xl text-xs font-bold text-navy hover:text-blue hover:border-blue/20 transition-all uppercase tracking-wider"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/" className="text-xs font-bold font-varela text-navy hover:text-blue transition-colors uppercase tracking-wider">
                  Home
                </Link>
                <div className="w-1 h-1 bg-mint rounded-full"></div>
                <Link to="/auth/login" className="text-xs font-bold font-varela text-navy hover:text-blue transition-colors uppercase tracking-wider">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white/98 backdrop-blur-xl border-b-2 border-navy/10 shadow-[0_20px_40px_rgba(0,0,0,0.1)] py-6 px-6 animate-in fade-in slide-in-from-top duration-300 z-40">
          <div className="flex flex-col space-y-4">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-3 p-4 bg-navy/5 rounded-2xl border border-navy/5">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <User className="w-5 h-5 text-navy" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-navy/40 uppercase tracking-widest">Signed in as</p>
                    <p className="text-sm font-bold text-navy">{user.username || user.email}</p>
                  </div>
                </div>
                <Link 
                  to="/account/profile" 
                  className="flex items-center gap-3 text-lg font-black font-sniglet text-navy uppercase tracking-wide py-3 px-4 rounded-xl hover:bg-navy/5 transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Sparkles className="w-5 h-5 text-mint" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 text-lg font-black font-sniglet text-red-500 uppercase tracking-wide py-3 px-4 rounded-xl hover:bg-red-50 transition-all text-left"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/" 
                  className="text-lg font-black font-sniglet text-navy uppercase tracking-wide py-3 px-4 rounded-xl hover:bg-navy/5 transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  to="/auth/login" 
                  className="text-lg font-black font-sniglet text-blue uppercase tracking-wide py-3 px-4 rounded-xl hover:bg-blue/5 transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
