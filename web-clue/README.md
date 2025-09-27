# Clue Web Bot - Deduction Assistant

A web-based version a C++ Clue bot that helps players track cards, accusations, and perform logical deductions during Clue board games.

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation & Setup

1. **Navigate to the web-clue directory:**

   ```bash
   cd "c:\VisualStudioProjects\clue\web-clue"
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the server:**

   ```bash
   npm start
   ```

4. **Open your browser:**
   - Go to `http://localhost:3000`
   - The Clue Web Bot interface will load

## How to Use

### Game Setup

1. **Create a New Game:**
   - Click "Create New Game" button
   - Share the Game ID with other players
2. **Or Join an Existing Game:**
   - Enter a Game ID and click "Join Game"
3. **Configure the Game:**
   - Select number of players (2-6)
   - Enter all player names in turn order
   - Input your starting cards
   - Add any cards known to everyone (optional)
   - Click "Start Game"

### During the Game

- **View Known Cards:** See all cards you've discovered
- **Add Accusations:** Record accusations made by any player
- **Run Deduction:** Let the bot analyze all information and find new card locations
- **Add Known Cards:** Manually add cards you learn about
- **View Accusations:** Review all recorded accusations
