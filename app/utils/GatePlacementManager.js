/**
 * GatePlacementManager - Handles gate placement logic and validation
 * Extracts complex gate placement logic from UI components
 */

export class GatePlacementManager {
    constructor() {
        // Gate metadata - describes requirements for each gate type
        this.gateMetadata = {
            // Single-qubit gates
            'H': { numQubits: 1, hasParameter: false },
            'X': { numQubits: 1, hasParameter: false },
            'Y': { numQubits: 1, hasParameter: false },
            'Z': { numQubits: 1, hasParameter: false },
            'S': { numQubits: 1, hasParameter: false },
            'T': { numQubits: 1, hasParameter: false },
            'Sdg': { numQubits: 1, hasParameter: false },
            'Tdg': { numQubits: 1, hasParameter: false },
            'RX': { numQubits: 1, hasParameter: true },
            'RY': { numQubits: 1, hasParameter: true },
            'RZ': { numQubits: 1, hasParameter: true },
            'I': { numQubits: 1, hasParameter: false },
            'M': { numQubits: 1, hasParameter: false },

            // Two-qubit gates
            'CNOT': { numQubits: 2, hasParameter: false },
            'CX': { numQubits: 2, hasParameter: false },
            'CY': { numQubits: 2, hasParameter: false },
            'CZ': { numQubits: 2, hasParameter: false },
            'SWAP': { numQubits: 2, hasParameter: false },

            // Three-qubit gates
            'CCX': { numQubits: 3, hasParameter: false },
            'CCNOT': { numQubits: 3, hasParameter: false },
            'Toffoli': { numQubits: 3, hasParameter: false },

            // Special gates
            'Barrier': { numQubits: -1, hasParameter: false }
        };
    }

    /**
     * Get metadata for a gate
     * @param {string} gateName - Name of the gate
     * @returns {Object} Gate metadata
     */
    getGateInfo(gateName) {
        return this.gateMetadata[gateName] || { numQubits: 1, hasParameter: false };
    }

    /**
     * Parse angle parameter (supports π notation)
     * @param {string} angleStr - Angle string (e.g., "π/2", "3.14", "pi/4")
     * @returns {number} Parsed angle in radians
     */
    parseAngle(angleStr) {
        if (!angleStr || angleStr.trim() === '') return 0;

        // Replace π and pi with Math.PI, remove whitespace
        let processed = angleStr.trim()
            .replace(/π/g, 'Math.PI')
            .replace(/\bpi\b/gi, 'Math.PI')
            .replace(/\s+/g, ''); // Remove all whitespace

        try {
            // Use Function constructor for safer evaluation with Math context
            const evalFunc = new Function('Math', `'use strict'; return (${processed})`);
            const result = evalFunc(Math);

            // Validate result is a valid number
            if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
                return result;
            }
        } catch (error) {
            console.warn('Failed to parse angle expression:', angleStr, error.message);
        }

        // Fallback: try to parse as float
        const numericValue = parseFloat(processed);
        if (!isNaN(numericValue) && isFinite(numericValue)) {
            return numericValue;
        }

        console.error('Could not parse angle:', angleStr, '- defaulting to 0');
        return 0;
    }

    /**
     * Validate qubit index
     * @param {number} qubit - Qubit index
     * @param {number} totalQubits - Total number of qubits
     * @returns {boolean} Whether qubit is valid
     */
    isValidQubit(qubit, totalQubits) {
        return qubit >= 0 && qubit < totalQubits;
    }

    /**
     * Validate multi-qubit gate configuration
     * @param {Array<number>} qubits - Array of qubit indices
     * @param {number} totalQubits - Total number of qubits
     * @returns {Object} {valid: boolean, error: string}
     */
    validateMultiQubitGate(qubits, totalQubits) {
        // Check all qubits are valid
        for (const qubit of qubits) {
            if (!this.isValidQubit(qubit, totalQubits)) {
                return { valid: false, error: `Invalid qubit index: ${qubit}` };
            }
        }

        // Check all qubits are unique
        const uniqueQubits = new Set(qubits);
        if (uniqueQubits.size !== qubits.length) {
            return { valid: false, error: 'Duplicate qubit indices' };
        }

        return { valid: true };
    }

    /**
     * Create gate placement data for single-qubit gates
     * @param {string} gateName - Gate name
     * @param {number} qubit - Target qubit
     * @param {Object} options - Additional options (e.g., param for rotation gates)
     * @returns {Object} Gate placement data
     */
    createSingleQubitGate(gateName, qubit, options = {}) {
        const gateData = { name: gateName };

        // Add parameter if specified
        if (options.param !== undefined) {
            gateData.param = options.param;
        }

        return {
            placements: [{ qubit, data: gateData }],
            connections: []
        };
    }

    /**
     * Create gate placement data for two-qubit gates
     * @param {string} gateName - Gate name
     * @param {number} controlQubit - Control qubit
     * @param {number} targetQubit - Target qubit
     * @returns {Object} Gate placement data
     */
    createTwoQubitGate(gateName, controlQubit, targetQubit) {
        return {
            placements: [
                {
                    qubit: controlQubit,
                    data: { name: gateName, control: true, target: targetQubit }
                },
                {
                    qubit: targetQubit,
                    data: { name: gateName, control: false, source: controlQubit }
                }
            ],
            connections: [{ from: controlQubit, to: targetQubit }]
        };
    }

    /**
     * Create gate placement data for three-qubit gates (Toffoli)
     * @param {string} gateName - Gate name
     * @param {number} control1 - First control qubit
     * @param {number} control2 - Second control qubit
     * @param {number} target - Target qubit
     * @returns {Object} Gate placement data
     */
    createThreeQubitGate(gateName, control1, control2, target) {
        return {
            placements: [
                {
                    qubit: control1,
                    data: { name: gateName, control: true, control2, target }
                },
                {
                    qubit: control2,
                    data: { name: gateName, control: true, source: control1, target }
                },
                {
                    qubit: target,
                    data: { name: gateName, control: false, sources: [control1, control2] }
                }
            ],
            connections: [
                { from: Math.min(control1, control2, target), to: Math.max(control1, control2, target) }
            ]
        };
    }

    /**
     * Create barrier placement data (spans all qubits)
     * @param {number} totalQubits - Total number of qubits
     * @returns {Object} Barrier placement data
     */
    createBarrier(totalQubits) {
        const placements = [];
        for (let q = 0; q < totalQubits; q++) {
            placements.push({
                qubit: q,
                data: { name: 'Barrier', isBarrier: true }
            });
        }

        return {
            placements,
            connections: totalQubits > 1 ? [{ from: 0, to: totalQubits - 1 }] : []
        };
    }

    /**
     * Determine gate placement based on gate type and configuration
     * @param {string} gateName - Gate name
     * @param {number} primaryQubit - Primary qubit (first selected)
     * @param {number} totalQubits - Total number of qubits
     * @param {Object} config - Additional configuration
     * @returns {Object|null} Gate placement data or null if cancelled
     */
    determinePlacement(gateName, primaryQubit, totalQubits, config = {}) {
        const gateInfo = this.getGateInfo(gateName);

        // Barrier - spans all qubits
        if (gateInfo.numQubits === -1) {
            return this.createBarrier(totalQubits);
        }

        // Single-qubit gates
        if (gateInfo.numQubits === 1) {
            let param = config.param;

            // For rotation gates, get parameter if not provided
            if (gateInfo.hasParameter && param === undefined) {
                const angleStr = config.promptFunction
                    ? config.promptFunction(`Enter rotation angle for ${gateName} (in radians, or use PI):`, 'PI/2')
                    : null;

                if (angleStr === null) return null;
                param = this.parseAngle(angleStr);
            }

            return this.createSingleQubitGate(gateName, primaryQubit, { param });
        }

        // Two-qubit gates
        if (gateInfo.numQubits === 2) {
            let targetQubit = config.targetQubit;

            // Prompt for target if not provided
            if (targetQubit === undefined && config.promptFunction) {
                const suggestedTarget = primaryQubit < totalQubits - 1 ? primaryQubit + 1 : primaryQubit - 1;
                const targetStr = config.promptFunction(
                    `Gate ${gateName} requires 2 qubits. Current qubit: ${primaryQubit}. Enter target qubit (0-${totalQubits - 1}):`,
                    suggestedTarget
                );

                if (targetStr === null) return null;
                targetQubit = parseInt(targetStr);
            }

            // Validate target
            const validation = this.validateMultiQubitGate([primaryQubit, targetQubit], totalQubits);
            if (!validation.valid) {
                if (config.errorCallback) config.errorCallback(validation.error);
                return null;
            }

            return this.createTwoQubitGate(gateName, primaryQubit, targetQubit);
        }

        // Three-qubit gates (Toffoli)
        if (gateInfo.numQubits === 3) {
            let control2 = config.control2;
            let target = config.target;

            // Prompt for additional qubits if not provided
            if ((control2 === undefined || target === undefined) && config.promptFunction) {
                const suggestedConfig = `${primaryQubit + 1},${primaryQubit + 2}`;
                const configStr = config.promptFunction(
                    `Gate ${gateName} requires 3 qubits. Current (first control): ${primaryQubit}. Enter second control and target (e.g., "1,2"):`,
                    suggestedConfig
                );

                if (configStr === null) return null;

                const parts = configStr.split(',').map(s => parseInt(s.trim()));
                control2 = parts[0];
                target = parts[1];
            }

            // Validate configuration
            const validation = this.validateMultiQubitGate([primaryQubit, control2, target], totalQubits);
            if (!validation.valid) {
                if (config.errorCallback) config.errorCallback(validation.error);
                return null;
            }

            return this.createThreeQubitGate(gateName, primaryQubit, control2, target);
        }

        return null;
    }
}
