/*
Things to figure out/implement:
- button to reset to home view
- implement the gradient descent
- figure out how to use transform controls to move vertices around in the ui
- draw faces
- color edges/faces based on strain values
- color vertices by fixed or not
- concentrate positive curvature rather than try to distribute
- control parameters from ui

- self intersection?

New algorithm
- start with triangulated mesh-- can use grid but with diagonal members arbitrarily in one direction
- error function is based on gaussian curvature of a vertex as well as edge strain. resulting gradient descent will move both a vertice's 3d position and 2d position [caveat: edges on the paper border must stay on the border]. 

TODO:
- calculate theta and thetaf of vertices (helper function to determine 3d angle of 3 points)
- calculate the gradient of thetaf-theta with respect to position of vertex

the outside angles of edge nodes don't count/are not subject to angular strain law. also edge nodes would be fixed anyways in a hole filling problem (although maybe open edges)
would be possible to hard code but would then need to deal with edge nodes. better would be to wrie custom Tan function so angle sorting worked correctly. NaN is probably coming from acos

initialize by randomizing position (but not so much that they cross) so it's more isotropic
angular error might not be necessary, since a triangle's lengths will also be affected if an angle is off. 

npx vite
*/


//============
//Setup

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import * as THREE from './three.module.js';
// import { OrbitControls } from './OrbitControls.js';


const mainCanvas = document.getElementById("3dCanvas")
//add main scene
const scene = new THREE.Scene();
scene.background = new THREE.Color("white")
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth/2,window.innerHeight);
mainCanvas.appendChild(renderer.domElement);
//add main camera
const camera = new THREE.PerspectiveCamera(40,0.5*window.innerWidth/window.innerHeight,0.1,1000);
camera.position.set(1.5,1.5,1.5);
camera.lookAt(0,0,0);
const controls = new OrbitControls( camera, renderer.domElement );
controls.update();

// function addOrigin(){
//     const origin_axes = new THREE.Group();
//     const origin = new THREE.Vector3(0,0,0);
//     const x_axis = new THREE.BufferGeometry().setFromPoints([origin,new THREE.Vector3(0.1,0,0)]);
//     const y_axis = new THREE.BufferGeometry().setFromPoints([origin,new THREE.Vector3(0,0.1,0)]);
//     const z_axis = new THREE.BufferGeometry().setFromPoints([origin,new THREE.Vector3(0,0,0.1)]);
//     origin_axes.add(new THREE.Line(x_axis,new THREE.LineBasicMaterial({color:0xff0000,linewidth:10})))
//     origin_axes.add(new THREE.Line(y_axis,new THREE.LineBasicMaterial({color:0x00ff00})))
//     origin_axes.add(new THREE.Line(z_axis,new THREE.LineBasicMaterial({color:0x0000ff})))
//     scene.add(origin_axes)
//     return origin_axes
// }

//============ 3d Display settings

// const vertexMaterial = new THREE.MeshBasicMaterial({color:0xff0000})
// const vertexSize = 0.01
const edgeLineMaterial = new THREE.MeshBasicMaterial({color:0x000000})
const mountainLineMaterial = new THREE.MeshBasicMaterial({color:0xff0000})
const valleyLineMaterial = new THREE.MeshBasicMaterial({color:0x0000ff})
const edgePlaneMaterial = new THREE.MeshBasicMaterial({color:0x000000,opacity:0.2,transparent:true})
const mountainPlaneMaterial = new THREE.MeshBasicMaterial({color:0xff0000,opacity:0.2,transparent:true})
const valleyPlaneMaterial = new THREE.MeshBasicMaterial({color:0x0000ff,opacity:0.2,transparent:true})
const axisMaterial = new THREE.MeshBasicMaterial({color:0x00ff00,opacity:0.5,transparent:true})
const gridMaterial = new THREE.MeshBasicMaterial({color:0xa0a0a0,opacity:0.5,transparent:true})
//======================main functions
// export function UploadFold() {
//     return new Promise((resolve, reject) => {
//         paper.project.clear();
//         const reader = new FileReader();
//         reader.onload = function () {
//             const input = reader.result;
//             // Load the cp
//             const cpObject = readFoldFile(input);
//             console.log(cpObject);
//             for (const vertex of cpObject.vertices) {
//                 vertex.xabc = dec2abc(abc_table, vertex.x);
//                 vertex.yabc = dec2abc(abc_table, 1 - vertex.y);
//                 vertex.xyzw = abc2xyzw(...vertex.xabc, ...vertex.yabc);
//                 if (document.getElementById("abcForm").checked) {
//                     vertex.text = `[${vertex.xabc.join(', ')}]\n[${vertex.yabc.join(', ')}]`;
//                 } else if (document.getElementById("xyzwForm").checked) {
//                     var idk = vertex.xyzw.map(float => Math.trunc(float * 1000) / 1000);
//                     vertex.text = `(${idk.join(', ')})`;
//                 } else {
//                     vertex.text = '';
//                 }
//             }

//             console.log("abc coords calculated");
//             // Display the cp
//             displayCp(cpObject, 50, 50, 550, 550, false, true);
//             display3d(cpObject);
//             resolve(cpObject);
//         };
//         reader.onerror = function (error) {
//             reject(error);
//         };
//         const fileSelector = document.getElementById("inputfile");
//         if (fileSelector) {
//             reader.readAsText(fileSelector.files[0]);
//         } else {
//             reject(new Error("File input element not present"));
//         }
//     });
// }
export function UploadFold() {
    paper.project.clear();
    const reader = new FileReader();
    reader.onload = function () {
        const input = reader.result;
        //load the cp
        const cpObject = readFoldFile(input);
        console.log(cpObject)
        for (const vertex of cpObject.vertices) {
            // var x = vertex.x
            vertex.xabc = dec2abc(abc_table, vertex.x);
            vertex.yabc = dec2abc(abc_table, 1-vertex.y);
            vertex.xyzw = abc2xyzw(...vertex.xabc,...vertex.yabc);
            if (document.getElementById("abcForm").checked) {
                vertex.text = `[${vertex.xabc.join(', ')}]\n[${vertex.yabc.join(', ')}]`
            } else if (document.getElementById("xyzwForm").checked) {
                var idk = vertex.xyzw.map(float => Math.trunc(float*1000)/1000)//floatToFraction(float));
                vertex.text = `(${idk.join(', ')})`
            } else{vertex.text = ''}
        }

        console.log("abc coords calculated")
        //display the cp 
        displayCp(cpObject,50,50,550,550,false,true);
        display3d(cpObject)
        return cpObject
    };
    const fileSelector = document.getElementById("inputfile");
    if (fileSelector) {
        reader.readAsText(fileSelector.files[0]);
    } else {
        console.log("File input element not present");
    }
}
export function display3d(cpObject){
    console.log("displaying 3d")
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }
    // addOrigin()
    // const theta = document.getElementById("theta").value
    // const projector = [
    //     [Math.sin(theta), Math.cos(theta), Math.cos(theta), (1/3)**0.5],
    //     [Math.cos(theta), Math.sin(theta), Math.cos(theta), (1/3)**0.5],
    //     [Math.cos(theta), Math.cos(theta), Math.sin(theta), (1/3)**0.5] //TODO: maybe the slider can be this value. Or, could use the "h" value from the paper to see how that changes things
    // ];
    const projector = [
        [1,0,0,(1/3)**0.5],
        [0,1,0,(1/3)**0.5],
        [0,0,1,(1/3)**0.5]
    ];
    // const projector = [
    //     [0,1,0,0],
    //     [0,0,1,0],
    //     [0,0,0,1]
    // ];
    function project4_3(coords4d){
        return math.transpose(math.multiply(projector, math.transpose(coords4d)));
    }

    // const origin_axes = new THREE.Group();
    const origin = new THREE.Vector3(0,0,0);
    const x_axis = project4_3([0.25,0,0,0])
    const y_axis = project4_3([0,0.25,0,0])
    const z_axis = project4_3([0,0,0.25,0])
    const w_axis = project4_3([0,0,0,0.25])
    scene.add(createConnectingCylinder(origin,new THREE.Vector3(...x_axis),0.01,new THREE.MeshBasicMaterial({color:0xEDE095})))
    scene.add(createConnectingCylinder(origin,new THREE.Vector3(...y_axis),0.01,new THREE.MeshBasicMaterial({color:0xABD464})))
    scene.add(createConnectingCylinder(origin,new THREE.Vector3(...z_axis),0.01,new THREE.MeshBasicMaterial({color:0x45B53B})))
    scene.add(createConnectingCylinder(origin,new THREE.Vector3(...w_axis),0.01,new THREE.MeshBasicMaterial({color:0x089E54})))

    // const cpdisplay3d = new THREE.Group();
    for (const vertex of cpObject.vertices) {
        // var coords = project4_3(vertex.xyzw);
        vertex.vector = new THREE.Vector3(...project4_3(vertex.xyzw));
        //TODO: add a small cube marker here
    }
    for (const crease of cpObject.creases) {
        // console.log(new THREE.BufferGeometry().setFromPoints([crease.vertices[0].vector,crease.vertices[1].vector]).position)
        // scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([crease.vertices[0].vector,crease.vertices[1].vector]),crease.mv=="M"?mountainMaterial:crease.mv=="V"?valleyMaterial:edgeMaterial))
        scene.add(createConnectingCylinder(crease.vertices[0].vector,crease.vertices[1].vector,0.005,crease.mv=="M"?mountainLineMaterial:crease.mv=="V"?valleyLineMaterial:edgeLineMaterial))

        try{
            var points = calculate(crease.vertices[0].xyzw,crease.vertices[1].xyzw)
            console.log(points)
            points = points.map(point => new THREE.Vector3(...project4_3(point)))
            var geom = new THREE.BufferGeometry().setFromPoints(points)
            var indices = new Uint16Array([
                0, 1, 2,
                0, 2, 3,
                2,1,0, //repeat them but backwards so the mesh can be seen from both sides
                3,2,0
            ]);
            geom.setIndex(new THREE.BufferAttribute(indices, 1));
            geom.computeVertexNormals();
            scene.add(new THREE.Mesh( geom, crease.mv=="M"?mountainPlaneMaterial:crease.mv=="V"?valleyPlaneMaterial:edgePlaneMaterial ));
        } catch{
            console.log("unable to create plane for crease")
        }
    }
    // Draw 4-dimensional lattice
    const start = -1
    const end = 2
    const spacing = 1

    //add the w lines
    const grid = new THREE.Group();
    for(var x = start+1; x <= end-1; x+=spacing){
        for(var y = start+1; y <= end-1; y+=spacing){
            for(var z = start+1; z <= end-1; z+=spacing){
                scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...project4_3([x,y,z,start])), new THREE.Vector3(...project4_3([x,y,z,end]))]),gridMaterial))
            }
        }
    }
    //add the y lines
    for(var x = start+1; x <= end-1; x+=spacing){
        for(var z = start+1; z <= end-1; z+=spacing){
            for(var w = start+1; w <= end-1; w+=spacing){
                scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...project4_3([x,start,z,w])), new THREE.Vector3(...project4_3([x,end,z,w]))]),gridMaterial))
            }
        }
    }
    //add the z lines
    for(var x = start+1; x <= end-1; x+=spacing){
        for(var y = start+1; y <= end-1; y+=spacing){
            for(var w = start+1; w <= end-1; w+=spacing){
                scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...project4_3([x,y,start,w])), new THREE.Vector3(...project4_3([x,y,end,w]))]),gridMaterial))
            }
        }
    }
    //add the x lines
    for(var y = start+1; y <= end-1; y+=spacing){
        for(var z = start+1; z <= end-1; z+=spacing){
            for(var w = start+1; w <= end-1; w+=spacing){
                scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...project4_3([start,y,z,w])), new THREE.Vector3(...project4_3([end,y,z,w]))]),gridMaterial))
            }
        }
    }
}



function createConnectingCylinder(start, end,r=0.01,material=axisMaterial) {
    // Calculate the direction vector from start to end
    const direction = new THREE.Vector3().subVectors(end, start);
    
    // Calculate the length of the cylinder
    const length = direction.length();
    
    // Calculate the midpoint between start and end
    const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    
    // Create the cylinder geometry
    const cylinderGeometry = new THREE.CylinderGeometry(r, r, length, 8, 1, true);
    
    // Create the cylinder mesh
    const cylinder = new THREE.Mesh(cylinderGeometry, material);
    
    // Align the cylinder with the direction vector
    const orientation = new THREE.Matrix4();
    orientation.lookAt(start, end, new THREE.Vector3(0, 1, 0));
    
    // Rotate the cylinder to align with the direction vector
    const rotationMatrix = new THREE.Matrix4();
    rotationMatrix.makeRotationX(Math.PI / 2);
    orientation.multiply(rotationMatrix);
    
    // Apply the orientation to the cylinder
    cylinder.applyMatrix4(orientation);
    
    // Position the cylinder at the midpoint
    cylinder.position.copy(midpoint);
    
    return cylinder;
}


//====================== functions to render as planes
function sign(x) {
    return Math.sign(x);
}
const resolution = 1
function adjustValue(arr, index, adjustment) {
    if (index < 0) {
        arr[3] += -adjustment;
    } else if (index >= arr.length) {
        arr[0] += -adjustment;
    } else {
        arr[index] += adjustment;
    }
}
function createAdjustedCopies(arr, direction, sign, resolution) {
    let arrMinus = arr.slice();
    arrMinus[direction] -= sign * resolution;
    adjustValue(arrMinus, direction + 1, sign * resolution / (2 * Math.sqrt(2)));
    adjustValue(arrMinus, direction - 1, sign * resolution / (2 * Math.sqrt(2)));

    let arrPlus = arr.slice();
    arrPlus[direction] += sign * resolution;
    adjustValue(arrPlus, direction + 1, -sign * resolution / (2 * Math.sqrt(2)));
    adjustValue(arrPlus, direction - 1, -sign * resolution / (2 * Math.sqrt(2)));

    return [arrMinus, arrPlus];
}
function calculate(xyzw1, xyzw2) {
    // Calculate deltas
    const deltas = xyzw2.map((value, i) => value - xyzw1[i]);
    // Find non-zero indices
    const nonzeroIndices = deltas
        .map((delta, i) => delta !== 0 ? i : -1)
        .filter(index => index !== -1);
    const nonZeroCount = nonzeroIndices.length;
    let direction
    var sign
    var xyzw1minus
    var xyzw1plus
    var xyzw2minus
    var xyzw2plus
    switch (nonZeroCount) {
        case 0:
            console.log("vertices are the same");
            break;

        case 1:
            {const direction = nonzeroIndices[0];
            const sign = deltas[direction] > 0 ? 1 : -1;
            [xyzw1minus, xyzw1plus] = createAdjustedCopies(xyzw1, direction, sign, resolution);
            [xyzw2minus, xyzw2plus] = createAdjustedCopies(xyzw2, direction, sign, resolution);
            console.log(sign * direction);
            return [xyzw1minus, xyzw1plus, xyzw2plus, xyzw2minus];}

        case 2:
            {if (JSON.stringify(nonzeroIndices) === JSON.stringify([0, 2]) || JSON.stringify(nonzeroIndices) === JSON.stringify([1, 3])) {
                if (deltas[nonzeroIndices[0]] > 0 && deltas[nonzeroIndices[1]] > 0) {
                    direction = (nonzeroIndices[0] + nonzeroIndices[1]) / 2;
                    sign = 1;
                } else if (deltas[nonzeroIndices[0]] < 0 && deltas[nonzeroIndices[1]] < 0) {
                    direction = (nonzeroIndices[0] + nonzeroIndices[1]) / 2;
                    sign = -1;
                } else {
                    direction = (nonzeroIndices[1] + 1) % 4;
                    sign = ((nonzeroIndices[1] % 4) ? -1 : 1) * ((nonzeroIndices[1] < 0) ? -1 : 1);
                }
                const [xyzw1minus, xyzw1plus] = createAdjustedCopies(xyzw1, direction, sign, resolution);
                const [xyzw2minus, xyzw2plus] = createAdjustedCopies(xyzw2, direction, sign, resolution);
                console.log(sign * direction);
                return [xyzw1minus, xyzw1plus, xyzw2plus, xyzw2minus];
            } else {
                console.log("case 2");
                break
            }
            break;
}
        case 3:
            {const perpendicular = nonzeroIndices.find(i => !nonzeroIndices.includes(i));
            const direction = (perpendicular + 2) % 4;
            const sign = 1; // This is a guess, as noted in the original code
            const [xyzw1minus, xyzw1plus] = createAdjustedCopies(xyzw1, direction, sign, resolution);
            const [xyzw2minus, xyzw2plus] = createAdjustedCopies(xyzw2, direction, sign, resolution);
            // console.log(sign * direction);
            return [xyzw1minus, xyzw1plus, xyzw2plus, xyzw2minus];}

        case 4:
            console.log("case 2");
            break;
    }
}


//======================ui things
//detect click
//if there's a vertex in the raytrace, attach it to the transform controls. otherwise detatch
//keep transforming until user presses enter (because transforming will also require mouse clicking). also pause the orbit controls during this time
function click(event) {
    console.log(event.clientX,event.clientY)

}
document.addEventListener("click", click);
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
function onPointerMove( event ) {
	// calculate pointer position in normalized device coordinates
	// (-1 to +1) for both components
	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}
function render() {
	// update the picking ray with the camera and pointer position
	raycaster.setFromCamera( pointer, camera );
	// calculate objects intersecting the picking ray
	const intersects = raycaster.intersectObjects( scene.children );
	for ( let i = 0; i < intersects.length; i ++ ) {
		intersects[ i ].object.material.color.set( 0xff0000 );
	}
	renderer.render( scene, camera );
}

window.addEventListener( 'pointermove', onPointerMove );
window.requestAnimationFrame(render);
//=======================================
function animate(){
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene,camera);
    // display3d(cpObject)
}
animate();
