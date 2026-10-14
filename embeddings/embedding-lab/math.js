// math.js

// Make sure both vectors can be compared component by component.

function validateVectors(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) {
    throw new TypeError("Both inputs must be arrays.");
  }

  if (a.length === 0 || a.length !== b.length) {
    throw new Error("Vectors must be non-empty and have equal dimensions.");
  }

  for (const value of [...a, ...b]) {
    if (!Number.isFinite(value)) {
      throw new TypeError("Vector values must be finite numbers.");
    }
  }
}


// How strongly do the vectors align, considering their sizes?
export function dotProduct(a, b) {
  validateVectors(a, b);

  let total = 0;

  for (let i = 0; i < a.length; i++) {
    total += a[i] * b[i];
  }
  return total;
}

// What is the length of this vector?
export function magnitude(v) {
  if (!Array.isArray(v) || v.length === 0) {
    throw new Error("Vector must be a non-empty array.");
  }

  if (!v.every(Number.isFinite)) {
    throw new TypeError("Vector values must be finite numbers.");
  }

  let sumOfSquares = 0;

  for(const value of v){
    sumOfSquares += value * value;
  }

  return Math.sqrt(sumOfSquares);
}

// 3. Cosine similarity :- How similar are their directions?
export function cosineSimilarity(a, b) {
  validateVectors(a, b);

  const magA = magnitude(a);
  const magB = magnitude(b);

  // Cosine similarity is undefined for a zero vector.
  if (magA === 0 || magB === 0) {
    throw new Error(
      "Cosine similarity is undefined for zero vectors."
    );
  }

  return dotProduct(a, b) / (magA * magB);
}

// 4. Euclidean distance : How far apart are the points?
export function euclideanDistance(a, b) {
  validateVectors(a, b);

  let sumOfSquares = 0;

  for (let i = 0; i < a.length; i++) {
    const difference = a[i] - b[i];
    sumOfSquares += difference * difference;
  }
  return Math.sqrt(sumOfSquares);
}

// 5. Normalize a vector to unit length : How can I make the vector's length equal to 1?
export function normalize(v) {
  const mag = magnitude(v);

  if (mag === 0) {
    throw new Error("Cannot normalize a zero vector.");
  }

  return v.map(value => value / mag);
}


// console.log(magnitude([1,2,3]));