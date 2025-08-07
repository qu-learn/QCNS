/**
 * QCNS - Quantum Circuit and Network Simulator
 * QuantumRegister class for managing quantum register objects
 *
 * Provides a clean interface for quantum register management similar to Qiskit's QuantumRegister
 */

export class QuantumRegister {
    /**
     * Create a quantum register
     * @param {number} size - Number of qubits in the register
     * @param {string} name - Name of the register (default: 'qreg')
     */
    constructor(size, name = 'qreg') {
        if (typeof size !== 'number' || size < 1 || !Number.isInteger(size)) {
            throw new Error('Register size must be a positive integer');
        }

        if (typeof name !== 'string' || name.trim() === '') {
            throw new Error('Register name must be a non-empty string');
        }

        this.size = size;
        this.name = name.trim();
        this._qubits = []; // Basic structure
    }

    /**
     * Get qubit at index
     */
    qubit(index) {
        throw new Error('Not implemented');
    }

    /**
     * Get all qubits in the register
     */
    qubits() {
        throw new Error('Not implemented');
    }

    /**
     * Get qubit using array syntax
     */
    get(index) {
        return this.qubit(index);
    }

    /**
     * String representation
     */
    toString() {
        return `QuantumRegister('${this.name}', ${this.size})`;
    }

    /**
     * Export to JSON
     */
    toJSON() {
        return {
            type: 'QuantumRegister',
            size: this.size,
            name: this.name
        };
    }

    /**
     * Create QuantumRegister from JSON
     */
    static fromJSON(json) {
        throw new Error('Not implemented');
    }
}
