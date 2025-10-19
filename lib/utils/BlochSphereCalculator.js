/**
 * BlochSphereCalculator - Mathematical calculations for Bloch sphere visualization
 * Handles quantum state to Bloch vector conversion
 */

export class BlochSphereCalculator {
    /**
     * Compute reduced density matrix for a single qubit using partial trace
     * @param {Array} stateVector - Full state vector (array of complex numbers)
     * @param {number} qubitIndex - Index of the qubit to trace out
     * @param {number} totalQubits - Total number of qubits in the system
     * @returns {Array} 2x2 density matrix for the single qubit
     */
    computeReducedDensityMatrix(stateVector, qubitIndex, totalQubits) {
        const numStates = 1 << totalQubits; // 2^totalQubits

        // Initialize 2x2 density matrix for single qubit
        const rho = [
            [{ re: 0, im: 0 }, { re: 0, im: 0 }],
            [{ re: 0, im: 0 }, { re: 0, im: 0 }]
        ];

        // Partial trace: sum over all basis states
        for (let i = 0; i < numStates; i++) {
            for (let j = 0; j < numStates; j++) {
                // Extract qubit states at qubitIndex position
                const i_bit = (i >> qubitIndex) & 1;
                const j_bit = (j >> qubitIndex) & 1;

                // Check if other qubits match (for trace)
                const i_other = i ^ (i_bit << qubitIndex);
                const j_other = j ^ (j_bit << qubitIndex);

                if (i_other === j_other) {
                    // ρ[i_bit][j_bit] += stateVector[i] * conj(stateVector[j])
                    const psi_i = stateVector[i];
                    const psi_j = stateVector[j];

                    rho[i_bit][j_bit].re += psi_i.re * psi_j.re + psi_i.im * psi_j.im;
                    rho[i_bit][j_bit].im += psi_i.im * psi_j.re - psi_i.re * psi_j.im;
                }
            }
        }

        return rho;
    }

    /**
     * Convert reduced density matrix to Bloch vector (x, y, z)
     * Uses Pauli matrix decomposition: ρ = (I + x*σ_x + y*σ_y + z*σ_z) / 2
     * @param {Array} rho - 2x2 density matrix
     * @returns {Object} Bloch vector {x, y, z, purity}
     */
    densityMatrixToBlochVector(rho) {
        // Extract density matrix elements
        const rho00 = rho[0][0].re; // Should be real
        const rho11 = rho[1][1].re; // Should be real
        const rho01_re = rho[0][1].re;
        const rho01_im = rho[0][1].im;

        // Bloch vector coordinates
        const x = 2 * rho01_re;           // Tr(ρ * σ_x)
        const y = 2 * rho01_im;           // Tr(ρ * σ_y)
        const z = rho00 - rho11;          // Tr(ρ * σ_z)

        // Calculate purity (distance from center)
        const purity = Math.sqrt(x * x + y * y + z * z);

        return { x, y, z, purity };
    }

    /**
     * Compute Bloch vector directly from state vector for single qubit systems
     * @param {Array} stateVector - State vector with 2 complex amplitudes
     * @returns {Object} Bloch vector {x, y, z, purity}
     */
    stateVectorToBlochVector(stateVector) {
        if (stateVector.length !== 2) {
            throw new Error('State vector must have exactly 2 elements for single qubit');
        }

        const alpha = stateVector[0]; // |0⟩ amplitude
        const beta = stateVector[1];  // |1⟩ amplitude

        // Bloch vector coordinates
        const x = 2 * (alpha.re * beta.re + alpha.im * beta.im);
        const y = 2 * (alpha.im * beta.re - alpha.re * beta.im);
        const z = alpha.re * alpha.re + alpha.im * alpha.im - (beta.re * beta.re + beta.im * beta.im);

        const purity = Math.sqrt(x * x + y * y + z * z);

        return { x, y, z, purity };
    }

    /**
     * Compute Bloch vectors for all qubits in a multi-qubit system
     * @param {Array} stateVector - Full state vector
     * @param {number} totalQubits - Total number of qubits
     * @returns {Array} Array of Bloch vectors, one per qubit
     */
    computeAllBlochVectors(stateVector, totalQubits) {
        const blochVectors = [];

        for (let qubitIndex = 0; qubitIndex < totalQubits; qubitIndex++) {
            const rho = this.computeReducedDensityMatrix(stateVector, qubitIndex, totalQubits);
            const blochVector = this.densityMatrixToBlochVector(rho);
            blochVectors.push({
                qubitIndex,
                ...blochVector
            });
        }

        return blochVectors;
    }

    /**
     * Convert Bloch vector to spherical coordinates
     * @param {Object} blochVector - Bloch vector {x, y, z}
     * @returns {Object} Spherical coordinates {theta, phi, r}
     */
    toSphericalCoordinates(blochVector) {
        const { x, y, z } = blochVector;
        const r = Math.sqrt(x * x + y * y + z * z);

        // Polar angle (from +z axis)
        const theta = r > 0 ? Math.acos(z / r) : 0;

        // Azimuthal angle (in xy-plane from +x axis)
        const phi = Math.atan2(y, x);

        return { theta, phi, r };
    }

    /**
     * Convert spherical coordinates to Bloch vector
     * @param {number} theta - Polar angle in radians
     * @param {number} phi - Azimuthal angle in radians
     * @param {number} r - Radius (purity), default 1
     * @returns {Object} Bloch vector {x, y, z}
     */
    fromSphericalCoordinates(theta, phi, r = 1) {
        const x = r * Math.sin(theta) * Math.cos(phi);
        const y = r * Math.sin(theta) * Math.sin(phi);
        const z = r * Math.cos(theta);

        return { x, y, z };
    }

    /**
     * Check if a state is pure (on the surface of the Bloch sphere)
     * @param {Object} blochVector - Bloch vector {purity}
     * @param {number} tolerance - Tolerance for purity comparison
     * @returns {boolean} True if state is pure
     */
    isPureState(blochVector, tolerance = 1e-10) {
        return Math.abs(blochVector.purity - 1) < tolerance;
    }

    /**
     * Compute expectation values of Pauli operators
     * @param {Object} blochVector - Bloch vector {x, y, z}
     * @returns {Object} Expectation values {X, Y, Z}
     */
    computePauliExpectations(blochVector) {
        return {
            X: blochVector.x,
            Y: blochVector.y,
            Z: blochVector.z
        };
    }

    /**
     * Get common quantum state names for Bloch vectors
     * @param {Object} blochVector - Bloch vector {x, y, z, purity}
     * @param {number} tolerance - Tolerance for comparison
     * @returns {string|null} State name or null if not a standard state
     */
    identifyState(blochVector, tolerance = 0.01) {
        const { x, y, z, purity } = blochVector;

        // Must be pure state
        if (Math.abs(purity - 1) > tolerance) {
            return null;
        }

        // Check for standard states
        if (Math.abs(z - 1) < tolerance && Math.abs(x) < tolerance && Math.abs(y) < tolerance) {
            return '|0⟩';
        }
        if (Math.abs(z + 1) < tolerance && Math.abs(x) < tolerance && Math.abs(y) < tolerance) {
            return '|1⟩';
        }
        if (Math.abs(x - 1) < tolerance && Math.abs(y) < tolerance && Math.abs(z) < tolerance) {
            return '|+⟩';
        }
        if (Math.abs(x + 1) < tolerance && Math.abs(y) < tolerance && Math.abs(z) < tolerance) {
            return '|−⟩';
        }
        if (Math.abs(y - 1) < tolerance && Math.abs(x) < tolerance && Math.abs(z) < tolerance) {
            return '|+i⟩';
        }
        if (Math.abs(y + 1) < tolerance && Math.abs(x) < tolerance && Math.abs(z) < tolerance) {
            return '|−i⟩';
        }

        return null;
    }
}
