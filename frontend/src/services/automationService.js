import { api } from '../config/api';

export const getRules = async (boardId) => {
    const response = await api.get(`/boards/${boardId}/automations`);
    return response.data;
};

export const createRule = async (boardId, ruleData) => {
    const response = await api.post(`/boards/${boardId}/automations`, ruleData);
    return response.data;
};

export const deleteRule = async (ruleId) => {
    await api.delete(`/automations/${ruleId}`);
};
