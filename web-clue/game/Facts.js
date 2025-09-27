const { ALL_CARDS } = require('./globals');

class Facts {
    constructor(turnOrder = []) {
        this.myFacts = [];
        
        // Initialize facts - every card should have the possibility of being with every person
        for (const card of ALL_CARDS) {
            const possibilities = [];
            for (const person of turnOrder) {
                possibilities.push({ player: person, card: card });
            }
            possibilities.push({ player: "envelope", card: card });
            this.myFacts.push(possibilities);
        }
    }
    
    addFact(possibilities) {
        // Convert from array of [player, card] pairs to objects
        const factPossibilities = possibilities.map(pair => ({
            player: pair[0],
            card: pair[1]
        }));
        this.myFacts.push(factPossibilities);
    }
    
    eliminate(cards, playerNames) {
        const initialCopy = [...cards];
        const confirmed = [...cards];
        let changed = true;
        
        while (changed) {
            changed = false;
            
            // Collect any new unit clauses as confirmed facts
            for (const clause of this.myFacts) {
                if (clause.length === 1) {
                    const factArray = [clause[0].player, clause[0].card];
                    const exists = confirmed.some(card => 
                        card[0] === factArray[0] && card[1] === factArray[1]
                    );
                    
                    if (!exists) {
                        confirmed.push(factArray);
                        cards.push(factArray);
                        changed = true;
                    }
                }
            }
            
            // Check for players where we know all their cards
            const numCardsPerPlayer = Math.floor(18 / playerNames.length);
            const playerCardCounts = new Array(playerNames.length).fill(0);
            
            for (const fact of confirmed) {
                const playerIndex = playerNames.indexOf(fact[0]);
                if (playerIndex !== -1) {
                    playerCardCounts[playerIndex]++;
                }
            }
            
            for (let i = 0; i < playerCardCounts.length; i++) {
                if (numCardsPerPlayer === playerCardCounts[i]) {
                    // Eliminate anything that isn't part of confirmed with their name
                    for (const clause of this.myFacts) {
                        const sizeBefore = clause.length;
                        
                        for (let j = clause.length - 1; j >= 0; j--) {
                            const possibility = clause[j];
                            
                            if (possibility.player === playerNames[i]) {
                                const isConfirmed = confirmed.some(card => 
                                    card[0] === possibility.player && card[1] === possibility.card
                                );
                                
                                if (!isConfirmed) {
                                    clause.splice(j, 1);
                                }
                            }
                        }
                        
                        if (clause.length !== sizeBefore) {
                            changed = true;
                        }
                    }
                }
            }
            
            // Process each confirmed fact
            for (const fact of confirmed) {
                const playerName = fact[0];
                const cardName = fact[1];
                const target = { player: playerName, card: cardName };
                
                // Remove clauses that contain this fact (they're satisfied)
                for (let i = this.myFacts.length - 1; i >= 0; i--) {
                    const clause = this.myFacts[i];
                    
                    if (clause.some(p => p.player === target.player && p.card === target.card)) {
                        if (clause.length > 1) {
                            this.myFacts.splice(i, 1);
                            changed = true;
                        }
                    }
                }
                
                // Remove other players having this same card from all clauses
                for (const clause of this.myFacts) {
                    const sizeBefore = clause.length;
                    
                    for (let j = clause.length - 1; j >= 0; j--) {
                        const possibility = clause[j];
                        
                        if (possibility.card === cardName && possibility.player !== playerName) {
                            clause.splice(j, 1);
                        }
                    }
                    
                    if (clause.length !== sizeBefore) {
                        changed = true;
                    }
                }
            }
        }
        
        // Return newly discovered cards
        const newDeductions = [];
        for (const card of cards) {
            const inInitial = initialCopy.some(initialCard => 
                initialCard[0] === card[0] && initialCard[1] === card[1]
            );
            
            if (!inInitial) {
                newDeductions.push({
                    playerName: card[0],
                    cardName: card[1],
                    message: `Discovered ${card[0]} has ${card[1]}`
                });
            }
        }
        
        return newDeductions;
    }
}

module.exports = Facts;