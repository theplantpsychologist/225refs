import json
def abc2xyzw(ax,bx,cx,ay,by,cy):
    return (ax/cx, bx/cx + by/cy, ay/cy,-bx/cx + by/cy)

def abc2dec(a,b,c):
    return (a+b*2**0.5)/c

def generate_table():
    table = {}
    for a in range(-50, 50):
        for b in range(-50, 50):
            for c in range(1, 50):
                dec = abc2dec(a,b,c)
                if dec<0 or dec>1 or dec in table:
                    continue
                table[dec] = [a,b,c]
    sorted_table = dict(sorted(table.items()))
    with open('abc_table.json', 'w') as file:
        json.dump(sorted_table, file)

generate_table()

def find_closest_key(abc_table, target):
    closest_key = min(abc_table.keys(), key=lambda k: abs(k - target))
    return closest_key

# Example usage
abc_table = {
    0.1: "exact form 1",
    0.5: "exact form 2",
    0.9: "exact form 3"
}

target = 0.45
closest_key = find_closest_key(abc_table, target)
print(f"The closest key to {target} is {closest_key} with value {abc_table[closest_key]}")