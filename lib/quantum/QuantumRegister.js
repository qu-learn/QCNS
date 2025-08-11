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
        this._qubits = [];

        // Create qubit references
        for (let i = 0; i < size; i++) {
            this._qubits.push({
                register: this,
                index: i,
                toString: () => `${this.name}[${i}]`
            });
        }
    }

    /**
     * Get qubit at index
     * @param {number} index - Qubit index
     * @returns {Object} Qubit reference
     */
    qubit(index) {
        if (typeof index !== 'number' || index < 0 || index >= this.size || !Number.isInteger(index)) {
            throw new Error(`Qubit index ${index} out of range [0, ${this.size - 1}]`);
        }
        return this._qubits[index];
    }

    /**
     * Get all qubits in the register
     * @returns {Array} Array of qubit references
     */
    qubits() {
        return [...this._qubits];
    }

    /**
     * Get qubit using array syntax
     * @param {number} index - Qubit index
     * @returns {Object} Qubit reference
     */
    get(index) {
        return this.qubit(index);
    }

    /**
     * String representation
     * @returns {string} String representation of the register
     */
    toString() {
        return `QuantumRegister('${this.name}', ${this.size})`;
    }

    /**
     * Export to JSON
     * @returns {Object} JSON representation
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
     * @param {Object} json - JSON representation
     * @returns {QuantumRegister} New register instance
     */
    static fromJSON(json) {
        if (json.type !== 'QuantumRegister') {
            throw new Error('Invalid JSON: not a QuantumRegister');
        }
        return new QuantumRegister(json.size, json.name);
    }
}