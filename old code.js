//For reference if needed

//=============================================================================
//This is set up for the functionality described below, but not yet implemented to input the vertices and output the most convenient reference heights.  It's not yet complete either, but it can reliably go from a decimal approx of a radical back to the radical if the radical has a periodicity of less than 5, and has nothing before the periodic part.
//We need to input a decimal, and then output the continued fraction corresponding to this decimal as a set of three values: the integer component, the pre-repeating decimal component, and the repeating decimal component.  Next, these three components will be used to calculate the radical version of the decimal approximation.

const decApprox = 2.623615032630766;
let coefficients = [];

//takes the decimal (decApprox) as an input, and outputs the first 25 coefficients of its continued fraction as an array (coefficients)
function writeCF(decApprox) {
while (!Number.isInteger(decApprox)) {
let integerPart = Math.floor(decApprox); 
coefficients.push(integerPart);
decApprox = 1 / (decApprox - integerPart);
if (Number.isInteger(decApprox)) {
coefficients.push(Math.floor(decApprox));
}
// Add a safeguard to prevent infinite loops
if (coefficients.length > 25) {
    //console.error('Exceeded maximum iterations without converging.');
    break;
}}}

writeCF(decApprox);
console.log(decApprox);
console.log('Coefficients: ' + coefficients);

//takes the coefficients array, as well as the desired sequence length (4), search length (25), and outputs the periodicity of the CF, if it is found to be periodic, and the location where the periodicity begins (start)
function findRepeat(arr, sequenceLength, searchLength) {
const sequencePositions = {};

// Search within the first `searchLength` elements
for (let i = 0; i <= Math.min(arr.length, searchLength) - sequenceLength; i++) {
    const sequence = arr.slice(i, i + sequenceLength).join(',');

    if (sequencePositions.hasOwnProperty(sequence)) {
    const firstOccurrence = sequencePositions[sequence];
    const periodicity = i - firstOccurrence;
    return {
        sequence: sequence.split(',').map(Number),
        periodicity: periodicity,
        start: firstOccurrence
    };
    } else {
    sequencePositions[sequence] = i;
    }}
return null; // No repeating sequence found
}

const result = findRepeat(coefficients, 7, 25);

console.log("Periodicity: " + result.periodicity);
console.log("Start of Periodicity: " + result.start);
result.sequence = (coefficients.slice(result.start,(result.start+result.periodicity)));
const prePeriodic = coefficients.slice(0, result.start);
console.log("Periodic Sequence: " + result.sequence)

function solveRadical(pS) {
let a;
let b;
let c;
switch(pS.length) {
case 1:
    a = 1;
    b = pS[0];
    c = -1;
    break;
case 2:
    a = pS[0];
    b = (pS[0] * pS[1]);
    c = -pS[1];
    break;
case 3:
    a = (pS[0] * pS[1]) + 1;
    b = ((pS[0]) * (pS[1]) * (pS[2])) + pS[0] - pS[1] + pS[2];
    c = -(((pS[1]) * (pS[2])) + 1);
    break;
case 4:
    a = ((pS[0] * pS[1] * pS[2]) + pS[0] + pS[2]);
    b = ((pS[0] * pS[1] * pS[2] * pS[3]) + (pS[0] * pS[1]) + (pS[0] * pS[3]) + (pS[2] * pS[3]) - (pS[1] * pS[2]));
    c = -((pS[1] * pS[2] * pS[3]) + pS[1] + pS[3]);
    break;
default: 
    console.log('That number is too scary for me to deal with yet');
}
return [a, b, c];
};

//saves the a, b, c of the radical form of the periodic part as an array to variable abc.
const abc = solveRadical(result.sequence);
const qA = abc[0];
const qB = abc[1];
const qC = abc[2];

function quadratic (a, b, c) {
if (((-b + (Math.sqrt((b * b) - (4 * a * c))))/(2 * a)) > 0) {
    return [-b, (Math.sqrt(((b * b) - (4 * a * c)) / 2)), 2 * a];
    } else {
    return [-b, -(Math.sqrt(((b * b) - (4 * a * c)) / 2)), 2 * a];
}}

console.log("Pre-periodic: " + prePeriodic)
const values = quadratic(qA, qB, qC);
console.log(values)

function solvePrePeriodic (prePeriodic){
for (let j = prePeriodic.length; j > 0; j--){
    prePeriodic[j-2] += (1 / (prePeriodic[j-1]));
}
return prePeriodic[0];
}

const evalPrePeriodic = solvePrePeriodic(prePeriodic);

function convertToFrac (num){
let a=0
while (!(Number.isInteger(num))){
    num *= 10;
    a += 1;
}
return [num, Math.pow(10, a)];
}

const prePeriodicFrac = convertToFrac (evalPrePeriodic);
console.log(prePeriodicFrac)

//end added bit-------------------------------------------
