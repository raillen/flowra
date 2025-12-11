import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { logger } from '../src/config/logger.js';

/**
 * Seed script
 * Populates database with initial data for development/testing
 * 
 * @module scripts/seed
 */

const prisma = new PrismaClient();

async function main() {
  logger.info('Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@kbsys.com' },
    update: {},
    create: {
      email: 'admin@kbsys.com',
      name: 'Administrador',
      password: hashedPassword,
      role: 'admin',
    },
  });
  logger.info({ userId: admin.id }, 'Admin user created');

  // Create test user
  const testUser = await prisma.user.upsert({
    where: { email: 'test@kbsys.com' },
    update: {},
    create: {
      email: 'test@kbsys.com',
      name: 'Usuário Teste',
      password: hashedPassword,
      role: 'user',
    },
  });
  logger.info({ userId: testUser.id }, 'Test user created');

  // Create sample groups
  const groups = await Promise.all([
    prisma.group.upsert({
      where: { id: 'grp-marketing' },
      update: {},
      create: { id: 'grp-marketing', name: 'Marketing' },
    }),
    prisma.group.upsert({
      where: { id: 'grp-rh' },
      update: {},
      create: { id: 'grp-rh', name: 'RH' },
    }),
    prisma.group.upsert({
      where: { id: 'grp-engenharia' },
      update: {},
      create: { id: 'grp-engenharia', name: 'Engenharia' },
    }),
    prisma.group.upsert({
      where: { id: 'grp-financeiro' },
      update: {},
      create: { id: 'grp-financeiro', name: 'Financeiro' },
    }),
  ]);
  logger.info({ count: groups.length }, 'Groups created');

  // Create sample companies
  const companies = await Promise.all([
    prisma.company.upsert({
      where: { cnpj: '12345678000190' },
      update: {},
      create: {
        name: 'Rede Montagens Ltda',
        legalName: 'Rede Montagens e Serviços Ltda',
        cnpj: '12345678000190',
        city: 'São Paulo',
        state: 'SP',
        segment: 'Manutenção Industrial',
        contactName: 'Carlos Silva',
        contactEmail: 'carlos@redemontagens.com.br',
        contactPhone: '11987654321',
      },
    }),
    prisma.company.upsert({
      where: { cnpj: '98765432000110' },
      update: {},
      create: {
        name: 'Tech Inovação',
        legalName: 'Tech Inovação S.A.',
        cnpj: '98765432000110',
        city: 'Curitiba',
        state: 'PR',
        segment: 'Tecnologia da Informação',
        contactName: 'Mariana Souza',
        contactEmail: 'mariana@techinovacao.com',
        contactPhone: '4133334444',
      },
    }),
  ]);
  logger.info({ count: companies.length }, 'Companies created');

  // Create sample project
  const project = await prisma.project.create({
    data: {
      name: 'Campanha Black Friday',
      description: 'Planejamento e execução das mídias para novembro.',
      userId: admin.id,
      companyId: companies[0].id,
      groupId: groups[0].id,
    },
  });
  logger.info({ projectId: project.id }, 'Sample project created');

  logger.info('Database seeded successfully');
}

main()
  .catch((error) => {
    logger.error({ error }, 'Error seeding database');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

