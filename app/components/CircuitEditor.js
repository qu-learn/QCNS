/**
 * Circuit Component - Reusable Quantum Circuit Editor
 * This component can be instantiated multiple times for different circuits
 */

import { GatePlacementManager } from '../utils/GatePlacementManager.js';
import { CircuitBuilder } from '../../lib/utils/CircuitBuilder.js';
import { CircuitSerializer } from '../../lib/utils/CircuitSerializer.js';
import { FileExporter } from '../utils/FileExporter.js';
import { FileImporter } from '../utils/FileImporter.js';

class CircuitComponent {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);

        // Options with defaults
        this.options = {
            qubits: options.qubits || 3,
            depth: options.depth || 8,
            showControls: options.showControls !== false,
            showResults: options.showResults !== false,
            circuit: options.circuit || null,
            onCircuitChange: options.onCircuitChange || null
        };

        // Circuit instance
        this.circuit = this.options.circuit || new QuantumCircuit(this.options.qubits, this.options.qubits);

        // State management
        this.gateGrid = []; // 2D array: gateGrid[qubit][column]
        this.selectedGate = null;

        // Initialize utility modules
        this.gatePlacementManager = new GatePlacementManager();
        this.circuitBuilder = new CircuitBuilder();
        this.circuitSerializer = new CircuitSerializer();
        this.fileExporter = new FileExporter();
        this.fileImporter = new FileImporter();

        // Initialize component
        this.initialize();
    }

    initialize() {
        this.render();
        this.attachEventListeners();

        // Initialize quantum visualizer AFTER render
        if (this.options.showResults) {
            this.visualizer = new QuantumVisualizer(`${this.containerId}-visualizer`, {
                chartColor: 'rgba(59, 130, 246, 0.6)',
                chartBorderColor: 'rgba(59, 130, 246, 1)',
                showToggle: true
            });
        }

        if (this.options.circuit) {
            this.loadCircuitFromInstance();
        }
    }

    render() {
        const html = `
            ${this.options.showControls ? this.renderControls() : ''}
            <div class="circuit-component">
                ${this.renderGatePalette()}
                ${this.renderCircuitCanvas()}
            </div>
            ${this.options.showResults ? '<div id="' + this.containerId + '-visualizer"></div>' : ''}
        `;
        this.container.innerHTML = html;
        this.initializeGrid();
    }

    renderControls() {
        return `
            <div class="circuit-controls">
                <div class="control-group">
                    <label>Qubits:</label>
                    <input type="number" class="qubit-count-input" value="${this.options.qubits}" min="1" max="10">
                </div>
                <div class="control-group">
                    <label>Depth:</label>
                    <input type="number" class="depth-input" value="${this.options.depth}" min="1" max="20">
                </div>
                <button class="btn btn-success run-btn">Run Simulation</button>
                <button class="btn btn-warning clear-btn">Clear</button>
                <button class="btn btn-secondary export-btn">Export QASM</button>
                <button class="btn btn-secondary export-json-btn">Export JSON</button>
                <button class="btn btn-primary import-btn">Import (QASM/JSON)</button>
            </div>
        `;
    }

    renderGatePalette() {
        const gates = {
            'Basic Gates': [
                { name: 'H', label: 'Hadamard', class: 'hadamard' },
                { name: 'X', label: 'Pauli-X', class: 'pauli' },
                { name: 'Y', label: 'Pauli-Y', class: 'pauli' },
                { name: 'Z', label: 'Pauli-Z', class: 'pauli' },
                { name: 'I', label: 'Identity', class: 'pauli' }
            ],
            'Phase Gates': [
                { name: 'S', label: 'S Gate', class: 'phase' },
                { name: 'Sdg', label: 'S†', class: 'phase' },
                { name: 'T', label: 'T Gate', class: 'phase' },
                { name: 'Tdg', label: 'T†', class: 'phase' },
                { name: 'SX', label: '√X', class: 'phase' }
            ],
            'Rotation Gates': [
                { name: 'RX', label: 'RX(θ)', class: 'rotation' },
                { name: 'RY', label: 'RY(θ)', class: 'rotation' },
                { name: 'RZ', label: 'RZ(θ)', class: 'rotation' }
            ],
            'Multi-Qubit Gates': [
                { name: 'CX', label: 'CNOT', class: 'control' },
                { name: 'CY', label: 'CY', class: 'control' },
                { name: 'CZ', label: 'CZ', class: 'control' },
                { name: 'SWAP', label: 'SWAP', class: 'control' },
                { name: 'CCX', label: 'Toffoli', class: 'control' }
            ],
            'Measurement': [
                { name: 'measure', label: 'Measure', class: 'pauli' }
            ],
            'Directives': [
                { name: 'barrier', label: 'Barrier', class: 'barrier' }
            ]
        };

        let paletteHtml = '<div class="gate-palette"><h3>Gate Palette</h3>';

        for (const [category, gateList] of Object.entries(gates)) {
            paletteHtml += `
                <div class="gate-category">
                    <h4>${category}</h4>
                    <div class="gate-grid">
            `;

            gateList.forEach(gate => {
                paletteHtml += `
                    <div class="gate-item">
                        <div class="gate-button ${gate.class}" draggable="true" data-gate="${gate.name}">
                            ${gate.name}
                        </div>
                        <div class="gate-label">${gate.label}</div>
                    </div>
                `;
            });

            paletteHtml += `
                    </div>
                </div>
            `;
        }

        paletteHtml += '</div>';
        return paletteHtml;
    }

    renderCircuitCanvas() {
        let canvasHtml = '<div class="circuit-area"><div class="circuit-canvas">';

        for (let q = 0; q < this.options.qubits; q++) {
            canvasHtml += `
                <div class="qubit-line" data-qubit="${q}">
                    <div class="qubit-label">q${q}</div>
                    <div class="qubit-wire" data-qubit="${q}">
            `;

            for (let col = 0; col < this.options.depth; col++) {
                canvasHtml += `
                    <div class="gate-slot" data-qubit="${q}" data-column="${col}"></div>
                `;
            }

            canvasHtml += `
                    </div>
                </div>
            `;
        }

        canvasHtml += '</div></div>';
        return canvasHtml;
    }


    initializeGrid() {
        this.gateGrid = Array(this.options.qubits).fill(null).map(() => Array(this.options.depth).fill(null));
    }

    attachEventListeners() {
        const container = this.container;

        // Gate palette drag events
        const gateButtons = container.querySelectorAll('.gate-button');
        gateButtons.forEach(btn => {
            btn.addEventListener('dragstart', (e) => this.handleGateDragStart(e));
            btn.addEventListener('click', (e) => this.handleGateClick(e));
        });

        // Gate slot events
        const gateSlots = container.querySelectorAll('.gate-slot');
        gateSlots.forEach(slot => {
            slot.addEventListener('dragover', (e) => this.handleDragOver(e));
            slot.addEventListener('drop', (e) => this.handleDrop(e));
            slot.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            slot.addEventListener('dblclick', (e) => this.handleSlotDoubleClick(e));
        });

        // Control buttons
        if (this.options.showControls) {
            const runBtn = container.querySelector('.run-btn');
            const clearBtn = container.querySelector('.clear-btn');
            const exportBtn = container.querySelector('.export-btn');
            const exportJsonBtn = container.querySelector('.export-json-btn');
            const importBtn = container.querySelector('.import-btn');
            const qubitInput = container.querySelector('.qubit-count-input');
            const depthInput = container.querySelector('.depth-input');

            if (runBtn) runBtn.addEventListener('click', () => this.runSimulation());
            if (clearBtn) clearBtn.addEventListener('click', () => this.clearCircuit());
            if (exportBtn) exportBtn.addEventListener('click', () => this.exportQASM());
            if (exportJsonBtn) exportJsonBtn.addEventListener('click', () => this.exportCircuitJSON());
            if (importBtn) importBtn.addEventListener('click', () => this.importQASM());
            if (qubitInput) qubitInput.addEventListener('change', (e) => this.updateQubits(parseInt(e.target.value)));
            if (depthInput) depthInput.addEventListener('change', (e) => this.updateDepth(parseInt(e.target.value)));
        }

    }

    handleGateDragStart(e) {
        const gateName = e.target.dataset.gate;
        e.dataTransfer.setData('gate', gateName);
        e.dataTransfer.effectAllowed = 'copy';
        e.target.style.opacity = '0.5';
        setTimeout(() => e.target.style.opacity = '1', 0);
    }

    handleGateClick(e) {
        const gateName = e.target.dataset.gate;
        this.selectedGate = gateName;

        // Visual feedback
        this.container.querySelectorAll('.gate-button').forEach(btn => btn.classList.remove('selected'));
        e.target.classList.add('selected');

        this.showNotification(`Selected ${gateName} gate. Click on circuit slots to place.`, 'info');
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        e.target.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.target.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        e.target.classList.remove('drag-over');

        const gateName = e.dataTransfer.getData('gate');
        const qubit = parseInt(e.target.dataset.qubit);
        const column = parseInt(e.target.dataset.column);

        this.placeGate(gateName, qubit, column);
    }

    handleSlotDoubleClick(e) {
        const qubit = parseInt(e.target.dataset.qubit);
        const column = parseInt(e.target.dataset.column);

        if (this.gateGrid[qubit][column]) {
            this.removeGate(qubit, column);
        } else if (this.selectedGate) {
            this.placeGate(this.selectedGate, qubit, column);
        }
    }

    placeGate(gateName, qubit, column) {
        // Use GatePlacementManager to determine gate placement
        const placement = this.gatePlacementManager.determinePlacement(
            gateName,
            qubit,
            this.options.qubits,
            {
                promptFunction: (message, defaultValue) => prompt(message, defaultValue),
                errorCallback: (error) => this.showNotification(error, 'error')
            }
        );

        // User cancelled
        if (!placement) return;

        // Apply gate placements to grid
        placement.placements.forEach(({ qubit, data }) => {
            this.gateGrid[qubit][column] = data;
            this.updateSlot(qubit, column);
        });

        // Draw connections for multi-qubit gates
        placement.connections.forEach(({ from, to }) => {
            this.drawConnection(from, to, column);
        });

        // Notify circuit change
        if (this.options.onCircuitChange) {
            this.options.onCircuitChange(this.buildCircuit());
        }
    }

    removeGate(qubit, column) {
        const gate = this.gateGrid[qubit][column];
        if (!gate) return;

        // Remove multi-qubit gate from all qubits
        if (gate.target !== undefined) {
            this.gateGrid[gate.target][column] = null;
            this.updateSlot(gate.target, column);
        }
        if (gate.source !== undefined) {
            this.gateGrid[gate.source][column] = null;
            this.updateSlot(gate.source, column);
        }
        if (gate.control2 !== undefined) {
            this.gateGrid[gate.control2][column] = null;
            this.updateSlot(gate.control2, column);
        }
        if (gate.sources) {
            gate.sources.forEach(s => {
                this.gateGrid[s][column] = null;
                this.updateSlot(s, column);
            });
        }

        this.gateGrid[qubit][column] = null;
        this.updateSlot(qubit, column);
        this.removeConnection(column);

        if (this.options.onCircuitChange) {
            this.options.onCircuitChange(this.buildCircuit());
        }
    }

    updateSlot(qubit, column) {
        const slot = this.container.querySelector(`.gate-slot[data-qubit="${qubit}"][data-column="${column}"]`);
        if (!slot) return;

        const gate = this.gateGrid[qubit][column];

        if (gate) {
            slot.classList.add('occupied');
            slot.classList.add(`gate-${gate.name.toLowerCase()}`);

            if (gate.isBarrier) {
                slot.textContent = '║';
                slot.classList.add('barrier-gate');
            } else if (gate.control) {
                slot.textContent = '●';
                slot.classList.add('cnot-control');
            } else if (gate.control === false) {
                slot.textContent = '⊕';
                slot.classList.add('cnot-target');
            } else {
                slot.textContent = gate.name;
            }
        } else {
            slot.className = 'gate-slot';
            slot.textContent = '';
            slot.setAttribute('data-qubit', qubit);
            slot.setAttribute('data-column', column);
        }
    }

    drawConnection(qubit1, qubit2, column) {
        // Remove existing connection
        this.removeConnection(column);

        // Draw line between qubits
        const slot1 = this.container.querySelector(`.gate-slot[data-qubit="${qubit1}"][data-column="${column}"]`);
        const slot2 = this.container.querySelector(`.gate-slot[data-qubit="${qubit2}"][data-column="${column}"]`);

        if (!slot1 || !slot2) return;

        const rect1 = slot1.getBoundingClientRect();
        const rect2 = slot2.getBoundingClientRect();
        const containerRect = this.container.querySelector('.circuit-canvas').getBoundingClientRect();

        const line = document.createElement('div');
        line.className = 'connection-line';
        line.dataset.column = column;
        line.style.left = `${rect1.left - containerRect.left + rect1.width/2}px`;
        line.style.top = `${rect1.top - containerRect.top + rect1.height}px`;
        line.style.height = `${rect2.top - rect1.top - rect1.height}px`;

        this.container.querySelector('.circuit-canvas').appendChild(line);
    }

    removeConnection(column) {
        const lines = this.container.querySelectorAll(`.connection-line[data-column="${column}"]`);
        lines.forEach(line => line.remove());
    }

    getGateInfo(gateName) {
        // Delegate to GatePlacementManager
        return this.gatePlacementManager.getGateInfo(gateName);
    }

    parseAngle(angleStr) {
        // Delegate to GatePlacementManager
        return this.gatePlacementManager.parseAngle(angleStr);
    }

    buildCircuit() {
        // Delegate to CircuitBuilder
        const circuit = this.circuitBuilder.buildCircuitFromGrid(
            this.gateGrid,
            this.options.qubits,
            this.options.depth
        );

        this.circuit = circuit;
        return circuit;
    }

    runSimulation() {
        try {
            const circuit = this.buildCircuit();
            const results = circuit.run();

            this.displayResults(results, circuit);

            this.showNotification('Simulation completed successfully', 'success');
        } catch (error) {
            this.showNotification(`Simulation error: ${error.message}`, 'error');
            console.error(error);
        }
    }

    displayResults(results, circuit) {
        // Use the new quantum visualizer for all results display
        if (this.visualizer) {
            this.visualizer.displayResults(results, circuit);
        }
    }

    clearCircuit() {
        this.initializeGrid();
        this.circuit = new QuantumCircuit(this.options.qubits, this.options.qubits);

        // Clear all slots
        this.container.querySelectorAll('.gate-slot').forEach(slot => {
            slot.className = 'gate-slot';
            slot.textContent = '';
        });

        // Remove all connections
        this.container.querySelectorAll('.connection-line').forEach(line => line.remove());

        // Hide visualizer
        if (this.visualizer) {
            this.visualizer.hide();
        }

        if (this.options.onCircuitChange) {
            this.options.onCircuitChange(this.circuit);
        }

        this.showNotification('Circuit cleared', 'success');
    }

    exportQASM() {
        try {
            const circuit = this.buildCircuit();
            const qasm = this.circuitSerializer.toQASM(circuit);
            this.fileExporter.downloadAsQASM(qasm, 'circuit.qasm');
            this.showNotification('QASM exported successfully', 'success');
        } catch (error) {
            this.showNotification(`Export error: ${error.message}`, 'error');
        }
    }

    exportCircuitJSON() {
        try {
            const circuit = this.buildCircuit();
            const circuitData = {
                qubits: this.options.qubits,
                depth: this.options.depth,
                gateGrid: this.gateGrid,
                circuit: circuit.toJSON ? circuit.toJSON() : null
            };

            this.fileExporter.downloadAsJSON(circuitData, 'circuit.json');
            this.showNotification('Circuit exported as JSON', 'success');
        } catch (error) {
            this.showNotification(`Export error: ${error.message}`, 'error');
        }
    }

    importCircuitJSON(jsonData) {
        try {
            const circuitData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

            console.log('Importing circuit data:', circuitData);

            // Update options if different
            if (circuitData.qubits && circuitData.qubits !== this.options.qubits) {
                this.options.qubits = circuitData.qubits;
                console.log('Updated qubits to:', this.options.qubits);
            }
            if (circuitData.depth && circuitData.depth !== this.options.depth) {
                this.options.depth = circuitData.depth;
                console.log('Updated depth to:', this.options.depth);
            }

            // Load gate grid (preferred method - has UI gate positions)
            if (circuitData.gateGrid) {
                console.log('Loading from gate grid:', circuitData.gateGrid);

                // CRITICAL: Store the gate grid BEFORE rendering (render calls initializeGrid which would overwrite it)
                const savedGateGrid = circuitData.gateGrid;

                // Render the UI
                this.render();
                this.attachEventListeners();

                // NOW set the gate grid after render
                this.gateGrid = savedGateGrid;
                console.log('Gate grid set after render:', this.gateGrid);

                // Load gates into the rendered UI
                this.loadCircuitFromGrid();
                console.log('Gate grid loaded and rendered');
            } else if (circuitData.circuit) {
                // Load from circuit JSON (fallback - has to reconstruct UI positions)
                console.log('Loading from circuit JSON');
                this.circuit = window.QuantumCircuit.fromJSON(circuitData.circuit);
                this.render();
                this.attachEventListeners();
                this.loadCircuitFromInstance();
                console.log('Circuit instance loaded and rendered');
            } else {
                console.warn('No gateGrid or circuit found in import data');
                this.showNotification('Invalid circuit data: no gateGrid or circuit found', 'warning');
                return;
            }

            // Rebuild the circuit from the loaded gate grid
            this.circuit = this.buildCircuit();
            console.log('Circuit rebuilt from gate grid:', this.circuit);

            if (this.options.onCircuitChange) {
                this.options.onCircuitChange(this.circuit);
            }

            this.showNotification('Circuit loaded successfully', 'success');
        } catch (error) {
            this.showNotification(`Import error: ${error.message}`, 'error');
            console.error('Circuit import error:', error);
        }
    }

    async importQASM() {
        try {
            const result = await this.fileImporter.loadFromFile('.qasm,.txt,.json');

            // Check file extension
            if (result.filename.endsWith('.json')) {
                this.importCircuitJSON(result.content);
            } else {
                // QASM file
                this.showNotification('QASM import not yet fully implemented. Please use JSON export/import.', 'warning');
            }
        } catch (error) {
            // User cancelled or error occurred
            if (error.message !== 'File selection cancelled') {
                this.showNotification(`Import error: ${error.message}`, 'error');
            }
        }
    }

    updateQubits(newQubits) {
        if (newQubits < 1 || newQubits > 10) {
            this.showNotification('Number of qubits must be between 1 and 10', 'error');
            return;
        }

        this.options.qubits = newQubits;
        this.clearCircuit();
        this.render();
        this.attachEventListeners();
    }

    updateDepth(newDepth) {
        if (newDepth < 1 || newDepth > 20) {
            this.showNotification('Circuit depth must be between 1 and 20', 'error');
            return;
        }

        this.options.depth = newDepth;
        this.render();
        this.attachEventListeners();
        this.loadCircuitFromGrid(); // Preserve existing gates
    }

    loadCircuitFromGrid() {
        // Reload gates from gateGrid after render
        for (let q = 0; q < this.options.qubits; q++) {
            for (let col = 0; col < this.options.depth; col++) {
                if (this.gateGrid[q] && this.gateGrid[q][col]) {
                    this.updateSlot(q, col);
                }
            }
        }

        // Redraw connections for multi-qubit gates
        for (let col = 0; col < this.options.depth; col++) {
            for (let q = 0; q < this.options.qubits; q++) {
                const gate = this.gateGrid[q] && this.gateGrid[q][col];
                if (gate && gate.control === true && gate.target !== undefined) {
                    // Draw connection for this multi-qubit gate
                    if (gate.control2 !== undefined) {
                        // Three-qubit gate
                        this.drawConnection(
                            Math.min(q, gate.control2, gate.target),
                            Math.max(q, gate.control2, gate.target),
                            col
                        );
                    } else {
                        // Two-qubit gate
                        this.drawConnection(q, gate.target, col);
                    }
                }
            }
        }
    }

    loadCircuitFromInstance() {
        // Load circuit from provided QuantumCircuit instance
        if (!this.circuit || !this.circuit.gates || this.circuit.gates.length === 0) {
            console.log('No gates to load from circuit instance');
            return;
        }

        console.log('Loading circuit with gates (2D array):', this.circuit.gates);

        // Clear existing grid
        this.initializeGrid();

        // The circuit.gates is a 2D array: gates[qubit][column]
        // Each gate object has: { name, id, options }
        // We need to process column by column to handle multi-qubit gates correctly
        const numCols = Math.max(...this.circuit.gates.map(row => row.length));

        for (let col = 0; col < numCols && col < this.options.depth; col++) {
            const processedGates = new Set(); // Track already processed gate IDs

            for (let qubit = 0; qubit < this.circuit.gates.length && qubit < this.options.qubits; qubit++) {
                const gate = this.circuit.gates[qubit][col];

                // Skip null/empty slots
                if (!gate) continue;

                // Skip gates without a name
                if (!gate.name) {
                    console.warn(`Skipping gate without name at qubit ${qubit}, column ${col}:`, gate);
                    continue;
                }

                // Skip if we already processed this gate (multi-qubit gates appear on multiple rows)
                if (processedGates.has(gate.id)) {
                    continue;
                }
                processedGates.add(gate.id);

                const gateName = gate.name.toUpperCase();

                // Find all qubits this gate is on (for multi-qubit gates)
                const involvedQubits = [];
                for (let q = 0; q < this.circuit.gates.length; q++) {
                    if (this.circuit.gates[q][col] && this.circuit.gates[q][col].id === gate.id) {
                        involvedQubits.push(q);
                    }
                }

                // Handle different gate types based on number of qubits
                if (involvedQubits.length === 1) {
                    // Single qubit gate
                    const q = involvedQubits[0];
                    if (q < this.options.qubits && col < this.options.depth) {
                        // Check for parameterized gates
                        if (gate.options && gate.options.params) {
                            const paramKeys = Object.keys(gate.options.params);
                            const paramValue = paramKeys.length > 0 ? gate.options.params[paramKeys[0]] : null;
                            this.gateGrid[q][col] = { name: gateName, param: paramValue };
                        } else {
                            this.gateGrid[q][col] = { name: gateName };
                        }
                        this.updateSlot(q, col);
                    }
                } else if (involvedQubits.length === 2) {
                    // Two qubit gate (CNOT, CZ, SWAP, etc.)
                    const control = involvedQubits[0];
                    const target = involvedQubits[1];

                    if (control < this.options.qubits && target < this.options.qubits && col < this.options.depth) {
                        this.gateGrid[control][col] = { name: gateName, control: true, target: target };
                        this.gateGrid[target][col] = { name: gateName, control: false, source: control };
                        this.updateSlot(control, col);
                        this.updateSlot(target, col);
                        this.drawConnection(control, target, col);
                    }
                } else if (involvedQubits.length === 3) {
                    // Three qubit gate (Toffoli CCX)
                    const control1 = involvedQubits[0];
                    const control2 = involvedQubits[1];
                    const target = involvedQubits[2];

                    if (control1 < this.options.qubits && control2 < this.options.qubits &&
                        target < this.options.qubits && col < this.options.depth) {
                        this.gateGrid[control1][col] = { name: gateName, control: true, control2: control2, target: target };
                        this.gateGrid[control2][col] = { name: gateName, control: true, source: control1, target: target };
                        this.gateGrid[target][col] = { name: gateName, control: false, sources: [control1, control2] };
                        this.updateSlot(control1, col);
                        this.updateSlot(control2, col);
                        this.updateSlot(target, col);
                        this.drawConnection(Math.min(control1, control2, target), Math.max(control1, control2, target), col);
                    }
                }
            }
        }

        console.log('Circuit loaded successfully with gate grid:', this.gateGrid);
        this.showNotification('Circuit loaded from instance', 'success');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    getCircuit() {
        return this.buildCircuit();
    }

    setCircuit(circuit) {
        this.circuit = circuit;
        this.options.circuit = circuit;
        this.loadCircuitFromInstance();
    }
}

// Make CircuitComponent available globally
window.CircuitComponent = CircuitComponent;
