// Test the card selection logic
const fs = require('fs');

console.log('Testing Card Selection Logic...\n');

// Simulate the card selection process
const allCards = [
    // Suspects
    'green', 'mustard', 'peacock', 'plum', 'scarlett', 'orchid',
    // Weapons
    'candlestick', 'dagger', 'lead pipe', 'revolver', 'rope', 'wrench',
    // Rooms
    'kitchen', 'ballroom', 'conservatory', 'dining room', 'billiard room',
    'library', 'lounge', 'hall', 'study'
];

console.log('Total cards available:', allCards.length);

// Simulate 3 players (6 cards each)
const selectedCards = ['green', 'rope', 'kitchen', 'dagger', 'ballroom'];
const publicCards = ['study'];

console.log('Selected player cards:', selectedCards);
console.log('Public cards:', publicCards);

const unavailableCards = [...selectedCards, ...publicCards];
const availableCards = allCards.filter(card => !unavailableCards.includes(card));

console.log('Unavailable cards:', unavailableCards);
console.log('Still available cards:', availableCards);
console.log('Available count:', availableCards.length, '/ Total:', allCards.length);

if (availableCards.length === allCards.length - unavailableCards.length) {
    console.log('\nCard filtering logic works correctly!');
} else {
    console.log('\nCard filtering logic has issues!');
}
