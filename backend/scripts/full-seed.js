import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { logger } from '../src/config/logger.js';

/**
 * Full seed script
 * Populates database with comprehensive test data
 * 
 * @module scripts/full-seed
 */

const prisma = new PrismaClient();

async function main() {
    logger.info('Starting full database seed...');

    // ===== USERS =====
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@flowra.com' },
        update: {},
        create: {
            email: 'admin@flowra.com',
            name: 'Administrador',
            password: hashedPassword,
            role: 'admin',
        },
    });

    const users = await Promise.all([
        prisma.user.upsert({
            where: { email: 'joao.silva@flowra.com' },
            update: {},
            create: {
                email: 'joao.silva@flowra.com',
                name: 'João Silva',
                password: hashedPassword,
                role: 'user',
            },
        }),
        prisma.user.upsert({
            where: { email: 'maria.santos@flowra.com' },
            update: {},
            create: {
                email: 'maria.santos@flowra.com',
                name: 'Maria Santos',
                password: hashedPassword,
                role: 'user',
            },
        }),
        prisma.user.upsert({
            where: { email: 'pedro.costa@flowra.com' },
            update: {},
            create: {
                email: 'pedro.costa@flowra.com',
                name: 'Pedro Costa',
                password: hashedPassword,
                role: 'user',
            },
        }),
        prisma.user.upsert({
            where: { email: 'ana.oliveira@flowra.com' },
            update: {},
            create: {
                email: 'ana.oliveira@flowra.com',
                name: 'Ana Oliveira',
                password: hashedPassword,
                role: 'user',
            },
        }),
    ]);

    logger.info({ count: users.length + 1 }, 'Users created');

    // ===== GROUPS =====
    const groups = await Promise.all([
        prisma.group.upsert({
            where: { id: 'grp-marketing' },
            update: {},
            create: { id: 'grp-marketing', name: 'Marketing' },
        }),
        prisma.group.upsert({
            where: { id: 'grp-desenvolvimento' },
            update: {},
            create: { id: 'grp-desenvolvimento', name: 'Desenvolvimento' },
        }),
        prisma.group.upsert({
            where: { id: 'grp-rh' },
            update: {},
            create: { id: 'grp-rh', name: 'Recursos Humanos' },
        }),
        prisma.group.upsert({
            where: { id: 'grp-vendas' },
            update: {},
            create: { id: 'grp-vendas', name: 'Vendas' },
        }),
    ]);
    logger.info({ count: groups.length }, 'Groups created');

    // ===== COMPANIES =====
    const companies = await Promise.all([
        prisma.company.upsert({
            where: { cnpj: '12345678000190' },
            update: {},
            create: {
                name: 'TechSoft Solutions',
                legalName: 'TechSoft Solutions Ltda',
                cnpj: '12345678000190',
                city: 'São Paulo',
                state: 'SP',
                segment: 'Tecnologia',
                contactName: 'Roberto Lima',
                contactEmail: 'roberto@techsoft.com.br',
                contactPhone: '11999887766',
            },
        }),
        prisma.company.upsert({
            where: { cnpj: '98765432000110' },
            update: {},
            create: {
                name: 'Indústria ABC',
                legalName: 'Indústria ABC S.A.',
                cnpj: '98765432000110',
                city: 'Curitiba',
                state: 'PR',
                segment: 'Manufatura',
                contactName: 'Fernanda Martins',
                contactEmail: 'fernanda@industriaabc.com',
                contactPhone: '41988776655',
            },
        }),
    ]);
    logger.info({ count: companies.length }, 'Companies created');

    // ===== PROJECT 1: Sistema de E-commerce =====
    const project1 = await prisma.project.create({
        data: {
            name: 'Sistema de E-commerce',
            description: 'Desenvolvimento de plataforma completa de e-commerce com integração de pagamentos.',
            userId: admin.id,
            companyId: companies[0].id,
            groupId: groups[1].id,
        },
    });

    // Board 1: Sprint Atual
    const board1 = await prisma.board.create({
        data: {
            name: 'Sprint 12 - Checkout',
            projectId: project1.id,
        },
    });

    // Columns for Board 1
    const columns1 = await Promise.all([
        prisma.column.create({ data: { title: 'Backlog', order: 0, boardId: board1.id, color: 'bg-slate-100' } }),
        prisma.column.create({ data: { title: 'A Fazer', order: 1, boardId: board1.id, color: 'bg-blue-100' } }),
        prisma.column.create({ data: { title: 'Em Progresso', order: 2, boardId: board1.id, color: 'bg-yellow-100' } }),
        prisma.column.create({ data: { title: 'Code Review', order: 3, boardId: board1.id, color: 'bg-purple-100' } }),
        prisma.column.create({ data: { title: 'Concluído', order: 4, boardId: board1.id, color: 'bg-green-100' } }),
    ]);

    // Tags for Board 1
    const tags1 = await Promise.all([
        prisma.tag.create({ data: { name: 'Frontend', color: '#3b82f6', boardId: board1.id } }),
        prisma.tag.create({ data: { name: 'Backend', color: '#10b981', boardId: board1.id } }),
        prisma.tag.create({ data: { name: 'Bug', color: '#ef4444', boardId: board1.id } }),
        prisma.tag.create({ data: { name: 'Feature', color: '#8b5cf6', boardId: board1.id } }),
        prisma.tag.create({ data: { name: 'Urgente', color: '#f97316', boardId: board1.id } }),
    ]);

    // Cards for Board 1
    const cards1 = await Promise.all([
        // Backlog
        prisma.card.create({
            data: {
                title: 'Implementar sistema de cupons',
                description: 'Criar módulo para gerenciamento e aplicação de cupons de desconto no checkout.',
                columnId: columns1[0].id,
                boardId: board1.id,
                order: 0,
                priority: 'media',
                status: 'novo',
                type: 'feature',
                storyPoints: 8,
                estimatedHours: 16,
            },
        }),
        prisma.card.create({
            data: {
                title: 'Integração com PIX',
                description: 'Adicionar PIX como forma de pagamento utilizando API do banco.',
                columnId: columns1[0].id,
                boardId: board1.id,
                order: 1,
                priority: 'alta',
                status: 'novo',
                type: 'feature',
                storyPoints: 13,
                estimatedHours: 24,
            },
        }),
        // A Fazer
        prisma.card.create({
            data: {
                title: 'Validação de CEP',
                description: 'Implementar validação automática de CEP com preenchimento de endereço.',
                columnId: columns1[1].id,
                boardId: board1.id,
                order: 0,
                priority: 'media',
                status: 'novo',
                type: 'feature',
                storyPoints: 3,
                estimatedHours: 4,
                assignedUserId: users[0].id,
                dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            },
        }),
        prisma.card.create({
            data: {
                title: 'Correção de cálculo de frete',
                description: 'O frete está sendo calculado incorretamente para regiões do Norte.',
                columnId: columns1[1].id,
                boardId: board1.id,
                order: 1,
                priority: 'urgente',
                status: 'novo',
                type: 'bug',
                storyPoints: 5,
                estimatedHours: 8,
                assignedUserId: users[1].id,
                dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            },
        }),
        // Em Progresso
        prisma.card.create({
            data: {
                title: 'Redesign tela de carrinho',
                description: 'Atualizar visual do carrinho para novo design system.',
                columnId: columns1[2].id,
                boardId: board1.id,
                order: 0,
                priority: 'media',
                status: 'em_progresso',
                type: 'melhoria',
                storyPoints: 5,
                estimatedHours: 10,
                actualHours: 6,
                progress: 60,
                assignedUserId: users[2].id,
                startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            },
        }),
        prisma.card.create({
            data: {
                title: 'API de cálculo de parcelamento',
                description: 'Criar endpoint que retorna opções de parcelamento com e sem juros.',
                columnId: columns1[2].id,
                boardId: board1.id,
                order: 1,
                priority: 'alta',
                status: 'em_progresso',
                type: 'feature',
                storyPoints: 5,
                estimatedHours: 8,
                actualHours: 4,
                progress: 45,
                assignedUserId: users[0].id,
                startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            },
        }),
        // Code Review
        prisma.card.create({
            data: {
                title: 'Componente de resumo do pedido',
                description: 'Sidebar com resumo de itens, subtotal, frete e total.',
                columnId: columns1[3].id,
                boardId: board1.id,
                order: 0,
                priority: 'media',
                status: 'em_progresso',
                type: 'feature',
                storyPoints: 3,
                estimatedHours: 6,
                actualHours: 5,
                progress: 90,
                assignedUserId: users[3].id,
                reviewerId: users[0].id,
            },
        }),
        // Concluído
        prisma.card.create({
            data: {
                title: 'Integração com gateway de pagamento',
                description: 'Configurar e testar integração com PagSeguro.',
                columnId: columns1[4].id,
                boardId: board1.id,
                order: 0,
                priority: 'alta',
                status: 'concluido',
                type: 'feature',
                storyPoints: 8,
                estimatedHours: 16,
                actualHours: 14,
                progress: 100,
                assignedUserId: users[1].id,
                completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            },
        }),
        prisma.card.create({
            data: {
                title: 'Validação de cartão de crédito',
                description: 'Implementar validação client-side dos dados do cartão.',
                columnId: columns1[4].id,
                boardId: board1.id,
                order: 1,
                priority: 'media',
                status: 'concluido',
                type: 'feature',
                storyPoints: 2,
                estimatedHours: 3,
                actualHours: 2,
                progress: 100,
                assignedUserId: users[2].id,
                completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            },
        }),
    ]);

    // Add tags to cards
    await prisma.cardTag.createMany({
        data: [
            { cardId: cards1[0].id, tagId: tags1[0].id },
            { cardId: cards1[0].id, tagId: tags1[3].id },
            { cardId: cards1[1].id, tagId: tags1[1].id },
            { cardId: cards1[1].id, tagId: tags1[3].id },
            { cardId: cards1[3].id, tagId: tags1[2].id },
            { cardId: cards1[3].id, tagId: tags1[4].id },
            { cardId: cards1[4].id, tagId: tags1[0].id },
            { cardId: cards1[5].id, tagId: tags1[1].id },
        ],
    });

    // Add comments
    await prisma.comment.createMany({
        data: [
            { content: 'Já começamos a documentação da API para essa feature.', cardId: cards1[1].id, userId: users[0].id },
            { content: 'Este bug está afetando vários clientes. Prioridade máxima!', cardId: cards1[3].id, userId: admin.id },
            { content: 'Preciso de ajuda com a integração do componente.', cardId: cards1[4].id, userId: users[2].id },
            { content: 'Ótimo trabalho no redesign! Ficou muito bom.', cardId: cards1[4].id, userId: admin.id },
        ],
    });

    logger.info('Project 1 (E-commerce) created with board, columns, cards, and tags');

    // ===== PROJECT 2: App Mobile =====
    const project2 = await prisma.project.create({
        data: {
            name: 'App Mobile - Cliente',
            description: 'Aplicativo mobile para clientes acompanharem pedidos e realizarem compras.',
            userId: admin.id,
            companyId: companies[0].id,
            groupId: groups[1].id,
        },
    });

    const board2 = await prisma.board.create({
        data: {
            name: 'MVP - Fase 1',
            projectId: project2.id,
        },
    });

    const columns2 = await Promise.all([
        prisma.column.create({ data: { title: 'Icebox', order: 0, boardId: board2.id, color: 'bg-gray-100' } }),
        prisma.column.create({ data: { title: 'Sprint', order: 1, boardId: board2.id, color: 'bg-blue-100' } }),
        prisma.column.create({ data: { title: 'Doing', order: 2, boardId: board2.id, color: 'bg-amber-100' } }),
        prisma.column.create({ data: { title: 'Done', order: 3, boardId: board2.id, color: 'bg-emerald-100' } }),
    ]);

    await Promise.all([
        prisma.card.create({
            data: {
                title: 'Tela de login com biometria',
                description: 'Implementar autenticação por digital/Face ID.',
                columnId: columns2[1].id,
                boardId: board2.id,
                order: 0,
                priority: 'alta',
                type: 'feature',
                assignedUserId: users[3].id,
            },
        }),
        prisma.card.create({
            data: {
                title: 'Push notifications',
                description: 'Configurar Firebase para envio de notificações push.',
                columnId: columns2[0].id,
                boardId: board2.id,
                order: 0,
                priority: 'media',
                type: 'feature',
            },
        }),
        prisma.card.create({
            data: {
                title: 'Rastreamento de pedidos',
                description: 'Tela com mapa e status de entrega em tempo real.',
                columnId: columns2[2].id,
                boardId: board2.id,
                order: 0,
                priority: 'alta',
                type: 'feature',
                assignedUserId: users[0].id,
                progress: 30,
            },
        }),
    ]);

    logger.info('Project 2 (App Mobile) created');

    // ===== PROJECT 3: Campanha Marketing =====
    const project3 = await prisma.project.create({
        data: {
            name: 'Campanha Black Friday 2024',
            description: 'Planejamento e execução da campanha de Black Friday.',
            userId: users[1].id,
            companyId: companies[1].id,
            groupId: groups[0].id,
        },
    });

    const board3 = await prisma.board.create({
        data: {
            name: 'Cronograma Geral',
            projectId: project3.id,
        },
    });

    const columns3 = await Promise.all([
        prisma.column.create({ data: { title: 'Ideias', order: 0, boardId: board3.id, color: 'bg-pink-100' } }),
        prisma.column.create({ data: { title: 'Aprovado', order: 1, boardId: board3.id, color: 'bg-blue-100' } }),
        prisma.column.create({ data: { title: 'Em Produção', order: 2, boardId: board3.id, color: 'bg-orange-100' } }),
        prisma.column.create({ data: { title: 'Publicado', order: 3, boardId: board3.id, color: 'bg-green-100' } }),
    ]);

    await Promise.all([
        prisma.card.create({
            data: {
                title: 'Banner principal site',
                description: 'Criar banner hero para página inicial com ofertas principais.',
                columnId: columns3[1].id,
                boardId: board3.id,
                order: 0,
                priority: 'urgente',
                type: 'tarefa',
                dueDate: new Date('2024-11-20'),
                assignedUserId: users[2].id,
            },
        }),
        prisma.card.create({
            data: {
                title: 'E-mail marketing - Esquenta',
                description: 'Série de 3 e-mails de aquecimento pré-Black Friday.',
                columnId: columns3[2].id,
                boardId: board3.id,
                order: 0,
                priority: 'alta',
                type: 'tarefa',
                progress: 66,
                assignedUserId: users[1].id,
            },
        }),
        prisma.card.create({
            data: {
                title: 'Posts redes sociais',
                description: 'Pacote de 15 posts para Instagram, Facebook e LinkedIn.',
                columnId: columns3[0].id,
                boardId: board3.id,
                order: 0,
                priority: 'media',
                type: 'tarefa',
            },
        }),
    ]);

    logger.info('Project 3 (Black Friday) created');

    // ===== CALENDAR EVENTS =====
    await Promise.all([
        prisma.calendarEvent.create({
            data: {
                title: 'Daily Standup',
                description: 'Reunião diária de sincronização da equipe.',
                startAt: new Date(new Date().setHours(9, 0, 0, 0)),
                endAt: new Date(new Date().setHours(9, 15, 0, 0)),
                color: '#3b82f6',
                userId: admin.id,
            },
        }),
        prisma.calendarEvent.create({
            data: {
                title: 'Sprint Review',
                description: 'Apresentação das entregas da sprint.',
                startAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                endAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
                color: '#8b5cf6',
                userId: admin.id,
            },
        }),
        prisma.calendarEvent.create({
            data: {
                title: 'Reunião com Cliente',
                description: 'Alinhamento sobre escopo do projeto.',
                startAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                allDay: false,
                color: '#f97316',
                userId: admin.id,
            },
        }),
    ]);
    logger.info('Calendar events created');

    // ===== NOTES =====
    await Promise.all([
        prisma.note.create({
            data: {
                title: 'Reunião de Kickoff - E-commerce',
                content: '<h2>Pontos discutidos</h2><ul><li>Prazo final: Março 2025</li><li>Orçamento aprovado: R$ 150.000</li><li>Equipe: 4 desenvolvedores + 1 designer</li></ul>',
                rawContent: 'Pontos discutidos\n- Prazo final: Março 2025\n- Orçamento aprovado: R$ 150.000\n- Equipe: 4 desenvolvedores + 1 designer',
                userId: admin.id,
                projectId: project1.id,
            },
        }),
        prisma.note.create({
            data: {
                title: 'Ideias para Black Friday',
                content: '<h2>Brainstorm</h2><p>Descontos progressivos, frete grátis acima de R$200, cupom exclusivo app.</p>',
                rawContent: 'Brainstorm\nDescontos progressivos, frete grátis acima de R$200, cupom exclusivo app.',
                userId: users[1].id,
                projectId: project3.id,
                reminderDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        }),
    ]);
    logger.info('Notes created');

    // ===== COLLABORATORS =====
    await Promise.all([
        prisma.collaborator.create({
            data: {
                name: 'Carlos Mendes',
                email: 'carlos.mendes@freelancer.com',
                employeeId: 'EXT001',
                status: 'Ativo',
            },
        }),
        prisma.collaborator.create({
            data: {
                name: 'Juliana Ferreira',
                email: 'juliana@agencia.com',
                employeeId: 'EXT002',
                status: 'Ativo',
            },
        }),
    ]);
    logger.info('Collaborators created');

    logger.info('=================================');
    logger.info('Full database seed completed!');
    logger.info('=================================');
    logger.info('Users:');
    logger.info('  admin@flowra.com / admin123 (Admin)');
    logger.info('  joao.silva@flowra.com / admin123');
    logger.info('  maria.santos@flowra.com / admin123');
    logger.info('  pedro.costa@flowra.com / admin123');
    logger.info('  ana.oliveira@flowra.com / admin123');
}

main()
    .catch((error) => {
        logger.error({ error }, 'Error seeding database');
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
