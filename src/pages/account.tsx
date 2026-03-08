import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/backendAuth';
import { Crown, Zap, Check, X, Star } from 'lucide-react';

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

const Account: React.FC = () => {
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
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #48E5B6 0%, #00B4FF 50%, #006D88 100%)',
        padding: '2rem',
      }}
    >
      {/* Header */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            <img
              src="/Gemini_Generated_Image_h7y6jnh7y6jnh7y6.webp"
              alt="SplashTool"
              style={{ width: '150px', height: 'auto' }}
            />
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Sign Out
          </button>
        </div>

        {/* User Info */}
        <div
          style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '20px',
            padding: '1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1F2937' }}>
              Welcome, {user?.username || 'User'}!
            </h2>
            <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>{user?.email}</p>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: `linear-gradient(135deg, ${currentTierData.color}20, ${currentTierData.color}40)`,
              borderRadius: '12px',
              border: `2px solid ${currentTierData.color}`,
            }}
          >
            <Crown size={20} style={{ color: currentTierData.color }} />
            <span style={{ fontWeight: 'bold', color: currentTierData.color, textTransform: 'uppercase' }}>
              {currentTierData.name}
            </span>
          </div>
        </div>

        {/* Current Plan Stats */}
        <div
          style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '20px',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1F2937' }}>
            Your Plan
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div style={{ textAlign: 'center', padding: '1rem', background: '#F9FAFB', borderRadius: '12px' }}>
              <Zap size={24} style={{ color: '#48E5B6', margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1F2937' }}>
                {currentTierData.dailyLimit}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>Daily Generations</p>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: '#F9FAFB', borderRadius: '12px' }}>
              <Star size={24} style={{ color: '#00B4FF', margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1F2937' }}>
                {currentTierData.models.length}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>Available Models</p>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: '#F9FAFB', borderRadius: '12px' }}>
              <Crown size={24} style={{ color: '#006D88', margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1F2937' }}>
                {currentTierData.price}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>{currentTierData.period}</p>
            </div>
          </div>
        </div>

        {/* Upgrade Plans */}
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'white', textAlign: 'center' }}>
          Upgrade Your Plan
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              style={{
                background: 'rgba(255,255,255,0.95)',
                borderRadius: '20px',
                padding: '1.5rem',
                position: 'relative',
                border: currentTier === tier.id ? `3px solid ${tier.color}` : '3px solid transparent',
                transform: tier.popular ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              {tier.popular && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: `linear-gradient(135deg, ${tier.color}, ${tier.color}dd)`,
                    color: 'white',
                    padding: '0.25rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                  }}
                >
                  MOST POPULAR
                </div>
              )}
              
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1F2937' }}>{tier.name}</h4>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.25rem' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 'bold', color: tier.color }}>{tier.price}</span>
                  <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>{tier.period}</span>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>
                  <strong style={{ color: '#1F2937' }}>{tier.dailyLimit}</strong> generations/day
                </p>
                <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                  <strong style={{ color: '#1F2937' }}>{tier.models.join(', ')}</strong> models
                </p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                {tier.features.map((feature, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <Check size={16} style={{ color: tier.color }} />
                    <span style={{ fontSize: '0.875rem', color: '#4B5563' }}>{feature}</span>
                  </div>
                ))}
              </div>

              {currentTier === tier.id ? (
                <button
                  disabled
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#E5E7EB',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#6B7280',
                    fontWeight: 'bold',
                    cursor: 'not-allowed',
                  }}
                >
                  Current Plan
                </button>
              ) : (
                <button
                  onClick={() => handleUpgrade(tier.id)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: `linear-gradient(135deg, ${tier.color}, ${tier.color}dd)`,
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  {TIERS.findIndex(t => t.id === currentTier) < TIERS.findIndex(t => t.id === tier.id) 
                    ? 'Upgrade' 
                    : 'Switch'}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', color: 'white/70', marginTop: '2rem', fontSize: '0.875rem' }}>
          Powered by AI Tool Pool
        </p>
      </div>
    </div>
  );
};

export default Account;
