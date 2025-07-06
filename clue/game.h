#pragma once
#include <vector>
#include <string>

using namespace std;

// cards stores { name, cardName }
// 
// accusations stores { { { accuser, person, weapon, place }, playersInvolved }, cardShown }, where 
// playersInvolved is a vector of strings, and cardShown is a boolean describing whether
// a card was shown during the accusation
// 
// the key point is that the players are shown in turn order.
// if there are multiple players, it means that the last player is the one
// who showed the card, and the previous players didn't have any of the cards. playersInvolved
// does NOT contain the accuser
//

class game
{
public:
	// RUNNING THE GAME

	// pre: number of players is greater or equal to two
	// post: sets up the initial configuration of the game, prompts user to
	// input number of players, their individual cards, the players' names,
	// and order of play.
	void setUpGame(int& numberOfPlayers, vector<string>& names, 
		vector<vector<string>>& cards);

	// pre: none
	// post: runs the game
	void playGame(vector<string>& names, vector<vector<string>>& cards, 
		vector<pair<vector<vector<string>>, bool>>& accusations);

	// INSIDE THE GAME

	// pre: none
	// post: display everything known to the player, including what other players have,
	// what the player has, what the player should suspect, etc. 
	void displayKnown(vector<vector<string>>& cards);

	// pre: your turn
	// post: stores the accusation tuple in accusations, checks if you are the accuser
	void accusation(vector<pair<vector<vector<string>>, bool>>& accusations,
		const vector<string>& turnOrder, string yourName, vector<vector<string>>& cards);

	// pre: none
	// post: looks at all accusations stored and deduces clues(if any)
	void deduce(vector<pair<vector<vector<string>>, bool>>& accusations);

	// pre: none
	// post: displays all current accusations
	void showAccusations(vector<pair<vector<vector<string>>, bool>>& accusations);
};

