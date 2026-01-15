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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #48E5B6 0%, #00B4FF 50%, #006D88 100%)',
        padding: '2rem',
      }}
    >
      {/* Logo */}
      <div
        style={{
          marginBottom: '2rem',
          cursor: 'pointer',
          transition: 'transform 0.3s',
        }}
        onClick={() => navigate('/')}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <img
          src="/Gemini_Generated_Image_h7y6jnh7y6jnh7y6.webp"
          alt="SplashTool Logo"
          style={{
            width: '200px',
            height: 'auto',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
          }}
        />
      </div>

      {/* Auth Form Container */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          maxWidth: '400px',
          width: '100%',
        }}
      >
        <h2
          style={{
            fontSize: '2rem',
            fontWeight: '800',
            marginBottom: '1.5rem',
            textAlign: 'center',
            fontFamily: 'Sniglet, cursive',
            color: '#006D88',
          }}
        >
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
