#include "game.h"
#include "deduction.h"
#include <iostream>
#include <vector>
#include <string>

using namespace std;

vector<string> allCards = {
    // Suspects
    "mr green", "col mustard", "mrs peacock", "prof plum", "miss scarlett", "dr orchid",
    // Weapons
    "candlestick", "dagger", "lead pipe", "revolver", "rope", "wrench",
    // Rooms
    "kitchen", "ballroom", "conservatory", "dining room", "billiard room",
    "library", "lounge", "hall", "study"
};

void game::setUpGame(int& numberOfPlayers, vector<string>& names, vector<vector<string>>& cards)
{
    // number of players
    cout << "How many players? ";
    cin >> numberOfPlayers;
    cin.ignore();

    // player order
    cout << "Enter the player's names in order of who goes first." << endl;
    for (int i = 0; i < numberOfPlayers; ++i)
    {
        string playerName;
        cout << "Player " << i << "'s name: ";
        getline(cin, playerName);
        names.push_back(playerName);
    }

    // entering your cards
    cout << "Enter your cards." << endl;

    int numCards = 18 / numberOfPlayers;
    for (int i = 0; i < numCards; ++i) {
        string cardName;
        while (true)
        {
            cout << "Card " << i + 1 << ": ";
            getline(cin, cardName);

            // check if card is valid
            auto it = find(allCards.begin(), allCards.end(), cardName);
            if (it != allCards.end())
            {
                cards.push_back({ names[0], cardName });
                break;
            }
            else
            {
                cout << "Invalid card name. Try again.\n";
            }
        }
    }

    // if there are uneven amount of players so cards must be shown to everyone
    cout << "Any cards known to everyone? (Yes/No): ";
    string ans;
    getline(cin, ans);

    if (ans == "Yes" || ans == "yes" || ans == "Y" || ans == "y")
    {
        while (true)
        {
            cout << "Enter card (or enter 'X' if finished): ";
            string cardName;
            getline(cin, cardName);

            if (cardName == "X" || cardName == "x")
            {
                break;
            }

            // validate
            auto it = find(allCards.begin(), allCards.end(), cardName);
            if (it != allCards.end())
            {
                cards.push_back({ "everyone", cardName});
            }
            else
            {
                cout << "Invalid card. Try again.\n";
            }
        }
    }

    // game is now ready
    cout << "Game ready..." << endl << endl;
}

void game::playGame(vector<string>& names, vector<vector<string>>& cards, 
    vector<pair<vector<vector<string>>, bool>>& accusations)
{
    int numPlayers = names.size();
    cout << "What is the turn order?" << endl;
    vector<string> turnOrder(numPlayers, "");
    for (int i = 0; i < numPlayers; ++i)
    {
        getline(cin, turnOrder[i]);
    }
    
    while (true)
    {
        string input = "";
        cout << "Look at known cards(k), enter accusations(a), deduce something(d), view accusations(v), or game ended(anything else)" << endl;
        getline(cin, input);

        if (input == "k")
        {
            displayKnown(cards);
        }
        else if (input == "a")
        {
            accusation(accusations, turnOrder, names[0], cards);
        }
        else if (input == "d")
        {
            deduce(accusations);
        }
        else if (input == "v")
        {
            showAccusations(accusations);
        }
        else
        {
            break;
        }
    }
}

void game::displayKnown(vector<vector<string>>& cards)
{
    for (auto nameCardPair : cards)
    {
        cout << nameCardPair[0] << " has " << nameCardPair[1] << endl;
    }
}

void game::accusation(vector<pair<vector<vector<string>>, bool>>& accusations, const vector<string>& turnOrder, 
    string yourName, vector<vector<string>>& cards)
{
    int numPlayers = turnOrder.size();
    for (int i = 0; i < numPlayers; ++i)
    {
        cout << "Player " << turnOrder[i] << endl;
    }

    string accuser, accused;
    cout << "Who made the accusation?" << endl;
    getline(cin, accuser);

    // find the index of the player in turnOrder
    int accuserIndex = -1;
    for (int i = 0; i < numPlayers; ++i)
    {
        if (turnOrder[i] == accuser)
        {
            accuserIndex = i;
            break;
        }
    }

    // contents of accusation
    string person, weapon, place;

    cout << "Person?" << endl;
    while (true)
    {
        getline(cin, person);
        auto it = find(allCards.begin(), allCards.end(), person);
        if (it != allCards.end())
        {
            break;
        }
        else
        {
            cout << "Invalid card name. Try again.\n";
        }
    }

    cout << "Weapon?" << endl;
    while (true)
    {
        getline(cin, weapon);
        auto it = find(allCards.begin(), allCards.end(), weapon);
        if (it != allCards.end())
        {
            break;
        }
        else
        {
            cout << "Invalid card name. Try again.\n";
        }
    }

    cout << "Place?" << endl;
    while (true)
    {
        getline(cin, place);
        auto it = find(allCards.begin(), allCards.end(), place);
        if (it != allCards.end())
        {
            break;
        }
        else
        {
            cout << "Invalid card name. Try again.\n";
        }
    }

    // looping through the remaining players to see if any of them have any of the cards
    vector<string> playersInvolved;
    bool showedCard = false;
    for (int i = 1; i < numPlayers; ++i)
    {
        // consider next player
        string accused = turnOrder[(accuserIndex + i) % numPlayers];

        string ans;
        cout << "Did " << accused << " have anything?" << endl;
        getline(cin, ans);
        if (ans == "Yes" || ans == "yes" || ans == "y" || ans == "Y")
        {
            if (yourName == accuser)
            {
                string newInfo;
                cout << "What card did they show?" << endl;
                getline(cin, newInfo);
                cards.push_back({ accused, newInfo });
            }
            showedCard = true;
            playersInvolved.push_back(accused);
            break;
        }
        playersInvolved.push_back(accused);
    }

    accusations.push_back({ { {accuser, person, weapon, place}, playersInvolved }, showedCard });
}

void game::deduce(vector<pair<vector<vector<string>>, bool>>& accusations)
{
    deduction d;
    d.deduce(accusations);
}

void game::showAccusations(vector<pair<vector<vector<string>>, bool>>& accusations)
{
    int count = 1;
    for (auto accusation : accusations)
    {
        // gather the info
        vector<vector<string>> info = accusation.first;
        vector<string> moreInfo = info[0];
        string accuser = moreInfo[0];
        string person = moreInfo[1];
        string weapon = moreInfo[2];
        string place = moreInfo[3];
        vector<string> playersInvolved = info[1];
        bool shownCard = accusation.second;

        // display the accusation
        cout << count << ": " << accuser << " accused " << person << ", " << weapon << ", " << place << ". ";
        if (!shownCard)
        {
            cout << "Nobody had anything." << endl;
        }
        else
        {
            // loop stops right before the last one, who has it
            int s = playersInvolved.size();
            if (s > 1)
            {
                for (int i = 0; i < s - 1; ++i)
                {
                    string curr = playersInvolved[i];
                    cout << curr << ", ";
                }
                cout << "don't have anything, but " << playersInvolved[s - 1] << " does." << endl;
            }
            else if (s == 1)
            {
                cout << playersInvolved[0] << " had something." << endl;
            }
        }

        ++count;
    }
}
