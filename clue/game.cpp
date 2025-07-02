#include "game.h"
#include "card.h"
#include <iostream>
#include <vector>
#include <string>

using namespace std;

void game::setUpGame(int& numberOfPlayers, vector<string>& names, vector<card>& cards)
{
    // number of players
    cout << "How many players? ";
    cin >> numberOfPlayers;

    // player order
    cout << "Enter the player's names in order of who goes first." << endl;
    for (int i = 0; i < numberOfPlayers; ++i)
    {
        string playerName;
        cout << "Player " << i << "'s name: ";
        cin >> playerName;
        names.push_back(playerName);
    }

    // entering your cards
    cout << "Enter your cards." << endl;
    for (int i = 0; i < 18 / numberOfPlayers; ++i)
    {
        string cardCategory, cardName;
        cout << "Card " << i + 1 << ": ";
        cin >> cardCategory >> cardName;
        cards.push_back(card(cardCategory, cardName));
    }

    // if there are uneven amount of players so cards must be shown to everyone
    cout << "Any cards known to everyone?" << endl;
    string ans;
    cin >> ans;
    if (ans == "Yes")
    {
        while (true)
        {
            cout << "Enter card, or enter 'X X' if finished: ";
            string cardCategory, cardName;
            cin >> cardCategory >> cardName;
            if (cardCategory == "X")
            {
                break;
            }
            else
            {
                cards.push_back(card(cardCategory, cardName));
            }
        }
    }

    // game is now ready
    cout << "Game ready..." << endl;
    cout << endl;
}

void game::playGame()
{
    while (true)
    {
        string input = "";
        cout << "Look at known cards(k), enter accusations(a), enter exchanged information(e), or game ended(anything else)" << endl;
        cin >> input;

        if (input == "k")
        {
            displayKnown();
        }
        else if (input == "a")
        {
            accusation();
        }
        else if (input == "e")
        {
            exchange();
        }
        else
        {
            break;
        }
    }
}

void game::displayKnown()
{

}

void game::accusation()
{

}

void game::exchange()
{

}