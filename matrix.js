
        export function naiveMultiplyTranspose(a, b) {
            const size1 = a.length;
            const size2 = a[0].length;
            const result = new Array(size1).fill(0).map(() => new Array(size1).fill(0));

            for (let i = 0; i < size1; i++) {
                for (let j = 0; j < size1; j++) {
                    for (let k = 0; k < size2; k++) {
                        result[i][j] += a[i][k] * b[j][k];
                    }
                }
            }

            return result;
        }
	export function dotDivide(a, b) {
            const size1 = a.length;
            const size2 = a[0].length;
            const result = new Array(size1).fill(0).map(() => new Array(size2).fill(0));

            for (let i = 0; i < size1; i++) {
                for (let j = 0; j < size2; j++) {
                        result[i][j] += a[i][j] / b[j];
                }
            }

            return result;
	}
        export function subtract(a, b){
		return [a[0] - b[0], a[1] - b[1]];
	}
        export function subtractv(a, b){
		return new Array(a.length).fill(0).map((_, i) => {return a[i] - b[i]});
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
                for (let k = i; k < n; k++) {
                    const tmp = A[maxRow][k];
                    A[maxRow][k] = A[i][k];
                    A[i][k] = tmp;
                }
                const tmp = b[maxRow];
                b[maxRow] = b[i];
                b[i] = tmp;

                // Make all rows below this one 0 in current column
                for (let k = i + 1; k < n; k++) {
                    const c = -A[k][i] / A[i][i];
                    for (let j = i; j < n; j++) {
                        if (i === j) {
                            A[k][j] = 0;
                        } else {
                            A[k][j] += c * A[i][j];
                        }
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
