import React, { useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { Button, BaseInput } from '../ui';
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Login card */}
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 animate-fade-in-up">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="h-12 w-12 bg-indigo-600 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Bem-vindo de volta</h1>
          <p className="text-gray-500 text-sm">Acesse sua conta para continuar gerenciando seus projetos.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error message */}
          {displayError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm animate-in fade-in">
              <AlertCircle size={18} />
              <span>{displayError}</span>
            </div>
          )}

          <div className="space-y-4">
            <BaseInput
              label="Email"
              icon={Mail}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              fullWidth
            />

            <div className="relative">
              <BaseInput
                label="Senha"
                icon={Lock}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                fullWidth
              // Injecting the toggle button manually since BaseInput might not support click action on right icon directly 
              // or checking BaseInput source in next step to be sure, but standardizing relative positioning works safe.
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-all" />
              <span className="text-gray-500 group-hover:text-gray-700">Lembrar de mim</span>
            </label>
            <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline">
              Esqueceu a senha?
            </a>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
            disabled={loading}
            icon={LogIn}
          >
            {loading ? 'Entrando...' : 'Entrar na Plataforma'}
          </Button>
        </form>

        {/* Create account link */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
          <p>
            Não tem uma conta?{' '}
            <button
              onClick={onCreateAccount}
              className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline transition-colors"
            >
              Criar conta
            </button>
          </p>
        </div>

        {/* Quick login hint */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full text-xs text-gray-500 border border-gray-100">
            <span className="text-xs">💡</span>
            <span>Teste: admin@flowra.com / admin123</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
