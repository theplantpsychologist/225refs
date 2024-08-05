resolution = 10
def adjust_value(lst, index, adjustment):
    if index < 0:
        lst[-1] += -adjustment
    elif index >= len(lst):
        lst[0] += -adjustment
    else:
        lst[index] += adjustment
def create_adjusted_copies(xyzw, direction, sign, resolution):
    #TODO: sign is probably not needed
    xyzw_minus = xyzw.copy()
    xyzw_minus[direction] -= sign * resolution
    adjust_value(xyzw_minus, direction + 1, sign * resolution / (2 * 2**0.5))
    adjust_value(xyzw_minus, direction - 1, sign * resolution / (2 * 2**0.5))

    xyzw_plus = xyzw.copy()
    xyzw_plus[direction] += sign * resolution
    adjust_value(xyzw_plus, direction + 1, -sign * resolution / (2 * 2**0.5))
    adjust_value(xyzw_plus, direction - 1, -sign * resolution / (2 * 2**0.5))

    return xyzw_minus, xyzw_plus

def calculate(xyzw1, xyzw2):
    deltas = [xyzw2[i] - xyzw1[i] for i in range(4)]
    nonzero_indices = [i for i, delta in enumerate(deltas) if delta != 0]
    match sum(1 for delta in deltas if delta != 0):
        case 0:
            print("vertices are the same")
        case 1:
            direction = nonzero_indices[0]
            if deltas[direction] > 0:
                sign = 1
            else:
                sign = -1
            xyzw1minus, xyzw1plus = create_adjusted_copies(xyzw1, direction, sign, resolution)
            xyzw2minus, xyzw2plus = create_adjusted_copies(xyzw2, direction, sign, resolution)
            print(sign*direction)
            return [xyzw1minus, xyzw1, xyzw1plus, xyzw2plus, xyzw2, xyzw2minus]
           
        case 2:
            #one of the zero directions is the perependicular, and one is the parallel. if both nonzeros are positive, it's the one between them, positive. If both are negative, it's the one beetween them negative.
            # 10-10 --- -3    -1010 --- +3     010-1 --- +0    0-101 --- -0
            if nonzero_indices in ([0, 2],[1,3]):
                if deltas[nonzero_indices[0]] > 0 and deltas[nonzero_indices[1]] > 0:
                    direction = (nonzero_indices[0]+nonzero_indices[1])/2
                    sign = 1
                if deltas[nonzero_indices[0]] < 0 and deltas[nonzero_indices[1]] < 0:
                    direction = (nonzero_indices[0]+nonzero_indices[1])/2
                    sign = -1
                else:
                    direction = (nonzero_indices[1]+1)%4
                    sign = (-1 if nonzero_indices[1]//4 else 1)*(-1 if nonzero_indices[1]<0 else 1)
                xyzw1minus, xyzw1plus = create_adjusted_copies(xyzw1, direction, sign, resolution)
                xyzw2minus, xyzw2plus = create_adjusted_copies(xyzw2, direction, sign, resolution)
                print(sign*direction)
                return [xyzw1minus, xyzw1, xyzw1plus, xyzw2plus, xyzw2, xyzw2minus]
            else:
                print("case 2")
        case 3:
            perpendicular = next(i for i in range(4) if i not in nonzero_indices)
            direction = (perpendicular+2)%4
            sign = 1 #TODO: this is a guess but I don't think it matters
            xyzw1minus, xyzw1plus = create_adjusted_copies(xyzw1, direction, sign, resolution)
            xyzw2minus, xyzw2plus = create_adjusted_copies(xyzw2, direction, sign, resolution)
            print(sign*direction)
            return [xyzw1minus, xyzw1, xyzw1plus, xyzw2plus, xyzw2, xyzw2minus]
        case 4:
            print("case 2")

origin = [0,0,0,0]
point1 = [0,1,1,1]
# point2 = [1,1,0,0]
# point3 = [-1,0,1,0]

print(calculate(origin, point1))
# print(calculate(origin, point2))
# print(calculate(origin, point3))

