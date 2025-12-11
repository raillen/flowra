/**
 * Company Filter Middleware
 * Provides automatic filtering by company for multi-tenant isolation
 */

/**
 * Get company context from request
 * Returns the companyId from the authenticated user
 */
export const getCompanyContext = (request) => {
    return request.user?.companyId || null;
};

/**
 * Middleware to require company association
 * Rejects requests from users without a company
 */
export const requireCompany = async (request, reply) => {
    if (!request.user) {
        return reply.status(401).send({
            success: false,
            message: 'Não autenticado'
        });
    }

    if (!request.user.companyId) {
        return reply.status(403).send({
            success: false,
            message: 'Usuário não está associado a uma empresa'
        });
    }

    // Attach company context to request for easy access
    request.companyId = request.user.companyId;
};

/**
 * Build company filter for Prisma queries
 * Adds companyId filter if user has a company association
 */
export const buildCompanyFilter = (request, existingWhere = {}) => {
    const companyId = getCompanyContext(request);

    if (!companyId) {
        return existingWhere;
    }

    return {
        ...existingWhere,
        companyId
    };
};

/**
 * Build project company filter
 * For queries on Project model
 */
export const buildProjectCompanyFilter = (request, existingWhere = {}) => {
    const companyId = getCompanyContext(request);

    if (!companyId) {
        return existingWhere;
    }

    return {
        ...existingWhere,
        // Projects can be filtered by companyId directly
        companyId
    };
};

/**
 * Build board company filter
 * For queries on Board model (through project relation)
 */
export const buildBoardCompanyFilter = (request, existingWhere = {}) => {
    const companyId = getCompanyContext(request);

    if (!companyId) {
        return existingWhere;
    }

    return {
        ...existingWhere,
        project: {
            companyId
        }
    };
};

/**
 * Check if user can access a project
 * Returns true if user's company matches project's company
 */
export const canAccessProject = (user, project) => {
    // Admin users can access everything
    if (user.role === 'admin') {
        return true;
    }

    // If user has no company, they can access projects without company
    if (!user.companyId) {
        return !project.companyId;
    }

    // User with company can only access same company's projects
    return project.companyId === user.companyId;
};

/**
 * Middleware to check project access
 * Use after authenticate, expects project in request.params
 */
export const checkProjectAccess = async (request, reply) => {
    const { projectId } = request.params;

    if (!projectId) {
        return; // No project context, skip check
    }

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { id: true, companyId: true, userId: true }
        });

        if (!project) {
            return reply.status(404).send({
                success: false,
                message: 'Projeto não encontrado'
            });
        }

        if (!canAccessProject(request.user, project)) {
            return reply.status(403).send({
                success: false,
                message: 'Sem permissão para acessar este projeto'
            });
        }

        // Attach project to request
        request.project = project;
    } finally {
        await prisma.$disconnect();
    }
};
