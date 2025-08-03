#pragma once
#include "globals.h"
#include <vector>
#include <string>

using namespace std;

class facts
{
public:
	// each element is { [ Person, Card] , [Person, Card], ... }, which would
	// represent one of these [Person, Card] tuples as being true. HOWEVER,
	// the tuples are not actually stored as tuples, there are just strings that
	// alternate, so it really looks like { Person, Card, Person, Card, ... }
	facts(vector<string> turnOrder = {});

	// pre: none
	// post: adds a fact(from accusations or elsewhere) to use in deductions
	void addFact(const vector<pair<string, string>>& possibilities);

	// pre: none
	// post: bulk of the logic here to eliminate stuff from facts and add stuff back
	// to cards. this where the magic happens!
	void eliminate(vector<vector<string>>& cards, const vector<string>& names);

private:
	vector<vector<pair<string, string>>> myFacts;
};
