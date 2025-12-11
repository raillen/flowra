import api from '../config/api';

/**
 * Board Configuration Service
 * Handles API calls for board field configuration
 * 
 * @module services/boardConfigService
 */

/**
 * Gets the field configuration for a board
 * @param {string} boardId - Board ID
 * @returns {Promise<Object>} Field configuration
 */
export const getBoardConfig = async (boardId) => {
    const response = await api.get(`/boards/${boardId}/config`);
    return response.data.data || response.data;
};

/**
 * Updates the field configuration for a board
 * @param {string} boardId - Board ID
 * @param {Object} fields - Field configuration object
 * @returns {Promise<Object>} Updated configuration
 */
export const updateBoardConfig = async (boardId, fields) => {
    const response = await api.put(`/boards/${boardId}/config`, { fields });
    return response.data.data || response.data;
};

/**
 * Gets the list of enabled fields for a board
 * @param {string} boardId - Board ID
 * @returns {Promise<string[]>} List of enabled field names
 */
export const getEnabledFields = async (boardId) => {
    const response = await api.get(`/boards/${boardId}/config/enabled`);
    const data = response.data.data || response.data;
    return data.enabledFields || [];
};

/**
 * Default field configuration (all fields disabled)
 * Used as fallback when no config exists
 */
export const defaultFieldConfig = {
    // Time and Progress fields
    startDate: { enabled: false, required: false },
    completedAt: { enabled: false, required: false },
    estimatedHours: { enabled: false, required: false },
    actualHours: { enabled: false, required: false },
    progress: { enabled: false, required: false },
    checklist: { enabled: false, required: false },

    // Collaboration fields
    assignees: { enabled: false, required: false },
    reporter: { enabled: false, required: false },
    reviewer: { enabled: false, required: false },
    watchers: { enabled: false, required: false },

    // Organization fields
    type: { enabled: false, required: false, options: ['tarefa', 'bug', 'feature', 'melhoria', 'reuniao'] },
    status: { enabled: false, required: false, options: ['novo', 'em_progresso', 'bloqueado', 'concluido'] },
    subtasks: { enabled: false, required: false },
    blockedBy: { enabled: false, required: false },
    relatedTo: { enabled: false, required: false },

    // Visual fields
    color: { enabled: false, required: false },
    icon: { enabled: false, required: false },
    cover: { enabled: false, required: false },

    // Business fields
    projectPhase: { enabled: false, required: false, options: ['discovery', 'design', 'development', 'testing', 'deployment'] },
    budget: { enabled: false, required: false },
    billable: { enabled: false, required: false },
    storyPoints: { enabled: false, required: false },
    externalUrl: { enabled: false, required: false },

    // Custom fields
    customFields: { enabled: false, definitions: [] },
};

/**
 * Field labels for display
 */
export const fieldLabels = {
    startDate: 'Data de Início',
    completedAt: 'Data de Conclusão',
    estimatedHours: 'Horas Estimadas',
    actualHours: 'Horas Trabalhadas',
    progress: 'Progresso',
    checklist: 'Lista de Tarefas',
    assignees: 'Múltiplos Responsáveis',
    reporter: 'Responsável pelo Reporte',
    reviewer: 'Revisor',
    watchers: 'Seguidores',
    type: 'Tipo do Card',
    status: 'Status',
    subtasks: 'Subtarefas',
    blockedBy: 'Bloqueado Por',
    relatedTo: 'Relacionado A',
    customFields: 'Campos Personalizados',
    color: 'Cor',
    icon: 'Ícone',
    cover: 'Imagem de Capa',
    projectPhase: 'Fase do Projeto',
    budget: 'Orçamento',
    billable: 'Faturável',
    storyPoints: 'Story Points',
    externalUrl: 'Link Externo',
    customFields: 'Campos Personalizados',
};

/**
 * Field categories for grouping in UI
 */
export const fieldCategories = {
    time: {
        label: 'Tempo e Progresso',
        fields: ['startDate', 'completedAt', 'estimatedHours', 'actualHours', 'progress', 'checklist'],
    },
    collaboration: {
        label: 'Colaboração',
        fields: ['assignees', 'reporter', 'reviewer', 'watchers'],
    },
    organization: {
        label: 'Organização',
        fields: ['type', 'status', 'subtasks', 'blockedBy', 'relatedTo'],
    },
    visual: {
        label: 'Visual',
        fields: ['color', 'icon', 'cover'],
    },
    business: {
        label: 'Negócios',
        fields: ['projectPhase', 'budget', 'billable', 'storyPoints', 'externalUrl'],
    },
    custom: {
        label: 'Personalizado',
        fields: ['customFields'],
    },
};
