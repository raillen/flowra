import React, { useState, useEffect } from 'react';
import { Modal, Button } from '../../ui';
import { useApp } from '../../../contexts/AppContext';

/**
 * Project creation/edition modal component
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal visibility
 * @param {Function} props.onClose - Close handler
 * @param {Object|null} props.project - Project to edit (null for new project)
 * @param {Function} props.onSuccess - Optional callback called after successful creation/update
 */
const ProjectModal = ({ isOpen, onClose, project = null, onSuccess }) => {
  const { companies, groups, addProject, updateProject } = useApp();
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectCompany, setProjectCompany] = useState('');
  const [projectGroup, setProjectGroup] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens/closes or project changes
  useEffect(() => {
    if (isOpen) {
      if (project) {
        // Edit mode
        setProjectName(project.name || '');
        setProjectDescription(project.description || '');
        setProjectCompany(project.companyId || '');
        setProjectGroup(project.groupId || '');
      } else {
        // Create mode
        setProjectName('');
        setProjectDescription('');
        setProjectCompany('');
        setProjectGroup('');
      }
      setError('');
    }
  }, [isOpen, project]);

  const handleSaveProject = async () => {
    if (!projectName.trim()) {
      setError('Nome do projeto é obrigatório');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const projectData = {
        name: projectName.trim(),
        description: projectDescription.trim() || null,
        companyId: projectCompany || null,
        groupId: projectGroup || null,
      };

      if (project) {
        // Update existing project
        await updateProject(project.id, projectData);
      } else {
        // Create new project
        await addProject(projectData);
      }

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (err) {
      setError(err.response?.data?.message || `Erro ao ${project ? 'atualizar' : 'criar'} projeto`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={project ? 'Editar Projeto' : 'Novo Projeto'}>
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nome do Projeto *
          </label>
          <input
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            placeholder="Nome do Projeto"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Descrição
          </label>
          <textarea
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
            placeholder="Descrição do projeto..."
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Empresa
            </label>
            <select
              className="w-full p-2 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              value={projectCompany}
              onChange={(e) => setProjectCompany(e.target.value)}
            >
              <option value="">Selecione...</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Grupo
            </label>
            <select
              className="w-full p-2 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              value={projectGroup}
              onChange={(e) => setProjectGroup(e.target.value)}
            >
              <option value="">Selecione...</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button
          onClick={handleSaveProject}
          className="w-full"
          disabled={!projectName.trim() || loading}
        >
          {loading ? (project ? 'Salvando...' : 'Criando...') : (project ? 'Salvar Alterações' : 'Criar Projeto')}
        </Button>
      </div>
    </Modal>
  );
};

export default ProjectModal;

