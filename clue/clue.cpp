#include <iostream>
#include <vector>
#include "game.h"
#include "card.h"

using namespace std;

int main()
{
    // sets up the game
    game g;
    int numberOfPlayers = 0;
    vector<string> names;
    vector<card> cards;
    g.setUpGame(numberOfPlayers, names, cards);

    // playing the game
    g.playGame();
}
