import React, { useState } from 'react';
import { Button, Toast, BaseInput } from '../ui';
import { UserPlus, Mail, Lock, User, AlertCircle, ArrowLeft, Building2 } from 'lucide-react';
import { register } from '../../services/authService';

/**
 * Register component
 * Handles user registration
 * 
 * @module components/auth/Register
 */
const Register = ({ onBackToLogin, onRegisterSuccess }) => {
    const [name, setName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [toast, setToast] = useState({ isOpen: false, message: '', type: 'info' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!name || !email || !password || !confirmPassword || !companyName) {
            setError('Por favor, preencha todos os campos');
            return;
        }

        if (name.length < 3) {
            setError('O nome deve ter pelo menos 3 caracteres');
            return;
        }

        if (companyName.length < 3) {
            setError('O nome da empresa deve ter pelo menos 3 caracteres');
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
            const result = await register({ name, email, password, companyName });
            setToast({
                isOpen: true,
                message: 'Conta e empresa criadas com sucesso!',
                type: 'success'
            });

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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <div className="h-12 w-12 bg-indigo-600 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
                        <UserPlus className="text-white w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Criar Conta</h1>
                    <p className="text-gray-500 text-sm">Cadastre-se e comece a organizar seus projetos com sua equipe.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm animate-in fade-in slide-in-from-top-2">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        <BaseInput
                            label="Nome Completo"
                            icon={User}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Seu nome"
                            fullWidth
                        />

                        <BaseInput
                            label="Nome da Empresa"
                            icon={Building2} // Need to import Building2 if not already available, or use generic icon
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="Sua empresa"
                            fullWidth
                        />

                        <BaseInput
                            label="Email Corporativo"
                            icon={Mail}
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@empresa.com"
                            fullWidth
                        />

                        <BaseInput
                            label="Senha"
                            icon={Lock}
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            helperText="Mínimo de 6 caracteres"
                            fullWidth
                        />

                        <BaseInput
                            label="Confirmar Senha"
                            icon={Lock}
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            fullWidth
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
                        disabled={loading}
                    >
                        {loading ? 'Criando conta...' : 'Criar Conta Grátis'}
                    </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
                    <p>
                        Já possui uma conta?{' '}
                        <button
                            onClick={onBackToLogin}
                            className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline inline-flex items-center gap-1 transition-colors"
                        >
                            <ArrowLeft size={14} />
                            Fazer Login
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
