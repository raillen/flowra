
const API_URL = 'http://localhost:3000/api';
let authToken = null;
let projectId = null;
let boardId = null;
let columnId = null;
let cardIds = [];

async function post(endpoint, body, headers = {}) {
    const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) {
        console.error(`❌ POST ${endpoint} failed:`, JSON.stringify(data, null, 2));
        throw new Error(data.message || 'Request failed');
    }
    // console.log(`DEBUG POST ${endpoint} response:`, JSON.stringify(data, null, 2));
    return data;
}

async function get(endpoint, headers = {}) {
    const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', ...headers }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
}

async function patch(endpoint, body, headers = {}) {
    const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
}

async function login() {
    try {
        const data = await post('/auth/login', {
            email: 'admin@kbsys.com',
            password: 'admin123'
        });
        authToken = data.data.token;
        console.log('✅ Login successful');
    } catch (e) {
        console.log('⚠️ Could not login as admin, trying to register a tmp user...');
        await registerTmpUser();
    }
}

async function registerTmpUser() {
    const timestamp = Date.now();
    const data = await post('/auth/register', {
        name: `Reorder Tester`,
        email: `reorder${timestamp}@test.com`,
        password: 'password123',
        companyName: `Reorder Corp`
    });
    authToken = data.data.token;
    console.log('✅ Temporary user registered and logged in');
}

async function setupBoard() {
    const headers = { Authorization: `Bearer ${authToken}` };

    // 1. Create Project
    const projData = await post('/projects', {
        name: `Sort Test Project ${Date.now()}`,
        description: 'Temp project'
    }, headers);
    projectId = projData.data.id;
    console.log('✅ Project created:', projectId);

    // 2. Create Board
    const boardData = await post(`/projects/${projectId}/boards`, {
        name: 'Sort Board'
    }, headers);
    boardId = boardData.data.id;
    console.log('✅ Board created:', boardId);

    // 3. Create Column
    const colData = await post(`/projects/${projectId}/boards/${boardId}/columns`, {
        title: 'To Do',
        order: 0
    }, headers);
    columnId = colData.data.id;
    console.log('✅ Column created:', columnId);
}

async function createCards() {
    const headers = { Authorization: `Bearer ${authToken}` };
    cardIds = [];

    for (let i = 1; i <= 3; i++) {
        const cardData = await post(`/projects/${projectId}/boards/${boardId}/columns/${columnId}/cards`, {
            title: `Card ${i}`,
            priority: 'media'
        }, headers);
        cardIds.push(cardData.data.id);
        console.log(`✅ Card ${i} created (Order: ${cardData.data.order})`);
    }
}

async function testReordering() {
    const headers = { Authorization: `Bearer ${authToken}` };

    console.log('\n--- Testing Reorder ---');
    // Card 1 is at index 0 (order 1?). Assuming 1-based or 0-based.
    // DB usually uses whatever was passed or auto-increment.

    const cardToMove = cardIds[0]; // Card 1
    const newOrder = 2; // Move to position 2 (which should make it 3rd item if 0-based, or 2nd if 1-based, let's see)

    console.log(`Moving Card 1 to order ${newOrder}...`);

    await patch(`/projects/${projectId}/boards/${boardId}/cards/${cardToMove}/move`, {
        columnId: columnId,
        order: newOrder
    }, headers);

    console.log('✅ Move request sent');

    // Verify
    const cardsData = await get(`/projects/${projectId}/boards/${boardId}/cards`, headers);
    const cards = cardsData.data.filter(c => c.columnId === columnId).sort((a, b) => a.order - b.order);

    console.log('\nNew Card Order:');
    cards.forEach(c => console.log(`- ${c.title}: Order ${c.order}`));

    const card1 = cards.find(c => c.title === 'Card 1');
    if (card1.order === 2) {
        console.log('\n✅ REORDER SUCCESS: Card 1 is now at index 2');
    } else {
        console.error(`\n❌ REORDER FAILED: Card 1 is at order ${card1.order}, expected 2`);
        process.exit(1);
    }
}

async function run() {
    try {
        await login();
        await setupBoard();
        await createCards();
        await testReordering();
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

run();
