import api from '../config/api';

export const getBoardSummary = async (boardId) => {
    const response = await api.get(`/analytics/board/${boardId}/summary`);
    return response.data;
};

export const getMemberWorkload = async (boardId) => {
    const response = await api.get(`/analytics/board/${boardId}/workload`);
    return response.data;
};

export const getStatusDistribution = async (boardId) => {
    const response = await api.get(`/analytics/board/${boardId}/status`);
    return response.data;
};

export const getBurndown = async (boardId) => {
    const response = await api.get(`/analytics/board/${boardId}/burndown`);
    return response.data;
};
