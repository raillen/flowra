import * as attachmentService from '../services/attachment.service.js';
import { successResponse } from '../utils/responses.js';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';

const pump = promisify(pipeline);

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'attachments');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'application/pdf',
  'text/plain', 'text/markdown', 'text/csv',
  'application/json',
  'application/zip',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'application/vnd.openxmlformats-officedocument.presentationml.presentation' // pptx
];

/**
 * Attachment controller
 * Handles HTTP requests and responses for attachment endpoints
 * 
 * @module controllers/attachment
 */

/**
 * Creates a new attachment (file upload or link)
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with created attachment
 */
export async function createAttachment(request, reply) {
  const { projectId, boardId, cardId } = request.params;
  const userId = request.user.id;

  let attachmentData;

  // Check if this is a multipart request (file upload)
  if (request.isMultipart()) {
    const data = await request.file();
    if (!data) {
      return reply.code(400).send({ success: false, message: 'No file provided' });
    }

    if (!ALLOWED_MIME_TYPES.includes(data.mimetype)) {
      return reply.code(400).send({
        success: false,
        message: `File type not allowed. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`
      });
    }

    // Generate unique filename
    const ext = path.extname(data.filename);
    const uniqueFilename = `${cardId}_${Date.now()}${ext}`;
    const filePath = path.join(UPLOAD_DIR, uniqueFilename);

    // Save file to disk
    await pump(data.file, fs.createWriteStream(filePath));

    attachmentData = {
      filename: uniqueFilename,
      originalName: data.filename,
      mimeType: data.mimetype,
      size: data.file.bytesRead || 0,
      url: `/uploads/attachments/${uniqueFilename}`,
    };
  } else {
    // JSON body - link attachment
    attachmentData = request.body;
  }

  const attachment = await attachmentService.createAttachment(
    boardId,
    cardId,
    attachmentData,
    userId
  );

  return reply
    .code(201)
    .send(successResponse(attachment, 'Attachment created successfully', 201));
}

/**
 * Lists all attachments for a card
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with attachments list
 */
export async function listAttachments(request, reply) {
  const { projectId, boardId, cardId } = request.params;

  const attachments = await attachmentService.listAttachments(boardId, cardId);

  return reply.send(successResponse(attachments));
}

/**
 * Deletes an attachment
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Success response
 */
export async function deleteAttachment(request, reply) {
  const { projectId, boardId, cardId, attachmentId } = request.params;
  const userId = request.user.id;

  await attachmentService.deleteAttachment(boardId, cardId, attachmentId, userId);

  return reply
    .code(204)
    .send();
}

