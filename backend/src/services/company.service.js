import { NotFoundError, ConflictError } from '../utils/errors.js';
import { companyRepository } from '../repositories/company.repository.js';
import { logger } from '../config/logger.js';

/**
 * Company service layer
 * Contains business logic for company operations
 * 
 * @module services/company
 */

/**
 * Creates a new company
 * @param {Object} companyData - Company data
 * @returns {Promise<Object>} Created company
 * @throws {ConflictError} If CNPJ already exists
 */
export async function createCompany(companyData) {
  logger.debug({ companyData }, 'Creating company');
  
  // Clean CNPJ
  const cleanCnpj = companyData.cnpj.replace(/\D/g, '');
  
  // Check for duplicate CNPJ
  const existing = await companyRepository.findByCNPJ(cleanCnpj);
  if (existing) {
    throw new ConflictError('Company with this CNPJ already exists');
  }
  
  const company = await companyRepository.create({
    ...companyData,
    cnpj: cleanCnpj,
  });
  
  logger.info({ companyId: company.id }, 'Company created successfully');
  return company;
}

/**
 * Retrieves a company by ID
 * @param {string} companyId - Company ID
 * @returns {Promise<Object>} Company object
 * @throws {NotFoundError} If company not found
 */
export async function getCompanyById(companyId) {
  const company = await companyRepository.findById(companyId);
  
  if (!company) {
    throw new NotFoundError('Company not found');
  }
  
  return company;
}

/**
 * Lists all companies with pagination
 * @param {Object} options - Query options
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @returns {Promise<Object>} Paginated companies list
 */
export async function listCompanies(options = {}) {
  const { page = 1, limit = 10 } = options;
  
  const [companies, total] = await Promise.all([
    companyRepository.findAll({ page, limit }),
    companyRepository.count(),
  ]);
  
  return {
    items: companies,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Updates an existing company
 * @param {string} companyId - Company ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated company
 * @throws {NotFoundError} If company not found
 * @throws {ConflictError} If new CNPJ already exists
 */
export async function updateCompany(companyId, updateData) {
  // Verify company exists
  await getCompanyById(companyId);
  
  // If CNPJ is being updated, check for conflicts
  if (updateData.cnpj) {
    const cleanCnpj = updateData.cnpj.replace(/\D/g, '');
    const existing = await companyRepository.findByCNPJ(cleanCnpj);
    if (existing && existing.id !== companyId) {
      throw new ConflictError('CNPJ already registered to another company');
    }
  }
  
  const updated = await companyRepository.update(companyId, updateData);
  
  logger.info({ companyId }, 'Company updated successfully');
  return updated;
}

/**
 * Deletes a company
 * @param {string} companyId - Company ID
 * @returns {Promise<void>}
 * @throws {NotFoundError} If company not found
 */
export async function deleteCompany(companyId) {
  // Verify company exists
  await getCompanyById(companyId);
  
  await companyRepository.delete(companyId);
  
  logger.info({ companyId }, 'Company deleted successfully');
}

