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
            this.gameState = gameState;
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
        document.getElementById('addAccusationBtn').addEventListener('click', () => this.showAccusationForm());
        document.getElementById('deduceBtn').addEventListener('click', () => this.performDeduction());
        document.getElementById('addKnownCardBtn').addEventListener('click', () => this.showKnownCardForm());
        document.getElementById('viewAccusationsBtn').addEventListener('click', () => this.showAccusations());
        
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
                <select name="card${i}" required>
                    <option value="">Select a card...</option>
                </select>
            `;
            playerCardsInputs.appendChild(div);
            
            // Populate this select with all cards
            const select = div.querySelector('select');
            this.populateCardSelect(select);
        }
        
        playerCardsSection.style.display = 'block';
        document.getElementById('publicCardsSection').style.display = 'block';
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
    }
    
    removePublicCard(cardValue, element) {
        this.publicCards = this.publicCards.filter(card => card !== cardValue);
        element.remove();
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
        document.getElementById('gameConfig').style.display = 'none';
        document.getElementById('gameInterface').style.display = 'block';
        document.getElementById('gameSuggestions').style.display = 'block';
        
        this.populatePlayerSelects();
        this.updateGameSuggestions();
    }
    
    populatePlayerSelects() {
        const playerSelects = ['accuser', 'cardPlayer'];
        playerSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            select.innerHTML = '<option value="">Select player...</option>';
            
            this.playerNames.forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                select.appendChild(option);
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
    
    showAccusationForm() {
        const modal = document.getElementById('accusationForm');
        
        // Populate players in order inputs
        const playersInputs = document.getElementById('playersInOrderInputs');
        playersInputs.innerHTML = '';
        
        this.playerNames.forEach((name, index) => {
            if (index === 0) return; // Skip the main player
            
            const div = document.createElement('div');
            div.innerHTML = `
                <label>
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
        
        this.socket.emit('addAccusation', accusationData);
        this.closeModal(document.getElementById('accusationForm'));
    }
    
    showKnownCardForm() {
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
        this.socket.emit('requestDeduction');
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
    
    updateGameSuggestions() {
        if (!this.gameState) return;
        
        // Logic to update suggestions based on current game state
        fetch(`/api/game/${this.gameId}`)
            .then(response => response.json())
            .then(data => {
                // Update suggestions display
                console.log('Updated game state:', data);
            })
            .catch(error => console.error('Error updating suggestions:', error));
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
}

// Initialize the app
const clueBot = new ClueWebBot();