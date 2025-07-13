#include "facts.h"
#include <iostream>
#include <vector>
#include <string>

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
		myFacts.push_back(temp);
	}
}

void facts::addFact(vector<pair<string, string>> possibilities)
{
	myFacts.push_back(possibilities);	
}

void facts::eliminate()
{
	// look through myFacts and check for redundancy against all others
	return;
}
