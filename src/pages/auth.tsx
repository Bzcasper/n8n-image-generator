import { AuthView } from '@neondatabase/neon-js/auth/react/ui';
import { useParams } from 'react-router-dom';

export function Auth() {
  const { pathname } = useParams();
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
        onClick={() => window.location.href = '/'}
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
        <AuthView pathname={pathname} />
      </div>
    </div>
  );
}