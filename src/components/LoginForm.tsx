import React, { useState, useCallback } from 'react';
import { useAuth } from '../lib/backendAuth';

interface LoginFormProps {
  onToggleMode: () => void;
  onSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setIsLoading(true);

      try {
        await login(email, password);
        onSuccess();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Login failed');
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, login, onSuccess],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-navy mb-1 font-varela">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 rounded-16 border border-gray-300 focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none transition-all font-varela"
          placeholder="your@email.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-navy mb-1 font-varela">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full px-4 py-2 rounded-16 border border-gray-300 focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none transition-all font-varela"
          placeholder="•••••••••"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-16 text-sm font-varela">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-mint to-blue text-white font-bold py-3 rounded-20 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-sniglet text-lg shadow-lg"
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>

      <p className="text-center text-sm text-navy/70 font-varela">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onToggleMode}
          className="text-blue font-bold hover:underline"
        >
          Sign Up
        </button>
      </p>
    </form>
  );
};

export default LoginForm;
