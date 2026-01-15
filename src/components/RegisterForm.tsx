import React, { useState, useCallback } from 'react';
import { useAuth, type RegisterData } from '../lib/backendAuth';

interface RegisterFormProps {
  onToggleMode: () => void;
  onSuccess: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleMode, onSuccess }) => {
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    username: '',
    firstName: '',
    lastName: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (formData.password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      setIsLoading(true);

      try {
        await register(formData);
        onSuccess();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Registration failed');
      } finally {
        setIsLoading(false);
      }
    },
    [formData, confirmPassword, register, onSuccess],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-navy mb-1 font-varela">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 rounded-16 border border-gray-300 focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none transition-all font-varela"
          placeholder="your@email.com"
        />
      </div>

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-navy mb-1 font-varela">
          Username (optional)
        </label>
        <input
          id="username"
          name="username"
          type="text"
          value={formData.username}
          onChange={handleChange}
          minLength={3}
          className="w-full px-4 py-2 rounded-16 border border-gray-300 focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none transition-all font-varela"
          placeholder="username"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-navy mb-1 font-varela">
            First Name (optional)
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-16 border border-gray-300 focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none transition-all font-varela"
            placeholder="John"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-navy mb-1 font-varela">
            Last Name (optional)
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-16 border border-gray-300 focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none transition-all font-varela"
            placeholder="Doe"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-navy mb-1 font-varela">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={8}
          className="w-full px-4 py-2 rounded-16 border border-gray-300 focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none transition-all font-varela"
          placeholder="•••••••••"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-navy mb-1 font-varela">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
        {isLoading ? 'Creating account...' : 'Sign Up'}
      </button>

      <p className="text-center text-sm text-navy/70 font-varela">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onToggleMode}
          className="text-blue font-bold hover:underline"
        >
          Sign In
        </button>
      </p>
    </form>
  );
};

export default RegisterForm;
