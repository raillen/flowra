import React, { useState } from 'react';
import { Button, Toast } from '../ui';
import { UserPlus, Mail, Lock, User, AlertCircle, ArrowLeft } from 'lucide-react';
import { register } from '../../services/authService';

/**
 * Register component
 * Handles user registration
 * 
 * @module components/auth/Register
 */
const Register = ({ onBackToLogin, onRegisterSuccess }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [toast, setToast] = useState({ isOpen: false, message: '', type: 'info' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            setError('Por favor, preencha todos os campos');
            return;
        }

        if (name.length < 3) {
            setError('O nome deve ter pelo menos 3 caracteres');
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        setLoading(true);

        try {
            const result = await register({ name, email, password });
            setToast({
                isOpen: true,
                message: 'Conta criada com sucesso!',
                type: 'success'
            });

            // Call success callback with user and token
            if (onRegisterSuccess) {
                onRegisterSuccess(result);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Erro ao criar conta';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Criar Conta</h1>
                    <p className="text-slate-500">Cadastre-se no KBSys</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                            <AlertCircle size={18} />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Nome
                        </label>
                        <div className="relative">
                            <User
                                size={18}
                                className="absolute left-3 top-3 text-slate-400"
                            />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                placeholder="Seu nome completo"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <Mail
                                size={18}
                                className="absolute left-3 top-3 text-slate-400"
                            />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                placeholder="seu@email.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Senha
                        </label>
                        <div className="relative">
                            <Lock
                                size={18}
                                className="absolute left-3 top-3 text-slate-400"
                            />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Mínimo de 6 caracteres</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Confirmar Senha
                        </label>
                        <div className="relative">
                            <Lock
                                size={18}
                                className="absolute left-3 top-3 text-slate-400"
                            />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                        icon={UserPlus}
                    >
                        {loading ? 'Criando conta...' : 'Criar Conta'}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-500">
                    <p>
                        Já tem uma conta?{' '}
                        <button
                            onClick={onBackToLogin}
                            className="text-indigo-600 hover:underline font-medium inline-flex items-center gap-1"
                        >
                            <ArrowLeft size={14} />
                            Voltar para login
                        </button>
                    </p>
                </div>
            </div>

            <Toast
                isOpen={toast.isOpen}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, isOpen: false })}
            />
        </div>
    );
};

export default Register;
