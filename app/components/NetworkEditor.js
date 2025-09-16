/**
 * Network Simulator - Quantum Network Management with Instance-Based Node Editing
 *
 * KEY FEATURE: Each network node gets its own CircuitComponent instance for editing
 */

import { CircuitSerializer } from '../../lib/utils/CircuitSerializer.js';
import { FileExporter } from '../utils/FileExporter.js';
import { FileImporter } from '../utils/FileImporter.js';

class NetworkSimulator {
    constructor() {
        this.network = new QuantumNetwork('QCNS Network');
        this.nodes = []; // Array of {id, name, qubits, circuit, position, component}
        this.entanglements = [];
        this.canvas = document.getElementById('network-canvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.selectedNodeId = null;
        this.nodeEditorComponents = {}; // Map of nodeId -> CircuitComponent

        // Initialize utility modules
        this.circuitSerializer = new CircuitSerializer();
        this.fileExporter = new FileExporter();
        this.fileImporter = new FileImporter();

        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.redrawCanvas();
        this.updateNodeList();
        this.updateEntanglementSelects();
        this.updateEntanglementList();

        // Initialize quantum visualizer AFTER DOM is ready
        setTimeout(() => {
            this.visualizer = new QuantumVisualizer('network-visualizer', {
                chartColor: 'rgba(16, 185, 129, 0.6)',
                chartBorderColor: 'rgba(16, 185, 129, 1)',
                showToggle: true
            });
        }, 100);
    }

    setupEventListeners() {
        // Canvas events
        if (this.canvas) {
            this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
            this.canvas.addEventListener('dblclick', (e) => this.handleCanvasDblClick(e));
        }

        // Button event listeners
        const addNodeBtn = document.getElementById('add-node-btn');
        if (addNodeBtn) addNodeBtn.addEventListener('click', () => this.addNode());

        const runNetworkBtn = document.getElementById('run-network-btn');
        if (runNetworkBtn) runNetworkBtn.addEventListener('click', () => this.runSimulation());

        const clearNetworkBtn = document.getElementById('clear-network-btn');
        if (clearNetworkBtn) clearNetworkBtn.addEventListener('click', () => this.clearNetwork());

        const exportNetworkQasmBtn = document.getElementById('export-network-qasm-btn');
        if (exportNetworkQasmBtn) exportNetworkQasmBtn.addEventListener('click', () => this.exportQASM());

        const exportNetworkJsonBtn = document.getElementById('export-network-json-btn');
        if (exportNetworkJsonBtn) exportNetworkJsonBtn.addEventListener('click', () => this.exportNetworkJSON());

        const importNetworkJsonBtn = document.getElementById('import-network-json-btn');
        if (importNetworkJsonBtn) importNetworkJsonBtn.addEventListener('click', () => this.importNetworkJSON());

        const addEntanglementBtn = document.getElementById('add-entanglement-btn');
        if (addEntanglementBtn) addEntanglementBtn.addEventListener('click', () => this.addEntanglement());

        const closeNodeEditorBtn = document.getElementById('close-node-editor-btn');
        if (closeNodeEditorBtn) closeNodeEditorBtn.addEventListener('click', () => this.closeNodeEditor());

        // Event delegation for node list (since it's dynamically generated)
        const nodeList = document.getElementById('node-list');
        if (nodeList) {
            nodeList.addEventListener('click', (e) => {
                const nodeItem = e.target.closest('.node-item');
                if (nodeItem) {
                    const nodeId = nodeItem.dataset.nodeId;
                    console.log('Node list clicked, nodeId:', nodeId);

                    // Check if clicked on edit button
                    if (e.target.closest('.btn-primary')) {
                        console.log('Edit button clicked for node:', nodeId);
                        this.editNodeCircuit(nodeId);
                    }
                    // Check if clicked on remove button
                    else if (e.target.closest('.btn-error')) {
                        console.log('Remove button clicked for node:', nodeId);
                        this.removeNode(nodeId);
                    }
                    // Otherwise select node
                    else {
                        console.log('Node item clicked (selection):', nodeId);
                        this.selectNode(nodeId);
                    }
                }
            });
        }

        // Event delegation for entanglement list
        const entanglementList = document.getElementById('entanglement-list');
        if (entanglementList) {
            entanglementList.addEventListener('click', (e) => {
                if (e.target.closest('.btn-error')) {
                    const button = e.target.closest('.btn-error');
                    const entId = button.dataset.entId;
                    if (entId) this.removeEntanglement(entId);
                }
            });
        }
    }

    closeNodeEditor() {
        const modal = document.getElementById('node-editor-modal');
        if (modal) modal.classList.remove('active');
    }

    addNode() {
        const nameInput = document.getElementById('node-name');
        const qubitsInput = document.getElementById('node-qubits');

        const name = nameInput.value.trim() || `Node${this.nodes.length}`;
        const qubits = parseInt(qubitsInput.value) || 2;

        if (qubits < 1 || qubits > 10) {
            this.showNotification('Number of qubits must be between 1 and 10', 'error');
            return;
        }

        // Create network node - returns the NODE OBJECT, not just ID
        const position = this.calculateNodePosition(this.nodes.length);
        const nodeObject = this.network.addNode(name, qubits, position);

        // IMPORTANT: Get the ID from the returned node object
        const nodeId = nodeObject.id;

        console.log('Created node with ID:', nodeId, 'type:', typeof nodeId);

        // Create circuit for this node (the network already created one, so use it)
        const circuit = nodeObject.circuit;

        // Store node data with numeric ID
        this.nodes.push({
            id: nodeId,  // This is now a number
            name: name,
            qubits: qubits,
            circuit: circuit,
            position: position,
            component: null // Will be created when editing
        });

        // Update UI
        this.updateNodeList();
        this.updateEntanglementSelects();
        this.redrawCanvas();

        // Clear inputs
        nameInput.value = '';
        qubitsInput.value = '2';

        this.showNotification(`Node "${name}" added with ${qubits} qubits`, 'success');
    }

    calculateNodePosition(index) {
        const canvasWidth = this.canvas ? this.canvas.width : 500;
        const canvasHeight = this.canvas ? this.canvas.height : 400;
        const radius = Math.min(canvasWidth, canvasHeight) * 0.3;
        const angle = (index * 2 * Math.PI) / Math.max(this.nodes.length + 1, 3);
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;

        return {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        };
    }

    updateNodeList() {
        const nodeList = document.getElementById('node-list');
        if (!nodeList) return;

        if (this.nodes.length === 0) {
            nodeList.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-secondary);">No nodes added yet</div>';
            return;
        }

        nodeList.innerHTML = this.nodes.map(node => `
            <div class="node-item ${String(node.id) === String(this.selectedNodeId) ? 'active' : ''}"
                 data-node-id="${node.id}">
                <div>
                    <strong>${node.name}</strong>
                    <div style="font-size: 0.85rem; color: var(--text-secondary);">
                        ${node.qubits} qubit${node.qubits > 1 ? 's' : ''}
                    </div>
                </div>
                <div style="display: flex; gap: 5px;">
                    <button class="btn btn-primary btn-small">
                        Edit Circuit
                    </button>
                    <button class="btn btn-error btn-small">
                        Remove
                    </button>
                </div>
            </div>
        `).join('');
    }

    selectNode(nodeId) {
        console.log('selectNode called with:', nodeId);
        this.selectedNodeId = nodeId;
        this.updateNodeList();
        this.redrawCanvas();
    }

    /**
     * CRITICAL METHOD: Edit node circuit using a new CircuitComponent instance
     * This is the core feature for instance-based editing
     */
    editNodeCircuit(nodeId) {
        console.log('editNodeCircuit called with nodeId:', nodeId, 'type:', typeof nodeId);
        console.log('Available nodes:', this.nodes.map(n => ({ id: n.id, type: typeof n.id })));

        // Use string comparison for safety
        const node = this.nodes.find(n => String(n.id) === String(nodeId));
        if (!node) {
            console.error('Node not found for id:', nodeId);
            this.showNotification('Node not found', 'error');
            return;
        }

        // CRITICAL: Get the circuit from QuantumNetwork, not from local copy
        // The QuantumNetwork holds the authoritative version
        const numericNodeId = typeof nodeId === 'string' ? parseInt(nodeId) : nodeId;
        const networkNode = this.network.nodes.get(numericNodeId);
        if (!networkNode) {
            console.error('Network node not found:', numericNodeId);
            this.showNotification('Network node not found', 'error');
            return;
        }

        console.log('Found node:', node, 'Network node circuit:', networkNode.circuit);

        // Show modal
        const modal = document.getElementById('node-editor-modal');
        const title = document.getElementById('node-editor-title');
        const content = document.getElementById('node-editor-content');

        if (!modal || !title || !content) {
            this.showNotification('Editor modal not found', 'error');
            return;
        }

        title.textContent = `Edit Circuit for ${node.name} (${node.qubits} qubits)`;

        // Create unique container ID for this node's circuit editor
        const editorId = `node-circuit-editor-${nodeId}`;
        content.innerHTML = `<div id="${editorId}" style="min-width: 800px;"></div>`;

        // Show modal with active class
        modal.classList.add('active');

        // INSTANTIATE NEW CircuitComponent for this node
        // This is the key: each node gets its own isolated circuit editor instance
        setTimeout(() => {
            // Check if CircuitComponent is available
            if (typeof CircuitComponent === 'undefined') {
                console.error('CircuitComponent class not found!');
                this.showNotification('Circuit editor not loaded. Please refresh the page.', 'error');
                modal.classList.remove('active');
                return;
            }

            console.log('Creating CircuitComponent with editorId:', editorId);

            try {
                // CRITICAL FIX: Use QuantumNetwork's circuit as the authoritative source
                // This ensures changes persist when modal is reopened
                const componentInstance = new CircuitComponent(editorId, {
                    qubits: node.qubits,
                    depth: 8,
                    showControls: true,
                    showResults: true,
                    circuit: networkNode.circuit,  // Use QuantumNetwork's circuit, not local copy
                    onCircuitChange: (updatedCircuit) => {
                        // Update both local and network circuits to keep them in sync
                        node.circuit = updatedCircuit;
                        this.updateNetworkNodeCircuit(nodeId, updatedCircuit);
                    }
                });

                // Store reference to component for this node
                this.nodeEditorComponents[nodeId] = componentInstance;
                console.log('CircuitComponent created successfully');
            } catch (error) {
                console.error('Error creating CircuitComponent:', error);
                this.showNotification(`Editor error: ${error.message}`, 'error');
                modal.classList.remove('active');
            }
        }, 100);

        this.showNotification(`Editing circuit for ${node.name}`, 'info');
    }

    updateNetworkNodeCircuit(nodeId, circuit) {
        // Update the circuit in the QuantumNetwork instance
        // IMPORTANT: this.network.nodes is a MAP, not an array!
        // ALSO: nodeId might be a string from dataset, convert to number
        const numericNodeId = typeof nodeId === 'string' ? parseInt(nodeId) : nodeId;
        console.log('updateNetworkNodeCircuit - nodeId:', nodeId, 'numeric:', numericNodeId);

        const networkNode = this.network.nodes.get(numericNodeId);
        if (networkNode) {
            networkNode.circuit = circuit;
            console.log('Updated circuit for node:', numericNodeId);
        } else {
            console.error('Could not find network node:', numericNodeId, 'Available keys:', Array.from(this.network.nodes.keys()));
        }
    }

    removeNode(nodeId) {
        if (!confirm('Are you sure you want to remove this node?')) return;

        console.log('removeNode called with:', nodeId, 'type:', typeof nodeId);

        // Convert to number if string
        const numericNodeId = typeof nodeId === 'string' ? parseInt(nodeId) : nodeId;

        // Remove from network
        this.network.removeNode(numericNodeId);

        // Remove from local storage - use string comparison
        this.nodes = this.nodes.filter(n => String(n.id) !== String(nodeId));

        // Remove any entanglements involving this node - use string comparison
        this.entanglements = this.entanglements.filter(e =>
            String(e.node1Id) !== String(nodeId) && String(e.node2Id) !== String(nodeId)
        );

        // Clean up component if exists
        if (this.nodeEditorComponents[nodeId]) {
            delete this.nodeEditorComponents[nodeId];
        }

        // Update UI
        this.updateNodeList();
        this.updateEntanglementSelects();
        this.updateEntanglementList();
        this.redrawCanvas();

        this.showNotification('Node removed', 'success');
    }

    addEntanglement() {
        const node1Select = document.getElementById('entangle-node1');
        const qubit1Input = document.getElementById('entangle-qubit1');
        const node2Select = document.getElementById('entangle-node2');
        const qubit2Input = document.getElementById('entangle-qubit2');

        if (!node1Select || !node2Select) return;

        const node1Id = node1Select.value;
        const node2Id = node2Select.value;
        const qubit1 = parseInt(qubit1Input.value);
        const qubit2 = parseInt(qubit2Input.value);

        console.log('addEntanglement called:', { node1Id, node2Id, qubit1, qubit2 });

        if (!node1Id || !node2Id) {
            this.showNotification('Please select both nodes', 'error');
            return;
        }

        if (node1Id === node2Id) {
            console.log('Node IDs are equal:', node1Id, '===', node2Id);
            this.showNotification('Cannot entangle a node with itself', 'error');
            return;
        }

        // Find nodes - use loose equality in case of type mismatch
        const node1 = this.nodes.find(n => String(n.id) === String(node1Id));
        const node2 = this.nodes.find(n => String(n.id) === String(node2Id));

        console.log('Found nodes:', { node1, node2 });

        if (!node1 || !node2) {
            this.showNotification('One or both nodes not found', 'error');
            return;
        }

        if (qubit1 < 0 || qubit1 >= node1.qubits || qubit2 < 0 || qubit2 >= node2.qubits) {
            this.showNotification('Invalid qubit indices', 'error');
            return;
        }

        // Add to network - CONVERT STRING IDs TO NUMBERS
        const numericNode1Id = typeof node1Id === 'string' ? parseInt(node1Id) : node1Id;
        const numericNode2Id = typeof node2Id === 'string' ? parseInt(node2Id) : node2Id;

        console.log('Adding entanglement with numeric IDs:', numericNode1Id, numericNode2Id);

        const entanglement = this.network.addEntanglement(numericNode1Id, qubit1, numericNode2Id, qubit2, 'EPR');
        const entanglementId = entanglement.id;

        // Store locally - use numeric IDs for consistency
        this.entanglements.push({
            id: entanglementId,
            node1Id: numericNode1Id,
            qubit1,
            node2Id: numericNode2Id,
            qubit2,
            type: 'EPR'
        });

        this.updateEntanglementList();
        this.redrawCanvas();

        this.showNotification('Entanglement added', 'success');
    }

    updateEntanglementSelects() {
        const node1Select = document.getElementById('entangle-node1');
        const node2Select = document.getElementById('entangle-node2');

        if (!node1Select || !node2Select) return;

        const options = this.nodes.map(node =>
            `<option value="${node.id}">${node.name}</option>`
        ).join('');

        node1Select.innerHTML = '<option value="">Select node</option>' + options;
        node2Select.innerHTML = '<option value="">Select node</option>' + options;
    }

    updateEntanglementList() {
        const entanglementList = document.getElementById('entanglement-list');
        if (!entanglementList) return;

        if (this.entanglements.length === 0) {
            entanglementList.innerHTML = '<div style="padding: 10px; text-align: center; color: var(--text-secondary); font-size: 0.9rem;">No entanglements configured</div>';
            return;
        }

        entanglementList.innerHTML = this.entanglements.map(ent => {
            const node1 = this.nodes.find(n => n.id === ent.node1Id);
            const node2 = this.nodes.find(n => n.id === ent.node2Id);

            return `
                <div class="entanglement-pair">
                    <span style="flex: 1;">
                        <strong>${node1.name}</strong>[q${ent.qubit1}] ⟷ <strong>${node2.name}</strong>[q${ent.qubit2}]
                        <span style="color: var(--text-secondary); font-size: 0.85rem;">(${ent.type})</span>
                    </span>
                    <button class="btn btn-error btn-tiny" data-ent-id="${ent.id}">
                        Remove
                    </button>
                </div>
            `;
        }).join('');
    }

    removeEntanglement(entanglementId) {
        this.network.removeEntanglement(entanglementId);
        this.entanglements = this.entanglements.filter(e => e.id !== entanglementId);
        this.updateEntanglementList();
        this.redrawCanvas();
        this.showNotification('Entanglement removed', 'success');
    }

    redrawCanvas() {
        if (!this.ctx || !this.canvas) return;

        const width = this.canvas.width;
        const height = this.canvas.height;

        // Clear canvas
        this.ctx.clearRect(0, 0, width, height);

        // Draw entanglements first (behind nodes)
        this.entanglements.forEach(ent => {
            const node1 = this.nodes.find(n => n.id === ent.node1Id);
            const node2 = this.nodes.find(n => n.id === ent.node2Id);

            if (node1 && node2) {
                this.drawEntanglementLine(node1.position, node2.position);
            }
        });

        // Draw nodes
        this.nodes.forEach(node => {
            this.drawNode(node);
        });
    }

    drawNode(node) {
        const ctx = this.ctx;
        const pos = node.position;
        const radius = 30;
        const isSelected = String(node.id) === String(this.selectedNodeId);

        // Draw circle
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = isSelected ? '#2196F3' : '#4CAF50';
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#1976D2' : '#388E3C';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw node name
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.name, pos.x, pos.y - 5);

        // Draw qubit count
        ctx.font = '10px sans-serif';
        ctx.fillText(`${node.qubits}q`, pos.x, pos.y + 8);
    }

    drawEntanglementLine(pos1, pos2) {
        const ctx = this.ctx;

        ctx.beginPath();
        ctx.moveTo(pos1.x, pos1.y);
        ctx.lineTo(pos2.x, pos2.y);
        ctx.strokeStyle = '#FF9800';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw entanglement symbol in the middle
        const midX = (pos1.x + pos2.x) / 2;
        const midY = (pos1.y + pos2.y) / 2;

        ctx.fillStyle = '#FF9800';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⟷', midX, midY);
    }

    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if clicking on a node
        const clickedNode = this.nodes.find(node => {
            const dx = x - node.position.x;
            const dy = y - node.position.y;
            return Math.sqrt(dx * dx + dy * dy) <= 30;
        });

        if (clickedNode) {
            this.selectNode(clickedNode.id);
        }
    }

    handleCanvasDblClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if double-clicking on a node
        const clickedNode = this.nodes.find(node => {
            const dx = x - node.position.x;
            const dy = y - node.position.y;
            return Math.sqrt(dx * dx + dy * dy) <= 30;
        });

        if (clickedNode) {
            this.editNodeCircuit(clickedNode.id);
        }
    }

    runSimulation() {
        if (this.nodes.length === 0) {
            this.showNotification('Add at least one node to simulate', 'warning');
            return;
        }

        try {
            // Convert network to a single global circuit
            const globalCircuit = this.network.toCircuit();

            // Run simulation
            const results = globalCircuit.run();

            // Display results
            this.displayNetworkResults(results, globalCircuit);

            this.showNotification('Network simulation completed', 'success');
        } catch (error) {
            this.showNotification(`Simulation error: ${error.message}`, 'error');
            console.error(error);
        }
    }

    displayNetworkResults(results, circuit) {
        // Use the new quantum visualizer for all results display
        if (this.visualizer) {
            this.visualizer.displayResults(results, circuit);
        }
    }

    clearNetwork() {
        if (!confirm('Clear all nodes and entanglements?')) return;

        this.network = new QuantumNetwork('QCNS Network');
        this.nodes = [];
        this.entanglements = [];
        this.selectedNodeId = null;
        this.nodeEditorComponents = {};

        this.updateNodeList();
        this.updateEntanglementSelects();
        this.updateEntanglementList();
        this.redrawCanvas();

        // Hide visualizer
        if (this.visualizer) {
            this.visualizer.hide();
        }

        // Clear network state from localStorage to prevent persistence across reloads
        if (window.tabManager) {
            window.tabManager.tabStates['network-tab'] = null;
            window.tabManager.saveTabState();
        }

        this.showNotification('Network cleared', 'success');
    }

    exportQASM() {
        if (this.nodes.length === 0) {
            this.showNotification('No network to export', 'warning');
            return;
        }

        try {
            const globalCircuit = this.network.toCircuit();
            const qasm = this.circuitSerializer.toQASM(globalCircuit);
            this.fileExporter.downloadAsQASM(qasm, 'network.qasm');
            this.showNotification('Network QASM exported', 'success');
        } catch (error) {
            this.showNotification(`Export error: ${error.message}`, 'error');
        }
    }

    exportNetworkJSON() {
        if (this.nodes.length === 0) {
            this.showNotification('No network to export', 'warning');
            return;
        }

        try {
            // Serialize the network state including gate grids
            const networkData = {
                name: this.network.name,
                nodes: this.nodes.map(node => {
                    // Get the node editor component to access gate grid
                    const component = this.nodeEditorComponents[node.id];
                    return {
                        id: node.id,
                        name: node.name,
                        qubits: node.qubits,
                        position: node.position,
                        gateGrid: component ? component.gateGrid : null,
                        circuit: node.circuit.toJSON ? node.circuit.toJSON() : null
                    };
                }),
                entanglements: this.entanglements,
                selectedNodeId: this.selectedNodeId
            };

            this.fileExporter.downloadAsJSON(networkData, 'quantum-network.json');
            this.showNotification('Network exported as JSON', 'success');
        } catch (error) {
            this.showNotification(`Export error: ${error.message}`, 'error');
            console.error('Network export error:', error);
        }
    }

    async importNetworkJSON() {
        try {
            const result = await this.fileImporter.loadJSONFile('.json');
            const networkData = result.data;

                    // Clear existing network
                    this.network = new QuantumNetwork(networkData.name || 'Imported Network');
                    this.nodes = [];
                    this.entanglements = [];
                    this.selectedNodeId = null;
                    this.nodeEditorComponents = {};

                    // Restore nodes
                    if (networkData.nodes) {
                        networkData.nodes.forEach(nodeData => {
                            // Create circuit from JSON or create new one
                            const circuit = nodeData.circuit ?
                                QuantumCircuit.fromJSON(nodeData.circuit) :
                                new QuantumCircuit(nodeData.qubits, nodeData.qubits);

                            // Add node to network
                            const networkNode = this.network.addNode(nodeData.name, nodeData.qubits, nodeData.position);

                            // Update the network node's circuit
                            if (this.network.nodes.has(networkNode.id)) {
                                this.network.nodes.get(networkNode.id).circuit = circuit;
                            }

                            // Store node data locally
                            this.nodes.push({
                                id: networkNode.id,
                                name: nodeData.name,
                                qubits: nodeData.qubits,
                                circuit: circuit,
                                position: nodeData.position,
                                component: null,
                                gateGrid: nodeData.gateGrid || null // Store gate grid for later restoration
                            });
                        });
                    }

                    // Restore entanglements
                    if (networkData.entanglements) {
                        networkData.entanglements.forEach(ent => {
                            try {
                                const entanglement = this.network.addEntanglement(
                                    ent.node1Id,
                                    ent.qubit1,
                                    ent.node2Id,
                                    ent.qubit2,
                                    ent.type || 'EPR'
                                );
                                this.entanglements.push({
                                    id: entanglement.id,
                                    node1Id: ent.node1Id,
                                    qubit1: ent.qubit1,
                                    node2Id: ent.node2Id,
                                    qubit2: ent.qubit2,
                                    type: ent.type || 'EPR'
                                });
                            } catch (err) {
                                console.warn('Failed to restore entanglement:', err.message);
                            }
                        });
                    }

                    this.selectedNodeId = networkData.selectedNodeId;

            // Update UI
            this.updateNodeList();
            this.updateEntanglementSelects();
            this.updateEntanglementList();
            this.redrawCanvas();

            this.showNotification('Network imported successfully', 'success');
        } catch (error) {
            // User cancelled or error occurred
            if (error.message !== 'File selection cancelled') {
                this.showNotification(`Import error: ${error.message}`, 'error');
                console.error('Network import error:', error);
            }
        }
    }

    getState() {
        return {
            nodes: this.nodes.map(n => ({
                id: n.id,
                name: n.name,
                qubits: n.qubits,
                position: n.position,
                circuit: n.circuit.toJSON ? n.circuit.toJSON() : null
            })),
            entanglements: this.entanglements,
            selectedNodeId: this.selectedNodeId
        };
    }

    setState(state) {
        if (!state) return;

        this.clearNetwork();

        // Restore nodes
        if (state.nodes) {
            state.nodes.forEach(nodeData => {
                const circuit = nodeData.circuit ?
                    QuantumCircuit.fromJSON(nodeData.circuit) :
                    new QuantumCircuit(nodeData.qubits, nodeData.qubits);

                this.nodes.push({
                    id: nodeData.id,
                    name: nodeData.name,
                    qubits: nodeData.qubits,
                    circuit: circuit,
                    position: nodeData.position,
                    component: null
                });

                this.network.addNode(nodeData.name, nodeData.qubits, nodeData.position);
            });
        }

        // Restore entanglements
        if (state.entanglements) {
            state.entanglements.forEach(ent => {
                this.network.addEntanglement(ent.node1Id, ent.qubit1, ent.node2Id, ent.qubit2, ent.type);
                this.entanglements.push(ent);
            });
        }

        this.selectedNodeId = state.selectedNodeId;

        this.updateNodeList();
        this.updateEntanglementSelects();
        this.updateEntanglementList();
        this.redrawCanvas();
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }
}

// Initialize network simulator when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.networkSimulator = new NetworkSimulator();
    });
} else {
    // DOM already loaded
    window.networkSimulator = new NetworkSimulator();
}
