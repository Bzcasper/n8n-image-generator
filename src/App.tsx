import { useState, useEffect, useRef } from 'react';
import { Sparkles, Zap, Shield } from 'lucide-react';

const App: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const x = (clientX / innerWidth) * 2 - 1;
      const y = (clientY / innerHeight) * 2 - 1;
      
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen w-full relative overflow-hidden flex flex-col text-slate-900 bg-[#F0F2F5]"
    >
      {/* Dynamic Background Blobs */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[120px] opacity-40 mix-blend-multiply transition-transform duration-75 ease-out will-change-transform"
        style={{ 
          backgroundColor: '#48E5B6',
          transform: `translate(${mousePos.x * -40}px, ${mousePos.y * -40}px)` 
        }}
      />
      <div 
        className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[140px] opacity-40 mix-blend-multiply transition-transform duration-100 ease-out will-change-transform"
        style={{ 
          backgroundColor: '#00B4FF',
          transform: `translate(${mousePos.x * 50}px, ${mousePos.y * 50}px)` 
        }}
      />
      <div 
        className="absolute top-[20%] right-[20%] w-[30vw] h-[30vw] rounded-full blur-[100px] opacity-30 mix-blend-multiply transition-transform duration-150 ease-out will-change-transform"
        style={{ 
          backgroundColor: '#006D88',
           transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)` 
        }}
      />

      {/* Logo in Upper Left */}
      <div className="absolute top-0 left-[-3rem] md:left-[-6rem] z-50 p-2">
        <img 
          src="/Gemini_Generated_Image_h7y6jnh7y6jnh7y6.webp" 
          alt="SplashTool Logo" 
          className="w-72 md:w-[24rem] h-auto drop-shadow-2xl"
        />
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex flex-col justify-start items-center text-center px-6 pt-24 md:pt-32">
        
        {/* Big Bold Headline */}
        <h1 className="max-w-5xl mx-auto text-6xl md:text-8xl font-black tracking-tight leading-[0.9] mb-6 font-sniglet">
          <span className="block font-varela text-black drop-shadow-sm">Think. Prompt.</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00B4FF] via-[#48E5B6] to-[#006D88] animate-gradient-x block filter drop-shadow-sm text-7xl md:text-[11rem] leading-none">
            SPLASH
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-lg mx-auto text-lg md:text-2xl text-slate-600 mb-10 font-varela font-bold tracking-wide">
          AI-powered image generation that flows like water
        </p>

        {/* Generate Button */}
        <div className="mb-10 relative group">
          <div 
            className="absolute inset-0 blur-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-glow"
            style={{
              background: 'radial-gradient(circle, #48E5B6 0%, #00B4FF 50%, #006D88 100%)',
              transform: 'scale(1.2)',
            }}
          />
          
          <a 
            href="#"
            className="relative z-10 inline-flex items-center justify-center px-16 py-5 text-xl md:text-2xl font-black tracking-wide text-white transition-all hover:-translate-y-2 active:translate-y-0 shadow-[0_20px_60px_rgba(0,109,136,0.5)] animate-float font-sniglet"
            style={{
              background: 'linear-gradient(135deg, #48E5B6 0%, #00B4FF 50%, #006D88 100%)',
              borderRadius: '20px',
              boxShadow: '0 15px 45px rgba(0, 109, 136, 0.4), 0 0 30px rgba(72, 229, 182, 0.3), inset 0 -4px 15px rgba(0, 0, 0, 0.15)',
            }}
          >
            <span className="relative z-10">Generate Now</span>
            <div className="absolute inset-0 rounded-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 60%)',
            }} />
          </a>
        </div>

        {/* Feature Cards - Slightly Smaller & Moved Up */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12 px-4">
          <div className="bg-white/95 backdrop-blur-sm p-6 rounded-20 shadow-2xl border-b-4 border-[#48E5B6] transform hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 bg-[#48E5B6]/15 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <Sparkles className="text-[#48E5B6] w-8 h-8" />
            </div>
            <h3 className="text-lg font-black mb-2 font-sniglet text-black uppercase tracking-wide">Pure Magic</h3>
            <p className="text-slate-700 font-varela text-xs font-bold leading-relaxed">
              Transform thoughts into breathtaking masterpieces with AI.
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-sm p-6 rounded-20 shadow-2xl border-b-4 border-[#00B4FF] transform hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 bg-[#00B4FF]/15 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <Zap className="text-[#00B4FF] w-8 h-8" />
            </div>
            <h3 className="text-lg font-black mb-2 font-sniglet text-black uppercase tracking-wide">Instant Flow</h3>
            <p className="text-slate-700 font-varela text-xs font-bold leading-relaxed">
              Lightning-fast generation speeds to keep you creative.
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-sm p-6 rounded-20 shadow-2xl border-b-4 border-[#006D88] transform hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 bg-[#006D88]/15 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <Shield className="text-[#006D88] w-8 h-8" />
            </div>
            <h3 className="text-lg font-black mb-2 font-sniglet text-black uppercase tracking-wide">Secure Stream</h3>
            <p className="text-slate-700 font-varela text-xs font-bold leading-relaxed">
              Your creations handled with top privacy and security.
            </p>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center relative z-10">
        <p className="text-[#006D88]/50 text-sm font-questrial">Powered by AI Tool Pool</p>
      </footer>
    </div>
  );
};

export default App;
