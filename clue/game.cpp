#include "game.h"
#include "deduction.h"
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

void game::setUpGame(int& numberOfPlayers, vector<string>& names, vector<vector<string>>& cards)
{
    // number of players
    cout << "How many players? ";
    cin >> numberOfPlayers;
    cout << endl;
    cin.ignore();

    // player order
    cout << "Enter the player's names in order of who goes first." << endl;
    for (int i = 0; i < numberOfPlayers; ++i)
    {
        string playerName;
        if (i == 0)
        {
            cout << "Player " << i << "'s name(your name): ";
        }
        else
        {
            cout << "Player " << i << "'s name: ";
        }        
        getline(cin, playerName);
        names.push_back(playerName);
    }

    // entering your cards
    cout << endl;
    cout << "Enter your cards. (Please reference globals.cpp to see the card names used, only use lowercase)" << endl;

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
    cout << endl;
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
    cout << endl;
    cout << "Game ready..." << endl;
    cout << endl;
}

void game::playGame(const vector<string>& names, vector<vector<string>>& cards, 
    vector<pair<vector<vector<string>>, pair<bool, string>>>& accusations)
{
    int numPlayers = names.size();
    cout << "What is the turn order?" << endl;
    vector<string> turnOrder;
    for (int i = 0; i < numPlayers; ++i)
    {
        while (true)
        {
            cout << (i + 1) << ": ";
            string testName;
            getline(cin, testName);

            // check if card is valid
            auto it = find(names.begin(), names.end(), testName);
            if (it != names.end())
            {
                turnOrder.push_back(testName);
                break;
            }
            else
            {
                cout << "Invalid name. Try again.\n";
            }
        }
    }
    cout << endl;

    while (true)
    {
        string input = "";
        cout << "Look at known cards(k), enter accusations(a), deduce something(d), view accusations(v), add known card(c), or game ended(anything else). Note that you need to use (d) if you want to deduce anything!" << endl;
        cout << endl;
        getline(cin, input);

        if (input == "k")
        {
            displayKnown(cards);
            cout << endl;
        }
        else if (input == "a")
        {
            accusation(accusations, turnOrder, names[0], cards);
            cout << endl;
        }
        else if (input == "d")
        {
            deduce(accusations, names, cards);
            cout << endl;
        }
        else if (input == "v")
        {
            showAccusations(accusations);
            cout << endl;
        }
        else if (input == "c")
        {
            addKnownCard(names, cards);
            cout << endl;
        }
        else
        {
            break;
        }
    }
}

void game::displayKnown(vector<vector<string>>& cards)
{
    sort(cards.begin(), cards.end());
    int counter = 1;
    for (auto nameCardPair : cards)
    {
        cout << counter++ << ": " << nameCardPair[0] << " has " << nameCardPair[1] << endl;
    }
}

void game::accusation(vector<pair<vector<vector<string>>, pair<bool, string>>>& accusations, const vector<string>& turnOrder,
    string yourName, vector<vector<string>>& cards)
{
    int numPlayers = turnOrder.size();
    string accuser, accused;
    cout << "Which player made the accusation?" << endl;
    while (true)
    {
        getline(cin, accuser);
        auto it = find(turnOrder.begin(), turnOrder.end(), accuser);
        if (it != turnOrder.end())
        {
            break;
        }
        else
        {
            cout << "Invalid player name. Try again.\n";
        }
    }

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

    cout << "Person(card)?" << endl;
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

    cout << "Weapon(card)?" << endl;
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

    cout << "Place(card)?" << endl;
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
    cout << endl;

    // looping through the remaining players to see if any of them have any of the cards
    vector<string> playersInvolved;
    bool showedCard = false;
    string newInfo = "";
    for (int i = 1; i < numPlayers; ++i)
    {
        // consider next player
        string accused = turnOrder[(accuserIndex + i) % numPlayers];

        string ans;
        cout << "Did " << accused << " have anything? (yes/no)" << endl;
        getline(cin, ans);
        if (ans == "Yes" || ans == "yes" || ans == "y" || ans == "Y")
        {
            if (yourName == accuser)
            {
                cout << "What card did they show?" << endl;
                getline(cin, newInfo);
                cards.push_back({ accused, newInfo });
            }
            else if (yourName == accused)
            {
                cout << "What card did you show?" << endl;
                getline(cin, newInfo);
            }

            showedCard = true;
            playersInvolved.push_back(accused);
            break;
        }
        playersInvolved.push_back(accused);
    }

    accusations.push_back({ { {accuser, person, weapon, place}, playersInvolved }, { showedCard, newInfo } });
}

void game::deduce(const vector<pair<vector<vector<string>>, pair<bool, string>>>& accusations,
    const vector<string>& names, vector<vector<string>>& cards)
{
    deduction d(names);
    d.deduce(accusations, names, cards);
}

void game::showAccusations(const vector<pair<vector<vector<string>>, pair<bool, string>>>& accusations)
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
        bool shownCard = accusation.second.first;
        string knownCard = accusation.second.second;

        // display the accusation
        cout << count << ": " << accuser << " accused " << person << ", " << weapon << ", " << place << ". ";
        
        if (knownCard != "")
        {
            cout << "The card shown was " << knownCard << ". ";
        }

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
                cout << "don't/doesn't have anything, but " << playersInvolved[s - 1] << " does." << endl;
            }
            else if (s == 1)
            {
                cout << playersInvolved[0] << " had something." << endl;
            }
        }

        ++count;
    }
}

void game::addKnownCard(const vector<string>& names, vector<vector<string>>& cards)
{
    string knownCard, person;
    while (true)
    {
        cout << "Which card is known?" << endl;
        getline(cin, knownCard);

        // validate
        auto it = find(allCards.begin(), allCards.end(), knownCard);
        if (it == allCards.end())
        {
            cout << "Invalid card. Try again.\n";
        }
        else
        {
            break;
        }
    }

    while (true)
    {
        cout << "Which player had the card?" << endl;
        getline(cin, person);

        // validate
        auto it = find(names.begin(), names.end(), person);
        if (it == names.end())
        {
            cout << "Invalid card. Try again.\n";
        }
        else
        {
            break;
        }
    }

    cards.push_back({ person, knownCard });
}