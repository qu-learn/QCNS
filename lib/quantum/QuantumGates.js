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

            y: {
                description: "Pauli Y (PI rotation over Y-axis)",
                matrix: [
                    [0, "-i"],
                    ["i", 0]
                ],
                params: [],
                drawingInfo: {
                    connectors: ["box"],
                    label: "Y"
                }
            },

            z: {
                description: "Pauli Z (PI rotation over Z-axis)",
                matrix: [
                    [1, 0],
                    [0, -1]
                ],
                params: [],
                drawingInfo: {
                    connectors: ["box"],
                    label: "Z"
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

            s: {
                description: "S gate (sqrt(Z), 90 degree phase rotation)",
                matrix: [
                    [1, 0],
                    [0, "i"]
                ],
                params: [],
                drawingInfo: {
                    connectors: ["box"],
                    label: "S"
                }
            },

            t: {
                description: "T gate (sqrt(S), 45 degree phase rotation)",
                matrix: [
                    [1, 0],
                    [0, "e^(i * pi / 4)"]
                ],
                params: [],
                drawingInfo: {
                    connectors: ["box"],
                    label: "T"
                }
            },

            sdg: {
                description: "S dagger gate (inverse of S)",
                matrix: [
                    [1, 0],
                    [0, "-i"]
                ],
                params: [],
                drawingInfo: {
                    connectors: ["box"],
                    label: "S†"
                }
            },

            tdg: {
                description: "T dagger gate (inverse of T)",
                matrix: [
                    [1, 0],
                    [0, "e^(-i * pi / 4)"]
                ],
                params: [],
                drawingInfo: {
                    connectors: ["box"],
                    label: "T†"
                }
            },

            rx: {
                description: "Rotation around X-axis",
                matrix: [
                    ["cos(theta/2)", "-i*sin(theta/2)"],
                    ["-i*sin(theta/2)", "cos(theta/2)"]
                ],
                params: ["theta"],
                drawingInfo: {
                    connectors: ["box"],
                    label: "RX"
                }
            },

            ry: {
                description: "Rotation around Y-axis",
                matrix: [
                    ["cos(theta/2)", "-sin(theta/2)"],
                    ["sin(theta/2)", "cos(theta/2)"]
                ],
                params: ["theta"],
                drawingInfo: {
                    connectors: ["box"],
                    label: "RY"
                }
            },

            rz: {
                description: "Rotation around Z-axis",
                matrix: [
                    ["e^(-i*theta/2)", 0],
                    [0, "e^(i*theta/2)"]
                ],
                params: ["theta"],
                drawingInfo: {
                    connectors: ["box"],
                    label: "RZ"
                }
            },

            u1: {
                description: "Single-qubit gate with one parameter (phase)",
                matrix: [
                    [1, 0],
                    [0, "e^(i*lambda)"]
                ],
                params: ["lambda"],
                drawingInfo: {
                    connectors: ["box"],
                    label: "U1"
                }
            },

            u2: {
                description: "Single-qubit gate with two parameters",
                matrix: [
                    ["1/sqrt(2)", "-e^(i*lambda)/sqrt(2)"],
                    ["e^(i*phi)/sqrt(2)", "e^(i*(phi+lambda))/sqrt(2)"]
                ],
                params: ["phi", "lambda"],
                drawingInfo: {
                    connectors: ["box"],
                    label: "U2"
                }
            },

            u3: {
                description: "Single-qubit gate with three parameters (most general single-qubit gate)",
                matrix: [
                    ["cos(theta/2)", "-e^(i*lambda)*sin(theta/2)"],
                    ["e^(i*phi)*sin(theta/2)", "e^(i*(phi+lambda))*cos(theta/2)"]
                ],
                params: ["theta", "phi", "lambda"],
                drawingInfo: {
                    connectors: ["box"],
                    label: "U3"
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

            cy: {
                description: "Controlled-Y gate",
                matrix: [
                    [1, 0, 0, 0],
                    [0, 1, 0, 0],
                    [0, 0, 0, "-i"],
                    [0, 0, "i", 0]
                ],
                params: [],
                drawingInfo: {
                    connectors: ["dot", "box"],
                    label: "CY"
                }
            },

            cz: {
                description: "Controlled-Z gate",
                matrix: [
                    [1, 0, 0, 0],
                    [0, 1, 0, 0],
                    [0, 0, 1, 0],
                    [0, 0, 0, -1]
                ],
                params: [],
                drawingInfo: {
                    connectors: ["dot", "dot"],
                    label: "CZ"
                }
            },

            ch: {
                description: "Controlled-Hadamard gate",
                matrix: [
                    [1, 0, 0, 0],
                    [0, 1, 0, 0],
                    [0, 0, "1/sqrt(2)", "1/sqrt(2)"],
                    [0, 0, "1/sqrt(2)", "-1/sqrt(2)"]
                ],
                params: [],
                drawingInfo: {
                    connectors: ["dot", "box"],
                    label: "CH"
                }
            },

            swap: {
                description: "SWAP gate",
                matrix: [
                    [1, 0, 0, 0],
                    [0, 0, 1, 0],
                    [0, 1, 0, 0],
                    [0, 0, 0, 1]
                ],
                params: [],
                drawingInfo: {
                    connectors: ["x", "x"],
                    label: "SWAP"
                }
            },

            iswap: {
                description: "iSWAP gate",
                matrix: [
                    [1, 0, 0, 0],
                    [0, 0, "i", 0],
                    [0, "i", 0, 0],
                    [0, 0, 0, 1]
                ],
                params: [],
                drawingInfo: {
                    connectors: ["x", "x"],
                    label: "iSWAP"
                }
            },

            // Three-qubit gates
            ccx: {
                description: "Toffoli gate (CCX)",
                matrix: [
                    [1, 0, 0, 0, 0, 0, 0, 0],
                    [0, 1, 0, 0, 0, 0, 0, 0],
                    [0, 0, 1, 0, 0, 0, 0, 0],
                    [0, 0, 0, 1, 0, 0, 0, 0],
                    [0, 0, 0, 0, 1, 0, 0, 0],
                    [0, 0, 0, 0, 0, 1, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 1],
                    [0, 0, 0, 0, 0, 0, 1, 0]
                ],
                params: [],
                drawingInfo: {
                    connectors: ["dot", "dot", "not"],
                    label: "CCX"
                }
            },

            cswap: {
                description: "Fredkin gate (Controlled-SWAP)",
                matrix: [
                    [1, 0, 0, 0, 0, 0, 0, 0],
                    [0, 1, 0, 0, 0, 0, 0, 0],
                    [0, 0, 1, 0, 0, 0, 0, 0],
                    [0, 0, 0, 1, 0, 0, 0, 0],
                    [0, 0, 0, 0, 1, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 1, 0],
                    [0, 0, 0, 0, 0, 1, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 1]
                ],
                params: [],
                drawingInfo: {
                    connectors: ["dot", "x", "x"],
                    label: "CSWAP"
                }
            },

            // Missing OpenQASM v3 standard gates
            sdg: {
                description: "S-dagger gate (inverse sqrt(Z))",
                matrix: [
                    [1, 0],
                    [0, "-i"]
                ],
                params: [],
                drawingInfo: {
                    connectors: ["box"],
                    label: "S†"
                }
            },

            tdg: {
                description: "T-dagger gate (inverse sqrt(S))",
                matrix: [
                    [1, 0],
                    [0, "e^(-i * pi / 4)"]
                ],
                params: [],
                drawingInfo: {
                    connectors: ["box"],
                    label: "T†"
                }
            },

            sx: {
                description: "sqrt(X) gate",
                matrix: [
                    ["(1+i)/2", "(1-i)/2"],
                    ["(1-i)/2", "(1+i)/2"]
                ],
                params: [],
                drawingInfo: {
                    connectors: ["box"],
                    label: "√X"
                }
            },

            p: {
                description: "Phase gate",
                matrix: [
                    [1, 0],
                    [0, "e^(i*lambda)"]
                ],
                params: ["lambda"],
                drawingInfo: {
                    connectors: ["box"],
                    label: "P"
                }
            },

            phase: {
                description: "Phase gate (alias for p)",
                matrix: [
                    [1, 0],
                    [0, "e^(i*lambda)"]
                ],
                params: ["lambda"],
                drawingInfo: {
                    connectors: ["box"],
                    label: "Phase"
                }
            },

            cp: {
                description: "Controlled-phase gate",
                matrix: [
                    [1, 0, 0, 0],
                    [0, 1, 0, 0],
                    [0, 0, 1, 0],
                    [0, 0, 0, "e^(i*lambda)"]
                ],
                params: ["lambda"],
                drawingInfo: {
                    connectors: ["dot", "box"],
                    label: "CP"
                }
            },

            crx: {
                description: "Controlled-RX gate",
                matrix: [
                    [1, 0, 0, 0],
                    [0, 1, 0, 0],
                    [0, 0, "cos(theta/2)", "-i*sin(theta/2)"],
                    [0, 0, "-i*sin(theta/2)", "cos(theta/2)"]
                ],
                params: ["theta"],
                drawingInfo: {
                    connectors: ["dot", "box"],
                    label: "CRX"
                }
            },

            cry: {
                description: "Controlled-RY gate",
                matrix: [
                    [1, 0, 0, 0],
                    [0, 1, 0, 0],
                    [0, 0, "cos(theta/2)", "-sin(theta/2)"],
                    [0, 0, "sin(theta/2)", "cos(theta/2)"]
                ],
                params: ["theta"],
                drawingInfo: {
                    connectors: ["dot", "box"],
                    label: "CRY"
                }
            },

            crz: {
                description: "Controlled-RZ gate",
                matrix: [
                    [1, 0, 0, 0],
                    [0, 1, 0, 0],
                    [0, 0, "e^(-i*theta/2)", 0],
                    [0, 0, 0, "e^(i*theta/2)"]
                ],
                params: ["theta"],
                drawingInfo: {
                    connectors: ["dot", "box"],
                    label: "CRZ"
                }
            },

            cu: {
                description: "Controlled-U gate with relative phase",
                matrix: [
                    [1, 0, 0, 0],
                    [0, 1, 0, 0],
                    [0, 0, "cos(theta/2)", "-e^(i*lambda)*sin(theta/2)"],
                    [0, 0, "e^(i*phi)*sin(theta/2)", "e^(i*(phi+lambda))*cos(theta/2)"]
                ],
                params: ["theta", "phi", "lambda", "gamma"],
                drawingInfo: {
                    connectors: ["dot", "box"],
                    label: "CU"
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

    /**
     * Get single-qubit gate names
     * @returns {Array} Array of single-qubit gate names
     */
    static getSingleQubitGates() {
        const gates = this.getBasicGates();
        return Object.keys(gates).filter(name => {
            const gate = gates[name];
            return gate.matrix && gate.matrix.length === 2 && name !== 'measure';
        });
    }

    /**
     * Get two-qubit gate names
     * @returns {Array} Array of two-qubit gate names
     */
    static getTwoQubitGates() {
        const gates = this.getBasicGates();
        return Object.keys(gates).filter(name => {
            const gate = gates[name];
            return gate.matrix && gate.matrix.length === 4;
        });
    }

    /**
     * Get three-qubit gate names
     * @returns {Array} Array of three-qubit gate names
     */
    static getThreeQubitGates() {
        const gates = this.getBasicGates();
        return Object.keys(gates).filter(name => {
            const gate = gates[name];
            return gate.matrix && gate.matrix.length === 8;
        });
    }

    /**
     * Get parameterized gate names
     * @returns {Array} Array of parameterized gate names
     */
    static getParameterizedGates() {
        const gates = this.getBasicGates();
        return Object.keys(gates).filter(name => {
            const gate = gates[name];
            return gate.params && gate.params.length > 0;
        });
    }
}