const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Import game logic
const Game = require('./game/Game');

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Store active games
const games = new Map();

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes
app.post('/api/game/create', (req, res) => {
    const gameId = uuidv4();
    const game = new Game(gameId);
    games.set(gameId, game);
    
    res.json({ gameId, message: 'Game created successfully' });
});

app.get('/api/game/:gameId', (req, res) => {
    const game = games.get(req.params.gameId);
    if (!game) {
        return res.status(404).json({ error: 'Game not found' });
    }
    
    res.json({ gameState: game.getGameState() });
});

app.get('/api/game/:gameId/suggestions', (req, res) => {
    const game = games.get(req.params.gameId);
    if (!game) {
        return res.status(404).json({ error: 'Game not found' });
    }
    
    res.json({ suggestions: game.getSuggestions() });
});

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    
    socket.on('joinGame', (gameId) => {
        const game = games.get(gameId);
        if (!game) {
            socket.emit('error', 'Game not found');
            return;
        }
        
        socket.join(gameId);
        socket.gameId = gameId;
        console.log(`User ${socket.id} joined game ${gameId}`);
    });
    
    // Handle game setup
    socket.on('setupGame', (data) => {
        const game = games.get(socket.gameId);
        if (!game) {
            socket.emit('error', 'Game not found');
            return;
        }
        
        try {
            game.setupGame(data.numberOfPlayers, data.playerNames, data.playerCards);
            io.to(socket.gameId).emit('gameSetup', game.getGameState());
        } catch (error) {
            socket.emit('error', error.message);
        }
    });
    
    // Handle accusations
    socket.on('addAccusation', (accusationData) => {
        const game = games.get(socket.gameId);
        if (!game) {
            socket.emit('error', 'Game not found');
            return;
        }
        
        try {
            game.addAccusation(accusationData);
            io.to(socket.gameId).emit('accusationAdded', {
                accusation: accusationData,
                gameState: game.getGameState()
            });
        } catch (error) {
            socket.emit('error', error.message);
        }
    });
    
    // Handle deduction requests
    socket.on('requestDeduction', () => {
        const game = games.get(socket.gameId);
        if (!game) {
            socket.emit('error', 'Game not found');
            return;
        }
        
        try {
            const deductions = game.performDeduction();
            io.to(socket.gameId).emit('deductionResult', {
                deductions,
                gameState: game.getGameState()
            });
        } catch (error) {
            socket.emit('error', error.message);
        }
    });
    
    // Handle adding known cards
    socket.on('addKnownCard', (cardData) => {
        const game = games.get(socket.gameId);
        if (!game) {
            socket.emit('error', 'Game not found');
            return;
        }
        
        try {
            game.addKnownCard(cardData.playerName, cardData.cardName);
            io.to(socket.gameId).emit('cardAdded', {
                playerName: cardData.playerName,
                cardName: cardData.cardName,
                gameState: game.getGameState()
            });
        } catch (error) {
            socket.emit('error', error.message);
        }
    });
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Clue Web Bot server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in browser`);
});