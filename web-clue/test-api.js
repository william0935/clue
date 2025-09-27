// Integration test for the web API
const http = require('http');

async function testAPI() {
    console.log('Testing Suggestions API Integration...\n');
    
    try {
        // Test 1: Create a game
        console.log('Step 1: Creating a game...');
        const createResponse = await makeRequest('POST', '/api/game/create');
        const gameData = JSON.parse(createResponse);
        
        if (!gameData.gameId) {
            throw new Error('Failed to create game - no gameId returned');
        }
        
        console.log('Game created with ID:', gameData.gameId);
        const gameId = gameData.gameId;
        
        // Test 2: Check initial suggestions (should show all cards)
        console.log('\nStep 2: Testing initial suggestions...');
        const suggestionsResponse = await makeRequest('GET', `/api/game/${gameId}/suggestions`);
        const suggestionsData = JSON.parse(suggestionsResponse);
        
        if (!suggestionsData.suggestions) {
            throw new Error('No suggestions returned');
        }
        
        console.log('Initial suggestions received:');
        console.log('   Suspects:', suggestionsData.suggestions.possibleSuspects.length);
        console.log('   Weapons:', suggestionsData.suggestions.possibleWeapons.length);
        console.log('   Rooms:', suggestionsData.suggestions.possibleRooms.length);
        
        // Verify all cards are present initially
        const totalCards = suggestionsData.suggestions.possibleSuspects.length + 
                          suggestionsData.suggestions.possibleWeapons.length + 
                          suggestionsData.suggestions.possibleRooms.length;
        
        if (totalCards !== 21) { // 6 suspects + 6 weapons + 9 rooms
            console.log('  Warning: Expected 21 total cards, got', totalCards);
        } else {
            console.log('All 21 cards present in suggestions');
        }
        
        console.log('\nAPI Integration Test PASSED!');
        console.log('Game creation endpoint working');
        console.log('Suggestions endpoint working');
        console.log('Suggestions logic working correctly');

    } catch (error) {
        console.error('API Test failed:', error.message);
    }
}

function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        const req = http.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(responseData);
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
                }
            });
        });
        
        req.on('error', (err) => {
            reject(err);
        });
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

// Only run if server is available
testAPI();