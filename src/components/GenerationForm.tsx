import React, { useState, useCallback } from 'react';
import { Wand2, Shuffle, Settings, ChevronDown, Sparkles } from 'lucide-react';
import { GenerationParams, StyleOption, QualityOption, ModelOption } from '../types';

const STYLE_OPTIONS: StyleOption[] = [
  { value: 'photorealistic', label: 'Photorealistic', description: 'Ultra-realistic photography' },
  { value: 'artistic', label: 'Artistic', description: 'Oil painting masterpiece' },
  { value: 'cartoon', label: 'Cartoon', description: 'Animated Disney-style' },
  { value: 'cyberpunk', label: 'Cyberpunk', description: 'Futuristic neon aesthetic' },
  { value: 'fantasy', label: 'Fantasy', description: 'Magical mystical artwork' },
  { value: 'minimalist', label: 'Minimalist', description: 'Clean modern design' },
  { value: 'vintage', label: 'Vintage', description: 'Retro nostalgic style' },
];

const QUALITY_OPTIONS: QualityOption[] = [
  { value: 'high', label: 'Ultra HD', description: 'Maximum quality & detail' },
  { value: 'medium', label: 'High Quality', description: 'Balanced performance' },
  { value: 'low', label: 'Standard', description: 'Fast generation' },
];

const MODEL_OPTIONS: ModelOption[] = [
  { value: 'flux', label: 'Flux Pro', description: 'Latest premium model' },
  { value: 'turbo', label: 'Turbo', description: 'Lightning fast results' },
  { value: 'default', label: 'Classic', description: 'Reliable & consistent' },
];

const SIZE_OPTIONS = [
  { value: '512x512', label: '512×512', description: 'Square' },
  { value: '768x768', label: '768×768', description: 'Square HD' },
  { value: '1024x1024', label: '1024×1024', description: 'Square Ultra' },
  { value: '1024x768', label: '1024×768', description: 'Landscape' },
  { value: '768x1024', label: '768×1024', description: 'Portrait' },
  { value: '1536x1024', label: '1536×1024', description: 'Cinematic' },
];

interface GenerationFormProps {
  onGenerate: (params: GenerationParams) => void;
  isLoading: boolean;
  error: string | null;
}

const GenerationForm: React.FC<GenerationFormProps> = ({ onGenerate, isLoading, error }) => {
  const [message, setMessage] = useState('');
  const [style, setStyle] = useState<string>('photorealistic');
  const [size, setSize] = useState<string>('1024x1024');
  const [quality, setQuality] = useState<string>('high');
  const [model, setModel] = useState<string>('flux');
  const [seed, setSeed] = useState<number>(Math.floor(Math.random() * 1000000));
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onGenerate({
        message: message.trim(),
        style,
        size,
        quality,
        model,
        seed,
      });
    }
  }, [message, style, size, quality, model, seed, isLoading, onGenerate]);

  const generateRandomSeed = useCallback(() => {
    setSeed(Math.floor(Math.random() * 1000000));
  }, []);

  const isFormValid = message.trim().length >= 3 && message.trim().length <= 500;

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-20 shadow-xl p-4 md:p-6 border border-navy/10 h-full flex flex-col min-h-0">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-navy/5 rounded-lg">
          <Wand2 className="w-5 h-5 text-navy" />
        </div>
        <div>
          <h3 className="text-xl font-black font-sniglet text-black uppercase tracking-tight">Create Magic</h3>
          <p className="text-[10px] text-navy/40 font-black font-varela uppercase tracking-widest">Describe your vision</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5 flex-grow flex flex-col min-h-0 overflow-hidden">
        <div className="space-y-2">
          <label htmlFor="message" className="block text-[11px] font-black font-varela text-navy uppercase tracking-widest">
            Prompt
          </label>
          <div className="relative">
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="A majestic dragon..."
              className="w-full px-4 py-3 border-2 border-navy/5 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue resize-none transition-all duration-300 text-sm font-bold font-varela text-slate-700 placeholder-slate-400 bg-white shadow-inner"
              rows={3}
              maxLength={500}
              required
            />
            <div className="absolute bottom-2 right-3 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-blue/40" />
              <span className="text-[10px] text-navy/30 font-black">{message.length}/500</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-[11px] font-black font-varela text-navy uppercase tracking-widest">Art Style</label>
          <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[160px] md:max-h-[180px] pr-1 custom-scrollbar">
            {STYLE_OPTIONS.map((option) => (
              <label key={option.value} className={`group flex flex-col items-center justify-center p-3 border-2 rounded-16 cursor-pointer transition-all duration-300 relative overflow-hidden ${
                style === option.value
                  ? 'border-blue bg-blue/5 shadow-md scale-105'
                  : 'border-navy/5 bg-white'
              }`}>
                <input
                  type="radio"
                  name="style"
                  value={option.value}
                  checked={style === option.value}
                  onChange={(e) => setStyle(e.target.value)}
                  className="sr-only"
                />
                <span className={`text-sm font-black font-sniglet text-center relative z-20 transition-opacity duration-300 ${style === option.value ? 'text-blue' : 'text-slate-600 group-hover:opacity-0'}`}>
                  {option.label}
                </span>
                <span className={`absolute inset-0 z-20 flex items-center justify-center text-sm font-black font-sniglet text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}>
                  <span className="bg-gradient-to-r from-[#00B4FF] via-[#48E5B6] to-[#006D88] bg-clip-text text-transparent">
                    {option.label}
                  </span>
                </span>
                <div className={`absolute inset-0 z-10 bg-white opacity-0 transition-opacity duration-800 rounded-16 ${style === option.value ? '' : 'group-hover:opacity-100'}`}></div>
                <div className={`absolute inset-0 z-10 border-2 border-transparent rounded-16 transition-all duration-500 ${style === option.value ? '' : 'group-hover:border-[#00B4FF] group-hover:animate-border-draw group-hover:shadow-[0_0_20px_rgba(0,180,255,0.4),0_0_40px_rgba(72,229,182,0.3),0_0_60px_rgba(0,109,136,0.2)]'}`}></div>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-[11px] font-black font-varela text-navy uppercase tracking-widest">Dimensions</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SIZE_OPTIONS.map((option) => (
              <label key={option.value} className={`group flex flex-col items-center justify-center p-3 border-2 rounded-16 cursor-pointer transition-all duration-300 relative overflow-hidden ${
                size === option.value
                  ? 'border-mint bg-mint/5 shadow-md scale-105'
                  : 'border-navy/5 bg-white'
              }`}>
                <input
                  type="radio"
                  name="size"
                  value={option.value}
                  checked={size === option.value}
                  onChange={(e) => setSize(e.target.value)}
                  className="sr-only"
                />
                <span className={`text-sm font-black font-sniglet text-center relative z-20 transition-opacity duration-300 ${size === option.value ? 'text-mint' : 'text-slate-600 group-hover:opacity-0'}`}>
                  {option.label}
                </span>
                <span className={`text-xs font-bold font-varela text-center relative z-20 transition-opacity duration-300 ${size === option.value ? 'text-navy/40' : 'text-slate-400 group-hover:opacity-0'}`}>
                  {option.description}
                </span>
                <span className="absolute inset-0 z-20 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <span className="text-sm font-black font-sniglet text-center bg-gradient-to-r from-[#00B4FF] via-[#48E5B6] to-[#006D88] bg-clip-text text-transparent">
                    {option.label}
                  </span>
                  <span className="text-xs font-bold font-varela text-center text-navy/40">
                    {option.description}
                  </span>
                </span>
                <div className={`absolute inset-0 z-10 bg-white opacity-0 transition-opacity duration-800 rounded-16 ${size === option.value ? '' : 'group-hover:opacity-100'}`}></div>
                <div className={`absolute inset-0 z-10 border-2 border-transparent rounded-16 transition-all duration-500 ${size === option.value ? '' : 'group-hover:border-[#48E5B6] group-hover:animate-border-draw group-hover:shadow-[0_0_20px_rgba(72,229,182,0.4),0_0_40px_rgba(0,180,255,0.3),0_0_60px_rgba(0,109,136,0.2)]'}`}></div>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 text-[10px] font-black font-varela text-navy/40 hover:text-navy transition-colors uppercase tracking-widest group"
          >
            <Settings className="w-3 h-3 group-hover:rotate-90 transition-transform duration-300" />
            <span>Advanced Settings</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t border-navy/5 animate-in slide-in-from-top duration-300 flex-shrink-0 overflow-y-auto max-h-[200px] md:max-h-[250px] pr-1 custom-scrollbar">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="block text-[9px] font-black font-varela text-navy/40 uppercase tracking-widest">Quality Level</label>
                 <select 
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="w-full text-[10px] font-bold font-varela bg-white border-2 border-navy/5 rounded-lg px-2 py-1 outline-none focus:border-blue"
                 >
                   {QUALITY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                 </select>
               </div>
               <div className="space-y-1">
                 <label className="block text-[9px] font-black font-varela text-navy/40 uppercase tracking-widest">AI Model</label>
                 <select 
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full text-[10px] font-bold font-varela bg-white border-2 border-navy/5 rounded-lg px-2 py-1 outline-none focus:border-blue"
                 >
                   {MODEL_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                 </select>
               </div>
            </div>
            <div className="space-y-1">
               <label htmlFor="seed" className="block text-[9px] font-black font-varela text-navy/40 uppercase tracking-widest">Seed Value</label>
               <div className="flex space-x-2">
                 <input
                    type="number"
                    id="seed"
                    value={seed}
                    onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
                    className="flex-1 px-3 py-1.5 border-2 border-navy/5 rounded-lg text-xs font-bold font-varela outline-none focus:border-blue"
                 />
                 <button
                    type="button"
                    onClick={generateRandomSeed}
                    className="p-1.5 bg-navy/5 text-navy rounded-lg hover:bg-navy/10 transition-colors"
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>
               </div>
            </div>
          </div>
        )}

        <div className="pt-2 mt-auto">
          {error && (
            <div className="p-3 mb-4 bg-red-50 border-2 border-red-100 rounded-xl">
              <p className="text-[10px] text-red-600 font-bold font-varela leading-tight">{error}</p>
            </div>
          )}

          <div className="relative group">
            <div 
              className="absolute inset-0 blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500 animate-pulse-glow"
              style={{
                background: 'radial-gradient(circle, #48E5B6 0%, #00B4FF 50%, #006D88 100%)',
              }}
            />
            
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="relative w-full text-white py-3 px-6 rounded-xl font-black font-sniglet text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 transition-all duration-300 shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #48E5B6 0%, #00B4FF 50%, #006D88 100%)',
              }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Splash It!</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default GenerationForm;