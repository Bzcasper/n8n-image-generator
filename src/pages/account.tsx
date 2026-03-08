import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/backendAuth';
import { Crown, Zap, Check, Star } from 'lucide-react';

const TIERS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    dailyLimit: 'Unlimited',
    models: ['Flux'],
    features: ['Unlimited Flux generations', 'Basic styles', 'Standard quality'],
    color: '#6B7280',
    gradient: 'from-gray-400 to-gray-600',
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '$9',
    period: '/month',
    dailyLimit: '50',
    models: ['Flux', 'Z-Image'],
    features: ['50 generations/day', 'Premium styles', 'HD quality', 'Priority support'],
    color: '#48E5B6',
    gradient: 'from-green-400 to-emerald-600',
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    period: '/month',
    dailyLimit: '200',
    models: ['Flux', 'Z-Image', 'Klein'],
    features: ['200 generations/day', 'All styles', '4K quality', 'Early access', 'Priority support'],
    color: '#00B4FF',
    gradient: 'from-blue-400 to-indigo-600',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$99',
    period: '/month',
    dailyLimit: 'Unlimited',
    models: ['All models'],
    features: ['Unlimited everything', 'Custom API access', 'Dedicated support', 'White-label'],
    color: '#006D88',
    gradient: 'from-navy-500 to-navy-700',
  },
];

export function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentTier, setCurrentTier] = useState('free');

  useEffect(() => {
    const storedTier = localStorage.getItem('user_tier') || 'free';
    setCurrentTier(storedTier);
  }, []);

  const handleUpgrade = (tierId: string) => {
    localStorage.setItem('user_tier', tierId);
    setCurrentTier(tierId);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const currentTierData = TIERS.find(t => t.id === currentTier) || TIERS[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#48E5B6] via-[#00B4FF] to-[#006D88] p-4 md:p-8">
      {/* Header */}
      <div className="max-w-[1200px] mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
          <div className="cursor-pointer" onClick={() => navigate('/')}>
            <img
              src="/Gemini_Generated_Image_h7y6jnh7y6jnh7y6.webp"
              alt="SplashTool"
              className="w-32 md:w-40 h-auto"
            />
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold transition-all"
          >
            Sign Out
          </button>
        </div>

        {/* User Info */}
        <div className="bg-white/95 backdrop-blur-md rounded-20 p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-black text-gray-800 font-sniglet">
              Welcome, {user?.username || 'User'}!
            </h2>
            <p className="text-gray-500 font-varela">{user?.email}</p>
          </div>
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl border-2"
            style={{ 
              borderColor: currentTierData.color,
              background: `${currentTierData.color}15`
            }}
          >
            <Crown size={20} style={{ color: currentTierData.color }} />
            <span className="font-black uppercase tracking-wider" style={{ color: currentTierData.color }}>
              {currentTierData.name}
            </span>
          </div>
        </div>

        {/* Current Plan Stats */}
        <div className="bg-white/95 backdrop-blur-md rounded-20 p-6 mb-8">
          <h3 className="text-xl font-black mb-6 text-gray-800 font-sniglet uppercase tracking-tight">
            Your Usage
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
              <Zap size={24} className="text-[#48E5B6] mx-auto mb-2" />
              <p className="text-2xl font-black text-gray-800">{currentTierData.dailyLimit}</p>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Daily Generations</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
              <Star size={24} className="text-[#00B4FF] mx-auto mb-2" />
              <p className="text-2xl font-black text-gray-800">{currentTierData.models.length}</p>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Available Models</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
              <Crown size={24} className="text-[#006D88] mx-auto mb-2" />
              <p className="text-2xl font-black text-gray-800">{currentTierData.price}</p>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{currentTierData.period}</p>
            </div>
          </div>
        </div>

        {/* Upgrade Plans */}
        <h3 className="text-3xl font-black mb-8 text-white text-center font-sniglet drop-shadow-md">
          Upgrade Your Plan
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`bg-white/95 backdrop-blur-md rounded-20 p-6 relative transition-all duration-300 flex flex-col ${
                currentTier === tier.id ? 'scale-100 shadow-2xl' : 'hover:-translate-y-1 shadow-xl'
              }`}
              style={{ 
                border: currentTier === tier.id ? `3px solid ${tier.color}` : '1px solid rgba(0,0,0,0.05)'
              }}
            >
              {tier.popular && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${tier.color}, #006D88)` }}
                >
                  MOST POPULAR
                </div>
              )}
              
              <div className="text-center mb-6">
                <h4 className="text-xl font-black text-gray-800 font-sniglet uppercase">{tier.name}</h4>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-black" style={{ color: tier.color }}>{tier.price}</span>
                  <span className="text-gray-400 text-sm font-bold">{tier.period}</span>
                </div>
              </div>

              <div className="space-y-3 mb-8 flex-grow">
                {tier.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check size={16} className="mt-1 flex-shrink-0" style={{ color: tier.color }} />
                    <span className="text-sm font-bold text-gray-600 font-varela leading-tight">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => ! (currentTier === tier.id) && handleUpgrade(tier.id)}
                disabled={currentTier === tier.id}
                className={`w-full py-3 rounded-xl font-black uppercase tracking-widest transition-all ${
                  currentTier === tier.id
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'text-white shadow-lg hover:shadow-xl active:scale-95'
                }`}
                style={{
                  background: currentTier === tier.id ? '' : `linear-gradient(135deg, ${tier.color}, #006D88)`
                }}
              >
                {currentTier === tier.id ? 'Active Plan' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="text-center text-white/60 mt-12 font-black uppercase tracking-[0.2em] text-[10px]">
          Powered by AI Tool Pool
        </p>
      </div>
    </div>
  );
};

export default Account;
