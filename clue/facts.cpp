#include "facts.h"
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std; 

facts::facts(vector<string> turnOrder)
{
	// every card should have the possibility of being with every person, so
	// need to initialize facts to represent this
	for (auto card : allCards)
	{
		vector<pair<string, string>> temp;
		for (auto person : turnOrder)
		{
			temp.push_back({ person, card });
		}
        temp.push_back({ "envelope", card });
		myFacts.push_back(temp);
	}
}

void facts::addFact(vector<pair<string, string>> possibilities)
{
	myFacts.push_back(possibilities);	
}

void facts::eliminate(vector<vector<string>>& cards, vector<string> names)
{
	// look through myFacts and check for redundancy against all others
    vector<vector<string>> confirmed = cards;
    bool changed = true;

    while (changed)
    {
        changed = false;

        // collect any new unit clauses as confirmed facts
        for (vector<pair<string, string>>& clause : myFacts)
        {
            if (clause.size() == 1)
            {
                vector<string> factVec{ clause[0].first, clause[0].second};
                if (find(confirmed.begin(), confirmed.end(), factVec) == confirmed.end())
                {
                    confirmed.push_back(factVec);
                    cards.push_back(factVec);
                    changed = true;
                }
            }
        }

        // need to check for players where you know all their cards and eliminate facts
        int numCards = 18 / names.size();
        vector<int> count(names.size(), 0);
        for (vector<string> fact : confirmed)
        {
            for (int i = 0; i < names.size(); ++i)
            {
                if (fact[0] == names[i])
                {
                    ++count[i];
                }
            }
        }

        for (int i = 0; i < count.size(); ++i)
        {
            // if we know all of their cards already...
            if (numCards == count[i])
            {
                // eliminate anything that isn't part of confirmed with their name, (P, X)
                for (vector<pair<string, string>>& clause : myFacts)
                {
                    int before = clause.size();
                    for (auto it = clause.begin(); it != clause.end(); )
                    {
                        bool isInConfirmed = false;
                        for (auto fact : confirmed)
                        {
                            if (it->first == fact[0] && it->second == fact[1])
                            {
                                isInConfirmed = true;
                            }
                        }

                        if (!isInConfirmed && it->first == names[i])
                        {
                            // erase returns the next iterator
                            it = clause.erase(it);
                        }
                        else
                        {
                            ++it;
                        }
                        
                    }

                    if (clause.size() != before)
                    {
                        changed = true;
                    }
                }
            }
        }

        // go through every confirmed fact (P,C)
        for (vector<string>& fact : confirmed)
        {
            string P = fact[0];
            string C = fact[1];
            pair<string, string> target{ P, C };

            // remove every clause that contains (P,C) since it's satisfied already
            for (auto it = myFacts.begin(); it != myFacts.end(); )
            {
                if (find(it->begin(), it->end(), target) != it->end())
                {
                    // dont want to remove the statements of length 1
                    if (it->size() > 1)
                    {
                        it = myFacts.erase(it);
                        changed = true;
                    }
                    else
                    {
                        ++it;
                    }
                }
                else
                {
                    ++it;
                }
            }

            // strip out any other (X,C) from all other clauses
            for (vector<pair<string, string>>& clause : myFacts)
            {
                // Only remove pairs for the same card BUT a different person
                int before = clause.size();
                clause.erase(remove_if(clause.begin(), clause.end(),
                    [&](const pair<string, string>& somePair) {
                        return somePair.second == C && somePair.first != P;
                    }), clause.end());
                if (clause.size() != before)
                {
                    changed = true;
                }
            }
        }
    }
	return;
}
