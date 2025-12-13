import { importController } from '../controllers/importController.js';

export async function importRoutes(fastify, options) {
    fastify.post('/collaborators', {
        schema: {
            consumes: ['multipart/form-data'],
            querystring: {
                type: 'object',
                properties: {
                    type: { type: 'string', enum: ['senior', 'totvs'], default: 'senior' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        total: { type: 'number' },
                        preview: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    email: { type: 'string' },
                                    cpf: { type: 'string' },
                                    status: { type: 'string' },
                                    role: { type: 'string' },
                                    employeeId: { type: 'string' }
                                }
                            }
                        }
                    }
                }
            }
        },
        handler: importController.importCollaborators
    });
}
