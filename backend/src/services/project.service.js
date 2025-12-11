import { NotFoundError, ConflictError } from '../utils/errors.js';
import { projectRepository } from '../repositories/project.repository.js';
import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';

/**
 * Project service layer
 * Contains business logic for project operations
 * 
 * @module services/project
 */

/**
 * Creates a new project
 * @param {Object} projectData - Project data
 * @param {string} projectData.name - Project name
 * @param {string} projectData.companyId - Associated company ID
 * @param {string} projectData.groupId - Associated group ID
 * @param {string} userId - User ID creating the project
 * @returns {Promise<Object>} Created project
 * @throws {ConflictError} If project name already exists for user
 */
export async function createProject(projectData, userId) {
  logger.debug({ projectData, userId }, 'Creating project');

  // Check for duplicate name
  const existing = await projectRepository.findByNameAndUser(
    projectData.name,
    userId
  );

  if (existing) {
    throw new ConflictError('Project with this name already exists');
  }

  const project = await projectRepository.create({
    ...projectData,
    userId,
  });

  logger.info({ projectId: project.id }, 'Project created successfully');
  return project;
}

/**
 * Retrieves a project by ID
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object>} Project object
 * @throws {NotFoundError} If project not found
 */
export async function getProjectById(projectId, userId) {
  const project = await projectRepository.findById(projectId);

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Authorization check
  if (project.userId !== userId) {
    throw new NotFoundError('Project not found'); // Don't reveal existence
  }

  return project;
}

/**
 * Lists all projects for a user with pagination
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @returns {Promise<Object>} Paginated projects list
 */
export async function listProjects(userId, options = {}) {
  const { page = 1, limit = 10 } = options;

  const [projects, total] = await Promise.all([
    projectRepository.findByUserId(userId, { page, limit }),
    projectRepository.countByUserId(userId),
  ]);

  return {
    items: projects,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Updates an existing project
 * @param {string} projectId - Project ID
 * @param {Object} updateData - Data to update
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object>} Updated project
 * @throws {NotFoundError} If project not found
 */
export async function updateProject(projectId, updateData, userId) {
  // Verify ownership
  const existing = await verifyProjectAccess(projectId, userId, true);

  const updated = await projectRepository.update(projectId, updateData);

  logger.info({ projectId }, 'Project updated successfully');
  return updated;
}

/**
 * Deletes a project
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<void>}
 * @throws {NotFoundError} If project not found
 */
export async function deleteProject(projectId, userId) {
  // Verify ownership
  await verifyProjectAccess(projectId, userId, true);

  await projectRepository.delete(projectId);

  logger.info({ projectId }, 'Project deleted successfully');
}


/**
 * Verifies project access rights
 * @param {string} projectId 
 * @param {string} userId 
 * @param {boolean} requireAdmin - If true, requires project ownership or specific admin rights
 * @returns {Promise<Object>} Project object if accessible
 */
export async function verifyProjectAccess(projectId, userId, requireAdmin = false) {
  const project = await projectRepository.findById(projectId);
  if (!project) throw new NotFoundError('Project not found');

  // Owner always has access
  if (project.userId === userId) return project;

  // If requires admin, only owner for now
  if (requireAdmin) {
    if (project.userId !== userId) throw new NotFoundError('Project not found');
    return project;
  }

  // Check membership
  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } }
  });

  if (!member) throw new NotFoundError('Project not found');

  return project;
}

/**
 * Add member to project
 */
export async function addMember(projectId, userId, targetUserId) {
  await verifyProjectAccess(projectId, userId, true);
  // Optional: Check if targetUser exists? Prisma will throw if FK fails
  // Optional: Check if already member? Prisma create throws unique constraint error
  try {
    return await projectRepository.addMember(projectId, targetUserId);
  } catch (e) {
    if (e.code === 'P2002') throw new ConflictError('User is already a member');
    throw e;
  }
}

/**
 * Remove member from project
 */
export async function removeMember(projectId, userId, targetUserId) {
  await verifyProjectAccess(projectId, userId, true);
  return projectRepository.removeMember(projectId, targetUserId);
}
