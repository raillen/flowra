/**
 * Script to reset database and create test data
 * WARNING: This will delete all existing data!
 * 
 * Usage: node scripts/reset-and-seed.js
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { logger } from '../src/config/logger.js';

const prisma = new PrismaClient();

/**
 * Generates a UUID
 */
function uuid() {
  return crypto.randomUUID();
}

/**
 * Main function to reset and seed database
 */
async function main() {
  logger.info('🗑️  Deleting all existing data...');

  // Delete in correct order (respecting foreign keys)
  await prisma.automationRule.deleteMany(); // Added automation rules
  await prisma.cardTag.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.card.deleteMany();
  await prisma.column.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.board.deleteMany();
  await prisma.project.deleteMany();
  await prisma.collaborator.deleteMany();
  await prisma.group.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  logger.info('✅ All data deleted');

  logger.info('🌱 Creating test data...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.create({
    data: {
      id: uuid(),
      name: 'Administrador',
      email: 'admin@kbsys.com',
      password: hashedPassword,
      role: 'admin',
    },
  });

  logger.info({ email: adminUser.email }, '✅ Admin user created');

  // Create test company
  const company = await prisma.company.create({
    data: {
      id: uuid(),
      name: 'Empresa Teste',
      cnpj: '12345678000190',
      contactEmail: 'contato@empresateste.com',
      contactPhone: '11999999999',
    },
  });

  logger.info({ name: company.name }, '✅ Company created');

  // Create test group
  const group = await prisma.group.create({
    data: {
      id: uuid(),
      name: 'Grupo Desenvolvimento',
    },
  });

  logger.info({ name: group.name }, '✅ Group created');

  // Create test project
  const project = await prisma.project.create({
    data: {
      id: uuid(),
      name: 'Projeto Teste Completo',
      description: 'Projeto de teste com board completo',
      companyId: company.id,
      groupId: group.id,
      userId: adminUser.id,
    },
  });

  logger.info({ name: project.name }, '✅ Project created');

  // Create test board with default columns
  const board = await prisma.board.create({
    data: {
      id: uuid(),
      name: 'Board Principal',
      projectId: project.id,
      columns: {
        create: [
          {
            id: uuid(),
            title: 'A Fazer',
            color: 'bg-slate-100',
            order: 1,
          },
          {
            id: uuid(),
            title: 'Em Andamento',
            color: 'bg-blue-50',
            order: 2,
          },
          {
            id: uuid(),
            title: 'Em Revisão',
            color: 'bg-yellow-50',
            order: 3,
          },
          {
            id: uuid(),
            title: 'Concluído',
            color: 'bg-green-50',
            order: 4,
          },
        ],
      },
    },
    include: {
      columns: true,
    },
  });

  logger.info({ name: board.name, columns: board.columns.length }, '✅ Board created');

  // Create test tags
  const tags = await Promise.all([
    prisma.tag.create({
      data: {
        id: uuid(),
        name: 'Urgente',
        color: '#ef4444', // red-500
        boardId: board.id,
      },
    }),
    prisma.tag.create({
      data: {
        id: uuid(),
        name: 'Bug',
        color: '#f59e0b', // amber-500
        boardId: board.id,
      },
    }),
    prisma.tag.create({
      data: {
        id: uuid(),
        name: 'Feature',
        color: '#3b82f6', // blue-500
        boardId: board.id,
      },
    }),
    prisma.tag.create({
      data: {
        id: uuid(),
        name: 'Documentação',
        color: '#10b981', // green-500
        boardId: board.id,
      },
    }),
  ]);

  logger.info({ count: tags.length }, '✅ Tags created');

  // Get columns for card creation
  const columns = board.columns;
  const todoColumn = columns.find((c) => c.title === 'A Fazer');
  const inProgressColumn = columns.find((c) => c.title === 'Em Andamento');
  const doneColumn = columns.find((c) => c.title === 'Concluído');

  // Create test cards
  const cards = await Promise.all([
    // Card 1: A Fazer
    prisma.card.create({
      data: {
        id: uuid(),
        title: 'Implementar autenticação JWT',
        description: 'Implementar sistema de autenticação usando JWT tokens com refresh tokens',
        priority: 'alta',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        columnId: todoColumn.id,
        boardId: board.id,
        assignedUserId: adminUser.id,
        tags: {
          create: [
            { tagId: tags.find((t) => t.name === 'Feature').id },
            { tagId: tags.find((t) => t.name === 'Urgente').id },
          ],
        },
      },
    }),
    // Card 2: A Fazer
    prisma.card.create({
      data: {
        id: uuid(),
        title: 'Criar documentação da API',
        description: 'Documentar todos os endpoints da API usando Swagger/OpenAPI',
        priority: 'media',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        columnId: todoColumn.id,
        boardId: board.id,
        tags: {
          create: [
            { tagId: tags.find((t) => t.name === 'Documentação').id },
          ],
        },
      },
    }),
    // Card 3: Em Andamento
    prisma.card.create({
      data: {
        id: uuid(),
        title: 'Corrigir bug no login',
        description: 'O login não está funcionando corretamente em alguns navegadores',
        priority: 'alta',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        columnId: inProgressColumn.id,
        boardId: board.id,
        assignedUserId: adminUser.id,
        tags: {
          create: [
            { tagId: tags.find((t) => t.name === 'Bug').id },
            { tagId: tags.find((t) => t.name === 'Urgente').id },
          ],
        },
      },
    }),
    // Card 4: Concluído
    prisma.card.create({
      data: {
        id: uuid(),
        title: 'Configurar CI/CD',
        description: 'Configurar pipeline de CI/CD usando GitHub Actions',
        priority: 'media',
        columnId: doneColumn.id,
        boardId: board.id,
        assignedUserId: adminUser.id,
        tags: {
          create: [
            { tagId: tags.find((t) => t.name === 'Feature').id },
          ],
        },
      },
    }),
  ]);

  logger.info({ count: cards.length }, '✅ Cards created');

  // Create comments for first card
  const firstCard = cards[0];
  await prisma.comment.create({
    data: {
      id: uuid(),
      content: 'Vou começar a implementar isso hoje',
      cardId: firstCard.id,
      userId: adminUser.id,
    },
  });

  await prisma.comment.create({
    data: {
      id: uuid(),
      content: 'Lembrar de incluir refresh tokens',
      cardId: firstCard.id,
      userId: adminUser.id,
    },
  });

  logger.info('✅ Comments created: 2');

  logger.info('🎉 Database reset and seeded successfully!');
  console.log('\n📋 Test Data Summary:');
  console.log('   - Admin User: admin@kbsys.com / admin123');
  console.log('   - Company: Empresa Teste');
  console.log('   - Group: Grupo Desenvolvimento');
  console.log('   - Project: Projeto Teste Completo');
  console.log('   - Board: Board Principal');
  console.log('   - Columns: 4 (A Fazer, Em Andamento, Em Revisão, Concluído)');
  console.log('   - Cards: 4');
  console.log('   - Tags: 4');
  console.log('   - Comments: 2');
}

main()
  .catch((e) => {
    console.error('FULL ERROR:', e);
    logger.error({ error: e, message: e.message, stack: e.stack }, '❌ Error resetting and seeding database');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

