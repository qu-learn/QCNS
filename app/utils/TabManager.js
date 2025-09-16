/**
 * Tab Manager - Handles navigation between the three main tabs
 */

class TabManager {
    constructor() {
        this.activeTab = 'circuit-tab';
        this.tabStates = {
            'circuit-tab': null,
            'network-tab': null,
            'sandbox-tab': null
        };
        this.initialize();
    }

    initialize() {
        this.attachEventListeners();
        this.loadTabState();
    }

    attachEventListeners() {
        // Main tab navigation
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Result tabs within each section
        const resultTabs = document.querySelectorAll('.result-tab');
        resultTabs.forEach(tab => {
            tab.addEventListener('click', (e) => this.switchResultTab(e));
        });

        // Save state before page unload
        window.addEventListener('beforeunload', () => this.saveTabState());
    }

    switchTab(tabId) {
        if (!tabId || tabId === this.activeTab) return;

        // Save current tab state
        this.saveCurrentTabState();

        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Deactivate all tab buttons
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });

        // Show selected tab
        const selectedTab = document.getElementById(tabId);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }

        // Activate corresponding button
        const selectedButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
        if (selectedButton) {
            selectedButton.classList.add('active');
        }

        // Update active tab
        this.activeTab = tabId;

        // Restore tab state if available
        this.restoreTabState(tabId);

        // Trigger tab-specific initialization
        this.onTabActivated(tabId);
    }

    switchResultTab(e) {
        const tab = e.target;
        const tabName = tab.dataset.resultTab;
        const parentPanel = tab.closest('.results-panel');

        if (!parentPanel) return;

        // Update active tab
        parentPanel.querySelectorAll('.result-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Update active content
        parentPanel.querySelectorAll('.result-content').forEach(c => c.classList.remove('active'));
        const content = parentPanel.querySelector(`#${tabName}`);
        if (content) content.classList.add('active');
    }

    onTabActivated(tabId) {
        switch (tabId) {
            case 'circuit-tab':
                this.onCircuitTabActivated();
                break;
            case 'network-tab':
                this.onNetworkTabActivated();
                break;
            case 'sandbox-tab':
                this.onSandboxTabActivated();
                break;
        }
    }

    onCircuitTabActivated() {
        // Initialize circuit simulator if not already done
        if (!window.mainCircuitComponent) {
            window.mainCircuitComponent = new CircuitComponent('circuit-simulator-container', {
                qubits: 3,
                depth: 8,
                showControls: true,
                showResults: true
            });
        }
    }

    onNetworkTabActivated() {
        // Network canvas redraw if needed
        if (window.networkSimulator) {
            window.networkSimulator.redrawCanvas();
        }
    }

    onSandboxTabActivated() {
        // Sandbox-specific initialization
        // (handled by sandbox.js)
    }

    saveCurrentTabState() {
        // Save state based on active tab
        switch (this.activeTab) {
            case 'circuit-tab':
                if (window.mainCircuitComponent) {
                    this.tabStates['circuit-tab'] = {
                        qubits: window.mainCircuitComponent.options.qubits,
                        depth: window.mainCircuitComponent.options.depth,
                        gateGrid: JSON.parse(JSON.stringify(window.mainCircuitComponent.gateGrid))
                    };
                }
                break;
            case 'network-tab':
                if (window.networkSimulator) {
                    this.tabStates['network-tab'] = window.networkSimulator.getState();
                }
                break;
            case 'sandbox-tab':
                const sandboxCode = document.getElementById('sandbox-code');
                if (sandboxCode) {
                    this.tabStates['sandbox-tab'] = {
                        code: sandboxCode.value
                    };
                }
                break;
        }
    }

    restoreTabState(tabId) {
        const state = this.tabStates[tabId];
        if (!state) return;

        switch (tabId) {
            case 'circuit-tab':
                if (window.mainCircuitComponent && state.gateGrid) {
                    window.mainCircuitComponent.gateGrid = state.gateGrid;
                    window.mainCircuitComponent.options.qubits = state.qubits;
                    window.mainCircuitComponent.options.depth = state.depth;
                }
                break;
            case 'network-tab':
                if (window.networkSimulator) {
                    window.networkSimulator.setState(state);
                }
                break;
            case 'sandbox-tab':
                const sandboxCode = document.getElementById('sandbox-code');
                if (sandboxCode && state.code) {
                    sandboxCode.value = state.code;
                }
                break;
        }
    }

    saveTabState() {
        // Save to localStorage
        this.saveCurrentTabState();
        try {
            localStorage.setItem('qcns_tab_states', JSON.stringify(this.tabStates));
            localStorage.setItem('qcns_active_tab', this.activeTab);
        } catch (e) {
            console.warn('Could not save tab state to localStorage:', e);
        }
    }

    loadTabState() {
        try {
            const savedStates = localStorage.getItem('qcns_tab_states');
            const savedActiveTab = localStorage.getItem('qcns_active_tab');

            if (savedStates) {
                this.tabStates = JSON.parse(savedStates);
            }

            if (savedActiveTab && savedActiveTab !== this.activeTab) {
                this.switchTab(savedActiveTab);
            }
        } catch (e) {
            console.warn('Could not load tab state from localStorage:', e);
        }
    }

    clearTabState() {
        this.tabStates = {
            'circuit-tab': null,
            'network-tab': null,
            'sandbox-tab': null
        };
        try {
            localStorage.removeItem('qcns_tab_states');
            localStorage.removeItem('qcns_active_tab');
        } catch (e) {
            console.warn('Could not clear tab state from localStorage:', e);
        }
    }
}

// Initialize tab manager when DOM is loaded
// Handle both early and late script loading
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.tabManager = new TabManager();
    });
} else {
    // DOM already loaded, initialize immediately
    window.tabManager = new TabManager();
}
