#include <iostream>
#include <vector>
#include "game.h"

using namespace std;

// cards stores { name, cardName }
// 
// accusations stores { { { accuser, person, weapon, place }, playersInvolved }, { cardShown, knownCard } }, where 
// playersInvolved is a vector of strings, and cardShown is a boolean describing whether
// a card was shown during the accusation
// 
// cards stores { playerName, knownCard }
// 
// the key point is that the players are shown in turn order.
// if there are multiple players, it means that the last player is the one
// who showed the card, and the previous players didn't have any of the cards. playersInvolved
// does NOT contain the accuser
//

int main()
{
    // sets up the game
    game g;
    int numberOfPlayers = 0;
    vector<string> names;
    vector<vector<string>> cards;
    g.setUpGame(numberOfPlayers, names, cards);

    // playing the game
    vector<pair<vector<vector<string>>, pair<bool, string>>> accusations;
    g.playGame(names, cards, accusations);
}
