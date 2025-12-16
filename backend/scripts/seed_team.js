
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seeding...');

    // 1. Create Users
    const passwordHash = await bcrypt.hash('123456', 10);

    const users = [
        { name: 'Sabrina Pereira', email: 'sabrina@flowra.com', avatar: null, role: 'admin' },
        { name: 'Gerusia Nogueira', email: 'gerusia@flowra.com', avatar: null, role: 'user' },
        { name: 'Carolina Machado', email: 'carolina@flowra.com', avatar: null, role: 'user' },
        { name: 'Alexandre Maia', email: 'alexandre@flowra.com', avatar: null, role: 'user' },
        { name: 'Rafael Mascarenhas', email: 'rafael@flowra.com', avatar: null, role: 'user' }, // The user in the screenshot seemed to be this one or Raillen
        { name: 'Daiane Carvalho', email: 'daiane@flowra.com', avatar: null, role: 'user' },
        { name: 'Raillen Santos', email: 'raillen@flowra.com', avatar: null, role: 'admin' } // Current user usually
    ];

    const createdUsers = [];

    for (const u of users) {
        const user = await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: {
                email: u.email,
                name: u.name,
                password: passwordHash,
                role: u.role,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`, // Placeholder avatar
                bio: `${u.name} is a valued member of the team.`
            },
        });
        createdUsers.push(user);
        console.log(`✅ User ensured: ${user.name}`);
    }

    // 2. Create a Group (Confraternização Rede 2025)
    const group = await prisma.group.create({
        data: {
            name: 'Confraternização Rede 2025',
        }
    });
    console.log(`🎉 Group created: ${group.name}`);

    // 3. Create a Project linked to the Group
    // We need a userId for the project creator, let's use the first admin found
    const admin = createdUsers.find(u => u.role === 'admin') || createdUsers[0];

    const project = await prisma.project.create({
        data: {
            name: 'Planejamento 2025',
            description: 'Planejamento estratégico e organização da confraternização.',
            userId: admin.id,
            groupId: group.id
        }
    });
    console.log(`🚀 Project created: ${project.name}`);

    // 4. Add Members to Project (and effectively the group context)
    for (const user of createdUsers) {
        // Upsert project membership
        await prisma.projectMember.create({
            data: {
                projectId: project.id,
                userId: user.id,
                role: user.role === 'admin' ? 'owner' : 'member'
            }
        }).catch(() => { }); // Ignore if already exists (though create usually throws, upsert is safer but let's just try create unique constraint might hit if re-run on fresh db it's fine)
        console.log(`bust added ${user.name} to project`);
    }

    // 5. Create a Board
    const board = await prisma.board.create({
        data: {
            name: 'Decoração Geral',
            projectId: project.id,
            isPrivate: false,
        }
    });
    console.log(`📋 Board created: ${board.name}`);

    // 6. Add Members to Board
    for (const user of createdUsers) {
        await prisma.boardMember.create({
            data: {
                boardId: board.id,
                userId: user.id,
                role: 'editor'
            }
        }).catch(e => console.log(`Member already in board or error: ${e.message}`));
    }

    // 7. Ensure Company "Rede Montagens Ltda"
    const company = await prisma.company.upsert({
        where: { cnpj: '12345678000199' },
        update: {},
        create: {
            name: 'Rede Montagens Ltda',
            legalName: 'Rede Montagens Ltda',
            cnpj: '12345678000199', // Dummy CNPJ
            city: 'São Paulo',
            state: 'SP'
        }
    });
    console.log(`🏢 Company ensured: ${company.name}`);

    // 8. Create Collaborator records for each User
    for (const user of createdUsers) {
        const collaborator = await prisma.collaborator.upsert({
            where: { email: user.email },
            update: { userId: user.id }, // Link if missing
            create: {
                name: user.name,
                email: user.email,
                userId: user.id,
                status: 'Ativo',
                // Default random matricula/pis for realism
                employeeId: `EMP${Math.floor(Math.random() * 1000)}`,
                pis: `${Math.floor(Math.random() * 10000000000)}`
            }
        });
        console.log(`👷 Collaborator ensured: ${collaborator.name}`);

        // Link to Company
        await prisma.collaboratorCompany.upsert({
            where: {
                collaboratorId_companyId: {
                    collaboratorId: collaborator.id,
                    companyId: company.id
                }
            },
            update: {},
            create: {
                collaboratorId: collaborator.id,
                companyId: company.id
            }
        }).catch(() => { });

        // Link to Group
        await prisma.collaboratorGroup.upsert({
            where: {
                collaboratorId_groupId: {
                    collaboratorId: collaborator.id,
                    groupId: group.id
                }
            },
            update: {},
            create: {
                collaboratorId: collaborator.id,
                groupId: group.id
            }
        }).catch(() => { });
    }

    console.log('✅ Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
