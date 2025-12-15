
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button, Toast } from '../components/ui';
import { Camera, User, BarChart, CheckCircle, Clock, Layout, Save, Lock, X, Edit2 } from 'lucide-react';
import ImageEditor from '../components/common/ImageEditor';
import StatCard from '../components/common/StatCard';
import ThemeToggle from '../components/common/ThemeToggle';
import api from '../config/api';
import { updateProfile as updateAuthProfile } from '../services/authService';
import { toast } from 'sonner';

const ProfilePage = () => {
    const { user, login } = useAuth(); // login used to update context
    const [profile, setProfile] = useState({ name: '', bio: '', avatar: '' });
    const [stats, setStats] = useState({
        tasksCompleted: 0,
        tasksPending: 0,
        tasksInProgress: 0,
        projectsCount: 0,
        boardsCount: 0
    });

    // Password State
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showEditor, setShowEditor] = useState(false);
    const [tempImage, setTempImage] = useState(null);

    useEffect(() => {
        // console.log('ProfilePage: Component Mounted (Corrected URL)');
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            const [profileRes, statsRes] = await Promise.all([
                api.get('/profile'),
                api.get('/profile/stats')
            ]);
            setProfile(profileRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Failed to load profile:', error);
            toast.error('Erro ao carregar perfil.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setTempImage(reader.result);
                setShowEditor(true);
            });
            reader.readAsDataURL(file);
        }
    };

    const handleSaveAvatar = async (croppedImage) => {
        try {
            // Optimistic update
            setProfile(prev => ({ ...prev, avatar: croppedImage }));
            setShowEditor(false);

            await api.put('/profile/avatar', { avatar: croppedImage });

            // Update global context if possible, or just re-fetch
            // Assuming useAuth context update happens on re-login
            toast.success('Avatar atualizado!');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao salvar avatar.');
        }
    };

    const handleSaveProfile = async () => {
        try {
            setSaving(true);
            const res = await api.put('/profile', {
                name: profile.name,
                bio: profile.bio
            });
            setProfile(prev => ({ ...prev, ...res.data }));
            toast.success('Perfil atualizado com sucesso!');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao salvar perfil.');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('As senhas não coincidem');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('A nova senha deve ter pelo menos 6 caracteres');
            return;
        }

        try {
            setSaving(true);
            await updateAuthProfile({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            toast.success('Senha alterada com sucesso!');
            setShowPasswordForm(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Erro ao alterar senha';
            toast.error(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8 pb-20">
            {/* Header Section */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden transition-all hover:shadow-md">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-10"></div>

                {/* Avatar */}
                <div className="relative group z-10">
                    <div className="w-32 h-32 rounded-full ring-4 ring-white shadow-lg overflow-hidden bg-white">
                        {profile.avatar ? (
                            <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                                <User size={48} />
                            </div>
                        )}
                    </div>
                    <label className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-colors transform hover:scale-110">
                        <Camera size={18} />
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left z-10">
                    <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                    <p className="text-gray-500 mt-1">{user?.email}</p>
                    <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium uppercase tracking-wide">
                            {profile.role || 'Membro'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Tarefas Concluídas"
                    value={stats.tasksCompleted}
                    icon={CheckCircle}
                    color="green"
                    subtext="Total geral"
                />
                <StatCard
                    label="Em Progresso"
                    value={stats.tasksInProgress}
                    icon={Clock}
                    color="blue"
                    subtext="Ativas agora"
                />
                <StatCard
                    label="Pendentes"
                    value={stats.tasksPending}
                    icon={Layout}
                    color="amber"
                    subtext="A fazer"
                />
                <StatCard
                    label="Total de Participações"
                    value={stats.projectsCount + stats.boardsCount}
                    icon={BarChart}
                    color="purple"
                    subtext="Projetos e Quadros"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Form */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <User size={20} className="text-blue-500" /> Informações Pessoais
                        </h2>
                        <Button onClick={handleSaveProfile} disabled={saving}>
                            <Save size={18} className="mr-2" />
                            {saving ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Nome Completo</label>
                            <input
                                type="text"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                value={user?.email}
                                disabled
                                className="w-full p-2.5 border border-gray-100 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                        </div>
                        <div className="col-span-full space-y-2">
                            <label className="text-sm font-medium text-gray-700">Bio / Sobre</label>
                            <textarea
                                value={profile.bio || ''}
                                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                rows={4}
                                placeholder="Conte um pouco sobre você..."
                                className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                            />
                            <p className="text-xs text-gray-400 text-right">Breve descrição visível no perfil.</p>
                        </div>
                    </div>
                </div>

                {/* Appearance Section */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 h-fit mb-6">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
                        <User size={20} className="text-indigo-500" />
                        Aparência
                    </h3>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Modo Escuro</span>
                        <ThemeToggle />
                    </div>
                </div>

                {/* Security Section */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 h-fit">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Lock size={20} className="text-rose-500" />
                        Segurança
                    </h3>

                    {showPasswordForm ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                    Senha Atual
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                    Nova Senha
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                    Confirmar Senha
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="flex flex-col gap-2 pt-2">
                                <Button
                                    onClick={handleChangePassword}
                                    disabled={saving || !passwordData.currentPassword || !passwordData.newPassword}
                                    className="w-full justify-center bg-rose-600 hover:bg-rose-700 text-white"
                                >
                                    {saving ? 'Alterando...' : 'Confirmar Alteração'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowPasswordForm(false);
                                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                    }}
                                    className="w-full justify-center"
                                    disabled={saving}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Lock size={24} />
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                Mantenha sua conta segura alterando sua senha periodicamente.
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => setShowPasswordForm(true)}
                                className="w-full justify-center border-rose-200 text-rose-700 hover:bg-rose-50"
                            >
                                Alterar Senha
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Image Editor Modal */}
            {showEditor && tempImage && (
                <ImageEditor
                    image={tempImage}
                    onSave={handleSaveAvatar}
                    onCancel={() => setShowEditor(false)}
                />
            )}
        </div>
    );
};

export default ProfilePage;
