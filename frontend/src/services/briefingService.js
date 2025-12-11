import api from '../config/api';

export const listTemplates = async (projectId) => {
    const response = await api.get('/briefing/templates', { params: { projectId } });
    return response.data;
};

export const getTemplateById = async (id) => {
    const response = await api.get(`/briefing/templates/${id}`);
    return response.data;
};

export const createTemplate = async (data) => {
    const response = await api.post('/briefing/templates', data);
    return response.data;
};

export const updateTemplate = async (id, data) => {
    const response = await api.put(`/briefing/templates/${id}`, data);
    return response.data;
};

// Public Access
export const getPublicTemplate = async (token) => {
    const response = await api.get(`/briefing/public/${token}`);
    return response.data;
};

export const submitPublicBriefing = async (token, data) => {
    // Assuming a public submit endpoint exists or using specific logic
    // The backend route for public submit wasn't explicitly created in step 2907 (briefing.routes.js).
    // I only made `router.get('/public/:token'...)`.
    // I need to ADD a public POST endpoint to backend as well!
    const response = await api.post(`/briefing/public/${token}/submit`, { data });
    return response.data;
};

export const submitBriefing = async (cardId, data) => {
    const response = await api.post(`/briefing/cards/${cardId}/submit`, { data });
    return response.data;
};

export const getBriefingHistory = async (cardId) => {
    const response = await api.get(`/briefing/cards/${cardId}/history`);
    return response.data;
};

export const listSubmissions = async (templateId) => {
    const response = await api.get('/briefing/submissions', { params: { templateId } });
    return response.data;
};

// Destination Helpers (reusing existing project/board endpoints)
export const listProjects = async () => {
    const response = await api.get('/projects');
    return response.data;
};

export const listBoards = async (projectId) => {
    const response = await api.get(`/projects/${projectId}/boards`);
    return response.data;
};

export const listColumns = async (boardId) => {
    const response = await api.get(`/boards/${boardId}/columns`);
    return response.data;
};
