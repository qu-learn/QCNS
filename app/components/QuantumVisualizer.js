/**
 * Unified Quantum Visualization Component
 * Displays: Probability graphs, State vector, Unitary matrix, QASM code, Bloch spheres, Circuit metrics
 * Can be instantiated in Circuit Simulator, Network Simulator, and JS Sandbox
 */

import { BlochSphereCalculator } from '../../lib/utils/BlochSphereCalculator.js';
import { CircuitMetrics } from '../../lib/utils/CircuitMetrics.js';

class QuantumVisualizer {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);

        if (!this.container) {
            console.error(`Container ${containerId} not found`);
            return;
        }

        // Configuration options
        this.options = {
            chartColor: options.chartColor || 'rgba(59, 130, 246, 0.6)',
            chartBorderColor: options.chartBorderColor || 'rgba(59, 130, 246, 1)',
            showToggle: options.showToggle !== false,
            ...options
        };

        this.showAllBases = false;
        this.chartInstance = null;

        // Initialize utility modules
        this.blochSphereCalculator = new BlochSphereCalculator();
        this.circuitMetrics = new CircuitMetrics();

        this.initializeHTML();
    }

    /**
     * Initialize the HTML structure for the visualizer
     */
    initializeHTML() {
        this.container.innerHTML = `
            <div class="quantum-visualizer">
                <h3 class="section-title">Quantum State Visualization</h3>

                <!-- Tab Navigation -->
                <div class="visualizer-tabs">
                    <button class="visualizer-tab active" data-viz-tab="probabilities">Probabilities</button>
                    <button class="visualizer-tab" data-viz-tab="state-vector">State & Unitary</button>
                    <button class="visualizer-tab" data-viz-tab="bloch">Bloch Spheres</button>
                    <button class="visualizer-tab" data-viz-tab="qasm">QASM Code</button>
                    <button class="visualizer-tab" data-viz-tab="metrics">Circuit Metrics</button>
                </div>

                <!-- Tab Content -->
                <div class="visualizer-content">
                    <!-- Probabilities Tab -->
                    <div id="${this.containerId}-probabilities" class="viz-content active">
                        <div class="viz-header">
                            <h4>Measurement Probabilities</h4>
                            ${this.options.showToggle ? `
                                <button class="btn btn-secondary btn-small toggle-prob-btn">
                                    Show All Bases
                                </button>
                            ` : ''}
                        </div>
                        <div class="chart-container">
                            <canvas id="${this.containerId}-prob-chart"></canvas>
                        </div>
                    </div>

                    <!-- State Vector & Unitary Matrix Tab -->
                    <div id="${this.containerId}-state-vector" class="viz-content">
                        <div class="state-unitary-container">
                            <!-- State Vector Section -->
                            <div class="state-section">
                                <h4>State Vector</h4>
                                <div class="state-vector-display" id="${this.containerId}-state-display"></div>
                            </div>

                            <!-- Unitary Matrix Section -->
                            <div class="unitary-section">
                                <h4>Unitary Matrix</h4>
                                <div class="unitary-matrix-display" id="${this.containerId}-unitary-display"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Bloch Spheres Tab -->
                    <div id="${this.containerId}-bloch" class="viz-content">
                        <div class="viz-header">
                            <h4>Bloch Sphere Representation</h4>
                            <div class="bloch-info">
                                <span class="info-icon" title="Individual qubit states extracted via partial trace">ⓘ</span>
                                <span class="bloch-note">Entangled qubits appear near the center</span>
                            </div>
                        </div>
                        <canvas id="${this.containerId}-bloch-canvas" width="900" height="700"></canvas>
                    </div>

                    <!-- QASM Code Tab -->
                    <div id="${this.containerId}-qasm" class="viz-content">
                        <div class="viz-header">
                            <h4>OpenQASM 3.0 Code</h4>
                            <button class="btn btn-secondary btn-small copy-qasm-btn">Copy to Clipboard</button>
                        </div>
                        <pre class="qasm-output" id="${this.containerId}-qasm-output"></pre>
                    </div>

                    <!-- Circuit Metrics Tab -->
                    <div id="${this.containerId}-metrics" class="viz-content">
                        <h4>Circuit Parameters</h4>
                        <div class="metrics-grid" id="${this.containerId}-metrics-grid">
                            <!-- Metrics will be dynamically populated -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    /**
     * Attach event listeners for tab switching and buttons
     */
    attachEventListeners() {
        // Tab switching
        const tabs = this.container.querySelectorAll('.visualizer-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.getAttribute('data-viz-tab');
                this.switchTab(targetTab);
            });
        });

        // Probability toggle button
        const toggleBtn = this.container.querySelector('.toggle-prob-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.showAllBases = !this.showAllBases;
                toggleBtn.textContent = this.showAllBases ? 'Show Non-Zero Only' : 'Show All Bases';
                this.updateProbabilityChart();
            });
        }

        // Copy QASM button
        const copyBtn = this.container.querySelector('.copy-qasm-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const qasmText = this.container.querySelector(`#${this.containerId}-qasm-output`).textContent;
                navigator.clipboard.writeText(qasmText).then(() => {
                    this.showNotification('QASM code copied to clipboard', 'success');
                });
            });
        }
    }

    /**
     * Switch between visualization tabs
     */
    switchTab(tabName) {
        // Update tab buttons
        const tabs = this.container.querySelectorAll('.visualizer-tab');
        tabs.forEach(tab => {
            if (tab.getAttribute('data-viz-tab') === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Update content
        const contents = this.container.querySelectorAll('.viz-content');
        contents.forEach(content => {
            if (content.id === `${this.containerId}-${tabName}`) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
    }

    /**
     * Main display method - shows all visualizations for a quantum simulation result
     */
    displayResults(results, circuit = null) {
        if (!results) {
            console.error('No results to display');
            return;
        }

        this.currentResults = results;
        this.currentCircuit = circuit;

        // Show the visualizer
        this.container.style.display = 'block';

        // Update all visualizations
        this.displayProbabilities(results.probabilities);
        this.displayStateVector(results.stateVector, results.numQubits);
        this.displayUnitaryMatrix(results.unitaryMatrix);
        this.displayBlochSpheres(results.stateVector, results.numQubits);
        this.displayQASM(circuit);
        this.displayMetrics(circuit, results);
    }

    /**
     * Display probability histogram with binary state labels
     */
    displayProbabilities(probabilities) {
        if (!probabilities) return;

        const canvas = document.getElementById(`${this.containerId}-prob-chart`);
        if (!canvas) return;

        // Determine number of qubits
        const numStates = Object.keys(probabilities).length;
        const numQubits = Math.ceil(Math.log2(numStates));

        // Prepare labels and data
        let labels, data;
        if (this.showAllBases) {
            // Show all possible basis states
            const decimalLabels = Object.keys(probabilities).map(Number).sort((a, b) => a - b);
            labels = decimalLabels.map(decimal => '|' + decimal.toString(2).padStart(numQubits, '0') + '⟩');
            data = decimalLabels.map(decimal => probabilities[decimal] || 0);
        } else {
            // Show only non-zero probabilities
            const decimalLabels = Object.keys(probabilities)
                .map(Number)
                .filter(key => probabilities[key] > 1e-10)
                .sort((a, b) => a - b);
            labels = decimalLabels.map(decimal => '|' + decimal.toString(2).padStart(numQubits, '0') + '⟩');
            data = decimalLabels.map(decimal => probabilities[decimal]);
        }

        // Destroy previous chart
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        // Create new chart
        const ctx = canvas.getContext('2d');
        this.chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Probability',
                    data: data,
                    backgroundColor: this.options.chartColor,
                    borderColor: this.options.chartBorderColor,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 1,
                        title: {
                            display: true,
                            text: 'Probability',
                            color: '#d4d4d4',
                            font: { size: 14 }
                        },
                        ticks: { color: '#d4d4d4' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Quantum State',
                            color: '#d4d4d4',
                            font: { size: 14 }
                        },
                        ticks: { color: '#d4d4d4', font: { size: 11 } },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        callbacks: {
                            label: (context) => `Probability: ${context.parsed.y.toFixed(4)}`
                        }
                    }
                }
            }
        });
    }

    /**
     * Update probability chart (for toggle)
     */
    updateProbabilityChart() {
        if (this.currentResults && this.currentResults.probabilities) {
            this.displayProbabilities(this.currentResults.probabilities);
        }
    }

    /**
     * Display state vector
     */
    displayStateVector(stateVector, numQubits) {
        const display = document.getElementById(`${this.containerId}-state-display`);
        if (!display || !stateVector) return;

        let html = '<div class="state-vector-list">';

        stateVector.forEach((amplitude, index) => {
            const binaryState = index.toString(2).padStart(numQubits, '0');
            const magnitude = Math.sqrt(amplitude.re * amplitude.re + amplitude.im * amplitude.im);
            const phase = Math.atan2(amplitude.im, amplitude.re);

            if (magnitude > 1e-10) {
                html += `
                    <div class="state-vector-item">
                        <span class="state-label">|${binaryState}⟩:</span>
                        <span class="state-value">
                            ${this.formatComplex(amplitude.re, amplitude.im)}
                        </span>
                        <span class="state-meta">
                            |α|=${magnitude.toFixed(4)}, φ=${(phase * 180 / Math.PI).toFixed(2)}°
                        </span>
                    </div>
                `;
            }
        });

        html += '</div>';
        display.innerHTML = html;
    }

    /**
     * Display unitary matrix
     */
    displayUnitaryMatrix(unitaryMatrix) {
        const display = document.getElementById(`${this.containerId}-unitary-display`);
        if (!display) return;

        if (!unitaryMatrix || unitaryMatrix.length === 0) {
            display.innerHTML = '<p class="no-data">Unitary matrix not available</p>';
            return;
        }

        const dim = unitaryMatrix.length;
        let html = '<div class="unitary-matrix-table"><table class="matrix-table">';

        // Header row
        html += '<thead><tr><th></th>';
        for (let j = 0; j < Math.min(dim, 8); j++) {
            html += `<th>${j}</th>`;
        }
        if (dim > 8) html += '<th>...</th>';
        html += '</tr></thead><tbody>';

        // Matrix rows (limit to 8x8 for display)
        for (let i = 0; i < Math.min(dim, 8); i++) {
            html += `<tr><th>${i}</th>`;
            for (let j = 0; j < Math.min(dim, 8); j++) {
                const element = unitaryMatrix[i][j];
                html += `<td>${this.formatComplex(element.re, element.im, true)}</td>`;
            }
            if (dim > 8) html += '<td>...</td>';
            html += '</tr>';
        }

        if (dim > 8) {
            html += '<tr><th>...</th>';
            for (let j = 0; j < Math.min(dim, 8); j++) {
                html += '<td>...</td>';
            }
            html += '</tr>';
        }

        html += '</tbody></table></div>';
        html += `<p class="matrix-info">Matrix dimension: ${dim}×${dim}</p>`;

        display.innerHTML = html;
    }

    /**
     * Display Bloch spheres using partial trace
     */
    displayBlochSpheres(stateVector, numQubits) {
        const canvas = document.getElementById(`${this.containerId}-bloch-canvas`);
        if (!canvas || !stateVector || !numQubits) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (numQubits === 1) {
            this.renderSingleBlochSphere(ctx, stateVector, 0, canvas.width / 2, canvas.height / 2, 200);
        } else {
            this.renderMultiQubitBlochSpheres(ctx, stateVector, numQubits, canvas.width, canvas.height);
        }
    }

    /**
     * Render multiple Bloch spheres in a grid layout
     */
    renderMultiQubitBlochSpheres(ctx, stateVector, numQubits, width, height) {
        // Calculate grid layout
        const cols = Math.ceil(Math.sqrt(numQubits));
        const rows = Math.ceil(numQubits / cols);

        const sphereWidth = width / cols;
        const sphereHeight = height / rows;
        const radius = Math.min(sphereWidth, sphereHeight) * 0.35;

        // Render each qubit's Bloch sphere
        for (let i = 0; i < numQubits; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const centerX = col * sphereWidth + sphereWidth / 2;
            const centerY = row * sphereHeight + sphereHeight / 2;

            this.renderSingleBlochSphere(ctx, stateVector, i, centerX, centerY, radius, numQubits);
        }
    }

    /**
     * Render a single Bloch sphere for one qubit
     */
    renderSingleBlochSphere(ctx, stateVector, qubitIndex, centerX, centerY, radius, totalQubits = 1) {
        // Extract single qubit state using partial trace (reduced density matrix)
        const reducedState = this.computeReducedDensityMatrix(stateVector, qubitIndex, totalQubits);

        // Calculate Bloch vector from reduced density matrix
        const blochVector = this.densityMatrixToBlochVector(reducedState);

        // Draw sphere components
        this.draw3DSphere(ctx, centerX, centerY, radius);
        this.drawLatitudeCircles(ctx, centerX, centerY, radius);
        this.drawLongitudeLines(ctx, centerX, centerY, radius);
        this.draw3DAxes(ctx, centerX, centerY, radius);
        this.drawStateVector(ctx, centerX, centerY, radius, blochVector.x, blochVector.y, blochVector.z);
        this.drawBlochLabels(ctx, centerX, centerY, radius, `q${qubitIndex}`);
    }

    /**
     * Compute reduced density matrix using partial trace
     * This is the CORRECT way to extract individual qubit states from multi-qubit systems
     */
    computeReducedDensityMatrix(stateVector, qubitIndex, totalQubits) {
        // Delegate to BlochSphereCalculator
        return this.blochSphereCalculator.computeReducedDensityMatrix(stateVector, qubitIndex, totalQubits);
    }

    /**
     * Convert reduced density matrix to Bloch vector (x, y, z)
     * Uses Pauli matrix decomposition: ρ = (I + x*σ_x + y*σ_y + z*σ_z) / 2
     */
    densityMatrixToBlochVector(rho) {
        // Delegate to BlochSphereCalculator
        return this.blochSphereCalculator.densityMatrixToBlochVector(rho);
    }

    /**
     * Draw 3D sphere with gradient shading
     */
    draw3DSphere(ctx, centerX, centerY, radius) {
        // Create radial gradient for 3D lighting effect
        const gradient = ctx.createRadialGradient(
            centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.1,
            centerX, centerY, radius
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
        gradient.addColorStop(0.5, 'rgba(200, 220, 240, 0.15)');
        gradient.addColorStop(1, 'rgba(100, 150, 200, 0.08)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fill();

        // Outer circle
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    /**
     * Draw latitude circles with perspective
     */
    drawLatitudeCircles(ctx, centerX, centerY, radius) {
        const latitudes = [-60, -30, 0, 30, 60];
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
        ctx.lineWidth = 1;

        latitudes.forEach(lat => {
            const latRad = lat * Math.PI / 180;
            const z = Math.sin(latRad);
            const r = Math.cos(latRad) * radius;
            const yOffset = -z * radius;

            ctx.beginPath();
            ctx.ellipse(centerX, centerY + yOffset, r, r * 0.25, 0, 0, 2 * Math.PI);
            ctx.stroke();
        });
    }

    /**
     * Draw longitude lines
     */
    drawLongitudeLines(ctx, centerX, centerY, radius) {
        const longitudes = [0, 45, 90, 135];
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
        ctx.lineWidth = 1;

        longitudes.forEach(lon => {
            const angle = lon * Math.PI / 180;
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, radius * Math.abs(Math.cos(angle)), radius, angle, 0, 2 * Math.PI);
            ctx.stroke();
        });
    }

    /**
     * Draw 3D coordinate axes
     */
    draw3DAxes(ctx, centerX, centerY, radius) {
        const axisLength = radius * 0.85;

        // X-axis (red) - horizontal
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX - axisLength, centerY);
        ctx.lineTo(centerX + axisLength, centerY);
        ctx.stroke();
        this.drawArrowHead(ctx, centerX + axisLength, centerY, 0, '#ef4444');

        // Y-axis (green) - into screen
        ctx.strokeStyle = '#10b981';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX, centerY + axisLength * 0.3);
        ctx.stroke();

        // Z-axis (blue, dashed) - vertical
        ctx.strokeStyle = '#3b82f6';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY + axisLength);
        ctx.lineTo(centerX, centerY - axisLength);
        ctx.stroke();
        ctx.setLineDash([]);
        this.drawArrowHead(ctx, centerX, centerY - axisLength, -Math.PI / 2, '#3b82f6');
    }

    /**
     * Draw arrow head
     */
    drawArrowHead(ctx, x, y, angle, color) {
        const size = 8;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - size * Math.cos(angle - Math.PI / 6), y - size * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(x - size * Math.cos(angle + Math.PI / 6), y - size * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
    }

    /**
     * Draw state vector on Bloch sphere
     */
    drawStateVector(ctx, centerX, centerY, radius, x, y, z) {
        const vecX = centerX + x * radius * 0.75;
        const vecY = centerY - z * radius * 0.75;

        // Shadow for depth
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(centerX + 2, centerY + 2);
        ctx.lineTo(vecX + 2, vecY + 2);
        ctx.stroke();

        // Main vector (orange)
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(vecX, vecY);
        ctx.stroke();

        // State point with glow
        const pointGradient = ctx.createRadialGradient(vecX, vecY, 0, vecX, vecY, 10);
        pointGradient.addColorStop(0, '#f59e0b');
        pointGradient.addColorStop(0.5, 'rgba(245, 158, 11, 0.6)');
        pointGradient.addColorStop(1, 'rgba(245, 158, 11, 0)');

        ctx.fillStyle = pointGradient;
        ctx.beginPath();
        ctx.arc(vecX, vecY, 10, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(vecX, vecY, 5, 0, 2 * Math.PI);
        ctx.fill();
    }

    /**
     * Draw labels on Bloch sphere
     */
    drawBlochLabels(ctx, centerX, centerY, radius, qubitLabel) {
        ctx.fillStyle = '#d4d4d4';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';

        // Axis labels
        ctx.fillText('|0⟩', centerX, centerY - radius - 10);
        ctx.fillText('|1⟩', centerX, centerY + radius + 20);
        ctx.fillText('|+⟩', centerX + radius + 20, centerY + 5);
        ctx.fillText('|−⟩', centerX - radius - 20, centerY + 5);

        // Qubit label
        ctx.font = 'bold 16px Arial';
        ctx.fillText(qubitLabel, centerX, centerY - radius - 30);
    }

    /**
     * Display QASM code
     */
    displayQASM(circuit) {
        const display = document.getElementById(`${this.containerId}-qasm-output`);
        if (!display) return;

        // Try to get QASM from results first (for Sandbox), then from circuit
        let qasmCode;
        if (this.currentResults && this.currentResults.qasm) {
            qasmCode = this.currentResults.qasm;
        } else if (circuit && typeof circuit.qasm === 'function') {
            try {
                qasmCode = circuit.qasm();
            } catch (error) {
                qasmCode = `// Error generating QASM: ${error.message}`;
            }
        } else {
            qasmCode = '// QASM code not available';
        }

        display.textContent = qasmCode;
    }

    /**
     * Display circuit metrics
     */
    displayMetrics(circuit, results) {
        const display = document.getElementById(`${this.containerId}-metrics-grid`);
        if (!display) return;

        const metrics = this.calculateMetrics(circuit, results);

        let html = '';
        for (const [key, value] of Object.entries(metrics)) {
            html += `
                <div class="metric-card">
                    <div class="metric-label">${key}</div>
                    <div class="metric-value">${value}</div>
                </div>
            `;
        }

        display.innerHTML = html;
    }

    /**
     * Calculate circuit metrics (depth, width, cost)
     */
    calculateMetrics(circuit, results) {
        if (!circuit) {
            return {
                'Circuit Depth': 'N/A',
                'Circuit Width': 'N/A',
                'Gate Count': 'N/A',
                'Execution Cost': 'N/A'
            };
        }

        // Delegate to CircuitMetrics module
        const rawMetrics = this.circuitMetrics.calculateAll(circuit);
        return this.circuitMetrics.formatForDisplay(rawMetrics);
    }

    // Keep helper methods for backward compatibility, but delegate to CircuitMetrics
    flattenGates(gates) {
        return this.circuitMetrics.flattenGates(gates);
    }

    calculateCircuitDepth(gates) {
        return this.circuitMetrics.calculateDepth(gates);
    }

    calculateExecutionCost(gates) {
        return this.circuitMetrics.calculateExecutionCost(gates);
    }

    /**
     * Format complex number for display
     */
    formatComplex(re, im, compact = false) {
        const threshold = 1e-10;

        if (Math.abs(im) < threshold) {
            return compact ? re.toFixed(3) : re.toFixed(4);
        }

        if (Math.abs(re) < threshold) {
            return compact ? `${im.toFixed(3)}i` : `${im.toFixed(4)}i`;
        }

        const sign = im >= 0 ? '+' : '';
        return compact
            ? `${re.toFixed(2)}${sign}${im.toFixed(2)}i`
            : `${re.toFixed(4)} ${sign} ${Math.abs(im).toFixed(4)}i`;
    }

    /**
     * Show notification message
     */
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

    /**
     * Hide the visualizer
     */
    hide() {
        this.container.style.display = 'none';
    }

    /**
     * Show the visualizer
     */
    show() {
        this.container.style.display = 'block';
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.QuantumVisualizer = QuantumVisualizer;
}
