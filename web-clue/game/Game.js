const { ALL_CARDS } = require('./globals');
const Deduction = require('./Deduction');

class Game {
    constructor(gameId) {
        this.gameId = gameId;
        this.numberOfPlayers = 0;
        this.playerNames = [];
        this.cards = []; // Array of [playerName, cardName] pairs
        this.accusations = []; // Array of accusation objects
        this.turnOrder = [];
        this.gameReady = false;
    }
    
    // Convert from C++ setUpGame method
    setupGame(numberOfPlayers, playerNames, playerCards) {
        if (numberOfPlayers < 2) {
            throw new Error('Number of players must be at least 2');
        }
        
        this.numberOfPlayers = numberOfPlayers;
        this.playerNames = [...playerNames];
        this.turnOrder = [...playerNames]; // Use playerNames as default turn order
        
        // Validate player cards
        for (const card of playerCards) {
            if (!card.playerName || !card.cardName) {
                throw new Error('Invalid card format');
            }
            
            if (!ALL_CARDS.includes(card.cardName)) {
                throw new Error(`Invalid card name: ${card.cardName}`);
            }
            
            this.cards.push([card.playerName, card.cardName]);
        }
        
        this.gameReady = true;
        console.log(`Game ${this.gameId} setup complete with ${numberOfPlayers} players`);
    }
    
    // Set turn order
    setTurnOrder(turnOrder) {
        // Validate that all players are included
        for (const playerName of turnOrder) {
            if (!this.playerNames.includes(playerName)) {
                throw new Error(`Invalid player name in turn order: ${playerName}`);
            }
        }
        
        if (turnOrder.length !== this.playerNames.length) {
            throw new Error('Turn order must include all players');
        }
        
        this.turnOrder = [...turnOrder];
    }
    
    // Converts from C++ displayKnown method
    getKnownCards() {
        // Sort cards
        const sortedCards = [...this.cards].sort();
        return sortedCards.map((card, index) => ({
            id: index + 1,
            playerName: card[0],
            cardName: card[1]
        }));
    }
    
    // Convert from C++ accusation method - now receives structured data instead of console input
    addAccusation(accusationData) {
        const { accuser, suspect, weapon, room, playersInvolved, cardShown, shownCard } = accusationData;
        
        // Validate accuser
        if (!this.playerNames.includes(accuser)) {
            throw new Error(`Invalid accuser: ${accuser}`);
        }
        
        // Validate accusation cards
        if (!ALL_CARDS.includes(suspect) || !ALL_CARDS.includes(weapon) || !ALL_CARDS.includes(room)) {
            throw new Error('Invalid cards in accusation');
        }
        
        // Create accusation(same format as C++ version):
        // { { { accuser, person, weapon, place }, playersInvolved }, { cardShown, knownCard } }
        const accusation = {
            accusationDetails: [
                [accuser, suspect, weapon, room],
                playersInvolved || []
            ],
            result: {
                cardShown: cardShown || false,
                knownCard: shownCard || ""
            },
            timestamp: new Date().toISOString()
        };
        
        this.accusations.push(accusation);
        
        // If a card was shown, add it to known cards
        if (cardShown && shownCard && playersInvolved.length > 0) {
            // The last player in playersInvolved is the one who showed the card
            const cardHolder = playersInvolved[playersInvolved.length - 1];
            this.addKnownCard(cardHolder, shownCard);
        }
        
        return accusation;
    }
    
    // Convert from C++ deduce method
    performDeduction() {
        if (!this.gameReady) {
            throw new Error('Game not ready for deduction');
        }
        
        const deduction = new Deduction();
        const newDeductions = deduction.deduce(this.accusations, this.playerNames, this.cards);
        
        // Add any new deductions to our known cards
        for (const deduction of newDeductions) {
            if (!this.hasCard(deduction.playerName, deduction.cardName)) {
                this.cards.push([deduction.playerName, deduction.cardName]);
            }
        }
        
        return newDeductions;
    }
    
    // Convert from C++ showAccusations method
    getAccusations() {
        return this.accusations.map((accusation, index) => ({
            id: index + 1,
            accuser: accusation.accusationDetails[0][0],
            suspect: accusation.accusationDetails[0][1],
            weapon: accusation.accusationDetails[0][2],
            room: accusation.accusationDetails[0][3],
            playersInvolved: accusation.accusationDetails[1],
            cardShown: accusation.result.cardShown,
            shownCard: accusation.result.knownCard,
            timestamp: accusation.timestamp
        }));
    }
    
    // Convert from C++ addKnownCard method
    addKnownCard(playerName, cardName) {
        // Validate inputs
        if (!this.playerNames.includes(playerName) && playerName !== 'everyone') {
            throw new Error(`Invalid player name: ${playerName}`);
        }
        
        if (!ALL_CARDS.includes(cardName)) {
            throw new Error(`Invalid card name: ${cardName}`);
        }
        
        // Check if card is already known
        if (this.hasCard(playerName, cardName)) {
            return false; // Already known
        }
        
        this.cards.push([playerName, cardName]);
        return true; // New card added
    }
    
    // Helper method to check if a card is already known
    hasCard(playerName, cardName) {
        return this.cards.some(card => card[0] === playerName && card[1] === cardName);
    }
    
    // Get current game state for frontend
    getGameState() {
        return {
            gameId: this.gameId,
            numberOfPlayers: this.numberOfPlayers,
            playerNames: this.playerNames,
            knownCards: this.getKnownCards(),
            accusations: this.getAccusations(),
            turnOrder: this.turnOrder,
            gameReady: this.gameReady
        };
    }
    
    // Get suggestions for what cards might be in the solution
    getSuggestions() {
        const knownCardNames = this.cards.map(card => card[1]);
        const unknownCards = ALL_CARDS.filter(card => !knownCardNames.includes(card));
        
        return {
            possibleSuspects: unknownCards.filter(card => 
                ["green", "mustard", "peacock", "plum", "scarlett", "orchid"].includes(card)
            ),
            possibleWeapons: unknownCards.filter(card => 
                ["candlestick", "dagger", "lead pipe", "revolver", "rope", "wrench"].includes(card)
            ),
            possibleRooms: unknownCards.filter(card => 
                ["kitchen", "ballroom", "conservatory", "dining room", "billiard room",
                 "library", "lounge", "hall", "study"].includes(card)
            )
        };
    }
}

module.exports = Game;