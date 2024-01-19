import { expect, test } from "vitest";
import {
  naiveMultiply,
  multiplyTransposeSameSparsity,
  naiveSolve,
} from "./matrix.js";

test("funky sparse matrix routine", () => {
  expect(1).toBe(1);

  var symmetricA = [
    [4, 5, 0, 3],
    [5, 0, 0, 2],
    [0, 0, 9, 3],
    [3, 2, 3, 0],
  ];

  var out1 = naiveMultiply(symmetricA, symmetricA);
  var out2 = multiplyTransposeSameSparsity(symmetricA, symmetricA);

  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      expect(out1[i][j]).toBe(out2[i][j]);
    }
  }
});

test("matrix inversion", () => {
  var A = [
    [4, 5, 0, 3],
    [5, 0, 3, 2],
    [2, 0, 9, 3],
    [3, 2, 3, 0],
  ];
  var y = [[1], [2], [3], [4]];

  var x = naiveMultiply(A, y);

  y = y.flat();
  x = x.flat();

  var yhat = naiveSolve(A, x);
  for (var j = 0; j < 4; j++) {
    expect(y[j]).toBeCloseTo(yhat[j]);
  }
});
