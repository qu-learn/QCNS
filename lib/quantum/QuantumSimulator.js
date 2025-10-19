/**
 * QCNS - Quantum Circuit and Network Simulator
 * Quantum Simulator Module
 *
 * Provides quantum state simulation capabilities for circuits
 */

import { ComplexMath } from './ComplexMath.js';
import { QuantumGates } from './QuantumGates.js';

export class QuantumSimulator {
    constructor() {
        this.complexMath = new ComplexMath();
    }

    /**
     * Simulate a quantum circuit
     * @param {QuantumCircuit} circuit - The circuit to simulate
     * @returns {Object} Simulation results
     */
    simulate(circuit) {
        const numQubits = circuit.numQubits;
        const stateSize = 1 << numQubits; // 2^numQubits

        // Initialize state vector to |00...0⟩
        let stateVector = new Array(stateSize).fill(null);
        for (let i = 0; i < stateSize; i++) {
            stateVector[i] = this.complexMath.complex(i === 0 ? 1 : 0, 0);
        }

        // Process circuit column by column
        const numCols = circuit.numCols();

        for (let col = 0; col < numCols; col++) {
            const columnGates = this.getGatesAtColumn(circuit, col);

            for (const gate of columnGates) {
                if (gate && gate.name !== 'measure' && gate.name !== 'barrier') {
                    stateVector = this.applyGate(stateVector, gate, circuit, numQubits);
                }
            }
        }

        // Calculate probabilities
        const probabilities = this.calculateProbabilities(stateVector);

        // Handle measurements if any
        const measurementResults = this.handleMeasurements(circuit, probabilities);

        return {
            stateVector: stateVector,
            probabilities: probabilities,
            measurements: measurementResults,
            numQubits: numQubits,
            amplitudes: this.formatAmplitudes(stateVector)
        };
    }

    /**
     * Get all gates at a specific column
     * @param {QuantumCircuit} circuit - The quantum circuit
     * @param {number} column - Column index
     * @returns {Array} Array of gates at the column
     */
    getGatesAtColumn(circuit, column) {
        const gates = [];
        const processedGates = new Set();

        for (let wire = 0; wire < circuit.numQubits; wire++) {
            if (circuit.gates[wire] && circuit.gates[wire][column]) {
                const gate = circuit.gates[wire][column];
                if (!processedGates.has(gate.id)) {
                    gates.push(gate);
                    processedGates.add(gate.id);
                }
            }
        }

        return gates;
    }

    /**
     * Apply a gate to the state vector
     * @param {Array} stateVector - Current state vector
     * @param {Object} gate - Gate to apply
     * @param {QuantumCircuit} circuit - The circuit
     * @param {number} numQubits - Number of qubits
     * @returns {Array} Updated state vector
     */
    applyGate(stateVector, gate, circuit, numQubits) {
        const gateWires = this.findGateWires(circuit, gate);
        const gateMatrix = this.getGateMatrix(gate);

        if (gateWires.length === 1) {
            return this.applySingleQubitGate(stateVector, gateMatrix, gateWires[0], numQubits);
        } else if (gateWires.length === 2) {
            return this.applyTwoQubitGate(stateVector, gateMatrix, gateWires[0], gateWires[1], numQubits);
        } else if (gateWires.length === 3) {
            return this.applyThreeQubitGate(stateVector, gateMatrix, gateWires, numQubits);
        } else {
            throw new Error(`Unsupported gate with ${gateWires.length} qubits`);
        }
    }

    /**
     * Find which wires a gate operates on
     * @param {QuantumCircuit} circuit - The circuit
     * @param {Object} gate - The gate
     * @returns {Array} Wire indices
     */
    findGateWires(circuit, gate) {
        const wires = [];
        for (let wire = 0; wire < circuit.numQubits; wire++) {
            for (let col = 0; col < circuit.numCols(); col++) {
                if (circuit.gates[wire][col] === gate) {
                    wires.push(wire);
                    break;
                }
            }
        }
        return wires.sort((a, b) => a - b);
    }

    /**
     * Get the matrix representation of a gate
     * @param {Object} gate - Gate object
     * @returns {Array} Gate matrix
     */
    getGateMatrix(gate) {
        const gateDef = QuantumGates.getGate(gate.name);
        let matrix = this.parseGateMatrix(gateDef.matrix, gate.options?.params || {});

        // Handle special case matrices that need parameter substitution
        return matrix;
    }

    /**
     * Parse gate matrix with parameter substitution
     * @param {Array} matrix - Raw matrix from gate definition
     * @param {Object} params - Gate parameters
     * @returns {Array} Complex matrix
     */
    parseGateMatrix(matrix, params) {
        return matrix.map(row =>
            row.map(element => {
                if (typeof element === 'string') {
                    return this.evaluateMatrixElement(element, params);
                } else if (typeof element === 'number') {
                    return this.complexMath.complex(element, 0);
                } else {
                    return element;
                }
            })
        );
    }

    /**
     * Evaluate matrix element expressions
     * @param {string} expr - Expression to evaluate
     * @param {Object} params - Parameters
     * @returns {Object} Complex number
     */
    evaluateMatrixElement(expr, params) {
        // Handle common expressions
        const substitutions = {
            'i': { re: 0, im: 1 },
            '-i': { re: 0, im: -1 },
            '1/sqrt(2)': { re: 1/Math.sqrt(2), im: 0 },
            '-1/sqrt(2)': { re: -1/Math.sqrt(2), im: 0 },
            'cos(theta/2)': { re: Math.cos((params.theta || 0) / 2), im: 0 },
            'sin(theta/2)': { re: Math.sin((params.theta || 0) / 2), im: 0 },
            '-sin(theta/2)': { re: -Math.sin((params.theta || 0) / 2), im: 0 },
            '-i*sin(theta/2)': { re: 0, im: -Math.sin((params.theta || 0) / 2) }
        };

        if (expr in substitutions) {
            return this.complexMath.complex(substitutions[expr].re, substitutions[expr].im);
        }

        // Handle parameterized expressions
        if (expr.includes('theta')) {
            const theta = params.theta || 0;
            if (expr === 'e^(-i*theta/2)') {
                return this.complexMath.exp(-theta/2);
            } else if (expr === 'e^(i*theta/2)') {
                return this.complexMath.exp(theta/2);
            }
        }

        // Handle lambda parameter (for CP gate)
        if (expr.includes('lambda')) {
            const lambda = params.lambda || 0;
            if (expr === 'e^(i*lambda)') {
                return this.complexMath.exp(lambda);
            }
        }

        // Handle pi expressions (for S, T, Sdg, Tdg gates)
        if (expr === 'e^(i * pi / 4)') {
            return this.complexMath.exp(Math.PI / 4);
        } else if (expr === 'e^(-i * pi / 4)') {
            return this.complexMath.exp(-Math.PI / 4);
        } else if (expr === 'e^(i * pi / 2)') {
            return this.complexMath.exp(Math.PI / 2);
        } else if (expr === 'e^(-i * pi / 2)') {
            return this.complexMath.exp(-Math.PI / 2);
        }

        // Default to 1 for unrecognized expressions
        console.warn(`Unknown matrix element: ${expr}`);
        return this.complexMath.complex(1, 0);
    }

    /**
     * Apply single-qubit gate to state vector
     * @param {Array} stateVector - Current state
     * @param {Array} gateMatrix - Gate matrix
     * @param {number} targetQubit - Target qubit index
     * @param {number} numQubits - Total qubits
     * @returns {Array} Updated state vector
     */
    applySingleQubitGate(stateVector, gateMatrix, targetQubit, numQubits) {
        const stateSize = stateVector.length;
        const newStateVector = new Array(stateSize);

        for (let state = 0; state < stateSize; state++) {
            const targetBit = (state >> targetQubit) & 1;
            const flippedState = state ^ (1 << targetQubit);

            const currentAmplitude = stateVector[state];
            const flippedAmplitude = stateVector[flippedState];

            // Apply gate matrix
            const newAmplitude = this.complexMath.add(
                this.complexMath.multiply(gateMatrix[0][targetBit], targetBit === 0 ? currentAmplitude : flippedAmplitude),
                this.complexMath.multiply(gateMatrix[1][targetBit], targetBit === 0 ? flippedAmplitude : currentAmplitude)
            );

            newStateVector[state] = newAmplitude;
        }

        return newStateVector;
    }

    /**
     * Apply two-qubit gate to state vector
     * @param {Array} stateVector - Current state
     * @param {Array} gateMatrix - Gate matrix
     * @param {number} qubit1 - First qubit
     * @param {number} qubit2 - Second qubit
     * @param {number} numQubits - Total qubits
     * @returns {Array} Updated state vector
     */
    applyTwoQubitGate(stateVector, gateMatrix, qubit1, qubit2, numQubits) {
        const stateSize = stateVector.length;
        const newStateVector = new Array(stateSize).fill(null);

        // Initialize new state vector
        for (let i = 0; i < stateSize; i++) {
            newStateVector[i] = this.complexMath.complex(0, 0);
        }

        for (let state = 0; state < stateSize; state++) {
            const bit1 = (state >> qubit1) & 1;
            const bit2 = (state >> qubit2) & 1;
            const basisIndex = (bit1 << 1) | bit2;

            for (let newBasisIndex = 0; newBasisIndex < 4; newBasisIndex++) {
                const newBit1 = (newBasisIndex >> 1) & 1;
                const newBit2 = newBasisIndex & 1;

                const newState = (state & ~(1 << qubit1) & ~(1 << qubit2)) |
                                (newBit1 << qubit1) | (newBit2 << qubit2);

                const matrixElement = gateMatrix[newBasisIndex][basisIndex];
                const contribution = this.complexMath.multiply(matrixElement, stateVector[state]);

                newStateVector[newState] = this.complexMath.add(newStateVector[newState], contribution);
            }
        }

        return newStateVector;
    }

    /**
     * Apply three-qubit gate (simplified for Toffoli)
     * @param {Array} stateVector - Current state
     * @param {Array} gateMatrix - Gate matrix
     * @param {Array} qubits - Qubit indices
     * @param {number} numQubits - Total qubits
     * @returns {Array} Updated state vector
     */
    applyThreeQubitGate(stateVector, gateMatrix, qubits, numQubits) {
        // For now, implement only Toffoli gate (CCX)
        const [control1, control2, target] = qubits;
        const newStateVector = [...stateVector];

        for (let state = 0; state < stateVector.length; state++) {
            const bit1 = (state >> control1) & 1;
            const bit2 = (state >> control2) & 1;
            const targetBit = (state >> target) & 1;

            // Toffoli flips target only if both controls are 1
            if (bit1 === 1 && bit2 === 1) {
                const flippedState = state ^ (1 << target);
                // Swap amplitudes
                [newStateVector[state], newStateVector[flippedState]] =
                [newStateVector[flippedState], newStateVector[state]];
            }
        }

        return newStateVector;
    }

    /**
     * Calculate measurement probabilities from state vector
     * @param {Array} stateVector - State vector
     * @returns {Array} Probabilities for each basis state
     */
    calculateProbabilities(stateVector) {
        return stateVector.map(amplitude => {
            const magnitude = this.complexMath.abs(amplitude);
            return magnitude * magnitude;
        });
    }

    /**
     * Handle measurement operations
     * @param {QuantumCircuit} circuit - The circuit
     * @param {Array} probabilities - State probabilities
     * @returns {Object} Measurement results
     */
    handleMeasurements(circuit, probabilities) {
        const measurements = {};
        const numQubits = circuit.numQubits;

        // Find measurement gates
        for (let col = 0; col < circuit.numCols(); col++) {
            for (let wire = 0; wire < numQubits; wire++) {
                const gate = circuit.gates[wire][col];
                if (gate && gate.name === 'measure') {
                    // Simulate measurement result based on probabilities
                    const qubitProbabilities = this.calculateQubitProbabilities(probabilities, wire, numQubits);
                    const measurementResult = Math.random() < qubitProbabilities[1] ? 1 : 0;

                    if (gate.options?.creg) {
                        measurements[`${gate.options.creg.name}[${gate.options.creg.bit}]`] = measurementResult;
                    } else {
                        measurements[`qubit_${wire}`] = measurementResult;
                    }
                }
            }
        }

        return measurements;
    }

    /**
     * Calculate single qubit measurement probabilities
     * @param {Array} stateProbabilities - Full state probabilities
     * @param {number} qubitIndex - Qubit to measure
     * @param {number} numQubits - Total qubits
     * @returns {Array} [P(0), P(1)] for the qubit
     */
    calculateQubitProbabilities(stateProbabilities, qubitIndex, numQubits) {
        let prob0 = 0, prob1 = 0;

        for (let state = 0; state < stateProbabilities.length; state++) {
            const qubitValue = (state >> qubitIndex) & 1;
            if (qubitValue === 0) {
                prob0 += stateProbabilities[state];
            } else {
                prob1 += stateProbabilities[state];
            }
        }

        return [prob0, prob1];
    }

    /**
     * Format amplitudes for display
     * @param {Array} stateVector - State vector
     * @returns {Array} Formatted amplitude strings
     */
    formatAmplitudes(stateVector) {
        return stateVector.map((amplitude, index) => ({
            state: index.toString(2).padStart(Math.log2(stateVector.length), '0'),
            amplitude: this.complexMath.format(amplitude, { precision: 4 }),
            probability: Math.pow(this.complexMath.abs(amplitude), 2)
        }));
    }

    /**
     * Calculate the unitary matrix of the entire circuit
     * @param {QuantumCircuit} circuit - The circuit to analyze
     * @returns {Array} Unitary matrix representing the circuit
     */
    calculateUnitaryMatrix(circuit) {
        const numQubits = circuit.numQubits;
        const matrixSize = 1 << numQubits; // 2^numQubits

        // Initialize identity matrix
        let unitaryMatrix = this.createIdentityMatrix(matrixSize);

        // Process circuit column by column
        const numCols = circuit.numCols();

        for (let col = 0; col < numCols; col++) {
            const columnGates = this.getGatesAtColumn(circuit, col);

            for (const gate of columnGates) {
                if (gate && gate.name !== 'measure' && gate.name !== 'barrier') {
                    const gateMatrix = this.buildFullGateMatrix(gate, circuit, numQubits);
                    unitaryMatrix = this.multiplyMatrices(gateMatrix, unitaryMatrix);
                }
            }
        }

        return unitaryMatrix;
    }

    /**
     * Create identity matrix of given size
     * @param {number} size - Matrix size
     * @returns {Array} Identity matrix
     */
    createIdentityMatrix(size) {
        const matrix = [];
        for (let i = 0; i < size; i++) {
            matrix[i] = [];
            for (let j = 0; j < size; j++) {
                matrix[i][j] = this.complexMath.complex(i === j ? 1 : 0, 0);
            }
        }
        return matrix;
    }

    /**
     * Build full circuit-size matrix for a gate
     * @param {Object} gate - Gate object
     * @param {QuantumCircuit} circuit - Circuit
     * @param {number} numQubits - Number of qubits
     * @returns {Array} Full-size gate matrix
     */
    buildFullGateMatrix(gate, circuit, numQubits) {
        const matrixSize = 1 << numQubits;
        const gateWires = this.findGateWires(circuit, gate);
        const gateMatrix = this.getGateMatrix(gate);

        const fullMatrix = this.createIdentityMatrix(matrixSize);

        if (gateWires.length === 1) {
            return this.buildSingleQubitFullMatrix(gateMatrix, gateWires[0], numQubits);
        } else if (gateWires.length === 2) {
            return this.buildTwoQubitFullMatrix(gateMatrix, gateWires[0], gateWires[1], numQubits);
        } else if (gateWires.length === 3) {
            // Three-qubit gates (like Toffoli) are handled by applyThreeQubitGate
            // Full matrix construction not needed for state vector simulation
            return fullMatrix;
        } else {
            // For 4+ qubit gates, return identity
            console.warn(`Full matrix construction not implemented for ${gateWires.length}-qubit gates`);
            return fullMatrix;
        }
    }

    /**
     * Build full matrix for single-qubit gate
     * @param {Array} gateMatrix - Gate matrix (2x2)
     * @param {number} targetQubit - Target qubit index
     * @param {number} numQubits - Total qubits
     * @returns {Array} Full matrix
     */
    buildSingleQubitFullMatrix(gateMatrix, targetQubit, numQubits) {
        const matrixSize = 1 << numQubits;
        const fullMatrix = [];

        for (let i = 0; i < matrixSize; i++) {
            fullMatrix[i] = [];
            for (let j = 0; j < matrixSize; j++) {
                const iBit = (i >> targetQubit) & 1;
                const jBit = (j >> targetQubit) & 1;

                // Check if all other bits are the same
                const otherBitsI = i & ~(1 << targetQubit);
                const otherBitsJ = j & ~(1 << targetQubit);

                if (otherBitsI === otherBitsJ) {
                    fullMatrix[i][j] = gateMatrix[iBit][jBit];
                } else {
                    fullMatrix[i][j] = this.complexMath.complex(0, 0);
                }
            }
        }

        return fullMatrix;
    }

    /**
     * Build full matrix for two-qubit gate
     * @param {Array} gateMatrix - Gate matrix (4x4)
     * @param {number} qubit1 - First qubit
     * @param {number} qubit2 - Second qubit
     * @param {number} numQubits - Total qubits
     * @returns {Array} Full matrix
     */
    buildTwoQubitFullMatrix(gateMatrix, qubit1, qubit2, numQubits) {
        const matrixSize = 1 << numQubits;
        const fullMatrix = [];

        for (let i = 0; i < matrixSize; i++) {
            fullMatrix[i] = [];
            for (let j = 0; j < matrixSize; j++) {
                const iBit1 = (i >> qubit1) & 1;
                const iBit2 = (i >> qubit2) & 1;
                const jBit1 = (j >> qubit1) & 1;
                const jBit2 = (j >> qubit2) & 1;

                // Check if all other bits are the same
                const otherBitsI = i & ~(1 << qubit1) & ~(1 << qubit2);
                const otherBitsJ = j & ~(1 << qubit1) & ~(1 << qubit2);

                if (otherBitsI === otherBitsJ) {
                    const iIndex = (iBit1 << 1) | iBit2;
                    const jIndex = (jBit1 << 1) | jBit2;
                    fullMatrix[i][j] = gateMatrix[iIndex][jIndex];
                } else {
                    fullMatrix[i][j] = this.complexMath.complex(0, 0);
                }
            }
        }

        return fullMatrix;
    }

    /**
     * Multiply two complex matrices
     * @param {Array} matrixA - First matrix
     * @param {Array} matrixB - Second matrix
     * @returns {Array} Product matrix
     */
    multiplyMatrices(matrixA, matrixB) {
        const size = matrixA.length;
        const result = [];

        for (let i = 0; i < size; i++) {
            result[i] = [];
            for (let j = 0; j < size; j++) {
                result[i][j] = this.complexMath.complex(0, 0);

                for (let k = 0; k < size; k++) {
                    const product = this.complexMath.multiply(matrixA[i][k], matrixB[k][j]);
                    result[i][j] = this.complexMath.add(result[i][j], product);
                }
            }
        }

        return result;
    }

    /**
     * Format matrix for display
     * @param {Array} matrix - Complex matrix
     * @param {Object} options - Formatting options
     * @returns {Array} Formatted matrix
     */
    formatMatrix(matrix, options = {}) {
        const precision = options.precision || 3;
        return matrix.map(row =>
            row.map(element => this.complexMath.format(element, { precision }))
        );
    }
}