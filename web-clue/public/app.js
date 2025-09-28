// Clue Web Bot Client-side JavaScript
class ClueWebBot {
    constructor() {
        this.socket = null;
        this.gameId = null;
        this.gameState = null;
        this.playerNames = [];
        this.publicCards = [];
        
        this.init();
    }
    
    init() {
        this.setupSocketConnection();
        this.setupEventListeners();
        this.populateCardSelects();
    }
    
    setupSocketConnection() {
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.updateConnectionStatus(true);
        });
        
        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.updateConnectionStatus(false);
        });
        
        this.socket.on('gameSetup', (gameState) => {
            console.log('Game setup complete', gameState);
            console.log('gameState.playerNames:', gameState.playerNames);
            this.gameState = gameState;
            this.playerNames = gameState.playerNames || this.playerNames;
            console.log('this.playerNames after assignment:', this.playerNames);
            this.showGameInterface();
        });
        
        this.socket.on('accusationAdded', (data) => {
            console.log('Accusation added', data);
            this.gameState = data.gameState;
            this.updateGameSuggestions();
            this.showNotification('Accusation added successfully!');
        });
        
        this.socket.on('deductionResult', (data) => {
            console.log('Deduction results', data);
            this.gameState = data.gameState;
            this.showDeductionResults(data.deductions);
            this.updateGameSuggestions();
        });
        
        this.socket.on('cardAdded', (data) => {
            console.log('Card added', data);
            this.gameState = data.gameState;
            this.updateGameSuggestions();
            this.showNotification(`Added: ${data.playerName} has ${data.cardName}`);
        });
        
        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
            this.showNotification('Error: ' + error, 'error');
        });
    }
    
    setupEventListeners() {
        // Game setup events
        document.getElementById('createGameBtn').addEventListener('click', () => this.createGame());
        document.getElementById('joinGameBtn').addEventListener('click', () => this.joinGame());
        document.getElementById('copyGameIdBtn').addEventListener('click', () => this.copyGameId());
        
        // Game configuration events
        document.getElementById('numberOfPlayers').addEventListener('change', (e) => this.updatePlayerInputs(e.target.value));
        document.getElementById('gameConfigForm').addEventListener('submit', (e) => this.submitGameConfig(e));
        document.getElementById('addPublicCardBtn').addEventListener('click', () => this.addPublicCard());
        
        // Game interface events
        document.getElementById('showKnownBtn').addEventListener('click', () => this.showKnownCards());
        document.getElementById('showEnvelopeBtn').addEventListener('click', () => this.showEnvelopeCards());
        document.getElementById('addAccusationBtn').addEventListener('click', () => this.showAccusationForm());
        document.getElementById('deduceBtn').addEventListener('click', () => this.performDeduction());
        document.getElementById('addKnownCardBtn').addEventListener('click', () => this.showKnownCardForm());
        document.getElementById('viewAccusationsBtn').addEventListener('click', () => this.showAccusations());
        document.getElementById('viewSuggestionsBtn').addEventListener('click', () => this.showSuggestions());
        document.getElementById('copyGameIdBtn').addEventListener('click', () => this.copyGameId());
        
        // Form events
        document.getElementById('accusationFormData').addEventListener('submit', (e) => this.submitAccusation(e));
        document.getElementById('knownCardFormData').addEventListener('submit', (e) => this.submitKnownCard(e));
        document.getElementById('cardWasShown').addEventListener('change', (e) => this.toggleCardShownSection(e.target.checked));
        
        // Modal close events
        document.querySelectorAll('.close-modal, .close-panel').forEach(btn => {
            btn.addEventListener('click', (e) => this.closeModal(e.target));
        });
    }
    
    populateCardSelects() {
        const allCards = [
            // Suspects
            { value: 'green', text: 'Mr. Green' },
            { value: 'mustard', text: 'Colonel Mustard' },
            { value: 'peacock', text: 'Mrs. Peacock' },
            { value: 'plum', text: 'Professor Plum' },
            { value: 'scarlett', text: 'Miss Scarlett' },
            { value: 'orchid', text: 'Dr. Orchid' },

            // Weapons
            { value: 'candlestick', text: 'Candlestick' },
            { value: 'dagger', text: 'Dagger' },
            { value: 'lead pipe', text: 'Lead Pipe' },
            { value: 'revolver', text: 'Revolver' },
            { value: 'rope', text: 'Rope' },
            { value: 'wrench', text: 'Wrench' },

            // Rooms
            { value: 'kitchen', text: 'Kitchen' },
            { value: 'ballroom', text: 'Ballroom' },
            { value: 'conservatory', text: 'Conservatory' },
            { value: 'dining room', text: 'Dining Room' },
            { value: 'billiard room', text: 'Billiard Room' },
            { value: 'library', text: 'Library' },
            { value: 'lounge', text: 'Lounge' },
            { value: 'hall', text: 'Hall' },
            { value: 'study', text: 'Study' }
        ];
        
        // Populate card selects
        const cardSelects = ['publicCardSelect', 'shownCard', 'cardName'];
        cardSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                allCards.forEach(card => {
                    const option = document.createElement('option');
                    option.value = card.value;
                    option.textContent = card.text;
                    select.appendChild(option);
                });
            }
        });
    }
    
    updateConnectionStatus(connected) {
        const indicator = document.getElementById('statusIndicator');
        const text = document.getElementById('statusText');
        
        if (connected) {
            indicator.className = 'status-indicator connected';
            text.textContent = 'Connected';
        } else {
            indicator.className = 'status-indicator disconnected';
            text.textContent = 'Disconnected';
        }
    }
    
    async createGame() {
        try {
            const response = await fetch('/api/game/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            
            this.gameId = data.gameId;
            this.socket.emit('joinGame', this.gameId);
            
            document.getElementById('gameIdText').textContent = this.gameId;
            document.getElementById('gameIdDisplay').style.display = 'block';
            document.getElementById('gameConfig').style.display = 'block';
            
            this.showNotification('Game created successfully!');
        } catch (error) {
            console.error('Error creating game:', error);
            this.showNotification('Error creating game', 'error');
        }
    }
    
    joinGame() {
        const gameId = document.getElementById('joinGameId').value.trim();
        if (!gameId) {
            this.showNotification('Please enter a game ID', 'error');
            return;
        }
        
        this.gameId = gameId;
        this.socket.emit('joinGame', gameId);
        
        document.getElementById('gameConfig').style.display = 'block';
        this.showNotification('Joined game: ' + gameId);
    }
    
    copyGameId() {
        navigator.clipboard.writeText(this.gameId).then(() => {
            this.showNotification('Game ID copied to clipboard!');
        });
    }
    
    updatePlayerInputs(numberOfPlayers) {
        const count = parseInt(numberOfPlayers);
        if (!count) return;
        
        // Update player names inputs
        const playerNamesSection = document.getElementById('playerNamesSection');
        const playerNamesInputs = document.getElementById('playerNamesInputs');
        
        playerNamesInputs.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const div = document.createElement('div');
            div.className = 'player-input-group';
            div.innerHTML = `
                <label>Player ${i + 1} ${i === 0 ? '(You)' : ''}:</label>
                <input type="text" name="player${i}" required placeholder="Enter player name">
            `;
            playerNamesInputs.appendChild(div);
        }
        
        playerNamesSection.style.display = 'block';
        
        // Update player cards inputs
        const cardsPerPlayer = Math.floor(18 / count);
        const playerCardsSection = document.getElementById('playerCardsSection');
        const playerCardsInputs = document.getElementById('playerCardsInputs');
        
        playerCardsInputs.innerHTML = '';
        for (let i = 0; i < cardsPerPlayer; i++) {
            const div = document.createElement('div');
            div.className = 'card-input-group';
            div.innerHTML = `
                <label>Your Card ${i + 1}:</label>
                <select name="card${i}" data-card-index="${i}" required>
                    <option value="">Select a card...</option>
                </select>
            `;
            playerCardsInputs.appendChild(div);
            
            // Populate this select with all cards
            const select = div.querySelector('select');
            this.populateCardSelect(select);
            
            // Add change event listener to update other selects
            select.addEventListener('change', () => this.updateCardSelections());
        }
        
        playerCardsSection.style.display = 'block';
        document.getElementById('publicCardsSection').style.display = 'block';
        
        // Initialize the card selections update
        this.updateCardSelections();
    }
    
    populateCardSelect(select) {
        const allCards = [
            // Suspects
            'green', 'mustard', 'peacock', 'plum', 'scarlett', 'orchid',

            // Weapons
            'candlestick', 'dagger', 'lead pipe', 'revolver', 'rope', 'wrench',

            // Rooms
            'kitchen', 'ballroom', 'conservatory', 'dining room', 'billiard room',
            'library', 'lounge', 'hall', 'study'
        ];
        
        allCards.forEach(card => {
            const option = document.createElement('option');
            option.value = card;
            option.textContent = this.capitalizeCard(card);
            select.appendChild(option);
        });
    }
    
    capitalizeCard(card) {
        return card.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
    
    updateCardSelections() {
        // Only update card selects within the player cards inputs section
        // This prevents interfering with player selects in other forms
        const playerCardsContainer = document.getElementById('playerCardsInputs');
        if (!playerCardsContainer) return;
        
        // Get all currently selected cards from player card inputs
        const selectedCards = [];
        const cardSelects = playerCardsContainer.querySelectorAll('select[name^="card"]');
        
        cardSelects.forEach(select => {
            if (select.value) {
                selectedCards.push(select.value);
            }
        });
        
        // Add public cards to the selected list
        selectedCards.push(...this.publicCards);
        
        // Update each card select to remove already selected options
        cardSelects.forEach(select => {
            const currentValue = select.value;
            const currentIndex = select.getAttribute('data-card-index');
            
            // Clear and repopulate
            select.innerHTML = '<option value="">Select a card...</option>';
            
            // Get all cards
            const allCards = [
                // Suspects
                'green', 'mustard', 'peacock', 'plum', 'scarlett', 'orchid',
                // Weapons
                'candlestick', 'dagger', 'lead pipe', 'revolver', 'rope', 'wrench',
                // Rooms
                'kitchen', 'ballroom', 'conservatory', 'dining room', 'billiard room',
                'library', 'lounge', 'hall', 'study'
            ];
            
            // Add options for cards that aren't selected elsewhere
            allCards.forEach(card => {
                // Show card if it's not selected, or if it's the current value of this select
                if (!selectedCards.includes(card) || card === currentValue) {
                    const option = document.createElement('option');
                    option.value = card;
                    option.textContent = this.capitalizeCard(card);
                    select.appendChild(option);
                }
            });
            
            // Restore the current selection
            if (currentValue) {
                select.value = currentValue;
            }
        });
        
        // Update cards remaining info
        this.updateCardsRemainingInfo(selectedCards.length);
        
        // Update the public card select as well
        this.updatePublicCardSelect();
    }
    
    updateCardsRemainingInfo(selectedCount) {
        // Find or create the info display
        let infoDiv = document.getElementById('cardsRemainingInfo');
        if (!infoDiv) {
            infoDiv = document.createElement('div');
            infoDiv.id = 'cardsRemainingInfo';
            infoDiv.className = 'card-selection-info';
            
            const playerCardsSection = document.getElementById('playerCardsSection');
            if (playerCardsSection) {
                playerCardsSection.appendChild(infoDiv);
            }
        }
        
        const totalCards = 21;
        const remainingCards = totalCards - selectedCount;
        
        if (selectedCount === 0) {
            infoDiv.textContent = `${totalCards} cards available to select`;
            infoDiv.style.color = '#6b7280';
        } else if (remainingCards > 5) {
            infoDiv.textContent = `${remainingCards} cards remaining (${selectedCount} selected)`;
            infoDiv.style.color = '#059669';
        } else if (remainingCards > 2) {
            infoDiv.textContent = `Only ${remainingCards} cards remaining (${selectedCount} selected)`;
            infoDiv.style.color = '#d97706';
        } else if (remainingCards > 0) {
            infoDiv.textContent = `Just ${remainingCards} cards left! (${selectedCount} selected)`;
            infoDiv.style.color = '#dc2626';
        } else {
            infoDiv.textContent = `All cards have been selected!`;
            infoDiv.style.color = '#7c3aed';
        }
    }
    
    updatePublicCardSelect() {
        const publicCardSelect = document.getElementById('publicCardSelect');
        if (!publicCardSelect) return;
        
        // Only get selected cards from the player cards container
        const selectedCards = [];
        const playerCardsContainer = document.getElementById('playerCardsInputs');
        if (playerCardsContainer) {
            const cardSelects = playerCardsContainer.querySelectorAll('select[name^="card"]');
            
            cardSelects.forEach(select => {
                if (select.value) {
                    selectedCards.push(select.value);
                }
            });
        }
        
        // Add already added public cards
        selectedCards.push(...this.publicCards);
        
        const currentValue = publicCardSelect.value;
        publicCardSelect.innerHTML = '<option value="">Select a card to add...</option>';
        
        // Get all cards
        const allCards = [
            'green', 'mustard', 'peacock', 'plum', 'scarlett', 'orchid',
            'candlestick', 'dagger', 'lead pipe', 'revolver', 'rope', 'wrench',
            'kitchen', 'ballroom', 'conservatory', 'dining room', 'billiard room',
            'library', 'lounge', 'hall', 'study'
        ];
        
        // Add only unselected cards
        allCards.forEach(card => {
            if (!selectedCards.includes(card)) {
                const option = document.createElement('option');
                option.value = card;
                option.textContent = this.capitalizeCard(card);
                publicCardSelect.appendChild(option);
            }
        });
        
        // Try to restore current value if it's still valid
        if (currentValue && !selectedCards.includes(currentValue)) {
            publicCardSelect.value = currentValue;
        }
    }
    
    addPublicCard() {
        const select = document.getElementById('publicCardSelect');
        const cardValue = select.value;
        
        if (!cardValue) return;
        
        // Check if already added
        if (this.publicCards.includes(cardValue)) {
            this.showNotification('Card already added', 'error');
            return;
        }
        
        this.publicCards.push(cardValue);
        
        const cardsList = document.getElementById('publicCardsList');
        const cardDiv = document.createElement('div');
        cardDiv.className = 'public-card-item';
        cardDiv.innerHTML = `
            <span>${this.capitalizeCard(cardValue)}</span>
            <button class="remove-card-btn" onclick="clueBot.removePublicCard('${cardValue}', this.parentElement)">Remove</button>
        `;
        cardsList.appendChild(cardDiv);
        
        select.value = '';
        
        // Update all card selections to reflect the new public card
        this.updateCardSelections();
    }
    
    removePublicCard(cardValue, element) {
        this.publicCards = this.publicCards.filter(card => card !== cardValue);
        element.remove();
        
        // Update all card selections to make the removed card available again
        this.updateCardSelections();
    }
    
    submitGameConfig(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const numberOfPlayers = parseInt(document.getElementById('numberOfPlayers').value);
        
        // Get player names
        const playerNames = [];
        for (let i = 0; i < numberOfPlayers; i++) {
            const name = formData.get(`player${i}`);
            if (name) playerNames.push(name);
        }
        
        // Get player cards
        const playerCards = [];
        const cardsPerPlayer = Math.floor(18 / numberOfPlayers);
        
        for (let i = 0; i < cardsPerPlayer; i++) {
            const card = formData.get(`card${i}`);
            if (card) {
                playerCards.push({
                    playerName: playerNames[0], // Your cards
                    cardName: card
                });
            }
        }
        
        // Add public cards
        this.publicCards.forEach(card => {
            playerCards.push({
                playerName: 'everyone',
                cardName: card
            });
        });
        
        this.playerNames = playerNames;
        
        // Send to server
        this.socket.emit('setupGame', {
            numberOfPlayers,
            playerNames,
            playerCards
        });
    }
    
    showGameInterface() {
        console.log('showGameInterface called');
        document.getElementById('gameSetup').style.display = 'none';
        document.getElementById('gameConfig').style.display = 'none';
        document.getElementById('gameInterface').style.display = 'block';
        document.getElementById('gameSuggestions').style.display = 'block';
        
        // Display the game ID
        if (this.gameState && this.gameState.gameId) {
            document.getElementById('gameIdDisplay').textContent = this.gameState.gameId;
        }
        
        console.log('About to call populatePlayerSelects with playerNames:', this.playerNames);
        this.populatePlayerSelects();
        this.updateGameSuggestions();
    }
    
    populatePlayerSelects() {
        console.log('populatePlayerSelects called, playerNames:', this.playerNames);
        const playerSelects = ['accuser', 'cardPlayer'];
        playerSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (!select) {
                console.log(`Select element ${selectId} not found`);
                return;
            }
            
            select.innerHTML = '<option value="">Select player...</option>';
            
            if (!this.playerNames || this.playerNames.length === 0) {
                console.log('No player names available');
                return;
            }
            
            this.playerNames.forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                select.appendChild(option);
                console.log(`Added player ${name} to ${selectId}`);
            });
            
            // Add "everyone" option for cardPlayer
            if (selectId === 'cardPlayer') {
                const option = document.createElement('option');
                option.value = 'everyone';
                option.textContent = 'Everyone';
                select.appendChild(option);
            }
        });
    }
    
    showKnownCards() {
        const display = document.getElementById('knownCardsDisplay');
        const list = document.getElementById('knownCardsList');
        
        list.innerHTML = '';
        
        if (this.gameState && this.gameState.knownCards) {
            this.gameState.knownCards.forEach(card => {
                const cardDiv = document.createElement('div');
                cardDiv.className = 'card-item';
                cardDiv.innerHTML = `
                    <span class="player-name">${card.playerName}</span>
                    <span class="card-name">${this.capitalizeCard(card.cardName)}</span>
                `;
                list.appendChild(cardDiv);
            });
        }
        
        if (list.children.length === 0) {
            list.innerHTML = '<p>No cards known yet.</p>';
        }
        
        display.style.display = 'block';
    }
    
    showEnvelopeCards() {
        const display = document.getElementById('envelopeCardsDisplay');
        const list = document.getElementById('envelopeCardsList');
        
        list.innerHTML = '';
        
        if (this.gameState && this.gameState.envelopeCards && this.gameState.envelopeCards.length > 0) {
            // Group cards by type
            const suspects = this.gameState.envelopeCards.filter(card => 
                ['green', 'mustard', 'peacock', 'plum', 'scarlett', 'orchid'].includes(card)
            );
            const weapons = this.gameState.envelopeCards.filter(card => 
                ['candlestick', 'dagger', 'lead pipe', 'revolver', 'rope', 'wrench'].includes(card)
            );
            const rooms = this.gameState.envelopeCards.filter(card => 
                ['kitchen', 'ballroom', 'conservatory', 'dining room', 'billiard room', 'library', 'lounge', 'hall', 'study'].includes(card)
            );
            
            // Display organized by type
            if (suspects.length > 0) {
                const suspectDiv = document.createElement('div');
                suspectDiv.className = 'envelope-category';
                suspectDiv.innerHTML = `
                    <h4>Suspect: <span class="envelope-card">${this.capitalizeCard(suspects[0])}</span></h4>
                `;
                list.appendChild(suspectDiv);
            }
            
            if (weapons.length > 0) {
                const weaponDiv = document.createElement('div');
                weaponDiv.className = 'envelope-category';
                weaponDiv.innerHTML = `
                    <h4>Weapon: <span class="envelope-card">${this.capitalizeCard(weapons[0])}</span></h4>
                `;
                list.appendChild(weaponDiv);
            }
            
            if (rooms.length > 0) {
                const roomDiv = document.createElement('div');
                roomDiv.className = 'envelope-category';
                roomDiv.innerHTML = `
                    <h4>Room: <span class="envelope-card">${this.capitalizeCard(rooms[0])}</span></h4>
                `;
                list.appendChild(roomDiv);
            }
            
            // Show completion status
            const totalFound = suspects.length + weapons.length + rooms.length;
            if (totalFound === 3) {
                const completeDiv = document.createElement('div');
                completeDiv.className = 'solution-complete';
                completeDiv.innerHTML = `
                    <h3 style="color: #22c55e; margin-top: 20px;">🎉 Murder Solution Complete!</h3>
                    <p>You have successfully deduced the entire solution!</p>
                `;
                list.appendChild(completeDiv);
            } else {
                const progressDiv = document.createElement('div');
                progressDiv.className = 'solution-progress';
                progressDiv.innerHTML = `
                    <p style="margin-top: 15px; color: #6b7280;">
                        Progress: ${totalFound}/3 cards deduced
                        ${totalFound < 3 ? ' - Keep adding accusations and known cards to deduce more!' : ''}
                    </p>
                `;
                list.appendChild(progressDiv);
            }
        } else {
            list.innerHTML = `
                <div class="no-envelope-cards">
                    <p>No cards have been deduced to be in the envelope yet.</p>
                    <p style="margin-top: 10px; color: #6b7280; font-size: 0.9em;">
                        Add accusations and known cards, then run deduction to discover the murder solution!
                    </p>
                </div>
            `;
        }
        
        display.style.display = 'block';
    }
    
    showAccusationForm() {
        const modal = document.getElementById('accusationForm');
        
        // Populate accuser dropdown
        const accuserSelect = document.getElementById('accuser');
        accuserSelect.innerHTML = '<option value="">Select player...</option>';
        this.playerNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            accuserSelect.appendChild(option);
        });
        
        // Populate players in order inputs
        const playersInputs = document.getElementById('playersInOrderInputs');
        playersInputs.innerHTML = '';
        
        this.playerNames.forEach((name, index) => {
            if (index === 0) return; // Skip the main player
            
            const div = document.createElement('div');
            div.innerHTML = `
                <label class="checkbox-label">
                    <input type="checkbox" name="playerInOrder" value="${name}">
                    ${name}
                </label>
            `;
            playersInputs.appendChild(div);
        });
        
        modal.style.display = 'flex';
    }
    
    toggleCardShownSection(shown) {
        const section = document.getElementById('cardShownSection');
        section.style.display = shown ? 'block' : 'none';
    }
    
    submitAccusation(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        
        const accusationData = {
            accuser: formData.get('accuser'),
            suspect: formData.get('suspectAccused'),
            weapon: formData.get('weaponAccused'),
            room: formData.get('roomAccused'),
            cardShown: document.getElementById('cardWasShown').checked,
            shownCard: formData.get('shownCard') || '',
            playersInvolved: []
        };
        
        // Get players involved
        const checkedPlayers = document.querySelectorAll('input[name="playerInOrder"]:checked');
        checkedPlayers.forEach(checkbox => {
            accusationData.playersInvolved.push(checkbox.value);
        });
        
        // If no card was shown and no specific players were checked, 
        // assume all other players were asked in order
        if (!accusationData.cardShown && accusationData.playersInvolved.length === 0) {
            // Add all players except the accuser
            const accuser = accusationData.accuser;
            accusationData.playersInvolved = this.playerNames.filter(name => name !== accuser);
        }
        
        console.log('Submitting accusation:', accusationData);
        this.socket.emit('addAccusation', accusationData);
        this.closeModal(document.getElementById('accusationForm'));
    }
    
    showKnownCardForm() {
        // Populate player dropdown
        const cardPlayerSelect = document.getElementById('cardPlayer');
        cardPlayerSelect.innerHTML = '<option value="">Select player...</option>';
        this.playerNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            cardPlayerSelect.appendChild(option);
        });
        
        // Add "everyone" option
        const everyoneOption = document.createElement('option');
        everyoneOption.value = 'everyone';
        everyoneOption.textContent = 'Everyone';
        cardPlayerSelect.appendChild(everyoneOption);
        
        document.getElementById('knownCardForm').style.display = 'flex';
    }
    
    submitKnownCard(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const cardData = {
            playerName: formData.get('cardPlayer'),
            cardName: formData.get('cardName')
        };
        
        this.socket.emit('addKnownCard', cardData);
        this.closeModal(document.getElementById('knownCardForm'));
    }
    
    performDeduction() {
        console.log('=== CLIENT: performDeduction called ===');
        console.log('gameState:', this.gameState);
        console.log('socket connected:', this.socket.connected);
        this.socket.emit('requestDeduction');
        console.log('=== CLIENT: requestDeduction emitted ===');
    }
    
    showDeductionResults(deductions) {
        const display = document.getElementById('deductionResults');
        const list = document.getElementById('deductionsList');
        
        list.innerHTML = '';
        
        if (deductions && deductions.length > 0) {
            deductions.forEach(deduction => {
                const deductionDiv = document.createElement('div');
                deductionDiv.className = 'deduction-item';
                deductionDiv.innerHTML = `
                    <div class="deduction-text">${deduction.message}</div>
                `;
                list.appendChild(deductionDiv);
            });
        } else {
            list.innerHTML = '<p>No new deductions found.</p>';
        }
        
        display.style.display = 'block';
    }
    
    showAccusations() {
        const display = document.getElementById('accusationsDisplay');
        const list = document.getElementById('accusationsList');
        
        list.innerHTML = '';
        
        if (this.gameState && this.gameState.accusations) {
            this.gameState.accusations.forEach(accusation => {
                const accusationDiv = document.createElement('div');
                accusationDiv.className = 'accusation-item';
                accusationDiv.innerHTML = `
                    <div class="accusation-header">
                        ${accusation.accuser} accused ${this.capitalizeCard(accusation.suspect)} 
                        with ${this.capitalizeCard(accusation.weapon)} in ${this.capitalizeCard(accusation.room)}
                    </div>
                    <div class="accusation-details">
                        ${accusation.cardShown ? 
                            `Card shown: ${accusation.shownCard || 'Unknown'}` : 
                            'No card shown'}
                        ${accusation.playersInvolved.length > 0 ? 
                            `<br>Players involved: ${accusation.playersInvolved.join(', ')}` : ''}
                    </div>
                `;
                list.appendChild(accusationDiv);
            });
        }
        
        if (list.children.length === 0) {
            list.innerHTML = '<p>No accusations recorded yet.</p>';
        }
        
        display.style.display = 'block';
    }
    
    showSuggestions() {
        // Fetch and display current suggestions
        if (!this.gameId) {
            this.showNotification('No active game', 'error');
            return;
        }
        
        fetch(`/api/game/${this.gameId}/suggestions`)
            .then(response => response.json())
            .then(data => {
                if (data.suggestions) {
                    this.displaySuggestionsPanel(data.suggestions);
                }
            })
            .catch(error => {
                console.error('Error fetching suggestions:', error);
                this.showNotification('Error loading suggestions', 'error');
            });
    }
    
    displaySuggestionsPanel(suggestions) {
        const display = document.getElementById('suggestionsDisplay');
        
        // Update suspects
        const suspectsDiv = document.getElementById('possibleSuspects');
        suspectsDiv.innerHTML = '';
        if (suggestions.possibleSuspects.length === 0) {
            suspectsDiv.innerHTML = '<span class="no-cards">All suspects identified!</span>';
        } else {
            suggestions.possibleSuspects.forEach(suspect => {
                const span = document.createElement('span');
                span.className = 'card-suggestion';
                span.textContent = this.capitalizeCard(suspect);
                suspectsDiv.appendChild(span);
            });
        }
        
        // Update weapons
        const weaponsDiv = document.getElementById('possibleWeapons');
        weaponsDiv.innerHTML = '';
        if (suggestions.possibleWeapons.length === 0) {
            weaponsDiv.innerHTML = '<span class="no-cards">All weapons identified!</span>';
        } else {
            suggestions.possibleWeapons.forEach(weapon => {
                const span = document.createElement('span');
                span.className = 'card-suggestion';
                span.textContent = this.capitalizeCard(weapon);
                weaponsDiv.appendChild(span);
            });
        }
        
        // Update rooms
        const roomsDiv = document.getElementById('possibleRooms');
        roomsDiv.innerHTML = '';
        if (suggestions.possibleRooms.length === 0) {
            roomsDiv.innerHTML = '<span class="no-cards">All rooms identified!</span>';
        } else {
            suggestions.possibleRooms.forEach(room => {
                const span = document.createElement('span');
                span.className = 'card-suggestion';
                span.textContent = this.capitalizeCard(room);
                roomsDiv.appendChild(span);
            });
        }
        
        display.style.display = 'block';
    }
    
    updateGameSuggestions() {
        if (!this.gameState || !this.gameId) return;
        
        // Fetch suggestions from the server
        fetch(`/api/game/${this.gameId}/suggestions`)
            .then(response => response.json())
            .then(data => {
                if (data.suggestions) {
                    this.displaySuggestions(data.suggestions);
                }
            })
            .catch(error => console.error('Error updating suggestions:', error));
    }
    
    displaySuggestions(suggestions) {
        // Display possible suspects
        const suspectsDiv = document.getElementById('possibleSuspects');
        if (suspectsDiv) {
            suspectsDiv.innerHTML = '';
            suggestions.possibleSuspects.forEach(suspect => {
                const span = document.createElement('span');
                span.className = 'card-suggestion';
                span.textContent = this.capitalizeCard(suspect);
                suspectsDiv.appendChild(span);
            });
        }
        
        // Display possible weapons
        const weaponsDiv = document.getElementById('possibleWeapons');
        if (weaponsDiv) {
            weaponsDiv.innerHTML = '';
            suggestions.possibleWeapons.forEach(weapon => {
                const span = document.createElement('span');
                span.className = 'card-suggestion';
                span.textContent = this.capitalizeCard(weapon);
                weaponsDiv.appendChild(span);
            });
        }
        
        // Display possible rooms
        const roomsDiv = document.getElementById('possibleRooms');
        if (roomsDiv) {
            roomsDiv.innerHTML = '';
            suggestions.possibleRooms.forEach(room => {
                const span = document.createElement('span');
                span.className = 'card-suggestion';
                span.textContent = this.capitalizeCard(room);
                roomsDiv.appendChild(span);
            });
        }
        
        // Show suggestions section if hidden
        const suggestionsSection = document.getElementById('suggestionsDisplay');
        if (suggestionsSection) {
            suggestionsSection.style.display = 'block';
        }
    }
    
    closeModal(element) {
        let modal = element;
        while (modal && !modal.classList.contains('modal') && !modal.classList.contains('info-panel')) {
            modal = modal.parentElement;
        }
        if (modal) {
            modal.style.display = 'none';
            
            // Reset forms
            const form = modal.querySelector('form');
            if (form) form.reset();
        }
    }
    
    showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            ${type === 'error' ? 'background: #e53e3e;' : 'background: #38a169;'}
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.parentElement.removeChild(notification);
            }
        }, 3000);
    }
    
    // Debug function to test player select population
    testPopulatePlayerSelects() {
        console.log('Manual test of populatePlayerSelects');
        console.log('this.playerNames:', this.playerNames);
        const accuserSelect = document.getElementById('accuser');
        const cardPlayerSelect = document.getElementById('cardPlayer');
        console.log('accuser select element:', accuserSelect);
        console.log('cardPlayer select element:', cardPlayerSelect);
        this.populatePlayerSelects();
    }
}

// Initialize the app
const clueBot = new ClueWebBot();
window.clueBot = clueBot; // Make it globally accessible for debugging