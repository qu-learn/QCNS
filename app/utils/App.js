/**
 * Main Application Controller for QCNS Platform
 * Coordinates all three tabs and manages global application state
 */

import { KeyboardShortcuts } from './KeyboardShortcuts.js';

class QCNSApp {
    constructor() {
        this.version = '2.0.0';
        this.initialized = false;

        this.init();
    }

    init() {
        if (this.initialized) return;

        console.log(`QCNS Platform v${this.version} initializing...`);

        // Wait for QCNS library to load
        this.waitForQCNSLibrary()
            .then(() => {
                this.setupGlobalErrorHandling();
                this.initializeComponents();
                this.setupKeyboardShortcuts();
                this.displayWelcomeMessage();
                this.initialized = true;
                console.log('QCNS Platform initialized successfully');
            })
            .catch(error => {
                console.error('Failed to initialize QCNS Platform:', error);
                this.showCriticalError('Failed to load QCNS library. Please refresh the page.');
            });
    }

    waitForQCNSLibrary() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50;

            const checkLibrary = () => {
                if (window.QuantumCircuit && window.QuantumNetwork) {
                    resolve();
                } else if (attempts < maxAttempts) {
                    attempts++;
                    setTimeout(checkLibrary, 100);
                } else {
                    reject(new Error('QCNS library failed to load'));
                }
            };

            checkLibrary();
        });
    }

        initializeComponents() {
        // Wait for component classes to be available
        this.waitForComponentClasses()
            .then(() => {
                // Initialize Circuit Component
                if (typeof CircuitComponent !== 'undefined') {
                    console.log('Creating CircuitComponent instance...');
                    window.mainCircuitComponent = new CircuitComponent('circuit-simulator-container', {
                        qubits: 3,
                        depth: 8,
                        showControls: true,
                        showResults: true
                    });
                    console.log('CircuitComponent initialized');
                } else {
                    console.error('CircuitComponent class not available');
                }

                // Verify other components (they initialize themselves)
                if (!window.tabManager) {
                    console.warn('TabManager not initialized');
                }
                if (!window.networkSimulator) {
                    console.warn('NetworkSimulator not initialized');
                }
                if (!window.sandbox) {
                    console.warn('Sandbox not initialized');
                }

                console.log('All components verified');
            })
            .catch(error => {
                console.error('Failed to initialize components:', error);
                this.showNotification('Failed to initialize components', 'error');
            });
    }

    waitForComponentClasses() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 100; // 5 seconds max (50ms * 100)

            const checkClasses = () => {
                if (typeof CircuitComponent !== 'undefined' &&
                    typeof QuantumVisualizer !== 'undefined') {
                    console.log('Component classes are ready');
                    resolve();
                } else if (attempts < maxAttempts) {
                    attempts++;
                    setTimeout(checkClasses, 50);
                } else {
                    reject(new Error('Component classes failed to load in time'));
                }
            };

            checkClasses();
        });
    }

    setupGlobalErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.showNotification(`Error: ${event.error.message}`, 'error');
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.showNotification(`Promise error: ${event.reason}`, 'error');
        });
    }

    setupKeyboardShortcuts() {
        // Initialize KeyboardShortcuts module
        this.keyboardShortcuts = new KeyboardShortcuts();

        // Setup standard shortcuts
        this.keyboardShortcuts.setupStandardShortcuts({
            switchTab: (tabId) => {
                if (window.tabManager) {
                    window.tabManager.switchTab(tabId);
                }
            },
            run: () => this.runActiveTabSimulation(),
            clear: () => this.clearActiveTab(),
            execute: () => {
                if (window.sandbox) {
                    window.sandbox.executeCode();
                }
            },
            isInSandbox: () => window.tabManager && window.tabManager.activeTab === 'sandbox-tab'
        });

        // Enable keyboard shortcuts
        this.keyboardShortcuts.enable();

        console.log('Keyboard shortcuts enabled');
        console.log(this.keyboardShortcuts.getHelpText());
    }

    runActiveTabSimulation() {
        if (!window.tabManager) return;

        switch (window.tabManager.activeTab) {
            case 'circuit-tab':
                if (window.mainCircuitComponent) {
                    window.mainCircuitComponent.runSimulation();
                }
                break;
            case 'network-tab':
                if (window.networkSimulator) {
                    window.networkSimulator.runSimulation();
                }
                break;
            case 'sandbox-tab':
                if (window.sandbox) {
                    window.sandbox.executeCode();
                }
                break;
        }
    }

    clearActiveTab() {
        if (!window.tabManager) return;

        switch (window.tabManager.activeTab) {
            case 'circuit-tab':
                if (window.mainCircuitComponent) {
                    window.mainCircuitComponent.clearCircuit();
                }
                break;
            case 'network-tab':
                if (window.networkSimulator) {
                    window.networkSimulator.clearNetwork();
                }
                break;
            case 'sandbox-tab':
                if (window.sandbox) {
                    window.sandbox.clearConsole();
                }
                break;
        }
    }

    displayWelcomeMessage() {
        console.log('%c╔════════════════════════════════════════════╗', 'color: #2196F3');
        console.log('%c║   QCNS Platform - Quantum Computing       ║', 'color: #2196F3');
        console.log('%c║   Circuit & Network Simulator v2.0        ║', 'color: #2196F3');
        console.log('%c╚════════════════════════════════════════════╝', 'color: #2196F3');
        console.log('%c\nFeatures:', 'color: #4CAF50; font-weight: bold');
        console.log('%c  • Modular Circuit Simulator', 'color: #4CAF50');
        console.log('%c  • Instance-based Network Node Editing', 'color: #4CAF50');
        console.log('%c  • Programmatic JS Sandbox', 'color: #4CAF50');
        console.log('%c  • OpenQASM v3 Support', 'color: #4CAF50');
        console.log('%c\nKeyboard Shortcuts:', 'color: #FF9800; font-weight: bold');
        console.log('%c  Ctrl+1/2/3 - Switch Tabs', 'color: #FF9800');
        console.log('%c  Ctrl+R     - Run Simulation', 'color: #FF9800');
        console.log('%c  Ctrl+K     - Clear', 'color: #FF9800');
        console.log('%c  Ctrl+Enter - Execute (Sandbox)', 'color: #FF9800');
        console.log('%c\nDeveloped with ❤️ for Quantum Computing', 'color: #9C27B0');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    showCriticalError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #f44336;
            color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            z-index: 9999;
            max-width: 500px;
            text-align: center;
        `;

        errorDiv.innerHTML = `
            <h2 style="margin: 0 0 15px 0;">Critical Error</h2>
            <p style="margin: 0 0 20px 0;">${message}</p>
            <button onclick="location.reload()"
                    style="background: white; color: #f44336; border: none; padding: 10px 20px;
                           border-radius: 4px; cursor: pointer; font-weight: bold;">
                Reload Page
            </button>
        `;

        document.body.appendChild(errorDiv);
    }

    // Utility methods for global app state
    exportAppState() {
        const state = {
            version: this.version,
            timestamp: new Date().toISOString(),
            circuit: window.mainCircuitComponent ? window.mainCircuitComponent.getCircuit().toJSON() : null,
            network: window.networkSimulator ? window.networkSimulator.getState() : null,
            sandboxCode: document.getElementById('sandbox-code')?.value || ''
        };

        const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qcns-state-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Application state exported', 'success');
    }

    importAppState() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onload = (event) => {
                try {
                    const state = JSON.parse(event.target.result);

                    // Restore circuit
                    if (state.circuit && window.mainCircuitComponent) {
                        const circuit = window.QuantumCircuit.fromJSON(state.circuit);
                        window.mainCircuitComponent.setCircuit(circuit);
                    }

                    // Restore network
                    if (state.network && window.networkSimulator) {
                        window.networkSimulator.setState(state.network);
                    }

                    // Restore sandbox code
                    if (state.sandboxCode) {
                        const sandboxCode = document.getElementById('sandbox-code');
                        if (sandboxCode) sandboxCode.value = state.sandboxCode;
                    }

                    this.showNotification('Application state imported', 'success');
                } catch (error) {
                    this.showNotification(`Import error: ${error.message}`, 'error');
                }
            };

            reader.readAsText(file);
        };

        input.click();
    }

    getInfo() {
        return {
            version: this.version,
            platform: 'QCNS Platform',
            initialized: this.initialized,
            components: {
                tabManager: !!window.tabManager,
                circuitComponent: !!window.mainCircuitComponent,
                networkSimulator: !!window.networkSimulator,
                sandbox: !!window.sandbox
            },
            qcnsLibrary: {
                loaded: !!(window.QuantumCircuit && window.QuantumNetwork),
                classes: [
                    'QuantumCircuit',
                    'QuantumRegister',
                    'ClassicalRegister',
                    'QuantumNetwork',
                    'QuantumSimulator',
                    'QasmTranspiler'
                ].filter(cls => !!window[cls])
            }
        };
    }

    // Debug helper
    debug() {
        console.table(this.getInfo());
        console.log('Active Tab:', window.tabManager?.activeTab);
        console.log('Main Circuit:', window.mainCircuitComponent?.getCircuit());
        console.log('Network State:', window.networkSimulator?.getState());
    }
}

// Initialize application when DOM is loaded
// Handle both early and late script loading
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.qcnsApp = new QCNSApp();
    });
} else {
    // DOM already loaded, initialize immediately
    window.qcnsApp = new QCNSApp();
}

// Expose useful methods to console
window.qcnsDebug = () => window.qcnsApp?.debug();
window.qcnsExport = () => window.qcnsApp?.exportAppState();
window.qcnsImport = () => window.qcnsApp?.importAppState();
window.qcnsInfo = () => console.log(window.qcnsApp?.getInfo());
