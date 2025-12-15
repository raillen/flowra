/**
 * Documentation Routes
 * Serves documentation content from /docs folder
 * 
 * @module routes/docs
 */
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authenticate } from '../middleware/auth.middleware.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS_PATH = path.join(__dirname, '../../../docs');

export default async function docsRoutes(fastify, options) {

    // Get sidebar structure for a section
    fastify.get('/docs/:section/sidebar', {
        preHandler: authenticate
    }, async (request, reply) => {
        const { section } = request.params;

        // Check admin for technical docs
        if (section === 'technical' && request.user.role !== 'admin') {
            return reply.code(403).send({
                success: false,
                error: 'Acesso restrito a administradores'
            });
        }

        const sidebarPath = path.join(DOCS_PATH, section, '_sidebar.json');

        try {
            const content = fs.readFileSync(sidebarPath, 'utf8');
            return { success: true, data: JSON.parse(content) };
        } catch (error) {
            return reply.code(404).send({
                success: false,
                error: 'Sidebar não encontrada'
            });
        }
    });

    // Get document content
    fastify.get('/docs/:section/*', {
        preHandler: authenticate
    }, async (request, reply) => {
        const { section } = request.params;
        const docPath = request.params['*'];

        // Check admin for technical docs
        if (section === 'technical' && request.user.role !== 'admin') {
            return reply.code(403).send({
                success: false,
                error: 'Acesso restrito a administradores'
            });
        }

        // Sanitize path to prevent directory traversal
        const sanitizedPath = docPath.replace(/\.\./g, '');
        const filePath = path.join(DOCS_PATH, section, `${sanitizedPath}.md`);

        try {
            const content = fs.readFileSync(filePath, 'utf8');
            return { success: true, data: { content, path: sanitizedPath } };
        } catch (error) {
            return reply.code(404).send({
                success: false,
                error: 'Documento não encontrado'
            });
        }
    });

    // Update document (admin only)
    fastify.put('/docs/:section/*', {
        preHandler: authenticate
    }, async (request, reply) => {
        // Only admin can edit
        if (request.user.role !== 'admin') {
            return reply.code(403).send({
                success: false,
                error: 'Apenas administradores podem editar'
            });
        }

        const { section } = request.params;
        const docPath = request.params['*'];
        const { content } = request.body;

        const sanitizedPath = docPath.replace(/\.\./g, '');
        const filePath = path.join(DOCS_PATH, section, `${sanitizedPath}.md`);

        try {
            // Ensure directory exists
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            fs.writeFileSync(filePath, content, 'utf8');
            return { success: true, message: 'Documento atualizado' };
        } catch (error) {
            return reply.code(500).send({
                success: false,
                error: 'Erro ao salvar documento'
            });
        }
    });

    // Search docs
    fastify.get('/docs/search', {
        preHandler: authenticate
    }, async (request, reply) => {
        const { q } = request.query;
        const isAdmin = request.user.role === 'admin';

        if (!q || q.length < 2) {
            return { success: true, data: [] };
        }

        const results = [];
        const sections = isAdmin ? ['technical', 'usage', 'learn'] : ['usage'];

        for (const section of sections) {
            const sectionPath = path.join(DOCS_PATH, section);
            searchFiles(sectionPath, q.toLowerCase(), section, results);
        }

        return { success: true, data: results.slice(0, 20) };
    });
}

// Recursive file search
function searchFiles(dir, query, section, results) {
    try {
        const files = fs.readdirSync(dir);

        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                searchFiles(filePath, query, section, results);
            } else if (file.endsWith('.md')) {
                const content = fs.readFileSync(filePath, 'utf8');
                if (content.toLowerCase().includes(query)) {
                    // Extract title from first heading
                    const titleMatch = content.match(/^#\s+(.+)$/m);
                    const title = titleMatch ? titleMatch[1] : file.replace('.md', '');

                    // Extract snippet
                    const lines = content.split('\n');
                    const matchLine = lines.find(l => l.toLowerCase().includes(query));
                    const snippet = matchLine ? matchLine.substring(0, 100) : '';

                    const relativePath = filePath
                        .replace(path.join(DOCS_PATH, section), '')
                        .replace(/\\/g, '/')
                        .replace('.md', '')
                        .replace(/^\//, '');

                    results.push({
                        section,
                        path: relativePath,
                        title,
                        snippet
                    });
                }
            }
        }
    } catch (e) {
        // Ignore errors
    }
}
