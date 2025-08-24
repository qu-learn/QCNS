/**
 * QCNS - Quantum Circuit and Network Simulator
 * QuantumNetwork class for quantum network simulation
 *
 * This class enables the definition and simulation of quantum networks
 * by managing nodes and entanglements, then converting to a single QuantumCircuit.
 */

import { QuantumCircuit } from './QuantumCircuit.js';
import { QuantumRegister } from './QuantumRegister.js';
import { ClassicalRegister } from './ClassicalRegister.js';

export class QuantumNetworkNode {
    /**
     * Create a quantum network node
     * @param {number} id - Unique node identifier
     * @param {string} name - Node name
     * @param {number} qubits - Number of qubits in this node
     */
    constructor(id, name, qubits = 2) {
        this.id = id;
        this.name = name;
        this.qubits = qubits;
        this.circuit = new QuantumCircuit(qubits);
        this.position = { x: 0, y: 0 }; // For UI positioning
    }

    /**
     * Getter for numQubits (alias for qubits)
     */
    get numQubits() {
        return this.qubits;
    }

    /**
     * Apply a gate to this node's circuit
     * @param {string} gateName - Name of the gate
     * @param {...any} args - Gate arguments (qubits, parameters)
     * @returns {QuantumNetworkNode} This node for method chaining
     */
    addGate(gateName, ...args) {
        if (typeof this.circuit[gateName] === 'function') {
            this.circuit[gateName](...args);
        } else {
            throw new Error(`Unknown gate: ${gateName}`);
        }
        return this;
    }

    /**
     * Get the circuit for this node
     * @returns {QuantumCircuit} The node's quantum circuit
     */
    getCircuit() {
        return this.circuit;
    }

    /**
     * Export node to JSON
     * @returns {Object} JSON representation
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            qubits: this.qubits,
            position: this.position,
            circuit: this.circuit.toJSON()
        };
    }

    /**
     * Create node from JSON
     * @param {Object} json - JSON representation
     * @returns {QuantumNetworkNode} New node instance
     */
    static fromJSON(json) {
        const node = new QuantumNetworkNode(json.id, json.name, json.qubits);
        node.position = json.position || { x: 0, y: 0 };
        if (json.circuit) {
            node.circuit = QuantumCircuit.fromJSON(json.circuit);
        }
        return node;
    }
}

export class QuantumEntanglement {
    /**
     * Create an entanglement between two nodes
     * @param {number} node1Id - First node ID
     * @param {number} qubit1 - Qubit index in first node
     * @param {number} node2Id - Second node ID
     * @param {number} qubit2 - Qubit index in second node
     * @param {string} type - Entanglement type ('EPR', 'custom')
     */
    constructor(node1Id, qubit1, node2Id, qubit2, type = 'EPR') {
        this.node1Id = node1Id;
        this.qubit1 = qubit1;
        this.node2Id = node2Id;
        this.qubit2 = qubit2;
        this.type = type;
        this.id = `${node1Id}-${qubit1}_${node2Id}-${qubit2}`;
    }

    /**
     * Export entanglement to JSON
     * @returns {Object} JSON representation
     */
    toJSON() {
        return {
            node1Id: this.node1Id,
            qubit1: this.qubit1,
            node2Id: this.node2Id,
            qubit2: this.qubit2,
            type: this.type,
            id: this.id
        };
    }

    /**
     * Create entanglement from JSON
     * @param {Object} json - JSON representation
     * @returns {QuantumEntanglement} New entanglement instance
     */
    static fromJSON(json) {
        return new QuantumEntanglement(
            json.node1Id, json.qubit1, json.node2Id, json.qubit2, json.type
        );
    }
}

export class QuantumNetwork {
    /**
     * Create a quantum network
     * @param {string} name - Network name
     */
    constructor(name = 'Quantum Network') {
        this.name = name;
        this.nodes = new Map(); // nodeId -> QuantumNetworkNode
        this.entanglements = new Map(); // entanglementId -> QuantumEntanglement
        this.nextNodeId = 0;
    }

    /**
     * Add a node to the network
     * @param {string} name - Node name
     * @param {number} qubits - Number of qubits
     * @param {Object} position - Position for UI {x, y}
     * @returns {QuantumNetworkNode} The created node
     */
    addNode(name, qubits = 2, position = { x: 0, y: 0 }) {
        const nodeId = this.nextNodeId++;
        const node = new QuantumNetworkNode(nodeId, name || `Node ${nodeId}`, qubits);
        node.position = position;
        this.nodes.set(nodeId, node);
        return node;
    }

    /**
     * Remove a node from the network
     * @param {number} nodeId - Node ID to remove
     */
    removeNode(nodeId) {
        if (!this.nodes.has(nodeId)) {
            throw new Error(`Node ${nodeId} not found`);
        }

        // Remove all entanglements involving this node
        const entanglementsToRemove = [];
        for (const [id, entanglement] of this.entanglements) {
            if (entanglement.node1Id === nodeId || entanglement.node2Id === nodeId) {
                entanglementsToRemove.push(id);
            }
        }

        entanglementsToRemove.forEach(id => this.entanglements.delete(id));
        this.nodes.delete(nodeId);
    }

    /**
     * Get a node by ID
     * @param {number} nodeId - Node ID
     * @returns {QuantumNetworkNode} The node
     */
    getNode(nodeId) {
        const node = this.nodes.get(nodeId);
        if (!node) {
            throw new Error(`Node ${nodeId} not found`);
        }
        return node;
    }

    /**
     * Get all nodes
     * @returns {Array} Array of nodes
     */
    getNodes() {
        return Array.from(this.nodes.values());
    }

    /**
     * Add an entanglement between two nodes
     * @param {number} node1Id - First node ID
     * @param {number} qubit1 - Qubit in first node
     * @param {number} node2Id - Second node ID
     * @param {number} qubit2 - Qubit in second node
     * @param {string} type - Entanglement type
     * @returns {QuantumEntanglement} The created entanglement
     */
    addEntanglement(node1Id, qubit1, node2Id, qubit2, type = 'EPR') {
        // Validate nodes exist
        if (!this.nodes.has(node1Id) || !this.nodes.has(node2Id)) {
            throw new Error('Both nodes must exist to create entanglement');
        }

        // Validate qubit indices
        const node1 = this.nodes.get(node1Id);
        const node2 = this.nodes.get(node2Id);

        if (qubit1 >= node1.qubits || qubit2 >= node2.qubits) {
            throw new Error('Qubit index out of range');
        }

        // Check if qubits are already entangled
        for (const entanglement of this.entanglements.values()) {
            if ((entanglement.node1Id === node1Id && entanglement.qubit1 === qubit1) ||
                (entanglement.node2Id === node1Id && entanglement.qubit2 === qubit1) ||
                (entanglement.node1Id === node2Id && entanglement.qubit1 === qubit2) ||
                (entanglement.node2Id === node2Id && entanglement.qubit2 === qubit2)) {
                throw new Error('One or both qubits are already entangled');
            }
        }

        const entanglement = new QuantumEntanglement(node1Id, qubit1, node2Id, qubit2, type);
        this.entanglements.set(entanglement.id, entanglement);
        return entanglement;
    }

    /**
     * Remove an entanglement
     * @param {string} entanglementId - Entanglement ID
     */
    removeEntanglement(entanglementId) {
        if (!this.entanglements.has(entanglementId)) {
            throw new Error(`Entanglement ${entanglementId} not found`);
        }
        this.entanglements.delete(entanglementId);
    }

    /**
     * Get all entanglements
     * @returns {Array} Array of entanglements
     */
    getEntanglements() {
        return Array.from(this.entanglements.values());
    }

    /**
     * Convert the network to a single quantum circuit
     * This implements the core network-to-circuit conversion logic
     * @returns {QuantumCircuit} Combined circuit representing the network
     */
    toCircuit() {
        if (this.nodes.size === 0) {
            throw new Error('Network must have at least one node');
        }

        // Calculate total qubits and create global circuit
        let totalQubits = 0;
        const nodeOffsets = new Map(); // nodeId -> global qubit offset

        // Assign global qubit indices to each node
        for (const node of this.nodes.values()) {
            nodeOffsets.set(node.id, totalQubits);
            totalQubits += node.qubits;
        }

        // Determine maximum circuit depth
        let maxSteps = 0;
        for (const node of this.nodes.values()) {
            const steps = node.circuit.numCols();
            maxSteps = Math.max(maxSteps, steps);
        }

        // Add extra steps for entanglement setup and potential measurements
        const networkSteps = maxSteps + 4;

        // Create the global circuit
        const globalCircuit = new QuantumCircuit(totalQubits, totalQubits);

        // Step 1: Create entangled pairs (Bell states)
        for (const entanglement of this.entanglements.values()) {
            const offset1 = nodeOffsets.get(entanglement.node1Id);
            const offset2 = nodeOffsets.get(entanglement.node2Id);
            const globalQubit1 = offset1 + entanglement.qubit1;
            const globalQubit2 = offset2 + entanglement.qubit2;

            // Create EPR pair: H|0⟩ → CNOT → |Φ+⟩ = (|00⟩ + |11⟩)/√2
            globalCircuit.h(globalQubit1);
            globalCircuit.cx(globalQubit1, globalQubit2);
        }

        // Step 2: Apply individual node circuits
        // Offset all gates by 2 steps to allow for entanglement setup
        for (const node of this.nodes.values()) {
            const offset = nodeOffsets.get(node.id);

            // Get the node's circuit gates and translate them to global indices
            this.translateNodeCircuitToGlobal(node.circuit, globalCircuit, offset, 2);
        }

        // Step 3: Optional final measurements could be added here
        // For now, we'll leave the circuit in superposition

        return globalCircuit;
    }

    /**
     * Translate a node's circuit to global qubit indices
     * @param {QuantumCircuit} nodeCircuit - Node's local circuit
     * @param {QuantumCircuit} globalCircuit - Global circuit to modify
     * @param {number} offset - Global qubit offset for this node
     * @param {number} stepOffset - Step offset in global circuit
     */
    translateNodeCircuitToGlobal(nodeCircuit, globalCircuit, offset, stepOffset) {
        const numCols = nodeCircuit.numCols();

        for (let col = 0; col < numCols; col++) {
            for (let wire = 0; wire < nodeCircuit.numQubits; wire++) {
                const gate = nodeCircuit.gates[wire][col];

                if (gate) {
                    // Find all wires this gate operates on
                    const gateWires = this.findGateWires(nodeCircuit, gate);
                    const globalWires = gateWires.map(w => w + offset);

                    // Translate gate to global circuit
                    this.addGateToGlobalCircuit(
                        globalCircuit, gate.name, globalWires,
                        col + stepOffset, gate.options
                    );
                }
            }
        }
    }

    /**
     * Find which wires a gate operates on (helper method)
     * @param {QuantumCircuit} circuit - The circuit
     * @param {Object} gate - The gate object
     * @returns {Array} Array of wire indices
     */
    findGateWires(circuit, gate) {
        const wires = [];
        const numCols = circuit.numCols();

        for (let wire = 0; wire < circuit.numQubits; wire++) {
            for (let col = 0; col < numCols; col++) {
                if (circuit.gates[wire][col] === gate) {
                    wires.push(wire);
                    break;
                }
            }
        }

        return wires.sort((a, b) => a - b);
    }

    /**
     * Add a gate to the global circuit
     * @param {QuantumCircuit} globalCircuit - Target circuit
     * @param {string} gateName - Gate name
     * @param {Array} globalWires - Global wire indices
     * @param {number} column - Column position
     * @param {Object} options - Gate options
     */
    addGateToGlobalCircuit(globalCircuit, gateName, globalWires, column, options = {}) {
        // Map gate names and apply to global circuit
        switch (gateName) {
            case 'h':
                globalCircuit.h(globalWires[0]);
                break;
            case 'x':
                globalCircuit.x(globalWires[0]);
                break;
            case 'y':
                globalCircuit.y(globalWires[0]);
                break;
            case 'z':
                globalCircuit.z(globalWires[0]);
                break;
            case 's':
                globalCircuit.s(globalWires[0]);
                break;
            case 't':
                globalCircuit.t(globalWires[0]);
                break;
            case 'cx':
                globalCircuit.cx(globalWires[0], globalWires[1]);
                break;
            case 'cz':
                globalCircuit.cz(globalWires[0], globalWires[1]);
                break;
            case 'swap':
                globalCircuit.swap(globalWires[0], globalWires[1]);
                break;
            case 'ccx':
                globalCircuit.ccx(globalWires[0], globalWires[1], globalWires[2]);
                break;
            case 'rx':
                globalCircuit.rx(options.params?.theta || 0, globalWires[0]);
                break;
            case 'ry':
                globalCircuit.ry(options.params?.theta || 0, globalWires[0]);
                break;
            case 'rz':
                globalCircuit.rz(options.params?.theta || 0, globalWires[0]);
                break;
            case 'measure':
                if (options.creg) {
                    globalCircuit.measure(globalWires[0], options.creg.bit);
                }
                break;
            default:
                console.warn(`Unknown gate type in network conversion: ${gateName}`);
        }
    }

    /**
     * Get network statistics
     * @returns {Object} Network statistics
     */
    getNetworkStats() {
        let totalQubits = 0;
        let totalGates = 0;

        for (const node of this.nodes.values()) {
            totalQubits += node.qubits;
            totalGates += node.circuit.numCols() * node.qubits; // Approximate
        }

        return {
            nodes: this.nodes.size,
            entanglements: this.entanglements.size,
            totalQubits,
            totalGates,
            name: this.name
        };
    }

    /**
     * Export network to JSON
     * @returns {Object} JSON representation
     */
    toJSON() {
        const nodesArray = Array.from(this.nodes.values()).map(node => node.toJSON());
        const entanglementsArray = Array.from(this.entanglements.values()).map(ent => ent.toJSON());

        return {
            name: this.name,
            nodes: nodesArray,
            entanglements: entanglementsArray,
            nextNodeId: this.nextNodeId,
            metadata: {
                created: new Date().toISOString(),
                version: '1.0',
                ...this.getNetworkStats()
            }
        };
    }

    /**
     * Create network from JSON
     * @param {Object} json - JSON representation
     * @returns {QuantumNetwork} New network instance
     */
    static fromJSON(json) {
        const network = new QuantumNetwork(json.name);
        network.nextNodeId = json.nextNodeId || 0;

        // Import nodes
        for (const nodeData of json.nodes || []) {
            const node = QuantumNetworkNode.fromJSON(nodeData);
            network.nodes.set(node.id, node);
        }

        // Import entanglements
        for (const entData of json.entanglements || []) {
            const entanglement = QuantumEntanglement.fromJSON(entData);
            network.entanglements.set(entanglement.id, entanglement);
        }

        return network;
    }

    /**
     * Clear the entire network
     */
    clear() {
        this.nodes.clear();
        this.entanglements.clear();
        this.nextNodeId = 0;
    }
}