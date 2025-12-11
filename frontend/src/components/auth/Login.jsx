import React, { useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { Button } from '../ui';
import { LogIn, Mail, Lock, AlertCircle, Eye, EyeOff, Sparkles } from 'lucide-react';

/**
 * Login component
 * Modern authentication page with glass-morphism design
 * 
 * @module components/auth/Login
 */
const Login = ({ onCreateAccount }) => {
  const { login, loading, error } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Por favor, preencha todos os campos');
      return;
    }

    try {
      await login(email, password);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erro ao fazer login';
      setLocalError(errorMessage);
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-500 to-indigo-700">
        {/* Floating shapes */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-indigo-300/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Login card */}
      <div className="relative w-full max-w-md animate-fade-in-up">
        {/* Glass card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg shadow-primary-500/30 mb-4 animate-bounce-in">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-secondary-800 mb-2">KBSys</h1>
            <p className="text-secondary-500">Sistema de Gestão de Projetos</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error message */}
            {displayError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-fade-in">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                  <AlertCircle size={16} />
                </div>
                <span className="text-sm">{displayError}</span>
              </div>
            )}

            {/* Email field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-secondary-700">
                Email
              </label>
              <div className={`relative transition-all duration-200 ${focusedField === 'email' ? 'scale-[1.02]' : ''}`}>
                <Mail
                  size={18}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'email' ? 'text-primary-500' : 'text-secondary-400'
                    }`}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl bg-white transition-all outline-none ${focusedField === 'email'
                      ? 'border-primary-500 ring-4 ring-primary-500/10'
                      : 'border-secondary-200 hover:border-secondary-300'
                    }`}
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-secondary-700">
                Senha
              </label>
              <div className={`relative transition-all duration-200 ${focusedField === 'password' ? 'scale-[1.02]' : ''}`}>
                <Lock
                  size={18}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'password' ? 'text-primary-500' : 'text-secondary-400'
                    }`}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-xl bg-white transition-all outline-none ${focusedField === 'password'
                      ? 'border-primary-500 ring-4 ring-primary-500/10'
                      : 'border-secondary-200 hover:border-secondary-300'
                    }`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${loading
                  ? 'bg-primary-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 active:translate-y-0'
                }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Entrar
                </>
              )}
            </button>
          </form>

          {/* Create account link */}
          <div className="mt-8 pt-6 border-t border-secondary-100 text-center">
            <p className="text-sm text-secondary-500">
              Não tem uma conta?{' '}
              <button
                onClick={onCreateAccount}
                className="text-primary-600 hover:text-primary-700 font-semibold hover:underline transition-colors"
              >
                Criar conta
              </button>
            </p>
          </div>
        </div>

        {/* Quick login hint */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white/90">
            <span>💡</span>
            <span>Teste: admin@kbsys.com / admin123</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
