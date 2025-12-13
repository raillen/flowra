import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { createNotification } from './notification.service.js';
import crypto from 'crypto';

/**
 * Creates a new briefing template
 */
export async function createTemplate(data) {
    const { name, description, fields, isPublic, projectId } = data;

    const template = await prisma.briefingTemplate.create({
        data: {
            name,
            description,
            fields: typeof fields === 'string' ? fields : JSON.stringify(fields),
            isPublic: isPublic || false,
            publicToken: isPublic ? crypto.randomBytes(32).toString('hex') : null,
            projectId: projectId || null
        }
    });

    return template;
}

/**
 * Gets a template by ID
 */
export async function getTemplateById(id) {
    const template = await prisma.briefingTemplate.findUnique({
        where: { id }
    });

    if (!template) throw new NotFoundError('Briefing template not found');
    return template;
}

/**
 * Updates an existing briefing template
 */
export async function updateTemplate(id, data) {
    const { name, description, fields, isPublic, projectId } = data;

    // Check if exists
    const existing = await prisma.briefingTemplate.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Briefing template not found');

    const updateData = {
        name,
        description,
        fields: typeof fields === 'string' ? fields : JSON.stringify(fields),
        isPublic,
        projectId
    };

    // Handle token generation/removal logic
    if (isPublic && !existing.isPublic && !existing.publicToken) {
        updateData.publicToken = crypto.randomBytes(32).toString('hex');
    } else if (isPublic === false) {
        updateData.publicToken = null;
    }

    const template = await prisma.briefingTemplate.update({
        where: { id },
        data: updateData
    });

    return template;
}

/**
 * Gets a template by Public Token (for external access)
 */
export async function getTemplateByToken(token) {
    const template = await prisma.briefingTemplate.findUnique({
        where: { publicToken: token }
    });

    if (!template) throw new NotFoundError('Invalid public token');
    return template;
}

/**
 * Lists templates (optionally filtered by project)
 */
export async function listTemplates(projectId = null) {
    const where = {};
    if (projectId) {
        // Show global (null) AND project specific
        where.OR = [
            { projectId: null },
            { projectId: projectId }
        ];
    } else {
        // If no project specified, show only global? Or all? Let's show global.
        where.projectId = null;
    }

    return prisma.briefingTemplate.findMany({
        where,
        orderBy: { createdAt: 'desc' }
    });
}

/**
 * Deletes a briefing template
 */
export async function deleteTemplate(id) {
    const existing = await prisma.briefingTemplate.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Briefing template not found');

    return prisma.briefingTemplate.delete({ where: { id } });
}

/**
 * Updates a card with briefing data and creates a version entry
 */
export async function submitBriefing(cardId, data, userId = null) {
    const card = await prisma.card.findUnique({ where: { id: cardId } });
    if (!card) throw new NotFoundError('Card not found');

    const dataString = typeof data === 'string' ? data : JSON.stringify(data);

    // 1. Update Card
    const updatedCard = await prisma.card.update({
        where: { id: cardId },
        data: {
            briefingData: dataString
        }
    });

    // 2. Create Version Entry
    await prisma.briefingVersion.create({
        data: {
            cardId,
            data: dataString,
            createdBy: userId,
            changeLog: 'Updated via API'
        }
    });

    return updatedCard;
}

/**
 * Handles public briefing submission by creating a new Card
 */
export async function submitPublicBriefing(token, data) {
    const template = await getTemplateByToken(token);

    // Use configured destination if set, otherwise fall back to auto-detection
    let boardId = template.defaultBoardId;
    let columnId = template.defaultColumnId;
    let projectId = template.projectId;

    // If no configured destination, try to find one
    if (!boardId || !columnId) {
        if (projectId) {
            const board = await prisma.board.findFirst({ where: { projectId } });
            if (board) {
                boardId = board.id;
                const col = await prisma.column.findFirst({ where: { boardId }, orderBy: { order: 'asc' } });
                if (col) columnId = col.id;
            }
        }
    }

    // Still no destination? Fall back to any board/column in the system
    if (!boardId || !columnId) {
        const board = await prisma.board.findFirst();
        if (board) {
            boardId = board.id;
            const col = await prisma.column.findFirst({ where: { boardId }, orderBy: { order: 'asc' } });
            columnId = col?.id;
        }
    }

    if (!boardId || !columnId) throw new ValidationError('Cannot find target board for briefing submission');

    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const titleField = Object.keys(data)[0]; // Use first field as title guess? Or "New Briefing"
    const title = `Briefing: ${template.name}`;

    // 1. Create Submission Record
    const submission = await prisma.briefingSubmission.create({
        data: {
            templateId: template.id,
            data: dataString,
            status: 'converted',
            submittedAt: new Date()
        }
    });

    // 2. Create Card
    const card = await prisma.card.create({
        data: {
            title,
            description: `Submitted via public link from template: ${template.name}`,
            boardId,
            columnId,
            briefingTemplateId: template.id,
            briefingData: dataString,
            status: 'novo',
            type: 'tarefa'
        }
    });

    // 3. Link Submission to Card
    await prisma.briefingSubmission.update({
        where: { id: submission.id },
        data: { cardId: card.id }
    });

    // 4. Create initial version
    await prisma.briefingVersion.create({
        data: {
            cardId: card.id,
            data: dataString,
            changeLog: 'Initial public submission',
            createdBy: 'system' // or 'guest'
        }
    });

    // 5. Notify Project Owner
    try {
        const boardInfo = await prisma.board.findUnique({
            where: { id: boardId },
            include: {
                project: {
                    select: { userId: true }
                }
            }
        });

        if (boardInfo?.project?.userId) {
            await createNotification({
                type: 'briefing_submission',
                title: 'Novo Briefing Recebido',
                message: `Novo briefing submetido para: "${template.name}"`,
                userId: boardInfo.project.userId, // Notify Project Owner
                refType: 'card',
                refId: card.id,
                priority: 'normal',
                metadata: JSON.stringify({ projectId: boardInfo.project.id, boardId: boardId })
            });

            // Email Notification (Stub)
            // await notificationService.sendEmailNotification(user.email, 'New Briefing', ...);
        }
    } catch (notifyError) {
        logger.error(`Failed to send notification for briefing submission: ${notifyError.message}`);
    }

    return card;
}
/**
 * Gets briefing history for a card
 */
export async function getBriefingHistory(cardId) {
    return prisma.briefingVersion.findMany({
        where: { cardId },
        orderBy: { createdAt: 'desc' },
        include: {
            // ideally include creator User, but simplified for now
        }
    });
}

/**
 * Lists all cards that were created from Briefing submissions
 */
export async function listSubmissions(templateId = null) {
    const where = {
        briefingTemplateId: { not: null }
    };

    if (templateId) {
        where.briefingTemplateId = templateId;
    }

    return prisma.card.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
            briefingTemplate: {
                select: { id: true, name: true }
            },
            column: { select: { id: true, title: true } },
            board: { select: { id: true, name: true } }
        }
    });
}
