/**
 * QCNS - Quantum Circuit and Network Simulator
 * ClassicalRegister class for managing classical register objects
 *
 * Provides a clean interface for classical register management similar to Qiskit's ClassicalRegister
 */

export class ClassicalRegister {
    /**
     * Create a classical register
     * @param {number} size - Number of classical bits in the register
     * @param {string} name - Name of the register (default: 'creg')
     */
    constructor(size, name = 'creg') {
        if (typeof size !== 'number' || size < 1 || !Number.isInteger(size)) {
            throw new Error('Register size must be a positive integer');
        }

        if (typeof name !== 'string' || name.trim() === '') {
            throw new Error('Register name must be a non-empty string');
        }

        this.size = size;
        this.name = name.trim();
        this._bits = [];

        // Create bit references
        for (let i = 0; i < size; i++) {
            this._bits.push({
                register: this,
                index: i,
                value: 0, // Classical bits start at 0
                toString: () => `${this.name}[${i}]`
            });
        }
    }

    /**
     * Get classical bit at index
     * @param {number} index - Bit index
     * @returns {Object} Bit reference
     */
    bit(index) {
        if (typeof index !== 'number' || index < 0 || index >= this.size || !Number.isInteger(index)) {
            throw new Error(`Bit index ${index} out of range [0, ${this.size - 1}]`);
        }
        return this._bits[index];
    }

    /**
     * Get all bits in the register
     * @returns {Array} Array of bit references
     */
    bits() {
        return [...this._bits];
    }

    /**
     * Get bit using array syntax
     * @param {number} index - Bit index
     * @returns {Object} Bit reference
     */
    get(index) {
        return this.bit(index);
    }

    /**
     * Set value of a classical bit
     * @param {number} index - Bit index
     * @param {number} value - Value (0 or 1)
     */
    setBit(index, value) {
        if (typeof index !== 'number' || index < 0 || index >= this.size || !Number.isInteger(index)) {
            throw new Error(`Bit index ${index} out of range [0, ${this.size - 1}]`);
        }

        if (value !== 0 && value !== 1) {
            throw new Error('Bit value must be 0 or 1');
        }

        this._bits[index].value = value;
    }

    /**
     * Get value of a classical bit
     * @param {number} index - Bit index
     * @returns {number} Bit value (0 or 1)
     */
    getBit(index) {
        if (typeof index !== 'number' || index < 0 || index >= this.size || !Number.isInteger(index)) {
            throw new Error(`Bit index ${index} out of range [0, ${this.size - 1}]`);
        }
        return this._bits[index].value;
    }

    /**
     * Get all bit values as array
     * @returns {Array} Array of bit values
     */
    getValues() {
        return this._bits.map(bit => bit.value);
    }

    /**
     * Set all bit values from array
     * @param {Array} values - Array of bit values
     */
    setValues(values) {
        if (!Array.isArray(values) || values.length !== this.size) {
            throw new Error(`Values array must have length ${this.size}`);
        }

        for (let i = 0; i < values.length; i++) {
            if (values[i] !== 0 && values[i] !== 1) {
                throw new Error(`All values must be 0 or 1, got ${values[i]} at index ${i}`);
            }
        }

        values.forEach((value, index) => {
            this._bits[index].value = value;
        });
    }

    /**
     * Reset all bits to 0
     */
    reset() {
        this._bits.forEach(bit => {
            bit.value = 0;
        });
    }

    /**
     * Get register value as integer (little-endian)
     * @returns {number} Integer representation of the register
     */
    getValue() {
        let value = 0;
        for (let i = 0; i < this.size; i++) {
            value += this._bits[i].value * Math.pow(2, i);
        }
        return value;
    }

    /**
     * Set register value from integer (little-endian)
     * @param {number} value - Integer value
     */
    setValue(value) {
        if (typeof value !== 'number' || value < 0 || !Number.isInteger(value)) {
            throw new Error('Value must be a non-negative integer');
        }

        const maxValue = Math.pow(2, this.size) - 1;
        if (value > maxValue) {
            throw new Error(`Value ${value} exceeds maximum ${maxValue} for ${this.size}-bit register`);
        }

        for (let i = 0; i < this.size; i++) {
            this._bits[i].value = (value >> i) & 1;
        }
    }

    /**
     * String representation
     * @returns {string} String representation of the register
     */
    toString() {
        return `ClassicalRegister('${this.name}', ${this.size})`;
    }

    /**
     * Export to JSON
     * @returns {Object} JSON representation
     */
    toJSON() {
        return {
            type: 'ClassicalRegister',
            size: this.size,
            name: this.name,
            values: this.getValues()
        };
    }

    /**
     * Create ClassicalRegister from JSON
     * @param {Object} json - JSON representation
     * @returns {ClassicalRegister} New register instance
     */
    static fromJSON(json) {
        if (json.type !== 'ClassicalRegister') {
            throw new Error('Invalid JSON: not a ClassicalRegister');
        }

        const register = new ClassicalRegister(json.size, json.name);
        if (json.values) {
            register.setValues(json.values);
        }
        return register;
    }
}