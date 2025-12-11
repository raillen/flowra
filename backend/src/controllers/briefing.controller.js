import * as briefingService from '../services/briefing.service.js';
import { logger } from '../config/logger.js';

export async function createTemplate(request, reply) {
    try {
        const template = await briefingService.createTemplate(request.body);
        return reply.code(201).send(template);
    } catch (error) {
        throw error; // Fastify handles errors if thrown
    }
}

export async function updateTemplate(request, reply) {
    try {
        const { id } = request.params;
        const template = await briefingService.updateTemplate(id, request.body);
        return reply.send(template);
    } catch (error) {
        throw error;
    }
}

export async function getTemplate(request, reply) {
    try {
        const template = await briefingService.getTemplateById(request.params.id);
        return reply.send(template);
    } catch (error) {
        throw error;
    }
}

export async function listTemplates(request, reply) {
    try {
        const templates = await briefingService.listTemplates(request.query.projectId);
        return reply.send(templates);
    } catch (error) {
        throw error;
    }
}

export async function deleteTemplate(request, reply) {
    try {
        const { id } = request.params;
        await briefingService.deleteTemplate(id);
        return reply.code(204).send();
    } catch (error) {
        throw error;
    }
}

export async function getPublicTemplate(request, reply) {
    try {
        const template = await briefingService.getTemplateByToken(request.params.token);
        return reply.send(template);
    } catch (error) {
        throw error;
    }
}

export async function submitPublicBriefing(request, reply) {
    try {
        const { token } = request.params;
        const { data } = request.body;
        const card = await briefingService.submitPublicBriefing(token, data);
        return reply.code(201).send(card);
    } catch (error) {
        throw error;
    }
}

export async function submitBriefing(request, reply) {
    try {
        const { cardId } = request.params;
        const { data } = request.body;
        const userId = request.user?.id; // Fastify JWT attaches to request.user

        const updatedCard = await briefingService.submitBriefing(cardId, data, userId);
        return reply.send(updatedCard);
    } catch (error) {
        throw error;
    }
}

export async function getBriefingHistory(request, reply) {
    try {
        const { cardId } = request.params;
        const history = await briefingService.getBriefingHistory(cardId);
        return reply.send(history);
    } catch (error) {
        throw error;
    }
}

export async function listSubmissions(request, reply) {
    try {
        const { templateId } = request.query;
        const submissions = await briefingService.listSubmissions(templateId);
        return reply.send(submissions);
    } catch (error) {
        throw error;
    }
}
