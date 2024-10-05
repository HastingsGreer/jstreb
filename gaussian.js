function transpose(matrix) {                                                                                                                                                                                
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));                                                                                                                                
} 

// Function to calculate the mean of a matrix
export function calculateMean(X) {
    X = transpose(X)
    return X.map(row => row.reduce((sum, val) => sum + val, 0) / row.length);
}

// Function to calculate the covariance matrix
export function calculateCovariance(X, mean) {
    X = transpose(X)
  
    const n = X[0].length;
    return X.map((row, i) => 
        X.map((_, j) => 
            row.reduce((sum, _, k) => sum + (X[i][k] - mean[i]) * (X[j][k] - mean[j]), 0) / (n - 1)
        )
    );
}

// Function to perform Cholesky decomposition
export function choleskyDecomposition(matrix) {
    const n = matrix.length;
    const L = Array(n).fill().map(() => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
        for (let j = 0; j <= i; j++) {
            let sum = 0;
            for (let k = 0; k < j; k++) {
                sum += L[i][k] * L[j][k];
            }
            L[i][j] = (i === j) 
                ? Math.sqrt(matrix[i][i] - sum)
                : (matrix[i][j] - sum) / L[j][j];
        }
    }
    return L;
}

// Function to generate random normal numbers (Box-Muller transform)
export function randn() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Function to sample from a multivariate Gaussian distribution
export function sampleGaussian(mean, L) {
    const z = mean.map(() => randn());
    return mean.map((m, i) => m + L[i].reduce((sum, l, j) => sum + l * z[j], 0));
}

// Main function to fit Gaussian and sample new vector
export function fitAndSampleGaussian(X) {
    const mean = calculateMean(X);
    const cov = calculateCovariance(X, mean);
    const L = choleskyDecomposition(cov);
    return sampleGaussian(mean, L);
}

// Function to run multiple samples and perform statistical test
function testFitAndSampleGaussian(X, numSamples = 10000) {
    const mean = calculateMean(X);
    const cov = calculateCovariance(X, mean);
    const L = choleskyDecomposition(cov);

    const samples = Array(numSamples).fill().map(() => sampleGaussian(mean, L));

    console.log(X, samples)
    const sampleMean = calculateMean(samples);
    const sampleCov = calculateCovariance(samples, sampleMean);

    const meanDiff = Math.sqrt(mean.reduce((sum, m, i) => sum + (m - sampleMean[i])**2, 0));
    const covDiff = Math.sqrt(cov.reduce((sum, row, i) => 
        sum + row.reduce((rowSum, c, j) => rowSum + (c - sampleCov[i][j])**2, 0), 0));

    console.log("Original Mean:", mean);
    console.log("Sample Mean:", sampleMean);
    console.log("Mean Difference:", meanDiff);
    console.log("Covariance Difference:", covDiff);

    const meanTol = 0.1;
    const covTol = 0.5;

    if (meanDiff < meanTol && covDiff < covTol) {
        console.log("Test passed: Sample statistics are close to expected values");
    } else {
        console.log("Test failed: Sample statistics deviate too much from expected values");
    }
}

// Sample data
//const X = [
//    [1, 2, 9, 4, 5],
//    [2, 4, 5, 8, 10]
//];

const X = [
    [1, 2], [2, 4], [9, 5], [4, 8], [5, 10]
];


// Run the test
//testFitAndSampleGaussian(X);
