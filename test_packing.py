import numpy as np
from scipy.optimize import minimize
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon
import random
import math

ALPHA = 100 # Smoothing factor for smooth_max. Higher is more accurate but less smooth
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
SCALE_WEIGHT = 1
AXIAL_45ness_WEIGHT = 1

def pack(flap_lengths):
    x0 = []
    bounds = []
    for _ in flap_lengths:
        x0 += [random.random(), random.random()]
        bounds += [(0, 1), (0, 1)]
    x0.append(1)
    bounds.append((None,None))
    cons = [{'type':'ineq', 'fun': lambda x:  x[-1]}] #scale >0
    
    for i in range(len(flap_lengths)):
        for j in range(i+1,len(flap_lengths)):
            """
            uix = x[i*2]
            uiy = x[i*2+1]
            ujx = x[j*2]
            ujy = x[j*2+1]
            """
            # cons.append({'type':'ineq', 'fun': lambda x, i=i, j=j:
            #     distance(x[i*2], x[i*2+1], x[j*2], x[j*2+1]) - x[-1]*(flap_lengths[i] + flap_lengths[j])
            # })
            cons.append({'type':'ineq', 'fun': lambda x, i=i, j=j:
                smooth_max([dot(x[i*2]-x[j*2], x[i*2+1]-x[j*2+1],basis[0],basis[1]) for basis in BASES], alpha=ALPHA) - x[-1]*(flap_lengths[i] + flap_lengths[j])
            })

    def objective(x):
        scale = x[-1]
        return -1*scale
        # return scale * SCALE_WEIGHT + sum([smooth_max([dot(x[i*2]-x[j*2], x[i*2+1]-x[j*2+1],basis[0],basis[1]) for basis in BASES], alpha=ALPHA) for i in range(len(flap_lengths)) for j in range(i+1,len(flap_lengths)]) * AXIAL_45ness_WEIGHT

    solution = minimize(objective, x0, bounds=bounds, constraints=cons)
    print([round(x, 3) for x in solution.x])
    # display(solution.x,flap_lengths) 
    return solution.x

def smooth_max(x, alpha=ALPHA):
    return np.log(np.sum(np.exp(alpha * np.array(x)))) / alpha

def distance(x1, y1, x2, y2):
    return ((x1-x2)**2 + (y1-y2)**2)**0.5
def dot(x1, y1, x2, y2):
    return x1*x2 + y1*y2

# def display_multiple(x_list, flap_lengths_list):
#     num_plots = len(x_list)
#     num_cols = math.ceil(math.sqrt(num_plots))
#     num_rows = math.ceil(num_plots / num_cols)
    
#     fig, axs = plt.subplots(num_rows, num_cols, figsize=(5 * num_cols, 5 * num_rows))
#     axs = axs.flatten()  # Flatten the array of axes for easy iteration

#     for idx, (x, flap_lengths) in enumerate(zip(x_list, flap_lengths_list)):
#         scale = x[-1]
#         ax = axs[idx] if num_plots > 1 else axs
#         for i in range(len(flap_lengths)):
#             circle = plt.Circle((x[i*2], x[i*2+1]), flap_lengths[i]*scale, fill=False, edgecolor='blue')
#             center = (x[i*2], x[i*2+1])
#             point = plt.Circle(center, 0.01, color='black')
#             ax.add_artist(point)
#             ax.add_artist(circle)
#         ax.set_aspect('equal')
#         ax.set_xlim(0, 1)
#         ax.set_ylim(0, 1)
#         ax.set_title(f'Scale: {x[-1]:.3f}')

#     plt.show()

def create_octagon(center, radius):
    """Create the vertices of an octagon centered at `center` with the given `radius` (inscribed circle radius)."""
    vertex_radius = radius / np.cos(np.pi / 8)  # Adjust radius to be from center to vertex
    angles = np.linspace(0, 2 * np.pi, 9)[:-1] + np.pi / 8  # 8 angles for the octagon, rotated by 22.5 degrees
    vertices = [(center[0] + vertex_radius * np.cos(angle), center[1] + vertex_radius * np.sin(angle)) for angle in angles]
    return vertices

def display_multiple(x_list, flap_lengths_list):
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
            octagon = Polygon(create_octagon(center, radius), fill=False, edgecolor='blue')
            point = plt.Circle(center, 0.01, color='black')
            circle = plt.Circle(center, radius, fill=False, edgecolor='grey')
            ax.add_artist(point)
            ax.add_artist(octagon)
            ax.add_artist(circle)
        ax.set_aspect('equal')
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        ax.set_title(f'Scale: {x[-1]:.3f}')

    plt.show()

# Example usage
flap_lengths_list = [
    [1+2**0.5, 1+2**0.5, 1+2**0.5, 1+2**0.5,1+2**0.5, 1,1,1,1],
    # [1+2**0.5, 1+2**0.5,1,1]
    # [1,1,1]
]*16
x_list = [pack(flap_lengths) for flap_lengths in flap_lengths_list]
display_multiple(x_list, flap_lengths_list)
"""
Comments

try using scipy.sparse for ML crease patterns

If it becomes a real app, have the option of generating multiple tries each with a different random starting config, then allow the user to pick which one they like
"""