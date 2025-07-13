from pysat.formula import CNF, IDPool
from pysat.solvers import Glucose3
from pysat.card import CardEnc

# Define card sets
suspects = ['Green', 'Mustard', 'Peacock', 'Plum', 'Scarlet', 'White']
weapons = ['Candlestick', 'Dagger', 'LeadPipe', 'Revolver', 'Rope', 'Wrench']
rooms = ['Kitchen', 'Ballroom', 'Conservatory', 'DiningRoom', 'BilliardRoom', 'Library', 'Lounge', 'Hall', 'Study']
cards = suspects + weapons + rooms

# Input players
players = input("Enter player names separated by commas (put yourself first): ").strip().split(",")
players = [p.strip() for p in players]
num_players = len(players)
cards_per_player = (len(cards) - 3) // num_players

# Initialize solver setup
vpool = IDPool()
def var_holds(player, card):
    return vpool.id(f"holds({player},{card})")
def var_solution(card):
    return vpool.id(f"solution({card})")

cnf = CNF()

# Rule 1: each card must be held by someone or be in the solution
for c in cards:
    clause = [var_holds(p, c) for p in players] + [var_solution(c)]
    cnf.append(clause)
    for i in range(len(clause)):
        for j in range(i + 1, len(clause)):
            cnf.append([-clause[i], -clause[j]])

# Rule 2: players have exactly their number of cards
for p in players:
    lits = [var_holds(p, c) for c in cards]
    cnf.extend(CardEnc.equals(lits=lits, bound=cards_per_player, vpool=vpool))

# Rule 3: one suspect, one weapon, one room in solution
for group in [suspects, weapons, rooms]:
    sol_lits = [var_solution(c) for c in group]
    cnf.extend(CardEnc.equals(lits=sol_lits, bound=1, vpool=vpool))

# Input your hand
your_hand = input(f"Enter your cards (as {players[0]}), comma-separated: ").strip().split(",")
your_hand = [c.strip() for c in your_hand]
for c in your_hand:
    cnf.append([var_holds(players[0], c)])

solver = Glucose3()
solver.append_formula(cnf.clauses)

# Helper function
def show_deductions():
    print("\n==== CURRENT DEDUCTIONS ====")
    for c in cards:
        if not solver.solve(assumptions=[-var_solution(c)]):
            print(f"IN SOLUTION: {c}")
    for p in players:
        for c in cards:
            v = var_holds(p, c)
            if not solver.solve(assumptions=[v]):
                continue
            if not solver.solve(assumptions=[-v]):
                print(f"{p} HAS: {c}")
    print("============================\n")

# Input accusations
while True:
    line = input("Enter accusation and result (e.g. A: Green, Rope, Kitchen / B C - D shows / ENTER to quit): ").strip()
    if not line:
        break

    try:
        parts = line.split(":")
        accuser = parts[0].strip()
        rest = parts[1].strip()
        accused_cards, responses = rest.split("/")
        card_list = [x.strip() for x in accused_cards.strip().split(",")]
        response_parts = responses.strip().split("-")
        no_one = [x.strip() for x in response_parts[0].split()]
        if len(response_parts) > 1:
            shower = response_parts[1].strip().split()[0]
            # shower must have at least one of the cards
            cnf.append([var_holds(shower, c) for c in card_list])
        for p in no_one:
            for c in card_list:
                cnf.append([-var_holds(p, c)])
        solver.append_formula(cnf.clauses)
        show_deductions()
    except Exception as e:
        print("Could not parse input. Try again.")
        print("Example: A: Green, Rope, Kitchen / B C - D shows")
        print("Error:", e)
