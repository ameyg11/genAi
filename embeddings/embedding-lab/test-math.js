import {
  dotProduct,
  magnitude,
  cosineSimilarity,
  euclideanDistance,
  normalize
} from "./math.js";

const A = [1, 0];
const B = [1, 0];
const C = [0, 1];
const D = [-1, 0];

console.log("A =", A);
console.log("B =", B);
console.log("C =", C);
console.log("D =", D);

console.log("\nDot product:");
console.log("A · B =", dotProduct(A, B));
console.log("A · C =", dotProduct(A, C));
console.log("A · D =", dotProduct(A, D));

console.log("\nCosine similarity:");
console.log("A vs B =", cosineSimilarity(A, B));
console.log("A vs C =", cosineSimilarity(A, C));
console.log("A vs D =", cosineSimilarity(A, D));

console.log("\nEuclidean distance:");
console.log("A vs B =", euclideanDistance(A, B));
console.log("A vs C =", euclideanDistance(A, C));
console.log("A vs D =", euclideanDistance(A, D));

console.log("\nMagnitude:");
console.log("Magnitude of [3, 4] =", magnitude([3, 4]));

console.log("\nNormalization:");
console.log("Normalize [3, 4] =", normalize([3, 4]));