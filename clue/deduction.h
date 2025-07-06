#pragma once
#include <vector>
#include <string>

using namespace std;

class deduction
{
public:
	// pre: none
	// post: looks at all accusations stored and deduces clues(if any)
	void deduce(vector<pair<vector<vector<string>>, bool>>& accusations);
};

