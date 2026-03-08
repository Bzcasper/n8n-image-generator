import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import { useAuth } from '../lib/backendAuth';

export function Auth() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check URL path to determine mode
    const path = location.pathname;
    if (path === '/auth/register') {
      setIsLoginMode(false);
    } else if (path === '/auth/login') {
      setIsLoginMode(true);
    }

    // Redirect if already authenticated
    if (isAuthenticated && !isLoading) {
      navigate('/');
    }
  }, [location.pathname, isAuthenticated, isLoading, navigate]);

  const handleToggleMode = () => {
    setIsLoginMode((prev) => !prev);
  };

  const handleSuccess = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-[#48E5B6] via-[#00B4FF] to-[#006D88] p-6">
      {/* Logo */}
      <div
        className="mb-8 cursor-pointer hover:scale-105 transition-transform duration-300 w-full max-w-[300px] md:max-w-[500px]"
        onClick={() => navigate('/')}
      >
        <img
          src="/Gemini_Generated_Image_h7y6jnh7y6jnh7y6.webp"
          alt="SplashTool Logo"
          className="w-full h-auto drop-shadow-xl"
        />
      </div>

      {/* Auth Form Container */}
      <div className="bg-white/95 backdrop-blur-md rounded-20 p-6 md:p-10 shadow-2xl border border-white/20 max-w-[450px] w-full transform animate-fade-in-up">
        <h2 className="text-3xl md:text-4xl font-black mb-8 text-center font-sniglet text-[#006D88] uppercase tracking-tight">
          {isLoginMode ? 'Welcome Back!' : 'Create Account'}
        </h2>

        {isLoginMode ? (
          <LoginForm onToggleMode={handleToggleMode} onSuccess={handleSuccess} />
        ) : (
          <RegisterForm onToggleMode={handleToggleMode} onSuccess={handleSuccess} />
        )}
      </div>
    </div>
  );
}
