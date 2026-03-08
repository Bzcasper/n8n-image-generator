import React, { useState, useCallback, useMemo } from 'react';
import { Wand2, Shuffle, Settings, ChevronDown, Sparkles, Diamond, Loader2, WandSparkles } from 'lucide-react';
import { GenerationParams, StyleOption, QualityOption } from '../types';
import { MODELS } from '../lib/models';

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
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

  const modelOptions = useMemo(() => {
    return MODELS.map(m => ({
      value: m.id,
      label: m.name,
      description: m.description,
      isPaidOnly: m.isPaidOnly,
      cost: m.cost
    }));
  }, []);

  const selectedModel = useMemo(() => {
    return MODELS.find(m => m.id === model) || MODELS[0];
  }, [model]);

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

  const generateRandomPrompt = useCallback(async () => {
    setIsGeneratingPrompt(true);
    try {
      const response = await fetch(`https://text.pollinations.ai/Give%20me%20a%20random%20short%20creative%20AI%20image%20prompt?model=openai&seed=${Math.floor(Math.random() * 1000000)}&nologo=true`);
      
      if (!response.ok) throw new Error('Failed to fetch prompt');
      
      const generatedPrompt = await response.text();
      
      if (!generatedPrompt || generatedPrompt.includes('IMPORTANT NOTICE') || generatedPrompt.length < 10) {
        const fallbacks = [
          'A neon cyberpunk city in the rain with flying cars',
          'A majestic white owl with glowing blue eyes in a dark forest',
          'A floating island with a waterfall pouring into the clouds',
          'An astronaut sitting on a park bench on Mars, Earth in the background',
          'A magical library with books flying around and golden light'
        ];
        setMessage(fallbacks[Math.floor(Math.random() * fallbacks.length)]);
        return;
      }

      const cleanPrompt = generatedPrompt.trim().replace(/^["']|["']$/g, '').slice(0, 500);
      setMessage(cleanPrompt);
    } catch (err) {
      console.error('Failed to generate random prompt:', err);
    } finally {
      setIsGeneratingPrompt(false);
    }
  }, []);

  const isFormValid = message.trim().length >= 3 && message.trim().length <= 500;

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-20 shadow-xl p-3 md:p-4 border border-navy/10 h-full flex flex-col min-h-0 overflow-hidden relative">
      <div className="flex items-center space-x-3 mb-3 flex-shrink-0">
        <div className="p-2 bg-navy/5 rounded-lg">
          <Wand2 className="w-5 h-5 text-navy" />
        </div>
        <div>
          <h3 className="text-xl font-black font-sniglet text-black uppercase tracking-tight">Create Magic</h3>
          <p className="text-[10px] text-navy/40 font-black font-varela uppercase tracking-widest">Describe your vision</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-grow flex flex-col min-h-0 overflow-hidden">
        {/* Scrollable Form Body */}
        <div className="flex-grow overflow-y-auto pr-1 space-y-4 custom-scrollbar pb-24 lg:pb-0">
          <div className="space-y-1">
            <label htmlFor="message" className="block text-[11px] font-black font-varela text-navy uppercase tracking-widest">
              Prompt
            </label>
            <div className="relative">
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="A majestic dragon..."
                className="w-full px-4 py-2 border-2 border-navy/5 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue resize-none transition-all duration-300 text-sm font-bold font-varela text-slate-700 placeholder-slate-400 bg-white shadow-inner"
                rows={2}
                maxLength={500}
                required
              />
              <div className="absolute bottom-2 right-3 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={generateRandomPrompt}
                  disabled={isGeneratingPrompt}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-gradient-to-r from-[#48E5B6]/10 to-[#00B4FF]/10 hover:from-[#48E5B6]/20 hover:to-[#00B4FF]/20 rounded-lg transition-all disabled:opacity-50"
                  title="Generate random prompt"
                >
                  {isGeneratingPrompt ? (
                    <Loader2 className="w-4 h-4 text-blue animate-spin" />
                  ) : (
                    <WandSparkles className="w-4 h-4 text-blue" />
                  )}
                  <span className="text-[10px] font-black text-navy/60">Random</span>
                </button>
                <Sparkles className="w-3 h-3 text-blue/40" />
                <span className="text-[10px] text-navy/30 font-black">{message.length}/500</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-black font-varela text-navy uppercase tracking-widest">Art Style</label>
            <div className="grid grid-cols-2 gap-3">
              {STYLE_OPTIONS.map((option) => (
                <label key={option.value} className={`group flex flex-col items-center justify-center p-4 border-2 rounded-16 cursor-pointer transition-all duration-300 relative overflow-hidden ${
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
                  <div className={`absolute inset-0 z-10 border-2 border-transparent rounded-16 transition-all duration-500 ${style === option.value ? '' : 'group-hover:border-[#00B4FF] group-hover:animate-border-draw'}`}></div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-black font-varela text-navy uppercase tracking-widest">Dimensions</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SIZE_OPTIONS.map((option) => (
                <label key={option.value} className={`group flex flex-col items-center justify-center p-4 border-2 rounded-16 cursor-pointer transition-all duration-300 relative overflow-hidden ${
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
                  <span className={`text-xs font-black font-sniglet text-center relative z-20 transition-opacity duration-300 ${size === option.value ? 'text-mint' : 'text-slate-600 group-hover:opacity-0'}`}>
                    {option.label}
                  </span>
                  <div className={`absolute inset-0 z-10 bg-white opacity-0 transition-opacity duration-800 rounded-16 ${size === option.value ? '' : 'group-hover:opacity-100'}`}></div>
                  <div className={`absolute inset-0 z-10 border-2 border-transparent rounded-16 transition-all duration-500 ${size === option.value ? '' : 'group-hover:border-[#48E5B6] group-hover:animate-border-draw'}`}></div>
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
            <div className="space-y-4 pt-4 mt-2 border-t-2 border-navy/5 animate-in slide-in-from-top duration-300 bg-navy/[0.02] -mx-4 px-4 pb-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <label className="block text-[9px] font-black font-varela text-navy/40 uppercase tracking-widest">Quality Level</label>
                   <select 
                      value={quality}
                      onChange={(e) => setQuality(e.target.value)}
                      className="w-full text-[10px] font-bold font-varela bg-white border-2 border-navy/5 rounded-lg px-2 py-2 outline-none focus:border-blue"
                   >
                     {QUALITY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                   </select>
                 </div>
                 <div className="space-y-1">
                   <label className="block text-[9px] font-black font-varela text-navy/40 uppercase tracking-widest">AI Model</label>
                   <div className="relative">
                     <select 
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className={`w-full text-[10px] font-bold font-varela bg-white border-2 border-navy/5 rounded-lg pl-2 pr-8 py-2 outline-none focus:border-blue appearance-none transition-all ${
                          selectedModel?.isPaidOnly ? 'text-blue' : 'text-slate-700'
                        }`}
                     >
                       {modelOptions.map(opt => (
                         <option key={opt.value} value={opt.value}>
                           {opt.label} ({opt.cost} Pollen) {opt.isPaidOnly ? '💎' : ''}
                         </option>
                       ))}
                     </select>
                     <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                       {selectedModel?.isPaidOnly ? (
                         <Diamond className="w-3 h-3 text-blue" />
                       ) : (
                         <ChevronDown className="w-3 h-3 text-navy/30" />
                       )}
                     </div>
                   </div>
                 </div>
              </div>
              <div className="space-y-1">
                 <label htmlFor="seed" className="block text-[9px] font-black font-varela text-navy/40 uppercase tracking-widest">
                   Seed Value 
                   {selectedModel && (
                     <span className="ml-2 text-[8px] font-black text-blue/60 lowercase italic">
                       Cost: {selectedModel.cost} Pollen
                     </span>
                   )}
                 </label>
                 <div className="flex space-x-2">
                   <input
                      type="number"
                      id="seed"
                      value={seed}
                      onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 border-2 border-navy/5 rounded-lg text-xs font-bold font-varela outline-none focus:border-blue"
                   />
                   <button
                      type="button"
                      onClick={generateRandomSeed}
                      className="p-2.5 bg-navy/5 text-navy border-2 border-transparent rounded-lg hover:bg-navy/10 hover:border-navy/10 transition-all"
                    >
                      <Shuffle className="w-4 h-4" />
                    </button>
                 </div>
              </div>
            </div>
          )}

          {/* Error Message Display */}
          {error && (
            <div className="p-3 bg-red-50 border-2 border-red-100 rounded-xl animate-in fade-in zoom-in duration-300">
              <p className="text-[11px] text-red-600 font-bold font-varela leading-tight">{error}</p>
            </div>
          )}
        </div>
      </form>

      {/* Floating Action Button: Splash It! */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-[320px] md:max-w-md px-4 pointer-events-none">
        <div className="pointer-events-auto relative group">
          <div 
            className={`absolute -inset-2 blur-2xl opacity-40 group-hover:opacity-70 transition-all duration-700 animate-float ${
              isFormValid && !isLoading ? 'block' : 'hidden'
            }`}
            style={{
              background: 'radial-gradient(circle, #48E5B6 0%, #00B4FF 50%, #006D88 100%)',
            }}
          />
          <div 
            className={`absolute -inset-1 blur-xl opacity-60 animate-pulse-glow ${
              isLoading ? 'block' : 'hidden'
            }`}
            style={{
              background: 'linear-gradient(135deg, #48E5B6 0%, #00B4FF 50%, #006D88 100%)',
            }}
          />
          
          <button
            onClick={() => handleSubmit()}
            disabled={!isFormValid || isLoading}
            className="relative w-full text-white py-4 md:py-5 px-8 border-[3px] border-white/40 rounded-full font-black font-sniglet text-lg md:text-xl uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_20px_50px_rgba(0,109,136,0.5)] flex items-center justify-center space-x-3 overflow-hidden ring-4 ring-black/5"
            style={{
              background: 'linear-gradient(135deg, #48E5B6 0%, #00B4FF 50%, #006D88 100%)',
            }}
          >
            {isLoading ? (
              <>
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <WandSparkles className="w-6 h-6 animate-pulse" />
                <span>Splash It!</span>
                <Sparkles className="w-6 h-6" />
              </>
            )}
            
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerationForm;