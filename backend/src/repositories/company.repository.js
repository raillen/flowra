import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';

/**
 * Company repository layer
 * Handles all database operations for companies
 * 
 * @module repositories/company
 */

/**
 * Creates a new company
 * @param {Object} data - Company data
 * @returns {Promise<Object>} Created company
 */
export async function create(data) {
  try {
    return await prisma.company.create({
      data: {
        name: data.name,
        legalName: data.legalName || null,
        cnpj: data.cnpj,
        city: data.city || null,
        state: data.state || null,
        segment: data.segment || null,
        contactName: data.contactName || null,
        contactEmail: data.contactEmail || null,
        contactPhone: data.contactPhone || null,
      },
    });
  } catch (error) {
    logger.error({ error, data }, 'Failed to create company');
    throw error;
  }
}

/**
 * Finds a company by ID
 * @param {string} id - Company ID
 * @returns {Promise<Object|null>} Company or null if not found
 */
export async function findById(id) {
  return prisma.company.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          projects: true,
          collaborators: true,
        },
      },
    },
  });
}

/**
 * Finds a company by CNPJ
 * @param {string} cnpj - CNPJ (with or without formatting)
 * @returns {Promise<Object|null>} Company or null if not found
 */
export async function findByCNPJ(cnpj) {
  const cleanCnpj = cnpj.replace(/\D/g, '');
  return prisma.company.findUnique({
    where: { cnpj: cleanCnpj },
  });
}

/**
 * Lists all companies with pagination
 * @param {Object} options - Pagination options
 * @returns {Promise<Array>} Array of companies
 */
export async function findAll(options = {}) {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;
  
  return prisma.company.findMany({
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          projects: true,
          collaborators: true,
        },
      },
    },
  });
}

/**
 * Counts all companies
 * @returns {Promise<number>} Total count
 */
export async function count() {
  return prisma.company.count();
}

/**
 * Updates a company
 * @param {string} id - Company ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Updated company
 */
export async function update(id, data) {
  const updateData = {};
  
  if (data.name !== undefined) updateData.name = data.name;
  if (data.legalName !== undefined) updateData.legalName = data.legalName;
  if (data.cnpj !== undefined) updateData.cnpj = data.cnpj.replace(/\D/g, '');
  if (data.city !== undefined) updateData.city = data.city;
  if (data.state !== undefined) updateData.state = data.state;
  if (data.segment !== undefined) updateData.segment = data.segment;
  if (data.contactName !== undefined) updateData.contactName = data.contactName;
  if (data.contactEmail !== undefined) updateData.contactEmail = data.contactEmail;
  if (data.contactPhone !== undefined) updateData.contactPhone = data.contactPhone;
  
  return prisma.company.update({
    where: { id },
    data: updateData,
  });
}

/**
 * Deletes a company
 * @param {string} id - Company ID
 * @returns {Promise<Object>} Deleted company
 */
export async function deleteCompany(id) {
  return prisma.company.delete({
    where: { id },
  });
}

export const companyRepository = {
  create,
  findById,
  findByCNPJ,
  findAll,
  count,
  update,
  delete: deleteCompany,
};

