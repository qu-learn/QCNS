/**
 * CircuitSerializer - Handles serialization and deserialization of quantum circuits
 * Supports JSON and QASM formats
 */

import { QasmTranspiler } from '../transpiler/QasmTranspiler.js';
import { QuantumCircuit } from '../quantum/QuantumCircuit.js';

export class CircuitSerializer {
    constructor() {
        this.qasmTranspiler = new QasmTranspiler();
    }

    /**
     * Convert circuit to JSON format
     * @param {QuantumCircuit} circuit - The circuit to serialize
     * @param {Object} metadata - Additional metadata to include
     * @returns {Object} JSON representation of the circuit
     */
    toJSON(circuit, metadata = {}) {
        const circuitData = circuit.toJSON();
        return {
            version: '1.0',
            type: 'quantum-circuit',
            timestamp: new Date().toISOString(),
            ...metadata,
            circuit: circuitData
        };
    }

    /**
     * Reconstruct circuit from JSON
     * @param {Object} jsonData - JSON representation of the circuit
     * @returns {QuantumCircuit} Reconstructed circuit
     */
    fromJSON(jsonData) {
        const circuitData = jsonData.circuit || jsonData;
        const circuit = new QuantumCircuit();

        // Use the circuit's fromJSON method if available
        if (typeof circuit.fromJSON === 'function') {
            circuit.fromJSON(circuitData);
        } else {
            // Manual reconstruction
            circuit.numQubits = circuitData.numQubits || 0;
            circuit.numClassicalBits = circuitData.numClassicalBits || 0;
            circuit.gates = circuitData.gates || [];
        }

        return circuit;
    }

    /**
     * Convert circuit to QASM string
     * @param {QuantumCircuit} circuit - The circuit to convert
     * @returns {string} QASM representation
     */
    toQASM(circuit) {
        return this.qasmTranspiler.transpile(circuit);
    }

    /**
     * Parse QASM string into a circuit
     * @param {string} qasmCode - QASM code to parse
     * @returns {QuantumCircuit} Parsed circuit
     */
    fromQASM(qasmCode) {
        return this.qasmTranspiler.parse(qasmCode);
    }

    /**
     * Convert gate grid to JSON format
     * @param {Array} gateGrid - 2D array of gates
     * @param {number} numQubits - Number of qubits
     * @param {number} numDepth - Circuit depth
     * @returns {Object} JSON representation of the gate grid
     */
    gateGridToJSON(gateGrid, numQubits, numDepth) {
        return {
            version: '1.0',
            type: 'gate-grid',
            timestamp: new Date().toISOString(),
            numQubits,
            numDepth,
            gates: gateGrid
        };
    }

    /**
     * Convert JSON back to gate grid
     * @param {Object} jsonData - JSON data containing gate grid
     * @returns {Object} Object with gateGrid, numQubits, and numDepth
     */
    jsonToGateGrid(jsonData) {
        return {
            gateGrid: jsonData.gates || [],
            numQubits: jsonData.numQubits || 0,
            numDepth: jsonData.numDepth || 0
        };
    }
}
