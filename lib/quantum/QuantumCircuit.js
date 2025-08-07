/**
 * QCNS - Quantum Circuit and Network Simulator
 * Core QuantumCircuit class with Qiskit-like API
 *
 * This class provides a clean, modern JavaScript interface for quantum circuit construction
 * and simulation, inspired by IBM's Qiskit framework.
 */

import { QuantumRegister } from './QuantumRegister.js';
import { ClassicalRegister } from './ClassicalRegister.js';

export class QuantumCircuit {
    /**
     * Create a new quantum circuit
     * @param {number|QuantumRegister} qubits - Number of qubits or QuantumRegister
     * @param {number|ClassicalRegister} clbits - Number of classical bits or ClassicalRegister
     */
    constructor(qubits = 1, clbits = 0) {
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

        // Stub: A simple list of operations, not a 2D grid yet.
        this.operations = [];
    }

    // ============================================================================
    // QISKIT-LIKE API METHODS (STUBS)
    // ============================================================================

    h(qubit) { this.addGate('h', qubit); return this; }
    x(qubit) { this.addGate('x', qubit); return this; }
    cx(control, target) { this.addGate('cx', [control, target]); return this; }
    cnot(control, target) { return this.cx(control, target); }
    measure(qubit, cbit) { this.addGate('measure', qubit, { creg: { bit: cbit } }); return this; }
    barrier() { this.addGate('barrier', []); return this; }

    // ============================================================================
    // CIRCUIT MANIPULATION METHODS (STUB)
    // ============================================================================

    /**
     * Add gate to circuit (Stub version)
     */
    addGate(gateName, wires, options) {
        // Stub: Just records the operation
        this.operations.push({ gate: gateName, wires, options: options || {} });
    }

    // ============================================================================
    // SIMULATION & EXPORT METHODS (STUBS)
    // ============================================================================

    run() {
        throw new Error('Simulation not implemented in this version.');
    }

    simulate() {
        return this.run();
    }

    qasm() {
        throw new Error('QASM export not implemented in this version.');
    }

    toJSON() {
        // Stub: Provide a basic JSON representation
        return {
            numQubits: this.numQubits,
            numClbits: this.numClbits,
            operations: this.operations,
            qreg: this.qreg.toJSON(),
            creg: this.creg ? this.creg.toJSON() : null
        };
    }

    static fromJSON(json) {
        throw new Error('fromJSON not implemented in this version.');
    }
}
