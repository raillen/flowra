
import { userRepository } from '../repositories/user.repository.js';
import { logger } from '../config/logger.js';

export const profileController = {
    getProfile: async (req, reply) => {
        try {
            const user = await userRepository.findById(req.user.id);
            if (!user) {
                return reply.status(404).send({ error: 'User not found' });
            }
            return user;
        } catch (error) {
            logger.error({ error }, 'Failed to get profile');
            return reply.status(500).send({ error: 'Internal server error' });
        }
    },

    updateProfile: async (req, reply) => {
        try {
            const { name, bio } = req.body;
            const updatedUser = await userRepository.update(req.user.id, {
                name,
                bio
            });
            return updatedUser;
        } catch (error) {
            logger.error({ error }, 'Failed to update profile');
            return reply.status(500).send({ error: 'Internal server error' });
        }
    },

    updateAvatar: async (req, reply) => {
        try {
            // Expecting base64 string in body: { avatar: "data:image/png;base64,..." }
            const { avatar } = req.body;

            // Basic validation
            if (!avatar || !avatar.startsWith('data:image')) {
                return reply.status(400).send({ error: 'Invalid avatar format' });
            }

            const updatedUser = await userRepository.update(req.user.id, {
                avatar
            });
            return updatedUser;
        } catch (error) {
            logger.error({ error }, 'Failed to update avatar');
            return reply.status(500).send({ error: 'Internal server error' });
        }
    },

    getStats: async (req, reply) => {
        try {
            const stats = await userRepository.getStats(req.user.id);
            return stats;
        } catch (error) {
            logger.error({ error }, 'Failed to get stats');
            return reply.status(500).send({ error: 'Internal server error' });
        }
    }
};
