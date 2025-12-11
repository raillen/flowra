import { PrismaClient } from '@prisma/client';
import { createCard, updateCard } from '../src/services/card.service.js';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting Custom Fields Verification...');
    const results = { steps: [], success: false };

    try {
        // 1. Get a user
        const user = await prisma.user.findFirst();
        if (!user) throw new Error('No user found');
        results.steps.push({ step: 'GetUser', status: 'Success' });

        // 2. Get or Create a Board
        let board = await prisma.board.findFirst();
        if (!board) throw new Error('No board found');
        results.steps.push({ step: 'GetBoard', status: 'Success', boardId: board.id });

        // 3. Define Custom Field
        const customFieldId = "test_field_" + Date.now();
        results.steps.push({ step: 'DefineField', id: customFieldId });

        // 4. Get a column
        const column = await prisma.column.findFirst({ where: { boardId: board.id } });
        if (!column) throw new Error('No column found');

        // 5. Create a Card with Custom Field Value
        const cardData = {
            title: "Test Card with Custom Field " + Date.now(),
            customFields: {
                [customFieldId]: "Initial Value"
            }
        };

        const createdCard = await createCard(board.id, column.id, cardData);

        let createSuccess = false;
        // Check if customFields is present and correct
        // Note: Prisma might return it as object if type is Json, or we need to handle it.
        // In our service we parse it back to object.
        let createdCustomFields = createdCard.customFields;
        if (typeof createdCustomFields === 'string') {
            try { createdCustomFields = JSON.parse(createdCustomFields); } catch (e) { }
        }

        if (createdCustomFields && createdCustomFields[customFieldId] === "Initial Value") {
            createSuccess = true;
        }
        results.steps.push({ step: 'CreateCard', status: createSuccess ? 'Success' : 'Failure', data: createdCustomFields });

        // 6. Update the Card
        const updateData = {
            customFields: {
                [customFieldId]: "Updated Value"
            }
        };

        const updatedCard = await updateCard(board.id, createdCard.id, updateData);

        let updatedCustomFields = updatedCard.customFields;
        if (typeof updatedCustomFields === 'string') {
            try { updatedCustomFields = JSON.parse(updatedCustomFields); } catch (e) { }
        }

        let updateSuccess = false;
        if (updatedCustomFields && updatedCustomFields[customFieldId] === "Updated Value") {
            updateSuccess = true;
        }
        results.steps.push({ step: 'UpdateCard', status: updateSuccess ? 'Success' : 'Failure', data: updatedCustomFields });

        // Cleanup
        await prisma.card.delete({ where: { id: createdCard.id } });
        results.steps.push({ step: 'Cleanup', status: 'Success' });
        results.success = createSuccess && updateSuccess;

    } catch (error) {
        console.error(error);
        results.error = error.message;
        results.success = false;
    } finally {
        fs.writeFileSync('custom_fields_result.json', JSON.stringify(results, null, 2));
        console.log('Results written to custom_fields_result.json');
        await prisma.$disconnect();
    }
}

main().catch(console.error);
