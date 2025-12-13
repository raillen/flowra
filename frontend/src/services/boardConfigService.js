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
 * Default field configuration - Essential fields only
 * Fixed fields (always available): title, description, priority, dueDate, tags, attachments, comments, assignees
 * Configurable fields: listed below
 */
export const defaultFieldConfig = {
    // Essential configurable fields
    startDate: { enabled: false, required: false },
    estimatedHours: { enabled: false, required: false },
    checklist: { enabled: false, required: false },
    type: { enabled: false, required: false, options: ['tarefa', 'bug', 'feature', 'melhoria', 'reuniao'] },
    externalUrl: { enabled: false, required: false },
    customFields: { enabled: false, definitions: [] },
};

/**
 * Field labels for display
 */
export const fieldLabels = {
    startDate: 'Data de Início',
    estimatedHours: 'Horas Estimadas',
    checklist: 'Lista de Tarefas',
    type: 'Tipo do Card',
    externalUrl: 'Link Externo',
    customFields: 'Campos Personalizados',
};

/**
 * Field descriptions for tooltips
 */
export const fieldDescriptions = {
    startDate: 'Define quando o trabalho deve começar',
    estimatedHours: 'Previsão de horas para conclusão',
    checklist: 'Lista de subtarefas com checkbox e barra de progresso',
    type: 'Categorização do card (tarefa, bug, feature...)',
    externalUrl: 'Link para recurso externo (Figma, Docs...)',
    customFields: 'Campos personalizados criados por você',
};

/**
 * Field icons (lucide-react icon names)
 */
export const fieldIcons = {
    startDate: 'Calendar',
    estimatedHours: 'Clock',
    checklist: 'CheckSquare',
    type: 'Tag',
    externalUrl: 'ExternalLink',
    customFields: 'Sliders',
};

/**
 * All configurable field IDs in display order
 */
export const configurableFields = [
    'startDate',
    'estimatedHours',
    'checklist',
    'type',
    'externalUrl',
    'customFields',
];
