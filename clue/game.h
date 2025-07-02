#pragma once
#include "card.h"
#include <vector>
#include <string>

using namespace std;

class game
{
public:
	// RUNNING THE GAME

	// pre: number of players is greater or equal to two
	// post: sets up the initial configuration of the game, prompts user to
	// input number of players, their individual cards, the players' names,
	// and order of play
	void setUpGame(int& numberOfPlayers, vector<string>& names, vector<card>& cards);

	// pre: none
	// post: runs the game
	void playGame();

	// INSIDE THE GAME

	// pre: none
	// post: display everything known to the player, including what other players have,
	// what the player has, what the player should suspect, etc. 
	void displayKnown();

	// pre: your turn
	// post: does the accusation for you
	void accusation();

	// pre: NOT your turn
	// post: sets "maybe" status to cards that have been shown to exchange information
	void exchange();
};

