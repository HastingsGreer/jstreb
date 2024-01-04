function tobitvec(vec) {
  let res = 0;
  for (var i = 0; i < vec.length; i++) {
    if (vec[i] != 0) {
      res = res + (1 << i);
    }
  }
  return res;
}
export function multiplyTransposeSameSparsity(a, b) {
  const size1 = a.length;
  const result = new Array(size1).fill(0).map(() => new Array(size1));

  let aBitvecs = [];
  for (var i = 0; i < a.length; i++) {
    aBitvecs[i] = tobitvec(a[i]);
  }
  for (let i = 0; i < size1; i++) {
    var ai = a[i];
    for (let j = 0; j < size1; j++) {
      var acc = 0;
      var hot = aBitvecs[i] & aBitvecs[j];
      if (hot) {
        var bj = b[j];
        while (hot) {
          var k = 31 - Math.clz32(hot);
          hot = hot - (1 << k);

          acc += ai[k] * bj[k];
        }
      }
      result[i][j] = acc;
    }
  }

  return result;
}
export function dotDivide(a, b) {
  const size1 = a.length;
  const size2 = a[0].length;
  const result = new Array(size1).fill(0).map(() => new Array(size2));

  for (let i = 0; i < size1; i++) {
    let ri = result[i];
    let ai = a[i];
    for (let j = 0; j < size2; j++) {
      ri[j] = ai[j] / b[j];
    }
  }

  return result;
}
export function multiply(k, v) {
  const result = new Array(v.length);
  for (var i = 0; i < v.length; i++) {
    result[i] = v[i] * k;
  }
  return result;
}
export function batchAdd(vs) {
  const result = new Array(vs[0].length);
  for (var i = 0; i < vs[0].length; i++) {
    var acc = 0;
    for (var j = 0; j < vs.length; j++) {
      acc += vs[j][i];
    }
    result[i] = acc;
  }
  return result;
}
export function subtract(a, b) {
  return [a[0] - b[0], a[1] - b[1]];
}
export function subtractv(a, b) {
  return new Array(a.length).fill(0).map((_, i) => {
    return a[i] - b[i];
  });
}

export function naiveMultiply(a, b) {
  const size1 = a.length;
  const size2 = a[0].length;
  const size3 = b.length;
  const size4 = b[0].length;
  if (size2 != size3) {
    console.log(size2);
    console.log(size3);

    assert(size2 == size3);
  }
  const result = new Array(size1).fill(0).map(() => new Array(size4).fill(0));

  for (let i = 0; i < size1; i++) {
    for (let j = 0; j < size4; j++) {
      for (let k = 0; k < size2; k++) {
        result[i][j] += a[i][k] * b[k][j];
      }
    }
  }

  return result;
}
export function naiveSolve(A, b) {
  const n = A.length;
  for (let i = 0; i < n; i++) {
    // Search for maximum in this column
    let maxEl = Math.abs(A[i][i]);
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > maxEl) {
        maxEl = Math.abs(A[k][i]);
        maxRow = k;
      }
    }

    // Swap maximum row with current row (column by column)
    const tmp1 = A[maxRow];
    A[maxRow] = A[i];
    A[i] = tmp1;

    const tmp = b[maxRow];
    b[maxRow] = b[i];
    b[i] = tmp;

    // Make all rows below this one 0 in current column
    var Ai = A[i];
    for (let k = i + 1; k < n; k++) {
      var Ak = A[k];
      const c = -Ak[i] / Ai[i];
      Ak[i] = 0;
      for (let j = i + 1; j < n; j++) {
        Ak[j] += c * Ai[j];
      }
      b[k] += c * b[i];
    }
  }

  // Solve equation Ax=b for an upper triangular matrix A
  const x = new Array(n).fill(0);
  for (let i = n - 1; i > -1; i--) {
    x[i] = b[i] / A[i][i];
    for (let k = i - 1; k > -1; k--) {
      b[k] -= A[k][i] * x[i];
    }
  }
  return x;
}
