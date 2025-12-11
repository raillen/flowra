import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { Button, Toast } from '../ui';
import { User, Mail, Lock, Save, Edit2, X } from 'lucide-react';
import { updateProfile } from '../../services/authService';

/**
 * User profile view component
 * Displays and allows editing of user profile
 * 
 * @module components/modules/UserProfileView
 */
const UserProfileView = () => {
  const { user, setUser } = useAuthContext();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'info' });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const updateData = {};

      // Only include changed fields
      if (formData.name !== user.name) {
        updateData.name = formData.name;
      }
      if (formData.email !== user.email) {
        updateData.email = formData.email;
      }

      if (Object.keys(updateData).length === 0) {
        setToast({ isOpen: true, message: 'Nenhuma alteração detectada', type: 'info' });
        setEditMode(false);
        setLoading(false);
        return;
      }

      const updatedUser = await updateProfile(updateData);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setToast({ isOpen: true, message: 'Perfil atualizado com sucesso!', type: 'success' });
      setEditMode(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erro ao atualizar perfil';
      setToast({ isOpen: true, message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setToast({ isOpen: true, message: 'As senhas não coincidem', type: 'error' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setToast({ isOpen: true, message: 'A nova senha deve ter pelo menos 6 caracteres', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setToast({ isOpen: true, message: 'Senha alterada com sucesso!', type: 'success' });
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erro ao alterar senha';
      setToast({ isOpen: true, message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
    });
    setEditMode(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 animate-in fade-in duration-300">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Meu Perfil</h1>
      </div>

      {/* Profile Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-3xl font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{user?.name || 'Usuário'}</h2>
            <p className="text-slate-500 capitalize">{user?.role || 'User'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
              <User size={12} className="inline mr-1" />
              Nome
            </label>
            <input
              disabled={!editMode}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full p-3 border rounded-lg transition-colors ${editMode
                  ? 'bg-white border-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none'
                  : 'bg-slate-50 border-slate-200'
                }`}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
              <Mail size={12} className="inline mr-1" />
              Email
            </label>
            <input
              disabled={!editMode}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full p-3 border rounded-lg transition-colors ${editMode
                  ? 'bg-white border-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none'
                  : 'bg-slate-50 border-slate-200'
                }`}
            />
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          {editMode ? (
            <>
              <Button
                variant="primary"
                onClick={handleSaveProfile}
                disabled={loading}
                icon={Save}
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button
                variant="secondary"
                onClick={handleCancelEdit}
                disabled={loading}
                icon={X}
              >
                Cancelar
              </Button>
            </>
          ) : (
            <Button
              variant="secondary"
              onClick={() => setEditMode(true)}
              icon={Edit2}
            >
              Editar Perfil
            </Button>
          )}
        </div>
      </div>

      {/* Password Change Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Lock size={20} />
          Segurança
        </h3>

        {showPasswordForm ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                Senha Atual
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="••••••••"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Nova Senha
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={handleChangePassword}
                disabled={loading || !passwordData.currentPassword || !passwordData.newPassword}
              >
                {loading ? 'Alterando...' : 'Alterar Senha'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="secondary"
            onClick={() => setShowPasswordForm(true)}
            icon={Lock}
          >
            Alterar Senha
          </Button>
        )}
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

export default UserProfileView;
