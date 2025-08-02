#include "deduction.h"
#include <iostream>
#include <vector>
#include <string>

using namespace std;

deduction::deduction(vector<string> names)
    : f(names)
{
}

void deduction::deduce(vector<pair<vector<vector<string>>, pair<bool, string>>>& accusations,
    vector<string> names, vector<vector<string>>& cards)
{
    // have to add facts about cards you already know/have
    for (auto card : cards)
    {
        vector<pair<string, string>> temp;
        temp.push_back({ card[0], card[1] });
        f.addFact(temp);
    }

    // each accusation needs to add some constraints to hashmap
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
        bool showedCard = accusation.second.first;
        string knownCard = accusation.second.second;

	    // add fact about players who had something
        int numPlayersInvolved = playersInvolved.size();
        if (showedCard)
        {
            string playerWithSomething = playersInvolved[numPlayersInvolved - 1];
            vector<pair<string, string>> temp1;

            if (accuser == names[0])
            {
                temp1.push_back({ playerWithSomething, knownCard });
            }
            else
            {
                temp1.push_back({ playerWithSomething, person });
                temp1.push_back({ playerWithSomething, weapon });
                temp1.push_back({ playerWithSomething, place });
            }
            
            f.addFact(temp1);
        }

        // add facts about players with nothing
        int iterations = numPlayersInvolved - 1;
        bool addEnvelope = false;
        if (!showedCard)
        {
            ++iterations;
            addEnvelope = true;
        }

        for (int i = 0; i < iterations; ++i)
        {
            string currPerson = playersInvolved[i];
            vector<pair<string, string>> tempPerson;
            vector<pair<string, string>> tempWeapon;
            vector<pair<string, string>> tempPlace;

            // if nobody showed the card, the only people that could have it is the accuser or the envelope
            if (addEnvelope)
            {
                // person
                tempPerson.push_back({ "envelope", person });
                tempPerson.push_back({ accuser, person });

                // weapon
                tempWeapon.push_back({ "envelope", weapon });
                tempWeapon.push_back({ accuser, weapon });

                // place
                tempPlace.push_back({ "envelope", place });
                tempPlace.push_back({ accuser, place });
            }
            else
            {
                for (string player : names)
                {
                    // add a fact involving the current card and all people that is not the current person
                    if (player != currPerson)
                    {
                        // person
                        tempPerson.push_back({ player, person });

                        // weapon
                        tempWeapon.push_back({ player, weapon });

                        // place
                        tempPlace.push_back({ player, place });
                    }
                }

                // account for envelope having the cards as well
                tempPerson.push_back({ "envelope", person });
                tempWeapon.push_back({ "envelope", weapon });
                tempPlace.push_back({ "envelope", place });
            }

            f.addFact(tempPerson);
            f.addFact(tempWeapon);
            f.addFact(tempPlace);
        }
    }

    // look through facts and do some deductions
    f.eliminate(cards, names);
}