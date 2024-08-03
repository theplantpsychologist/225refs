//for an a, b, c, return the number of blocks

const a = 2;
const b = -1;
const c = 1;

//takes as an input a numerator and denominator of a fraction, outputs the coefficients of its continued fraction in an array "coefficients"
function writeCF(num, den) {
  let coefficients = [];
  let iterations = 0;
  const maxIterations = 25;

  while (den != 0 && !Number.isInteger(num / den)) {
    let integerPart = Math.floor(num / den);
    coefficients.push(integerPart);

    // Update num and den
    let remainder = num % den;
    num = den;
    den = remainder;

    iterations++;

    if (iterations > maxIterations) {
      console.error('Exceeded maximum iterations without converging.');
      break;
    }
  }

  // Add the final integer if the division is exact
  coefficients.push(Math.floor(num / den));
  
  return coefficients;
};

function convertABC (a, b, c) {
  if (c <= 0 || ((a + (b * Math.sqrt(2)))/c <= 0)) {
    console.error('Invalid input.');
    return null;
  }

  function sumArray(arr) {
    return arr.reduce((sum, value) => sum + value, 0);
  }

   let cFOne, cFTwo, type;
   if (a >= 0 && b >= 0){
    cFOne = writeCF(a, c);
    cFTwo = writeCF(b, c);
    type = 0;
  } else if (a < 0 && a + b >= 0) {
    cFOne = writeCF(Math.abs(a), c);
    cFTwo = writeCF(b - Math.abs(a), c);
    type = 1;
  } else if (b < 0 && a+(2*b) >= 0) {
    cFOne = writeCF (a + (2 * b), c);
    cFTwo = writeCF (Math.abs(b), c);
    type = 2;
  } else {
    return null;
  }

  return {
    cFOne: cFOne,
    cFOneCt: sumArray(cFOne),
    cFTwo: cFTwo,
    cFTwoCt: sumArray(cFTwo),
    type: type
  }
}

const convABC = convertABC(a,b,c);

console.log(convABC)

//returns the number of blocks required to develop a rectangle of w/h = a+b(rt2)/c
console.log(`This reference may be deconstructed into ${convABC.cFOneCt + convABC.cFTwoCt} blocks...`);

//returns a max bound on the number of creases required to develop the rectangle
function creaseCount (cFOneCt, cFTwoCt, type) {
  let count = 0;
  if (type === 0 && cFTwoCt === 0) {
    count = (3 * (cFOneCt + cFTwoCt - 1));
} else if (type === 0) {
    count = 4 + (3 * (cFOneCt + cFTwoCt - 1));
} else if (type === 1) {
    count = 5 + (3 * (cFOneCt + cFTwoCt - 1));
} else {
    count = 3 + (3 * (cFOneCt + cFTwoCt - 1));
}
  return count;
}

const max = creaseCount(convABC.cFOneCt, convABC.cFTwoCt, convABC.type);
console.log (`...and developed in ${max} creases or less.`);