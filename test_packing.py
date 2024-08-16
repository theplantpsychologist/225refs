import numpy as np
from scipy.optimize import minimize
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon
import random
import math
import json

ALPHA = 100 # Smoothing factor for smooth_max. Higher is more accurate but less smooth
    #TODO: perhaps alpha should be a function of the path lengths
# BETA = 10 #parameter for active paths
# GAMMA = 1 #another parameter for active paths
B = 0.1 #how far away is it ok to not be a 45 degree path. >0.1
K = 2 #how quickly to be ok with not being a 45 degree path. Must be even int (is an exponent)

RESOLUTION = 100 #allowable sum of x+w+z+w+c
with open('abc_table.json', 'r') as file:
    abc_table = json.load(file)
BASES = (
    (1,0),
    (1/2**0.5,1/2**0.5),
    (0,1),
    (-1/2**0.5,1/2**0.5),
    (-1,0),
    (-1/2**0.5,-1/2**0.5),
    (0,-1),
    (1/2**0.5,-1/2**0.5)
) #xyzw bases
# BASES = (
#     (1,0),
#     (0.5,3**0.5/2),
#     (-0.5,3**0.5/2),
#     (-1,0),
#     (-0.5,-3**0.5/2),
#     (0.5,-3**0.5/2)
# ) #hp bases
# BASES = (
#     (1,0),
#     (0,1),
#     (-1,0),
#     (0,-1)
# ) #bp bases

# SCALE_WEIGHT = 1
# AXIAL_45ness_WEIGHT = 1

#main function
def pack(flap_lengths):
    x0 = []
    bounds = []
    for _ in flap_lengths:
        x0 += [random.random(), random.random()]
        bounds += [(0, 1), (0, 1)]
    x0.append(1)
    bounds.append((None,None))
    cons = [
            {'type':'ineq', 'fun': lambda x:  x[-1]},
            # {'type':'eq','fun':lambda x:np.cos(np.pi/x[-1])**2 -1}
        ] 
    
    for i in range(len(flap_lengths)):
        for j in range(i+1,len(flap_lengths)):
            # Usual circle packing no-overlap constraint:
            cons.append({'type':'ineq', 'fun': lambda x, i=i, j=j:
                distance(x[i*2], x[i*2+1], x[j*2], x[j*2+1]) - x[-1]*(flap_lengths[i] + flap_lengths[j])
            })
            """
            uix = x[i*2]
            uiy = x[i*2+1]
            ujx = x[j*2]
            ujy = x[j*2+1]
            L = flap_lengths[i] + flap_lengths[j]
            """
            # Step 1: Polygon packing no-overlap constraint:
            # cons.append({'type':'ineq', 'fun': lambda x, i=i, j=j:
            #     smooth_max([dot(x[i*2]-x[j*2], x[i*2+1]-x[j*2+1],basis[0],basis[1]) for basis in BASES], alpha=ALPHA) - x[-1]*(flap_lengths[i] + flap_lengths[j])
            # })
            """
            dx = x[i*2] - x[j*2]
            dy = x[i*2+1] - x[j*2+1]

            
            ((dx^2 - dy^2)(dy)(dx))^2 measures how far off from a 45 degree angle the path is
            """
            # Step 2: encourage active paths to be 45 degree creases:
            # cons.append({'type':'ineq', 'fun': lambda x, i=i, j=j:
            #     ( smooth_max([dot(x[i*2]-x[j*2], x[i*2+1]-x[j*2+1],basis[0],basis[1]) for basis in BASES], alpha=ALPHA) - x[-1]*(flap_lengths[i] + flap_lengths[j]) +BETA )**2 
            #     / 
            #     (GAMMA*(((x[i*2]-x[j*2])**2 - (x[i*2+1]-x[j*2+1])**2)*(x[i*2] - x[j*2])*(x[i*2+1] - x[j*2+1]))**2 + BETA)
            #     - BETA
            # })

            # cons.append({'type':'ineq', 'fun': lambda x, i=i, j=j:
            #     ((x[i*2]-x[j*2])**2+(x[i*2+1]-x[j*2+1])**2)**0.5 - 
            #     x[-1]*(flap_lengths[i] + flap_lengths[j])*(B+1-B*math.cos(4*math.atan2(x[i*2+1]-x[j*2+1],x[i*2]-x[j*2]))**K)
            # })

    def objective(x):
        scale = x[-1]

        # return -1*scale

        # return -1*scale*(1+np.cos(np.pi*1/scale)**2)*np.sum(np.cos(np.pi*x[:-1]/scale)**2+1) #FOR BP   

        return -1*scale *(1+np.cos(np.pi*1/scale)**2)*np.sum(np.cos(np.pi*x[:-1]/scale)**2+1) #FOR HP
    solution = minimize(objective, x0, bounds=bounds, constraints=cons)
    # print([round(x, 3) for x in solution.x])
    return solution.x


#math helper functions
def smooth_max(x, alpha=ALPHA):
    return np.log(np.sum(np.exp(alpha * np.array(x)))) / alpha
def distance(x1, y1, x2, y2):
    return ((x1-x2)**2 + (y1-y2)**2)**0.5
def dot(x1, y1, x2, y2):
    return x1*x2 + y1*y2
    # Load the dictionary from abc_table.json

def dec2abc(target,abc_table=abc_table):
    keys = list(map(float, abc_table.keys()))
    keys.sort()  # Ensure keys are sorted

    # Binary search, using initial estimate of the index assuming an even distribution of keys
    left = max(0, 0)
    right = min(len(keys) - 1, len(keys) - 1)
    
    while left < right:
        mid = (left + right) // 2
        if keys[mid] == target:
            if keys[mid] == 0:
                return [0, 0, 1]
            elif keys[mid] == 1:
                return [1, 0, 1]
            else:
                return abc_table[keys[mid]]
        elif keys[mid] < target:
            left = mid + 1
        else:
            right = mid

    # After the loop, left should be the closest index
    if left == 0 or (left < len(keys) and abs(keys[left] - target) < abs(keys[left - 1] - target)):
        closest_key = keys[left]
    else:
        closest_key = keys[left - 1]

    if closest_key == 0:
        output = [0, 0, 1]
    elif closest_key == 1:
        output = [1, 0, 1]
    else:
        output = abc_table[str(closest_key)]

    return output
#Display functions
def create_octagon(center, radius,n=8):
    """Create the vertices of an octagon centered at `center` with the given `radius` (inscribed circle radius)."""
    vertex_radius = radius / np.cos(np.pi / n)  # Adjust radius to be from center to vertex
    angles = np.linspace(0, 2 * np.pi, n+1)[:-1] + np.pi / n  # 8 angles for the octagon, rotated by 22.5 degrees
    vertices = [(center[0] + vertex_radius * np.cos(angle), center[1] + vertex_radius * np.sin(angle)) for angle in angles]
    return vertices

def display_multiple(x_list, flap_lengths_list,ngon=len(BASES)):
    num_plots = len(x_list)
    num_cols = math.ceil(math.sqrt(num_plots))
    num_rows = math.ceil(num_plots / num_cols)
    
    fig, axs = plt.subplots(num_rows, num_cols, figsize=(5 * num_cols, 5 * num_rows))
    axs = axs.flatten()  # Flatten the array of axes for easy iteration

    for idx, (x, flap_lengths) in enumerate(zip(x_list, flap_lengths_list)):
        scale = x[-1]
        ax = axs[idx]
        for i in range(len(flap_lengths)):
            center = (x[i*2], x[i*2+1])
            radius = flap_lengths[i] * scale
            # octagon = Polygon(create_octagon(center, radius,ngon), fill=False, edgecolor='blue')
            # ax.add_artist(octagon)
            point = plt.Circle(center, 0.01, color='black')
            circle = plt.Circle(center, radius, fill=False, edgecolor='grey')
            ax.add_artist(point)
            ax.add_artist(circle)
        ax.set_aspect('equal')
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        ax.set_title(f'Scale: {x[-1]:.3f},grid:{1/x[-1]:.3f}')

    plt.show()

# Example usage
N = 30
n = 6
flap_lengths_list = [
    [2,2,2,3,3,1,1,1,1],
    # [1+2**0.5, 1+2**0.5, 1+2**0.5, 1+2**0.5,1+2**0.5, 1,1,1,1],
    # [1+2**0.5, 1+2**0.5, 1+2**0.5, 1+2**0.5,1],
    # [1+2**0.5, 1+2**0.5,1,1]
    # [1,1,1]
]*N
x_list = [pack(flap_lengths) for flap_lengths in flap_lengths_list]
top_n_solutions = sorted(x_list, key=lambda x: x[-1], reverse=True)[:n]
display_multiple(top_n_solutions, flap_lengths_list[:n])
"""
Comments

try using scipy.sparse for ML crease patterns

If it becomes a real app, have the option of generating multiple tries each with a different random starting config, then allow the user to pick which one they like

for global optimization, run it for N times, sort them by scale and only picking unique solutions, then display the top n solutions
"""