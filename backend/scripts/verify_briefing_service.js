

import { createTemplate, listTemplates, submitBriefing } from '../src/services/briefing.service.js';
import { createCard } from '../src/services/card.service.js';
import { prisma } from '../src/config/database.js';

async function main() {
    try {
        console.log('--- Starting Service Layer Verification ---');

        // 1. Create Template
        console.log('1. Creating Template...');
        const template = await createTemplate({
            name: "Test Briefing " + Date.now(),
            description: "A test template",
            fields: [{ id: "q1", label: "Question 1", type: "text" }],
            isPublic: true
        });
        console.log('   -> Created Template:', template.id);

        // 2. List Templates
        console.log('2. Listing Templates...');
        const templates = await listTemplates();
        console.log('   -> Found', templates.length, 'templates');

        // 3. Create a Dummy Card (needed for submission)
        console.log('3. Creating Dummy Card...');
        const user = await prisma.user.findFirst();
        const board = await prisma.board.findFirst();
        const column = await prisma.column.findFirst({ where: { boardId: board.id } });

        if (!user || !board || !column) {
            throw new Error('Missing prerequisites (User, Board, or Column)');
        }

        const card = await createCard(board.id, column.id, {
            title: "Briefing Test Card",
            briefingTemplateId: template.id
        });
        console.log('   -> Created Card:', card.id);

        // 4. Submit Briefing
        console.log('4. Submitting Briefing...');
        const submission = { q1: "My Answer" };
        const updatedCard = await submitBriefing(card.id, submission, user.id);
        console.log('   -> Submitted. Stored Data:', updatedCard.briefingData);

        if (updatedCard.briefingData.includes("My Answer")) {
            console.log('SUCCESS: Briefing flow verified!');
        } else {
            console.error('FAILURE: Data mismatch');
        }

        // Cleanup
        await prisma.briefingTemplate.delete({ where: { id: template.id } });
        await prisma.card.delete({ where: { id: card.id } });

    } catch (e) {
        console.error('VERIFICATION FAILED:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
