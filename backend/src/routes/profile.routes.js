
import { profileController } from '../controllers/profile.controller.js';

async function profileRoutes(fastify, options) {
    // All routes require authentication
    fastify.addHook('onRequest', async (request, reply) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.send(err);
        }
    });

    fastify.get('/', profileController.getProfile);
    fastify.put('/', profileController.updateProfile);
    fastify.put('/avatar', profileController.updateAvatar);
    fastify.get('/stats', profileController.getStats);
}

export default profileRoutes;
