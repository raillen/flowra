import * as companyService from '../services/company.service.js';
import { successResponse, paginatedResponse } from '../utils/responses.js';

/**
 * Company controller
 * Handles HTTP requests and responses for company endpoints
 * 
 * @module controllers/company
 */

/**
 * Creates a new company
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with created company
 */
export async function createCompany(request, reply) {
  const companyData = request.body;
  
  const company = await companyService.createCompany(companyData);
  
  return reply
    .code(201)
    .send(successResponse(company, 'Company created successfully', 201));
}

/**
 * Retrieves a company by ID
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with company data
 */
export async function getCompany(request, reply) {
  const { id } = request.params;
  
  const company = await companyService.getCompanyById(id);
  
  return reply.send(successResponse(company));
}

/**
 * Lists all companies
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Paginated response with companies
 */
export async function listCompanies(request, reply) {
  const { page = 1, limit = 10 } = request.query;
  
  const result = await companyService.listCompanies({ page, limit });
  
  return reply.send(
    paginatedResponse(
      result.items,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total
    )
  );
}

/**
 * Updates an existing company
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with updated company
 */
export async function updateCompany(request, reply) {
  const { id } = request.params;
  const updateData = request.body;
  
  const company = await companyService.updateCompany(id, updateData);
  
  return reply.send(successResponse(company, 'Company updated successfully'));
}

/**
 * Deletes a company
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Success response
 */
export async function deleteCompany(request, reply) {
  const { id } = request.params;
  
  await companyService.deleteCompany(id);
  
  return reply
    .code(204)
    .send();
}

