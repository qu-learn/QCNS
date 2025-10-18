/**
 * CircuitMetrics - Analyzes and calculates metrics for quantum circuits
 * Provides depth, width, gate counts, and execution cost estimates
 */

export class CircuitMetrics {
    constructor() {
        // Gate complexity costs (execution cost estimates)
        this.gateCosts = {
            // Single-qubit gates (1 unit each)
            'h': 1, 'x': 1, 'y': 1, 'z': 1, 's': 1, 't': 1,
            'rx': 1, 'ry': 1, 'rz': 1,
            'sx': 1, 'sdg': 1, 'tdg': 1, 'p': 1, 'phase': 1,
            'i': 1, 'id': 1, 'identity': 1,

            // Two-qubit gates (10 units each)
            'cx': 10, 'cnot': 10, 'cy': 10, 'cz': 10,
            'ch': 10, 'cp': 10,
            'crx': 10, 'cry': 10, 'crz': 10,
            'cu': 10,

            // SWAP gate (30 units)
            'swap': 30,
            'cswap': 30, 'fredkin': 30,

            // Toffoli gate (50 units)
            'ccx': 50, 'toffoli': 50, 'ccnot': 50,

            // Measurement
            'measure': 1, 'm': 1,

            // Barrier (0 cost)
            'barrier': 0
        };
    }

    /**
     * Calculate all metrics for a circuit
     * @param {QuantumCircuit} circuit - Circuit to analyze
     * @returns {Object} Complete metrics object
     */
    calculateAll(circuit) {
        if (!circuit) {
            return {
                width: 0,
                depth: 0,
                gateCount: 0,
                gateCounts: {},
                executionCost: 0,
                stateSpaceDimension: 0
            };
        }

        const flatGates = this.flattenGates(circuit.gates);
        const gateCounts = this.countGatesByType(flatGates);

        return {
            width: this.calculateWidth(circuit),
            depth: this.calculateDepth(circuit.gates),
            gateCount: flatGates.length,
            gateCounts,
            executionCost: this.calculateExecutionCost(flatGates),
            stateSpaceDimension: this.calculateStateSpaceDimension(circuit)
        };
    }

    /**
     * Calculate circuit width (number of qubits)
     * @param {QuantumCircuit} circuit - Circuit to analyze
     * @returns {number} Number of qubits
     */
    calculateWidth(circuit) {
        return circuit.numQubits || 0;
    }

    /**
     * Calculate circuit depth (longest linear path on any qubit)
     * @param {Array<Array>} gates - 2D gate array [qubit][column]
     * @returns {number} Maximum depth across all qubits
     */
    calculateDepth(gates) {
        if (!gates || !Array.isArray(gates) || gates.length === 0) {
            return 0;
        }

        let maxDepth = 0;

        // For each qubit, count non-null gates
        gates.forEach(qubitRow => {
            if (!Array.isArray(qubitRow)) return;

            const qubitDepth = qubitRow.filter(gate => gate !== null && gate !== undefined).length;
            maxDepth = Math.max(maxDepth, qubitDepth);
        });

        return maxDepth;
    }

    /**
     * Flatten gates from 2D array structure to a unique list
     * Handles multi-qubit gates to avoid double counting
     * @param {Array<Array>} gates - 2D gate array [qubit][column]
     * @returns {Array} List of unique gates
     */
    flattenGates(gates) {
        if (!gates || !Array.isArray(gates)) {
            return [];
        }

        const uniqueGates = new Map();

        gates.forEach((qubitRow, qubitIndex) => {
            if (!Array.isArray(qubitRow)) return;

            qubitRow.forEach((gate, columnIndex) => {
                if (!gate) return;

                // Use gate ID if available, otherwise create unique key
                const gateId = gate.id || `${qubitIndex}-${columnIndex}-${gate.name || 'unknown'}`;

                // Only add if not already present (avoids multi-qubit gate duplication)
                if (!uniqueGates.has(gateId)) {
                    uniqueGates.set(gateId, gate);
                }
            });
        });

        return Array.from(uniqueGates.values());
    }

    /**
     * Count gates by type
     * @param {Array} gates - Flat list of gates
     * @returns {Object} Gate type counts
     */
    countGatesByType(gates) {
        const counts = {};

        gates.forEach(gate => {
            const type = (gate.name || gate.type || gate.gate || 'unknown').toLowerCase();
            counts[type] = (counts[type] || 0) + 1;
        });

        return counts;
    }

    /**
     * Calculate estimated execution cost based on gate complexity
     * @param {Array} gates - Flat list of gates
     * @returns {number} Total estimated execution cost
     */
    calculateExecutionCost(gates) {
        let totalCost = 0;

        gates.forEach(gate => {
            const type = (gate.name || gate.type || gate.gate || '').toLowerCase();
            const cost = this.gateCosts[type] !== undefined ? this.gateCosts[type] : 1;
            totalCost += cost;
        });

        return totalCost;
    }

    /**
     * Calculate state space dimension (2^n for n qubits)
     * @param {QuantumCircuit} circuit - Circuit to analyze
     * @returns {number} State space dimension
     */
    calculateStateSpaceDimension(circuit) {
        const numQubits = circuit.numQubits || 0;
        return Math.pow(2, numQubits);
    }

    /**
     * Format metrics for display
     * @param {Object} metrics - Raw metrics object
     * @returns {Object} Formatted metrics for display
     */
    formatForDisplay(metrics) {
        const formatted = {
            'Circuit Width': `${metrics.width} qubits`,
            'Circuit Depth': metrics.depth,
            'Total Gates': metrics.gateCount,
            'Est. Execution Cost': `${metrics.executionCost} units`,
            'State Space Dim': metrics.stateSpaceDimension
        };

        // Add gate type breakdown if available
        if (metrics.gateCounts && Object.keys(metrics.gateCounts).length > 0) {
            const breakdown = Object.entries(metrics.gateCounts)
                .map(([type, count]) => `${type.toUpperCase()}: ${count}`)
                .join(', ');
            formatted['Gate Types'] = breakdown;
        }

        return formatted;
    }

    /**
     * Calculate T-depth (number of T gates in the critical path)
     * Useful for fault-tolerant quantum computing
     * @param {Array<Array>} gates - 2D gate array
     * @returns {number} T-depth
     */
    calculateTDepth(gates) {
        if (!gates || !Array.isArray(gates) || gates.length === 0) {
            return 0;
        }

        let maxTDepth = 0;

        gates.forEach(qubitRow => {
            if (!Array.isArray(qubitRow)) return;

            const tGates = qubitRow.filter(gate =>
                gate && (gate.name === 't' || gate.name === 'T')
            );
            maxTDepth = Math.max(maxTDepth, tGates.length);
        });

        return maxTDepth;
    }

    /**
     * Calculate two-qubit gate depth
     * @param {Array<Array>} gates - 2D gate array
     * @returns {number} Two-qubit gate depth
     */
    calculateTwoQubitDepth(gates) {
        if (!gates || !Array.isArray(gates) || gates.length === 0) {
            return 0;
        }

        let maxTwoQubitDepth = 0;

        gates.forEach(qubitRow => {
            if (!Array.isArray(qubitRow)) return;

            const twoQubitGates = qubitRow.filter(gate =>
                gate && (gate.control !== undefined || this._isTwoQubitGate(gate))
            );
            maxTwoQubitDepth = Math.max(maxTwoQubitDepth, twoQubitGates.length);
        });

        return maxTwoQubitDepth;
    }

    /**
     * Check if a gate is a two-qubit gate
     * @private
     * @param {Object} gate - Gate object
     * @returns {boolean} True if two-qubit gate
     */
    _isTwoQubitGate(gate) {
        const twoQubitGates = ['cx', 'cnot', 'cy', 'cz', 'swap', 'ch', 'cp', 'crx', 'cry', 'crz'];
        const gateName = (gate.name || gate.type || '').toLowerCase();
        return twoQubitGates.includes(gateName);
    }

    /**
     * Get gate cost for a specific gate type
     * @param {string} gateName - Gate name
     * @returns {number} Gate cost
     */
    getGateCost(gateName) {
        const normalizedName = gateName.toLowerCase();
        return this.gateCosts[normalizedName] !== undefined ? this.gateCosts[normalizedName] : 1;
    }

    /**
     * Set custom gate cost
     * @param {string} gateName - Gate name
     * @param {number} cost - Cost value
     */
    setGateCost(gateName, cost) {
        this.gateCosts[gateName.toLowerCase()] = cost;
    }
}
