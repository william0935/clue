#pragma once
#include <vector>
#include <string>
#include "facts.h"

using namespace std;

class deduction
{
public:
	// pre: none
	// post: none
	deduction(vector<string> names);

	// pre: none
	// post: looks at all accusations stored and deduces clues(if any)
	void deduce(const vector<pair<vector<vector<string>>, pair<bool, string>>>& accusations,
		const vector<string>& names, vector<vector<string>>& cards);

private:
	// contains all the information about who has what
	facts f;
};
