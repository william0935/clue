#pragma once
#include <string>

using namespace std;

class card
{
public:
	card(string theCategory, string theName)
	{
		category = theCategory;
		name = theName;
	}

private:
	string category;
	string name;
};

