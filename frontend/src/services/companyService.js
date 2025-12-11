import api from '../config/api';

/**
 * Company service for API communication
 * Handles all company-related API calls
 * 
 * @module services/companyService
 */

/**
 * Fetches all companies
 * @returns {Promise<Array>} Companies list
 */
export const getCompanies = async (params = {}) => {
  const response = await api.get('/companies', { params });
  // Backend retorna { success, data: { items, pagination } }
  const data = response.data.data || response.data;
  return Array.isArray(data) ? data : (data.items || []);
};

/**
 * Fetches a single company by ID
 * @param {string} companyId - Company ID
 * @returns {Promise<Object>} Company data
 */
export const getCompanyById = async (companyId) => {
  const response = await api.get(`/companies/${companyId}`);
  return response.data.data || response.data;
};

/**
 * Creates a new company
 * @param {Object} companyData - Company data
 * @returns {Promise<Object>} Created company
 */
export const createCompany = async (companyData) => {
  const response = await api.post('/companies', companyData);
  return response.data.data || response.data;
};

/**
 * Updates an existing company
 * @param {string} companyId - Company ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated company
 */
export const updateCompany = async (companyId, updateData) => {
  const response = await api.put(`/companies/${companyId}`, updateData);
  return response.data.data || response.data;
};

/**
 * Deletes a company
 * @param {string} companyId - Company ID
 * @returns {Promise<void>}
 */
export const deleteCompany = async (companyId) => {
  await api.delete(`/companies/${companyId}`);
};

/**
 * Fetches company data from BrasilAPI by CNPJ
 * @param {string} cnpj - CNPJ number (with or without formatting)
 * @returns {Promise<Object>} Company data from BrasilAPI
 */
export const fetchCompanyByCNPJ = async (cnpj) => {
  const cleanCnpj = cnpj.replace(/\D/g, '');
  const response = await fetch(
    `https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`
  );
  if (!response.ok) {
    throw new Error('CNPJ não encontrado ou erro na busca');
  }
  return response.json();
};

