/**
 * JS Sandbox - Programmatic QCNS API Access
 * Allows users to write and execute JavaScript code using the QCNS library
 */

class Sandbox {
    constructor() {
        this.codeEditor = document.getElementById('sandbox-code');
        this.consoleOutput = document.getElementById('sandbox-console');
        this.consoleHistory = [];

        this.initialize();
    }

    initialize() {
        this.setupConsoleOverride();
        this.setupEventListeners();
        this.loadExampleCode();

        // Initialize quantum visualizer AFTER DOM is ready
        setTimeout(() => {
            this.visualizer = new QuantumVisualizer('sandbox-visualizer', {
                chartColor: 'rgba(156, 39, 176, 0.6)',
                chartBorderColor: 'rgba(156, 39, 176, 1)',
                showToggle: true
            });
        }, 100);
    }

    setupEventListeners() {
        const executeBtn = document.getElementById('execute-sandbox-btn');
        if (executeBtn) executeBtn.addEventListener('click', () => this.executeCode());

        const clearCodeBtn = document.getElementById('clear-sandbox-code-btn');
        if (clearCodeBtn) clearCodeBtn.addEventListener('click', () => this.clearCode());

        const clearConsoleBtn = document.getElementById('clear-sandbox-console-btn');
        if (clearConsoleBtn) clearConsoleBtn.addEventListener('click', () => this.clearConsole());

        const exampleSelect = document.getElementById('sandbox-example-select');
        if (exampleSelect) exampleSelect.addEventListener('change', (e) => this.loadSelectedExample(e.target.value));
    }

    setupConsoleOverride() {
        // Store original console methods but don't override them globally
        // Instead, we'll create a custom console object for sandbox execution
        this.originalLog = console.log;
        this.originalError = console.error;
        this.originalWarn = console.warn;
        this.originalInfo = console.info;
        this.captureConsole = false; // Flag to control console capture
    }

    createSandboxConsole() {
        // Create a custom console object that captures output only during sandbox execution
        const self = this;
        return {
            log: function(...args) {
                self.originalLog.apply(console, args);
                self.appendToConsole(args.map(arg => self.formatValue(arg)).join(' '), 'log');
            },
            error: function(...args) {
                self.originalError.apply(console, args);
                self.appendToConsole(args.map(arg => self.formatValue(arg)).join(' '), 'error');
            },
            warn: function(...args) {
                self.originalWarn.apply(console, args);
                self.appendToConsole(args.map(arg => self.formatValue(arg)).join(' '), 'warning');
            },
            info: function(...args) {
                self.originalInfo.apply(console, args);
                self.appendToConsole(args.map(arg => self.formatValue(arg)).join(' '), 'info');
            }
        };
    }

    formatValue(value) {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        if (typeof value === 'object') {
            try {
                return JSON.stringify(value, null, 2);
            } catch (e) {
                return value.toString();
            }
        }
        return String(value);
    }

    appendToConsole(message, type = 'log') {
        if (!this.consoleOutput) return;

        const timestamp = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.style.marginBottom = '5px';
        entry.style.padding = '4px';
        entry.style.borderLeft = '3px solid';

        switch (type) {
            case 'error':
                entry.style.borderLeftColor = '#f44336';
                entry.style.color = '#ff6b6b';
                break;
            case 'warning':
                entry.style.borderLeftColor = '#FFC107';
                entry.style.color = '#ffd54f';
                break;
            case 'info':
                entry.style.borderLeftColor = '#2196F3';
                entry.style.color = '#64b5f6';
                break;
            default:
                entry.style.borderLeftColor = '#4CAF50';
                entry.style.color = '#d4d4d4';
        }

        entry.innerHTML = `<span style="color: #888; font-size: 0.8rem;">[${timestamp}]</span> ${this.escapeHtml(message)}`;

        this.consoleOutput.appendChild(entry);
        this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;

        this.consoleHistory.push({ message, type, timestamp });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    executeCode() {
        if (!this.codeEditor) return;

        const code = this.codeEditor.value.trim();

        if (!code) {
            this.showNotification('Please write some code to execute', 'warning');
            return;
        }

        this.appendToConsole('─'.repeat(50), 'info');
        this.appendToConsole('Executing code...', 'info');

        try {
            // Create execution function with QCNS API in scope
            const executeFunction = new Function(
                'QuantumCircuit',
                'QuantumRegister',
                'ClassicalRegister',
                'QuantumNetwork',
                'QuantumNetworkNode',
                'QuantumSimulator',
                'QasmTranspiler',
                'ComplexMath',
                'QuantumGates',
                'visualize',
                'visualizeCircuit',
                'displayProbabilities',
                'Math',
                'console',
                code
            );

            // Execute with proper context - use custom console
            const sandboxConsole = this.createSandboxConsole();
            const result = executeFunction(
                window.QuantumCircuit,
                window.QuantumRegister,
                window.ClassicalRegister,
                window.QuantumNetwork,
                window.QuantumNetworkNode,
                window.QuantumSimulator,
                window.QasmTranspiler,
                window.ComplexMath,
                window.QuantumGates,
                (results) => this.visualizeResults(results),
                (circuit) => this.visualizeCircuit(circuit),
                (probs) => this.displayProbabilities(probs),
                Math,
                sandboxConsole  // Use custom console instead of global console
            );

            // If result is a circuit simulation, visualize it
            if (result && result.probabilities) {
                this.visualizeResults(result);
            } else if (result !== undefined) {
                console.log('Result:', result);
            }

            this.appendToConsole('Execution completed successfully', 'info');
            this.showNotification('Code executed successfully', 'success');

        } catch (error) {
            console.error('Execution error:', error.message);
            this.appendToConsole(`Error: ${error.stack || error.message}`, 'error');
            this.showNotification(`Execution error: ${error.message}`, 'error');
        }
    }

    visualizeResults(results) {
        if (!results || !results.probabilities) {
            console.warn('No probabilities to visualize');
            return;
        }

        // Extract circuit if available from results
        const circuit = results.circuit || null;

        // Use the new quantum visualizer for all results display
        if (this.visualizer) {
            this.visualizer.displayResults(results, circuit);
        }

        console.log('Results visualized');
    }

    visualizeCircuit(circuit) {
        if (!circuit || typeof circuit.run !== 'function') {
            console.error('Invalid circuit object');
            return;
        }

        try {
            const results = circuit.run();
            this.visualizeResults(results);
        } catch (error) {
            console.error('Circuit execution error:', error.message);
        }
    }

    clearCode() {
        if (this.codeEditor) {
            this.codeEditor.value = '';
        }
        this.showNotification('Code cleared', 'success');
    }

    clearConsole() {
        if (this.consoleOutput) {
            this.consoleOutput.innerHTML = '';
        }
        this.consoleHistory = [];
        this.showNotification('Console cleared', 'success');
    }

    getExamples() {
        return [
            {
                id: 'default',
                name: 'Getting Started',
                code: `// Welcome to the QCNS Sandbox!
// Write JavaScript code to interact with the QCNS library.

// Example: Create a simple quantum circuit
const circuit = new QuantumCircuit(2, 2);
circuit.h(0);
circuit.cx(0, 1);
circuit.measure_all();

const results = circuit.run();
console.log('Results:', results);

// Visualize the results
visualize(results);`
            },
            {
                id: 'bell',
                name: 'Bell State (Entanglement)',
                code: `// Create a Bell state (maximally entangled state)
const circuit = new QuantumCircuit(2, 2);
circuit.h(0);        // Apply Hadamard to qubit 0
circuit.cx(0, 1);    // Apply CNOT with control=0, target=1
circuit.measure_all(); // Measure all qubits

const results = circuit.run();
console.log('Bell State Results:', results);
console.log('Expected: 50% |00⟩ and 50% |11⟩');
visualize(results);`
            },
            {
                id: 'superposition',
                name: 'Superposition State',
                code: `// Create equal superposition of all basis states
const circuit = new QuantumCircuit(3, 3);

// Apply Hadamard to all qubits
circuit.h(0);
circuit.h(1);
circuit.h(2);

circuit.measure_all();

const results = circuit.run();
console.log('Superposition Results:', results);
console.log('Expected: Equal probability for all 8 states');
visualize(results);`
            },
            {
                id: 'ghz',
                name: 'GHZ State (3-Qubit Entanglement)',
                code: `// Create a GHZ state (3-qubit entangled state)
const circuit = new QuantumCircuit(3, 3);
circuit.h(0);
circuit.cx(0, 1);
circuit.cx(1, 2);
circuit.measure_all();

const results = circuit.run();
console.log('GHZ State Results:', results);
console.log('Expected: 50% |000⟩ and 50% |111⟩');
visualize(results);`
            },
            {
                id: 'teleportation',
                name: 'Quantum Teleportation',
                code: `// Quantum Teleportation Protocol
const circuit = new QuantumCircuit(3, 3);

// Prepare state to teleport on qubit 0 (|+⟩ state)
circuit.h(0);

// Create Bell pair between qubits 1 and 2
circuit.h(1);
circuit.cx(1, 2);

// Bell measurement on qubits 0 and 1
circuit.cx(0, 1);
circuit.h(0);
circuit.measure(0, 0);
circuit.measure(1, 1);

// In real implementation, corrections would be applied conditionally

const results = circuit.run();
console.log('Teleportation Results:', results);
visualize(results);`
            },
            {
                id: 'grover',
                name: "Grover's Search Algorithm",
                code: `// Grover's algorithm for 2 qubits
// Searches for state |11⟩
const circuit = new QuantumCircuit(2, 2);

// Initialize superposition
circuit.h(0);
circuit.h(1);

// Oracle (marks |11⟩)
circuit.cz(0, 1);

// Diffusion operator
circuit.h(0);
circuit.h(1);
circuit.z(0);
circuit.z(1);
circuit.cz(0, 1);
circuit.h(0);
circuit.h(1);

circuit.measure_all();

const results = circuit.run();
console.log("Grover's Results:", results);
console.log('Expected: High probability of finding |11⟩');
visualize(results);`
            },
            {
                id: 'qasm',
                name: 'QASM Export/Import',
                code: `// Create a circuit and export to QASM
const circuit = new QuantumCircuit(2, 2);
circuit.h(0);
circuit.cx(0, 1);
circuit.measure_all();

// Export to QASM
const qasmCode = circuit.qasm();
console.log('QASM Code:');
console.log(qasmCode);

// Run simulation
const results = circuit.run();
console.log('\\nResults:', results.probabilities);
visualize(results);`
            },
            {
                id: 'interference',
                name: 'Quantum Interference',
                code: `// Demonstrate quantum interference
const circuit = new QuantumCircuit(1, 1);

// Create superposition
circuit.h(0);

// Apply phase flip
circuit.z(0);

// Interference - another Hadamard
circuit.h(0);

circuit.measure(0, 0);

const results = circuit.run();
console.log('Interference Results:', results);
console.log('Expected: 100% in |1⟩ state due to destructive interference');
visualize(results);`
            }
        ];
    }

    loadSelectedExample(exampleId) {
        if (!exampleId || exampleId === '') return;

        const examples = this.getExamples();
        const example = examples.find(ex => ex.id === exampleId);

        if (!example) {
            this.showNotification('Example not found', 'error');
            return;
        }

        if (this.codeEditor) {
            this.codeEditor.value = example.code;
        }

        this.appendToConsole(`Loaded example: ${example.name}`, 'info');
        this.showNotification(`Loaded example: ${example.name}`, 'success');
    }

    loadExampleCode() {
        // Load default example on initialization
        const examples = this.getExamples();
        const defaultExample = examples.find(ex => ex.id === 'default');

        if (this.codeEditor && !this.codeEditor.value && defaultExample) {
            this.codeEditor.value = defaultExample.code;
        }

        // Populate example select dropdown if it exists
        const exampleSelect = document.getElementById('sandbox-example-select');
        if (exampleSelect) {
            exampleSelect.innerHTML = '<option value="">-- Choose an Example --</option>';
            examples.forEach(example => {
                const option = document.createElement('option');
                option.value = example.id;
                option.textContent = example.name;
                exampleSelect.appendChild(option);
            });
        }

        this.appendToConsole('Sandbox ready. QCNS library loaded.', 'info');
        this.appendToConsole('Available classes: QuantumCircuit, QuantumNetwork, QuantumRegister, etc.', 'info');
        this.appendToConsole('Select an example from the dropdown to get started.', 'info');
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

// Initialize sandbox when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.sandbox = new Sandbox();
    });
} else {
    // DOM already loaded
    window.sandbox = new Sandbox();
}
