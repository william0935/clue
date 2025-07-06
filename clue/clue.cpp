#include <iostream>
#include <vector>
#include "game.h"

using namespace std;

int main()
{
    // sets up the game
    game g;
    int numberOfPlayers = 0;
    vector<string> names;
    vector<vector<string>> cards;
    g.setUpGame(numberOfPlayers, names, cards);

    // playing the game
    vector<pair<vector<vector<string>>, bool>> accusations;
    g.playGame(names, cards, accusations);
}
