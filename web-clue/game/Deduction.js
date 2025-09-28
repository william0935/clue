const Facts = require('./Facts');

class Deduction {
    constructor() {
        this.facts = null;
    }
    
    deduce(accusations, playerNames, cards) {
        console.log('=== DEDUCTION DEBUG ===');
        console.log('accusations:', JSON.stringify(accusations, null, 2));
        console.log('playerNames:', playerNames);
        console.log('cards:', cards);
        
        // Initialize facts with player names
        this.facts = new Facts(playerNames);
        
        // Add facts about cards we already know/have
        for (const card of cards) {
            const temp = [[card[0], card[1]]];
            this.facts.addFact(temp);
        }
        
        // Process each accusation to add constraints
        for (const accusation of accusations) {
            console.log('Processing accusation:', accusation);
            this.processAccusation(accusation, playerNames);
        }
        
        // Perform elimination and return new deductions
        const newDeductions = this.facts.eliminate(cards, playerNames);
        console.log('newDeductions:', newDeductions);
        console.log('=== END DEDUCTION DEBUG ===');
        return newDeductions;
    }
    
    processAccusation(accusation, playerNames) {
        // Extract accusation info
        const accusationDetails = accusation.accusationDetails[0];
        const accuser = accusationDetails[0];
        const suspect = accusationDetails[1];
        const weapon = accusationDetails[2];
        const room = accusationDetails[3];
        const playersInvolved = accusation.accusationDetails[1];
        const cardShown = accusation.result.cardShown;
        const knownCard = accusation.result.knownCard;
        
        const numPlayersInvolved = playersInvolved.length;
        
        // Add fact about players who had something
        if (cardShown) {
            const playerWithCard = playersInvolved[numPlayersInvolved - 1];
            let possibilities = [];
            
            if (accuser === playerNames[0]) {
                // If we are the accuser, we know exactly which card was shown
                possibilities.push([playerWithCard, knownCard]);
            } else {
                // We don't know which specific card, but we know they have one of these
                possibilities.push([playerWithCard, suspect]);
                possibilities.push([playerWithCard, weapon]);
                possibilities.push([playerWithCard, room]);
            }
            
            this.facts.addFact(possibilities);
        }
        
        // Add facts about players with nothing
        let iterations = numPlayersInvolved - 1;
        let addEnvelope = false;
        
        if (!cardShown) {
            iterations++;
            addEnvelope = true;
        }
        
        for (let i = 0; i < iterations; i++) {
            const currentPlayer = playersInvolved[i];
            
            if (addEnvelope) {
                // Nobody showed the card, so only the accuser or envelope could have it
                const suspectPossibilities = [
                    ["envelope", suspect],
                    [accuser, suspect]
                ];
                const weaponPossibilities = [
                    ["envelope", weapon],
                    [accuser, weapon]
                ];
                const roomPossibilities = [
                    ["envelope", room],
                    [accuser, room]
                ];
                
                this.facts.addFact(suspectPossibilities);
                this.facts.addFact(weaponPossibilities);
                this.facts.addFact(roomPossibilities);
            } else {
                // This player doesn't have any of the cards, so other players or envelope must have them
                const suspectPossibilities = [];
                const weaponPossibilities = [];
                const roomPossibilities = [];
                
                for (const player of playerNames) {
                    if (player !== currentPlayer) {
                        suspectPossibilities.push([player, suspect]);
                        weaponPossibilities.push([player, weapon]);
                        roomPossibilities.push([player, room]);
                    }
                }
                
                // Account for envelope having the cards as well
                suspectPossibilities.push(["envelope", suspect]);
                weaponPossibilities.push(["envelope", weapon]);
                roomPossibilities.push(["envelope", room]);
                
                this.facts.addFact(suspectPossibilities);
                this.facts.addFact(weaponPossibilities);
                this.facts.addFact(roomPossibilities);
            }
        }
    }
}

module.exports = Deduction;