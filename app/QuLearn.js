
class QuLearnApp {
    constructor() {
        this.validTabs = ['circuit-tab', 'network-tab', 'sandbox-tab']
    }

    init() {
    }

    setState(tab, state) {
        // Validate tab name
        if (!this.validTabs.includes(tab)) {
            console.error(`Invalid tab name: "${tab}". Valid tabs are:`, this.validTabs)
            return
        }

        console.log('Setting QCNS state for tab:', tab, 'state type:', typeof state, 'state value:', state)

        // Handle undefined or null state
        if (state === undefined || state === null || state === 'undefined' || state === 'null') {
            console.log('No state provided, just switching to tab:', tab)
            window.tabManager.switchTab(tab)
            return
        }

        // Deep clone state to avoid read-only issues
        try {
            state = JSON.parse(JSON.stringify(state))
        } catch (error) {
            console.error('Failed to parse state:', error)
            window.tabManager.switchTab(tab)
            return
        }

        console.log('Parsed state:', state)

        // Switch to the specified tab directly
        window.tabManager.switchTab(tab)

        // Apply state after component initialization with retry mechanism
        this._applyStateWithRetry(tab, state, 0)
    }

    _applyStateWithRetry(tab, state, attempt) {
        const maxAttempts = 10
        const retryDelay = 50

        setTimeout(() => {
            let success = false

            switch (tab) {
                case 'circuit-tab':
                    if (window.mainCircuitComponent) {
                        console.log('Loading circuit state (attempt ' + (attempt + 1) + ')')
                        window.mainCircuitComponent.importCircuitJSON(state)
                        success = true
                    }
                    break
                case 'network-tab':
                    if (window.networkSimulator) {
                        console.log('Loading network state (attempt ' + (attempt + 1) + ')')
                        window.networkSimulator.importNetworkJSON(state)
                        success = true
                    }
                    break
                case 'sandbox-tab':
                    const codeEditor = document.getElementById('sandbox-code')
                    if (codeEditor) {
                        console.log('Loading sandbox state (attempt ' + (attempt + 1) + ')')
                        codeEditor.value = state
                        success = true
                    }
                    break
            }

            // Retry if component not ready yet
            if (!success && attempt < maxAttempts) {
                console.log('Component not ready, retrying... (attempt ' + (attempt + 1) + '/' + maxAttempts + ')')
                this._applyStateWithRetry(tab, state, attempt + 1)
            } else if (!success) {
                console.error('Failed to load state after ' + maxAttempts + ' attempts')
            }
        }, attempt === 0 ? 100 : retryDelay)
    }

    getState() {
        // Get state based on active tab
        switch (window.tabManager.activeTab) {
            case 'circuit-tab':
                return window.mainCircuitComponent.exportCircuitJSON(true)
            case 'network-tab':
                return window.networkSimulator.exportNetworkJSON(true)
            case 'sandbox-tab':
                return document.getElementById('sandbox-code').value
        }
        return null
    }

    getValidTabs() {
        return this.validTabs
    }

    getCurrentTab() {
        return window.tabManager ? window.tabManager.activeTab : null
    }

    onQCNSAppReady() {
        console.log('QCNSApp is ready')
        console.log('Valid tabs:', this.validTabs)
        console.log('Current tab:', this.getCurrentTab())

        // Notify parent that QCNS is ready
        window.parent.postMessage({
            type: 'qcns-initialized',
            validTabs: this.validTabs,
            currentTab: this.getCurrentTab()
        }, '*')
    }
}

// Handle embedding scenario
if (window.parent !== window) {
    window.qulearn = new QuLearnApp()
    window.qulearn.init()
}
