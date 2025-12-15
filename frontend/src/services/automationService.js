import { api } from '../config/api';

export const getRules = async (boardId) => {
    const response = await api.get(`/boards/${boardId}/automation/rules`);
    // API returns { success: true, data: [...] }
    return response.data?.data || [];
};

export const createRule = async (boardId, ruleData) => {
    const response = await api.post(`/boards/${boardId}/automation/rules`, ruleData);
    return response.data?.data;
};

export const deleteRule = async (ruleId) => {
    await api.delete(`/automation/rules/${ruleId}`);
};

export const updateRule = async (ruleId, ruleData) => {
    const response = await api.put(`/automation/rules/${ruleId}`, ruleData);
    return response.data?.data;
};
