/**
 * QCNS - Quantum Circuit and Network Simulator
 * Core QuantumCircuit class with Qiskit-like API
 *
 * This class provides a clean, modern JavaScript interface for quantum circuit construction
 * and simulation, inspired by IBM's Qiskit framework.
 */

import { ComplexMath } from './ComplexMath.js';
import { QuantumGates } from './QuantumGates.js';
import { QuantumRegister } from './QuantumRegister.js';
import { ClassicalRegister } from './ClassicalRegister.js';
import { QasmTranspiler } from '../transpiler/QasmTranspiler.js';
import { QuantumSimulator } from './QuantumSimulator.js';

export class QuantumCircuit {
    /**
     * Create a new quantum circuit
     * @param {number|QuantumRegister} qubits - Number of qubits or QuantumRegister
     * @param {number|ClassicalRegister} clbits - Number of classical bits or ClassicalRegister
     */
    constructor(qubits = 1, clbits = 0) {
        // Handle different constructor signatures
        if (typeof qubits === 'number') {
            this.qreg = new QuantumRegister(qubits, 'qreg');
        } else if (qubits instanceof QuantumRegister) {
            this.qreg = qubits;
        } else {
            throw new Error('First argument must be a number or QuantumRegister');
        }

        if (typeof clbits === 'number') {
            this.creg = clbits > 0 ? new ClassicalRegister(clbits, 'creg') : null;
        } else if (clbits instanceof ClassicalRegister) {
            this.creg = clbits;
        } else if (clbits !== 0) {
            throw new Error('Second argument must be a number or ClassicalRegister');
        }

        this.numQubits = this.qreg.size;
        this.numClbits = this.creg ? this.creg.size : 0;

        // Initialize internal circuit representation
        this.gates = [];
        for (let i = 0; i < this.numQubits; i++) {
            this.gates.push([]);
        }

        // Circuit metadata
        this.name = '';
        this.params = {};
        this.customGates = {};

        // Import gate definitions and utilities from the original quantum-circuit.js
        this.basicGates = QuantumGates.getBasicGates();
        this.complexMath = new ComplexMath();

        // Initialize quantum state (after complexMath is available)
        this.state = {};
        this.stateBits = 0;
        this.initState();
    }

    /**
     * Getter for numClassicalBits (alias for numClbits)
     */
    get numClassicalBits() {
        return this.numClbits;
    }

    /**
     * Initialize quantum state to |00...0⟩
     */
    initState() {
        this.resetState();
        this.state["0"] = this.complexMath.complex(1, 0);
    }

    /**
     * Reset quantum state
     */
    resetState() {
        this.state = {};
        this.stateBits = 0;
    }

    // ============================================================================
    // QISKIT-LIKE API METHODS
    // ============================================================================

    /**
     * Apply Hadamard gate to qubit
     * @param {number} qubit - Target qubit index
     * @returns {QuantumCircuit} This circuit for method chaining
     */
    h(qubit) {
        this.addGate('h', -1, qubit);
        return this;
    }

    /**
     * Apply Pauli-X gate to qubit
     * @param {number} qubit - Target qubit index
     * @returns {QuantumCircuit} This circuit for method chaining
     */
    x(qubit) {
        this.addGate('x', -1, qubit);
        return this;
    }

    /**
     * Apply Pauli-Y gate to qubit
     * @param {number} qubit - Target qubit index
     * @returns {QuantumCircuit} This circuit for method chaining
     */
    y(qubit) {
        this.addGate('y', -1, qubit);
        return this;
    }

    /**
     * Apply Pauli-Z gate to qubit
     * @param {number} qubit - Target qubit index
     * @returns {QuantumCircuit} This circuit for method chaining
     */
    z(qubit) {
        this.addGate('z', -1, qubit);
        return this;
    }

    /**
     * Apply S gate to qubit
     * @param {number} qubit - Target qubit index
     * @returns {QuantumCircuit} This circuit for method chaining
     */
    s(qubit) {
        this.addGate('s', -1, qubit);
        return this;
    }

    /**
     * Apply T gate to qubit
     * @param {number} qubit - Target qubit index
     * @returns {QuantumCircuit} This circuit for method chaining
     */
    t(qubit) {
        this.addGate('t', -1, qubit);
        return this;
    }

    /**
     * Apply CNOT (CX) gate
     * @param {number} control - Control qubit index
     * @param {number} target - Target qubit index
     * @returns {QuantumCircuit} This circuit for method chaining
     */
    cx(control, target) {
        this.addGate('cx', -1, [control, target]);
        return this;
    }

    /**
     * Apply CNOT gate (alias for cx)
     * @param {number} control - Control qubit index
     * @param {number} target - Target qubit index
     * @returns {QuantumCircuit} This circuit for method chaining
     */
    cnot(control, target) {
        return this.cx(control, target);
    }

    /**
     * Apply CZ gate
     * @param {number} control - Control qubit index
     * @param {number} target - Target qubit index
     * @returns {QuantumCircuit} This circuit for method chaining
     */
    cz(control, target) {
        this.addGate('cz', -1, [control, target]);
        return this;
    }

    /**
     * Apply SWAP gate
     * @param {number} qubit1 - First qubit index
     * @param {number} qubit2 - Second qubit index
     * @returns {QuantumCircuit} This circuit for method chaining
     */
    swap(qubit1, qubit2) {
        this.addGate('swap', -1, [qubit1, qubit2]);
        return this;
    }

    /**
     * Apply Toffoli (CCX) gate
     * @param {number} control1 - First control qubit index
     * @param {number} control2 - Second control qubit index
     * @param {number} target - Target qubit index
     * @returns {QuantumCircuit} This circuit for method chaining
     */
    ccx(control1, control2, target) {
        this.addGate('ccx', -1, [control1, control2, target]);
        return this;
    }

    /**
     * Apply Toffoli gate (alias for ccx)
     * @param {number} control1 - First control qubit index
     * @param {number} control2 - Second control qubit index
     * @param {number} target - Target qubit index
     * @returns {QuantumCircuit} This circuit for method chaining
     */
    toffoli(control1, control2, target) {
        return this.ccx(control1, control2, target);
    }

    /**
     * Apply Fredkin (CSWAP) gate
     * @param {number} control - Control qubit index
     * @param {number} target1 - First target qubit index
     * @param {number} target2 - Second target qubit index
     * @returns {QuantumCircuit} This circuit for method chaining
     */
    cswap(control, target1, target2) {
        this.addGate('cswap', -1, [control, target1, target2]);
        return this;
    }

    /**
     * Apply Fredkin gate (alias for cswap)
     * @param {number} control - Control qubit index
     * @param {number} target1 - First target qubit index
     * @param {number} target2 - Second target qubit index
     * @returns {QuantumCircuit} This circuit for method chaining
     */
    fredkin(control, target1, target2) {
        return this.cswap(control, target1, target2);
    }

    /**
     * Apply rotation around X axis
     * @param {number} theta - Rotation angle in radians
     * @param {number} qubit - Target qubit index
     * @returns {QuantumCircuit} This circuit for method chaining
     */
    rx(theta, qubit) {
        this.addGate('rx', -1, qubit, { params: { theta } });
        return this;
    }

    /**
     * Apply rotation around Y axis
     * @param {number} theta - Rotation angle in radians
     * @param {number} qubit - Target qubit index
     * @returns {QuantumCircuit} This circuit for method chaining
     */
    ry(theta, qubit) {
        this.addGate('ry', -1, qubit, { params: { theta } });
        return this;
    }

    /**
     * Apply rotation around Z axis
     * @param {number} theta - Rotation angle in radians
     * @param {number} qubit - Target qubit index
     * @returns {QuantumCircuit} This circuit for method chaining
     */
    rz(theta, qubit) {
        this.addGate('rz', -1, qubit, { params: { theta } });
        return this;
    }

    /**
     * Apply S-dagger gate to qubit
     * @param {number} qubit - Target qubit index
     * @returns {QuantumCircuit} This circuit for method chaining
     */
    sdg(qubit) {
        this.addGate('sdg', -1, qubit);
        return this;
    }

    /**
     * Apply T-dagger gate to qubit
     * @param {number} qubit - Target qubit index
     * @returns {QuantumCircuit} This circuit for method chaining
     */
    tdg(qubit) {
        this.addGate('tdg', -1, qubit);
        return this;
    }

    /**
     * Apply sqrt(X) gate to qubit
     * @param {number} qubit - Target qubit index
     * @returns {QuantumCircuit} This circuit for method chaining
     */
    sx(qubit) {
        this.addGate('sx', -1, qubit);
        return this;
    }

    /**
     * Apply phase gate to qubit
     * @param {number} lambda - Phase angle in radians
     * @param {number} qubit - Target qubit index
     * @returns {QuantumCircuit} This circuit for method chaining
     */
    p(lambda, qubit) {
        this.addGate('p', -1, qubit, { params: { lambda } });
        return this;
    }

    /**
     * Apply phase gate (alias for p)
     * @param {number} lambda - Phase angle in radians
     * @param {number} qubit - Target qubit index
     * @returns {QuantumCircuit} This circuit for method chaining
     */
    phase(lambda, qubit) {
        this.addGate('phase', -1, qubit, { params: { lambda } });
        return this;
    }

    /**
     * Apply controlled-phase gate
     * @param {number} lambda - Phase angle in radians
     * @param {number} control - Control qubit index
     * @param {number} target - Target qubit index
     * @returns {QuantumCircuit} This circuit for method chaining
     */
    cp(lambda, control, target) {
        this.addGate('cp', -1, [control, target], { params: { lambda } });
        return this;
    }

    /**
     * Apply controlled-H gate
     * @param {number} control - Control qubit index
     * @param {number} target - Target qubit index
     * @returns {QuantumCircuit} This circuit for method chaining
     */
    ch(control, target) {
        this.addGate('ch', -1, [control, target]);
        return this;
    }

    /**
     * Apply controlled-Y gate
     * @param {number} control - Control qubit index
     * @param {number} target - Target qubit index
     * @returns {QuantumCircuit} This circuit for method chaining
     */
    cy(control, target) {
        this.addGate('cy', -1, [control, target]);
        return this;
    }

    /**
     * Apply controlled-RX gate
     * @param {number} theta - Rotation angle in radians
     * @param {number} control - Control qubit index
     * @param {number} target - Target qubit index
     * @returns {QuantumCircuit} This circuit for method chaining
     */
    crx(theta, control, target) {
        this.addGate('crx', -1, [control, target], { params: { theta } });
        return this;
    }

    /**
     * Apply controlled-RY gate
     * @param {number} theta - Rotation angle in radians
     * @param {number} control - Control qubit index
     * @param {number} target - Target qubit index
     * @returns {QuantumCircuit} This circuit for method chaining
     */
    cry(theta, control, target) {
        this.addGate('cry', -1, [control, target], { params: { theta } });
        return this;
    }

    /**
     * Apply controlled-RZ gate
     * @param {number} theta - Rotation angle in radians
     * @param {number} control - Control qubit index
     * @param {number} target - Target qubit index
     * @returns {QuantumCircuit} This circuit for method chaining
     */
    crz(theta, control, target) {
        this.addGate('crz', -1, [control, target], { params: { theta } });
        return this;
    }

    /**
     * Apply controlled-U gate with relative phase
     * @param {number} theta - Theta parameter
     * @param {number} phi - Phi parameter
     * @param {number} lambda - Lambda parameter
     * @param {number} gamma - Gamma parameter (relative phase)
     * @param {number} control - Control qubit index
     * @param {number} target - Target qubit index
     * @returns {QuantumCircuit} This circuit for method chaining
     */
    cu(theta, phi, lambda, gamma, control, target) {
        this.addGate('cu', -1, [control, target], {
            params: { theta, phi, lambda, gamma }
        });
        return this;
    }

    /**
     * Apply measurement to qubit
     * @param {number} qubit - Qubit to measure
     * @param {number} cbit - Classical bit to store result
     * @returns {QuantumCircuit} This circuit for method chaining
     */
    measure(qubit, cbit) {
        if (!this.creg || cbit >= this.numClbits) {
            throw new Error('Classical register not available or classical bit index out of range');
        }
        this.addGate('measure', -1, qubit, { creg: { name: this.creg.name, bit: cbit } });
        return this;
    }

    /**
     * Measure all qubits to classical register
     * @returns {QuantumCircuit} This circuit for method chaining
     */
    measure_all() {
        if (!this.creg || this.numClbits < this.numQubits) {
            throw new Error('Classical register must have at least as many bits as qubits');
        }
        for (let i = 0; i < this.numQubits; i++) {
            this.measure(i, i);
        }
        return this;
    }

    /**
     * Add a barrier across specified qubits (or all qubits if none specified)
     * Barriers are used to prevent gate optimization across them and for visual separation
     * @param {Array<number>} qubits - Optional array of qubit indices (defaults to all qubits)
     * @returns {QuantumCircuit} This circuit for method chaining
     */
    barrier(qubits = null) {
        const targetQubits = qubits || Array.from({ length: this.numQubits }, (_, i) => i);
        this.addGate('barrier', -1, targetQubits);
        return this;
    }

    // ============================================================================
    // CIRCUIT MANIPULATION METHODS (adapted from original quantum-circuit.js)
    // ============================================================================

    /**
     * Add gate to circuit
     * @param {string} gateName - Gate name
     * @param {number} column - Column position (-1 for append)
     * @param {number|Array} wires - Wire index or array of wire indices
     * @param {Object} options - Gate options (parameters, etc.)
     */
    addGate(gateName, column, wires, options) {
        const wireList = Array.isArray(wires) ? wires : [wires];

        // Find column position
        let targetColumn = column;
        if (column < 0) {
            targetColumn = this.lastNonEmptyPlace(wireList) + 1;
        }

        // Ensure gates array is large enough for ALL wires
        for (let wire = 0; wire < this.numQubits; wire++) {
            while (this.gates[wire].length <= targetColumn) {
                this.gates[wire].push(null);
            }
        }

        // Generate unique gate ID
        const gateId = this.randomString();

        // Create gate object
        const gate = {
            name: gateName,
            id: gateId,
            options: options || {}
        };

        // Place gate on all specified wires
        for (let wire of wireList) {
            this.gates[wire][targetColumn] = gate;
        }

        // Reset state since circuit has changed
        this.resetState();
    }

    /**
     * Get number of columns in circuit
     */
    numCols() {
        return this.gates.length ? this.gates[0].length : 0;
    }

    /**
     * Find last non-empty position for given wires
     * @param {Array} wires - Array of wire indices
     */
    lastNonEmptyPlace(wires) {
        let col = this.numCols();
        let allEmpty = true;

        while (col >= 1 && allEmpty) {
            col--;
            for (let wire of wires) {
                if (this.gates[wire] && this.gates[wire][col]) {
                    allEmpty = false;
                    break;
                }
            }
            if (allEmpty) {
                for (let i = 0; i < this.numQubits; i++) {
                    if (this.gates[i] && this.gates[i][col]) {
                        col++;
                        allEmpty = false;
                        break;
                    }
                }
            }
        }

        return col;
    }

    /**
     * Generate random string for gate ID
     */
    randomString(len = 17) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < len; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // ============================================================================
    // SIMULATION METHODS
    // ============================================================================

    /**
     * Run the circuit simulation
     * @returns {Object} Simulation results
     */
    run() {
        const simulator = new QuantumSimulator();
        const results = simulator.simulate(this);

        // Add unitary matrix to results
        results.unitaryMatrix = simulator.calculateUnitaryMatrix(this);

        // Add QASM code to results
        results.qasm = this.qasm();

        return results;
    }

    /**
     * Simulate the circuit (alias for run)
     * @returns {Object} Simulation results
     */
    simulate() {
        return this.run();
    }

    /**
     * Get current quantum state
     * @returns {Object} Current state vector
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Get measurement probabilities
     * @returns {Object} Measurement probabilities for each basis state
     */
    getProbabilities() {
        const probabilities = {};
        for (const state in this.state) {
            const amplitude = this.state[state];
            probabilities[state] = Math.pow(amplitude.re, 2) + Math.pow(amplitude.im, 2);
        }
        return probabilities;
    }

    // ============================================================================
    // EXPORT METHODS
    // ============================================================================

    /**
     * Export circuit to OpenQASM v3
     * @param {Object} options - Transpilation options
     * @returns {string} OpenQASM v3 representation
     */
    qasm(options = {}) {
        return this.toQASMv3(options);
    }

    /**
     * Export circuit to OpenQASM v3 (detailed method)
     * @param {Object} options - Transpilation options
     * @param {boolean} options.includeVersion - Include version declaration (default: true)
     * @param {boolean} options.includeStdGates - Include stdgates.inc (default: true)
     * @param {boolean} options.includeComments - Include generated comments (default: true)
     * @param {boolean} options.optimize - Apply optimizations (default: false)
     * @returns {string} OpenQASM v3 code
     */
    toQASMv3(options = {}) {
        const transpiler = new QasmTranspiler();

        // Validate circuit before transpilation
        transpiler.validate(this);

        // Transpile to OpenQASM v3
        return transpiler.transpile(this, options);
    }

    /**
     * Export circuit as JSON
     * @returns {Object} JSON representation
     */
    toJSON() {
        return {
            numQubits: this.numQubits,
            numClbits: this.numClbits,
            gates: this.gates,
            name: this.name,
            qreg: this.qreg.toJSON(),
            creg: this.creg ? this.creg.toJSON() : null
        };
    }

    /**
     * Create circuit from JSON
     * @param {Object} json - JSON representation
     * @returns {QuantumCircuit} New circuit instance
     */
    static fromJSON(json) {
        const qreg = QuantumRegister.fromJSON(json.qreg);
        const creg = json.creg ? ClassicalRegister.fromJSON(json.creg) : 0;

        const circuit = new QuantumCircuit(qreg, creg);
        circuit.gates = json.gates || [];
        circuit.name = json.name || '';

        return circuit;
    }
}