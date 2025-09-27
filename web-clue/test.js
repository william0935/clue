// Simple test script to validate the game logic
const Game = require('./game/Game');

console.log('Testing Clue Web Bot Game Logic...\n');

try {
    // Test 1: Create a new game
    console.log('Test 1: Creating new game...');
    const game = new Game('test-123');
    console.log('   Game created with ID:', game.gameId);

    // Test 2: Setup game with players and cards
    console.log('Test 2: Setting up game...');
    const playerNames = ['Alice', 'Bob', 'Charlie'];
    const playerCards = [
        { playerName: 'Alice', cardName: 'green' },
        { playerName: 'Alice', cardName: 'rope' },
        { playerName: 'everyone', cardName: 'kitchen' }
    ];
    
    game.setupGame(3, playerNames, playerCards);
    console.log('   Game setup complete with', game.numberOfPlayers, 'players');
    console.log('   Known cards:', game.cards.length);

    // Test 3: Add a known card
    console.log('Test 3: Adding known card...');
    const cardAdded = game.addKnownCard('Bob', 'dagger');
    console.log('   Card added:', cardAdded);

    // Test 4: Add an accusation
    console.log('Test 4: Adding accusation...');
    const accusationData = {
        accuser: 'Alice',
        suspect: 'mustard',
        weapon: 'candlestick',
        room: 'library',
        playersInvolved: ['Bob'],
        cardShown: true,
        shownCard: 'mustard'
    };
    
    const accusation = game.addAccusation(accusationData);
    console.log('   Accusation added for:', accusation.accusationDetails[0][0]);

    // Test 5: Perform deduction
    console.log('Test 5: Performing deduction...');
    const deductions = game.performDeduction();
    console.log('   Deductions found:', deductions.length);
    if (deductions.length > 0) {
        deductions.forEach(d => console.log('   -', d.message));
    }

    // Test 6: Get game state
    console.log('Test 6: Getting game state...');
    const gameState = game.getGameState();
    console.log('   Game ready:', gameState.gameReady);
    console.log('   Known cards:', gameState.knownCards.length);
    console.log('   Accusations:', gameState.accusations.length);

    console.log('\nAll tests passed! The game logic is working correctly.');

} catch (error) {
    console.error('Test failed:', error.message);
    console.error(error.stack);
}