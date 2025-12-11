import * as groupService from '../services/group.service.js';
import { successResponse } from '../utils/responses.js';

/**
 * Group controller
 * Handles HTTP requests and responses for group endpoints
 * 
 * @module controllers/group
 */

/**
 * Creates a new group
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with created group
 */
export async function createGroup(request, reply) {
  const groupData = request.body;
  
  const group = await groupService.createGroup(groupData);
  
  return reply
    .code(201)
    .send(successResponse(group, 'Group created successfully', 201));
}

/**
 * Retrieves a group by ID
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with group data
 */
export async function getGroup(request, reply) {
  const { id } = request.params;
  
  const group = await groupService.getGroupById(id);
  
  return reply.send(successResponse(group));
}

/**
 * Lists all groups
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with groups list
 */
export async function listGroups(request, reply) {
  const groups = await groupService.listGroups();
  
  return reply.send(successResponse(groups));
}

/**
 * Updates an existing group
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with updated group
 */
export async function updateGroup(request, reply) {
  const { id } = request.params;
  const updateData = request.body;
  
  const group = await groupService.updateGroup(id, updateData);
  
  return reply.send(successResponse(group, 'Group updated successfully'));
}

/**
 * Deletes a group
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Success response
 */
export async function deleteGroup(request, reply) {
  const { id } = request.params;
  
  await groupService.deleteGroup(id);
  
  return reply
    .code(204)
    .send();
}

