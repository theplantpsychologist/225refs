//for an a, b, c, return the number of blocks

const a = 200;
const b = 147;
const c = 37;

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

   let cFOne, cFTwo;
   if (a >= 0 && b >= 0){
    cFOne = writeCF(a, c);
    cFTwo = writeCF(b, c);
  } else if (a < 0 && a + b >= 0) {
    cFOne = writeCF(Math.abs(a), c);
    cFTwo = writeCF(b - Math.abs(a), c);
  } else if (b < 0 && a+(2*b) >= 0) {
    cFOne = writeCF (a + (2 * b), c);
    cFTwo = writeCF (Math.abs(b), c);
  } else {
    return null;
  }

  return (sumArray(cFOne) + sumArray(cFTwo))
}

//returns the number of blocks required to develop a rectangle of w/h = a+b(rt2)/c
console.log (convertABC(a,b,c));