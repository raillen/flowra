import { useState, useEffect } from 'react';
import {
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from '../services/companyService';

/**
 * Custom hook for managing companies
 * Provides company data and CRUD operations
 * 
 * @module hooks/useCompanies
 * @returns {Object} Companies state and operations
 */
export const useCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetches all companies
   */
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCompanies();
      setCompanies(Array.isArray(data) ? data : []);
    } catch (err) {
      // Ignore abort errors (component unmounted or request cancelled)
      if (err.name === 'AbortError' || err.name === 'CanceledError' || err.code === 'ECONNABORTED') {
        return;
      }
      setError(err.response?.data?.message || err.message || 'Failed to fetch companies');
      console.error('Error fetching companies:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Creates a new company
   * @param {Object} companyData - Company data
   * @returns {Promise<Object>} Created company
   */
  const addCompany = async (companyData) => {
    try {
      setError(null);
      const newCompany = await createCompany(companyData);
      setCompanies((prev) => [...prev, newCompany]);
      return newCompany;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create company';
      setError(errorMessage);
      throw err;
    }
  };

  /**
   * Updates an existing company
   * @param {string} companyId - Company ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated company
   */
  const updateCompanyById = async (companyId, updateData) => {
    try {
      setError(null);
      // updateCompany service already extracts response.data.data
      const updatedCompany = await updateCompany(companyId, updateData);
      setCompanies((prev) =>
        prev.map((c) => (c.id === companyId ? updatedCompany : c))
      );
      return updatedCompany;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update company';
      setError(errorMessage);
      throw err;
    }
  };

  /**
   * Deletes a company
   * @param {string} companyId - Company ID
   */
  const removeCompany = async (companyId) => {
    try {
      await deleteCompany(companyId);
      setCompanies((prev) => prev.filter((c) => c.id !== companyId));
    } catch (err) {
      setError(err.message || 'Failed to delete company');
      throw err;
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return {
    companies,
    loading,
    error,
    fetchCompanies,
    addCompany,
    updateCompany: updateCompanyById,
    deleteCompany: removeCompany,
  };
};

