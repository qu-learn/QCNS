/**
 * QCNS - Quantum Circuit and Network Simulator
 * ComplexMath utility class for complex number operations
 *
 * Provides mathematical operations needed for quantum circuit simulation
 */

export class ComplexMath {
    /**
     * Create a complex number
     * @param {number} re - Real part
     * @param {number} im - Imaginary part (default: 0)
     * @returns {Object} Complex number object
     */
    complex(re, im = 0) {
        return { re, im };
    }

    /**
     * Add two complex numbers
     * @param {Object} a - First complex number
     * @param {Object} b - Second complex number
     * @returns {Object} Sum of complex numbers
     */
    add(a, b) {
        return {
            re: a.re + b.re,
            im: a.im + b.im
        };
    }

    /**
     * Subtract two complex numbers
     * @param {Object} a - First complex number
     * @param {Object} b - Second complex number
     * @returns {Object} Difference of complex numbers
     */
    subtract(a, b) {
        return {
            re: a.re - b.re,
            im: a.im - b.im
        };
    }

    /**
     * Multiply two complex numbers
     * @param {Object} a - First complex number
     * @param {Object} b - Second complex number
     * @returns {Object} Product of complex numbers
     */
    multiply(a, b) {
        return {
            re: a.re * b.re - a.im * b.im,
            im: a.re * b.im + a.im * b.re
        };
    }

    /**
     * Divide two complex numbers
     * @param {Object} a - Numerator
     * @param {Object} b - Denominator
     * @returns {Object} Quotient of complex numbers
     */
    divide(a, b) {
        const denominator = b.re * b.re + b.im * b.im;
        if (denominator === 0) {
            throw new Error('Division by zero');
        }
        return {
            re: (a.re * b.re + a.im * b.im) / denominator,
            im: (a.im * b.re - a.re * b.im) / denominator
        };
    }

    /**
     * Get magnitude of complex number
     * @param {Object} z - Complex number
     * @returns {number} Magnitude
     */
    abs(z) {
        return Math.sqrt(z.re * z.re + z.im * z.im);
    }

    /**
     * Get phase/argument of complex number
     * @param {Object} z - Complex number
     * @returns {number} Phase in radians
     */
    arg(z) {
        return Math.atan2(z.im, z.re);
    }

    /**
     * Get complex conjugate
     * @param {Object} z - Complex number
     * @returns {Object} Complex conjugate
     */
    conj(z) {
        return {
            re: z.re,
            im: -z.im
        };
    }

    /**
     * Get complex conjugate (alias for conj)
     * @param {Object} z - Complex number
     * @returns {Object} Complex conjugate
     */
    conjugate(z) {
        return this.conj(z);
    }

    /**
     * Complex exponential e^(i*theta)
     * @param {number} theta - Angle in radians
     * @returns {Object} Complex number
     */
    exp(theta) {
        return {
            re: Math.cos(theta),
            im: Math.sin(theta)
        };
    }

    /**
     * Multiply complex number by scalar
     * @param {Object} z - Complex number
     * @param {number} scalar - Real scalar
     * @returns {Object} Scaled complex number
     */
    scale(z, scalar) {
        return {
            re: z.re * scalar,
            im: z.im * scalar
        };
    }

    /**
     * Check if two complex numbers are equal (within tolerance)
     * @param {Object} a - First complex number
     * @param {Object} b - Second complex number
     * @param {number} tolerance - Tolerance for comparison (default: 1e-14)
     * @returns {boolean} True if equal
     */
    equal(a, b, tolerance = 1e-14) {
        return Math.abs(a.re - b.re) < tolerance && Math.abs(a.im - b.im) < tolerance;
    }

    /**
     * Round complex number to specified decimal places
     * @param {Object} z - Complex number
     * @param {number} places - Number of decimal places
     * @returns {Object} Rounded complex number
     */
    round(z, places) {
        const factor = Math.pow(10, places);
        return {
            re: Math.round(z.re * factor) / factor,
            im: Math.round(z.im * factor) / factor
        };
    }

    /**
     * Format complex number as string
     * @param {Object} z - Complex number
     * @param {Object} options - Formatting options
     * @returns {string} Formatted string
     */
    format(z, options = {}) {
        const {
            precision = 6,
            fixedWidth = false,
            plusChar = '',
            iotaChar = 'i'
        } = options;

        let re = fixedWidth ? z.re.toFixed(precision) : this.formatFloat(z.re, precision);
        let im = fixedWidth ? Math.abs(z.im).toFixed(precision) : this.formatFloat(Math.abs(z.im), precision);

        // Handle real part
        if (plusChar && z.re >= 0 && !fixedWidth) {
            re = plusChar + re;
        }

        // Handle imaginary part
        if (z.im === 0) {
            return re;
        } else if (z.re === 0) {
            return (z.im === 1 ? '' : (z.im === -1 ? '-' : (z.im < 0 ? '-' + im : im))) + iotaChar;
        } else {
            const sign = z.im >= 0 ? '+' : '-';
            const imPart = z.im === 1 ? iotaChar : z.im === -1 ? iotaChar : im + iotaChar;
            return re + sign + imPart;
        }
    }

    /**
     * Format floating point number
     * @param {number} f - Number to format
     * @param {number} precision - Number of decimal places
     * @returns {string} Formatted string
     */
    formatFloat(f, precision) {
        if (precision !== undefined) {
            return parseFloat(f.toFixed(precision)).toString();
        }
        return f.toString();
    }

    // Matrix operations

    /**
     * Multiply two matrices
     * @param {Array} m1 - First matrix
     * @param {Array} m2 - Second matrix
     * @returns {Array} Product matrix
     */
    multiplyMatrices(m1, m2) {
        const rows1 = m1.length;
        const cols1 = m1[0].length;
        const rows2 = m2.length;
        const cols2 = m2[0].length;

        if (cols1 !== rows2) {
            throw new Error('Matrix dimensions incompatible for multiplication');
        }

        const result = [];
        for (let i = 0; i < rows1; i++) {
            result[i] = [];
            for (let j = 0; j < cols2; j++) {
                let sum = this.complex(0, 0);
                for (let k = 0; k < cols1; k++) {
                    const a = typeof m1[i][k] === 'number' ? this.complex(m1[i][k]) : m1[i][k];
                    const b = typeof m2[k][j] === 'number' ? this.complex(m2[k][j]) : m2[k][j];
                    sum = this.add(sum, this.multiply(a, b));
                }
                result[i][j] = sum;
            }
        }

        return result;
    }

    /**
     * Compute Kronecker product of two matrices
     * @param {Array} m1 - First matrix
     * @param {Array} m2 - Second matrix
     * @returns {Array} Kronecker product
     */
    kronecker(m1, m2) {
        const rows1 = m1.length;
        const cols1 = m1[0].length;
        const rows2 = m2.length;
        const cols2 = m2[0].length;

        const result = [];
        for (let i = 0; i < rows1 * rows2; i++) {
            result[i] = [];
            for (let j = 0; j < cols1 * cols2; j++) {
                const i1 = Math.floor(i / rows2);
                const i2 = i % rows2;
                const j1 = Math.floor(j / cols2);
                const j2 = j % cols2;

                const a = typeof m1[i1][j1] === 'number' ? this.complex(m1[i1][j1]) : m1[i1][j1];
                const b = typeof m2[i2][j2] === 'number' ? this.complex(m2[i2][j2]) : m2[i2][j2];

                result[i][j] = this.multiply(a, b);
            }
        }

        return result;
    }

    /**
     * Create identity matrix
     * @param {number} n - Matrix size
     * @returns {Array} Identity matrix
     */
    identity(n) {
        const matrix = [];
        for (let i = 0; i < n; i++) {
            matrix[i] = [];
            for (let j = 0; j < n; j++) {
                matrix[i][j] = this.complex(i === j ? 1 : 0, 0);
            }
        }
        return matrix;
    }

    /**
     * Create zero matrix
     * @param {number} rows - Number of rows
     * @param {number} cols - Number of columns
     * @returns {Array} Zero matrix
     */
    zeros(rows, cols = rows) {
        const matrix = [];
        for (let i = 0; i < rows; i++) {
            matrix[i] = [];
            for (let j = 0; j < cols; j++) {
                matrix[i][j] = this.complex(0, 0);
            }
        }
        return matrix;
    }
}