/**
 * QCNS - Quantum Circuit and Network Simulator
 * QuantumGates class containing quantum gate definitions
 *
 * Contains all quantum gate matrices and metadata extracted from the original quantum-circuit.js
 */

export class QuantumGates {
    /**
     * Get all basic gate definitions
     * @returns {Object} Object containing all gate definitions
     */
    static getBasicGates() {
        // Stub: Provides a minimal set of essential gates.
        return {
            id: {
                description: "Single qubit identity gate",
                matrix: [
                    [1, 0],
                    [0, 1]
                ],
                params: [],
                drawingInfo: {
                    connectors: ["box"],
                    label: "ID"
                }
            },

            x: {
                description: "Pauli X (PI rotation over X-axis) aka \"NOT\" gate",
                matrix: [
                    [0, 1],
                    [1, 0]
                ],
                params: [],
                drawingInfo: {
                    connectors: ["box"],
                    label: "X"
                }
            },

            h: {
                description: "Hadamard gate",
                matrix: [
                    ["1/sqrt(2)", "1/sqrt(2)"],
                    ["1/sqrt(2)", "-1/sqrt(2)"]
                ],
                params: [],
                drawingInfo: {
                    connectors: ["box"],
                    label: "H"
                }
            },

            // Two-qubit gates
            cx: {
                description: "Controlled-NOT gate (CNOT)",
                matrix: [
                    [1, 0, 0, 0],
                    [0, 1, 0, 0],
                    [0, 0, 0, 1],
                    [0, 0, 1, 0]
                ],
                params: [],
                drawingInfo: {
                    connectors: ["dot", "not"],
                    label: "CX"
                }
            },

            // Measurement
            measure: {
                description: "Measurement gate",
                params: [],
                drawingInfo: {
                    connectors: ["gauge"],
                    label: "M"
                }
            },

            // Barrier (directive, not a gate)
            barrier: {
                description: "Barrier directive for circuit scheduling and optimization control",
                params: [],
                drawingInfo: {
                    connectors: ["barrier"],
                    label: "║"
                },
                isDirective: true  // Not a unitary operation
            }
        };
    }

    /**
     * Check if gate name exists in basic gates
     * @param {string} gateName - Name of the gate
     * @returns {boolean} True if gate exists
     */
    static hasGate(gateName) {
        return gateName in this.getBasicGates();
    }

    /**
     * Get gate definition by name
     * @param {string} gateName - Name of the gate
     * @returns {Object} Gate definition object
     */
    static getGate(gateName) {
        const gates = this.getBasicGates();
        if (!(gateName in gates)) {
            throw new Error(`Unknown gate: ${gateName}`);
        }
        return gates[gateName];
    }

    /**
     * Get list of all available gate names
     * @returns {Array} Array of gate names
     */
    static getGateNames() {
        return Object.keys(this.getBasicGates());
    }
}
