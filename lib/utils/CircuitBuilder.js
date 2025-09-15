/**
 * CircuitBuilder - Converts gate grid representation to QuantumCircuit instances
 * Handles the conversion logic between UI state and circuit state
 */

import { QuantumCircuit } from '../quantum/QuantumCircuit.js';

export class CircuitBuilder {
    /**
     * Build a QuantumCircuit from a 2D gate grid
     * @param {Array<Array>} gateGrid - 2D array of gate objects [qubit][column]
     * @param {number} numQubits - Number of qubits
     * @param {number} numDepth - Circuit depth (number of columns)
     * @returns {QuantumCircuit} Constructed circuit
     */
    buildCircuitFromGrid(gateGrid, numQubits, numDepth) {
        const circuit = new QuantumCircuit(numQubits, numQubits);

        // Process column by column to maintain gate order
        for (let col = 0; col < numDepth; col++) {
            const processedQubits = new Set();

            for (let q = 0; q < numQubits; q++) {
                // Skip if qubit already processed in this column (multi-qubit gates)
                if (processedQubits.has(q)) continue;

                const gate = gateGrid[q][col];
                if (!gate) continue;

                // Add gate to circuit based on type
                this._addGateToCircuit(circuit, gate, q, col, processedQubits);
            }
        }

        return circuit;
    }

    /**
     * Add a gate from the grid to the circuit
     * @private
     * @param {QuantumCircuit} circuit - Circuit instance
     * @param {Object} gate - Gate object from grid
     * @param {number} qubit - Current qubit index
     * @param {number} column - Current column index
     * @param {Set} processedQubits - Set of already processed qubits
     */
    _addGateToCircuit(circuit, gate, qubit, column, processedQubits) {
        const gateNameLower = gate.name.toLowerCase();

        // Barrier - spans all qubits
        if (gate.isBarrier) {
            // Only add once per column (when we hit the first qubit)
            if (qubit === 0) {
                const allQubits = Array.from({ length: circuit.numQubits }, (_, i) => i);
                circuit.addGate('barrier', column, allQubits);
            }
            processedQubits.add(qubit);
            return;
        }

        // Multi-qubit gates
        if (gate.control !== undefined) {
            if (gate.control) {
                // This is a control qubit
                if (gate.control2 !== undefined) {
                    // Three-qubit gate (Toffoli)
                    circuit.addGate('ccx', column, [qubit, gate.control2, gate.target]);
                    processedQubits.add(qubit);
                    processedQubits.add(gate.control2);
                    processedQubits.add(gate.target);
                } else {
                    // Two-qubit gate
                    circuit.addGate(gateNameLower, column, [qubit, gate.target]);
                    processedQubits.add(qubit);
                    processedQubits.add(gate.target);
                }
            }
            // If gate.control is false, it's a target qubit - will be processed by control
            return;
        }

        // Measurement gate
        if (gate.name === 'measure' || gateNameLower === 'measure' || gateNameLower === 'm') {
            circuit.addGate('measure', column, qubit, {
                creg: { name: circuit.creg.name, bit: qubit }
            });
            processedQubits.add(qubit);
            return;
        }

        // Parameterized gates (rotation gates)
        if (gate.param !== undefined) {
            circuit.addGate(gateNameLower, column, qubit, {
                params: { theta: gate.param }
            });
            processedQubits.add(qubit);
            return;
        }

        // Single-qubit gates
        circuit.addGate(gateNameLower, column, qubit);
        processedQubits.add(qubit);
    }

    /**
     * Validate gate grid structure
     * @param {Array<Array>} gateGrid - Gate grid to validate
     * @param {number} expectedQubits - Expected number of qubits
     * @param {number} expectedDepth - Expected depth
     * @returns {Object} {valid: boolean, errors: Array<string>}
     */
    validateGateGrid(gateGrid, expectedQubits, expectedDepth) {
        const errors = [];

        // Check grid dimensions
        if (!Array.isArray(gateGrid)) {
            errors.push('Gate grid is not an array');
            return { valid: false, errors };
        }

        if (gateGrid.length !== expectedQubits) {
            errors.push(`Gate grid has ${gateGrid.length} qubits, expected ${expectedQubits}`);
        }

        // Check each qubit row
        for (let q = 0; q < gateGrid.length; q++) {
            if (!Array.isArray(gateGrid[q])) {
                errors.push(`Qubit ${q} is not an array`);
                continue;
            }

            if (gateGrid[q].length !== expectedDepth) {
                errors.push(`Qubit ${q} has depth ${gateGrid[q].length}, expected ${expectedDepth}`);
            }

            // Check for invalid gate references
            for (let col = 0; col < gateGrid[q].length; col++) {
                const gate = gateGrid[q][col];
                if (gate === null || gate === undefined) continue;

                // Validate multi-qubit gate references
                if (gate.target !== undefined && !this._isValidQubit(gate.target, expectedQubits)) {
                    errors.push(`Gate at [${q}][${col}] has invalid target: ${gate.target}`);
                }

                if (gate.control2 !== undefined && !this._isValidQubit(gate.control2, expectedQubits)) {
                    errors.push(`Gate at [${q}][${col}] has invalid control2: ${gate.control2}`);
                }

                if (gate.source !== undefined && !this._isValidQubit(gate.source, expectedQubits)) {
                    errors.push(`Gate at [${q}][${col}] has invalid source: ${gate.source}`);
                }
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Check if qubit index is valid
     * @private
     * @param {number} qubit - Qubit index
     * @param {number} totalQubits - Total number of qubits
     * @returns {boolean} Whether qubit is valid
     */
    _isValidQubit(qubit, totalQubits) {
        return Number.isInteger(qubit) && qubit >= 0 && qubit < totalQubits;
    }

    /**
     * Calculate circuit depth from gate grid (ignoring empty columns)
     * @param {Array<Array>} gateGrid - Gate grid
     * @returns {number} Effective circuit depth
     */
    calculateEffectiveDepth(gateGrid) {
        let maxDepth = 0;

        for (const qubitRow of gateGrid) {
            for (let col = qubitRow.length - 1; col >= 0; col--) {
                if (qubitRow[col] !== null && qubitRow[col] !== undefined) {
                    maxDepth = Math.max(maxDepth, col + 1);
                    break;
                }
            }
        }

        return maxDepth;
    }

    /**
     * Create an empty gate grid
     * @param {number} numQubits - Number of qubits
     * @param {number} numDepth - Circuit depth
     * @returns {Array<Array>} Empty gate grid
     */
    createEmptyGrid(numQubits, numDepth) {
        return Array.from({ length: numQubits }, () =>
            Array.from({ length: numDepth }, () => null)
        );
    }
}
