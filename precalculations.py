import json
import math
def abc2xyzw(ax,bx,cx,ay,by,cy):
    return (ax/cx, bx/cx + by/cy, ay/cy,-bx/cx + by/cy)

def abc2dec(a,b,c):
    return (a+b*2**0.5)/c

def generate_table():
    table = {}
    for a in range(-50, 50):
        for b in range(-50, 50):
            for c in range(1, 50):
                if math.gcd(a, b, c) > 1: 
                    continue
                dec = abc2dec(a,b,c)
                if dec<0 or dec>1 or dec in table:
                    continue
                table[dec] = [a,b,c]
    sorted_table = dict(sorted(table.items()))
    with open('abc_table.json', 'w') as file:
        json.dump(sorted_table, file)

generate_table()
