// Test the complete suggestions system
const Game = require('./game/Game');

console.log('Testing Complete Suggestions System...\n');

try {
    // Create a game with some known cards
    const game = new Game('test-suggestions');
    
    const playerNames = ['Alice', 'Bob', 'Charlie'];
    const playerCards = [
        { playerName: 'Alice', cardName: 'green' },      // Alice has Mr. Green
        { playerName: 'Alice', cardName: 'rope' },       // Alice has Rope  
        { playerName: 'Bob', cardName: 'kitchen' },      // Bob has Kitchen
        { playerName: 'everyone', cardName: 'ballroom' } // Everyone knows Ballroom
    ];
    
    game.setupGame(3, playerNames, playerCards);
    console.log('Game setup with known cards:');
    game.cards.forEach(card => console.log(`   - ${card[0]}: ${card[1]}`));
    
    // Test getSuggestions method
    const suggestions = game.getSuggestions();
    
    console.log('\nSuggestions Test Results:');
    console.log('Possible Suspects:', suggestions.possibleSuspects);
    console.log('Possible Weapons:', suggestions.possibleWeapons);  
    console.log('Possible Rooms:', suggestions.possibleRooms);
    
    // Verify logic is correct
    const hasGreen = suggestions.possibleSuspects.includes('green');
    const hasRope = suggestions.possibleWeapons.includes('rope');
    const hasKitchen = suggestions.possibleRooms.includes('kitchen');
    const hasBallroom = suggestions.possibleRooms.includes('ballroom');
    
    console.log('\nLogic Verification:');
    console.log('   Green in suspects (should be false):', hasGreen);
    console.log('   Rope in weapons (should be false):', hasRope);
    console.log('   Kitchen in rooms (should be false):', hasKitchen);
    console.log('   Ballroom in rooms (should be false):', hasBallroom);
    
    const allCorrect = !hasGreen && !hasRope && !hasKitchen && !hasBallroom;
    
    if (allCorrect) {
        console.log('\nAll logic tests PASSED! Suggestions system working correctly!');
    } else {
        console.log('\nSome logic tests failed. Check the getSuggestions method.');
    }
    
    // Count remaining cards
    const totalRemaining = suggestions.possibleSuspects.length + 
                          suggestions.possibleWeapons.length + 
                          suggestions.possibleRooms.length;
                          
    console.log(`\nSummary: ${game.cards.length} known cards, ${totalRemaining} remaining for solution`);
    
} catch (error) {
    console.error('Test failed:', error.message);
    console.error(error.stack);
}