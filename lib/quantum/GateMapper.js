/**
 * QCNS - Gate Name Mapping and Normalization System
 *
 * This module provides a comprehensive mapping between UI gate names
 * and internal library gate names to resolve naming inconsistencies.
 */

export class GateMapper {
    /**
     * Canonical gate name mapping
     * Maps UI gate names (any case) to internal library gate names
     */
    static getGateNameMap() {
        return {
            // Identity gate
            'I': 'id',
            'i': 'id',
            'ID': 'id',
            'id': 'id',
            'identity': 'id',
            'IDENTITY': 'id',
            'Identity': 'id',

            // Pauli gates
            'X': 'x',
            'x': 'x',
            'pauli-x': 'x',
            'PAULI-X': 'x',
            'not': 'x',
            'NOT': 'x',

            'Y': 'y',
            'y': 'y',
            'pauli-y': 'y',
            'PAULI-Y': 'y',

            'Z': 'z',
            'z': 'z',
            'pauli-z': 'z',
            'PAULI-Z': 'z',

            // Hadamard gate
            'H': 'h',
            'h': 'h',
            'hadamard': 'h',
            'HADAMARD': 'h',

            // Phase gates
            'S': 's',
            's': 's',
            'phase': 's',
            'PHASE': 's',

            'T': 't',
            't': 't',

            'SDG': 'sdg',
            'sdg': 'sdg',
            'Sdg': 'sdg',
            'S†': 'sdg',
            's-dagger': 'sdg',
            'S-DAGGER': 'sdg',

            'TDG': 'tdg',
            'tdg': 'tdg',
            'Tdg': 'tdg',
            'T†': 'tdg',
            't-dagger': 'tdg',
            'T-DAGGER': 'tdg',

            'SX': 'sx',
            'sx': 'sx',
            'sqrt-x': 'sx',
            'SQRT-X': 'sx',
            '√X': 'sx',

            'P': 'p',
            'p': 'p',
            'phase-gate': 'p',
            'PHASE-GATE': 'p',

            // Rotation gates
            'RX': 'rx',
            'rx': 'rx',
            'rot-x': 'rx',
            'ROT-X': 'rx',

            'RY': 'ry',
            'ry': 'ry',
            'rot-y': 'ry',
            'ROT-Y': 'ry',

            'RZ': 'rz',
            'rz': 'rz',
            'rot-z': 'rz',
            'ROT-Z': 'rz',

            // Universal single-qubit gates
            'U1': 'u1',
            'u1': 'u1',
            'U2': 'u2',
            'u2': 'u2',
            'U3': 'u3',
            'u3': 'u3',

            // Two-qubit gates
            'CNOT': 'cx',
            'cnot': 'cx',
            'CX': 'cx',
            'cx': 'cx',
            'controlled-x': 'cx',
            'CONTROLLED-X': 'cx',

            'CY': 'cy',
            'cy': 'cy',
            'controlled-y': 'cy',
            'CONTROLLED-Y': 'cy',

            'CZ': 'cz',
            'cz': 'cz',
            'controlled-z': 'cz',
            'CONTROLLED-Z': 'cz',

            'CH': 'ch',
            'ch': 'ch',
            'controlled-h': 'ch',
            'CONTROLLED-H': 'ch',

            'CP': 'cp',
            'cp': 'cp',
            'controlled-phase': 'cp',
            'CONTROLLED-PHASE': 'cp',

            'SWAP': 'swap',
            'swap': 'swap',

            'ISWAP': 'iswap',
            'iswap': 'iswap',
            'i-swap': 'iswap',
            'I-SWAP': 'iswap',

            // Controlled rotations
            'CRX': 'crx',
            'crx': 'crx',
            'controlled-rx': 'crx',
            'CONTROLLED-RX': 'crx',

            'CRY': 'cry',
            'cry': 'cry',
            'controlled-ry': 'cry',
            'CONTROLLED-RY': 'cry',

            'CRZ': 'crz',
            'crz': 'crz',
            'controlled-rz': 'crz',
            'CONTROLLED-RZ': 'crz',

            'CU': 'cu',
            'cu': 'cu',
            'controlled-u': 'cu',
            'CONTROLLED-U': 'cu',

            // Three-qubit gates
            'TOFFOLI': 'ccx',
            'toffoli': 'ccx',
            'CCX': 'ccx',
            'ccx': 'ccx',
            'controlled-controlled-x': 'ccx',
            'CONTROLLED-CONTROLLED-X': 'ccx',

            'FREDKIN': 'cswap',
            'fredkin': 'cswap',
            'CSWAP': 'cswap',
            'cswap': 'cswap',
            'controlled-swap': 'cswap',
            'CONTROLLED-SWAP': 'cswap',

            // Measurement
            'MEASURE': 'measure',
            'measure': 'measure',
            'M': 'measure',
            'm': 'measure'
        };
    }

    /**
     * Normalize gate name to internal canonical form
     * @param {string} gateName - Gate name from UI or any source
     * @returns {string} Canonical internal gate name
     * @throws {Error} If gate name is not recognized
     */
    static normalizeGateName(gateName) {
        if (!gateName || typeof gateName !== 'string') {
            throw new Error('Invalid gate name: must be a non-empty string');
        }

        const gateMap = this.getGateNameMap();
        const normalizedName = gateMap[gateName];

        if (!normalizedName) {
            // Try case-insensitive lookup
            const lowerName = gateName.toLowerCase();
            const upperName = gateName.toUpperCase();

            if (gateMap[lowerName]) {
                return gateMap[lowerName];
            }
            if (gateMap[upperName]) {
                return gateMap[upperName];
            }

            throw new Error(`Unknown gate type: ${gateName}`);
        }

        return normalizedName;
    }

    /**
     * Check if gate name is valid (can be mapped)
     * @param {string} gateName - Gate name to check
     * @returns {boolean} True if gate is recognized
     */
    static isValidGateName(gateName) {
        try {
            this.normalizeGateName(gateName);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get display name for internal gate name
     * @param {string} internalName - Internal canonical gate name
     * @returns {string} Display name for UI
     */
    static getDisplayName(internalName) {
        const displayMap = {
            'id': 'I',
            'x': 'X',
            'y': 'Y',
            'z': 'Z',
            'h': 'H',
            's': 'S',
            't': 'T',
            'sdg': 'S†',
            'tdg': 'T†',
            'sx': '√X',
            'p': 'P',
            'rx': 'RX',
            'ry': 'RY',
            'rz': 'RZ',
            'u1': 'U1',
            'u2': 'U2',
            'u3': 'U3',
            'cx': 'CNOT',
            'cy': 'CY',
            'cz': 'CZ',
            'ch': 'CH',
            'cp': 'CP',
            'swap': 'SWAP',
            'iswap': 'iSWAP',
            'crx': 'CRX',
            'cry': 'CRY',
            'crz': 'CRZ',
            'cu': 'CU',
            'ccx': 'Toffoli',
            'cswap': 'Fredkin',
            'measure': 'Measure'
        };

        return displayMap[internalName] || internalName.toUpperCase();
    }

    /**
     * Get gate arity (number of qubits affected)
     * @param {string} gateName - Gate name (any format)
     * @returns {number} Number of qubits this gate operates on
     */
    static getGateArity(gateName) {
        const normalizedName = this.normalizeGateName(gateName);

        const arityMap = {
            // Single-qubit gates
            'id': 1, 'x': 1, 'y': 1, 'z': 1, 'h': 1,
            's': 1, 't': 1, 'sdg': 1, 'tdg': 1, 'sx': 1,
            'p': 1, 'rx': 1, 'ry': 1, 'rz': 1,
            'u1': 1, 'u2': 1, 'u3': 1,

            // Two-qubit gates
            'cx': 2, 'cy': 2, 'cz': 2, 'ch': 2, 'cp': 2,
            'swap': 2, 'iswap': 2,
            'crx': 2, 'cry': 2, 'crz': 2, 'cu': 2,

            // Three-qubit gates
            'ccx': 3, 'cswap': 3,

            // Measurement
            'measure': 1
        };

        return arityMap[normalizedName] || 1;
    }

    /**
     * Get gate parameter requirements
     * @param {string} gateName - Gate name (any format)
     * @returns {Array<string>} Array of parameter names required by this gate
     */
    static getGateParameters(gateName) {
        const normalizedName = this.normalizeGateName(gateName);

        const paramMap = {
            'rx': ['theta'],
            'ry': ['theta'],
            'rz': ['theta'],
            'p': ['lambda'],
            'u1': ['lambda'],
            'u2': ['phi', 'lambda'],
            'u3': ['theta', 'phi', 'lambda'],
            'cp': ['lambda'],
            'crx': ['theta'],
            'cry': ['theta'],
            'crz': ['theta'],
            'cu': ['theta', 'phi', 'lambda', 'gamma']
        };

        return paramMap[normalizedName] || [];
    }

    /**
     * Create a gate object with normalized name and metadata
     * @param {string} gateName - Original gate name from UI
     * @param {Array} qubits - Qubit indices
     * @param {Object} params - Gate parameters
     * @returns {Object} Normalized gate object
     */
    static createNormalizedGate(gateName, qubits, params = {}) {
        const normalizedName = this.normalizeGateName(gateName);
        const expectedArity = this.getGateArity(gateName);
        const expectedParams = this.getGateParameters(gateName);

        // Validate qubit count
        if (qubits.length !== expectedArity) {
            throw new Error(`Gate ${gateName} requires ${expectedArity} qubits, got ${qubits.length}`);
        }

        // Validate parameters
        for (const param of expectedParams) {
            if (!(param in params)) {
                throw new Error(`Gate ${gateName} requires parameter: ${param}`);
            }
        }

        return {
            name: normalizedName,
            displayName: this.getDisplayName(normalizedName),
            qubits: qubits,
            params: params,
            arity: expectedArity,
            originalName: gateName,
            timestamp: Date.now()
        };
    }

    /**
     * Batch normalize multiple gate names
     * @param {Array<string>} gateNames - Array of gate names to normalize
     * @returns {Array<string>} Array of normalized gate names
     */
    static normalizeGateNames(gateNames) {
        return gateNames.map(name => this.normalizeGateName(name));
    }
}