
class QuLearnApp {
    init() {
    }

    setState(tab, state) {
        console.log('Setting QCNS state for tab:', tab, state)

        // Switch to the specified tab
        const tabs = ['circuit-tab', 'network-tab', 'sandbox-tab']
        tabs.splice(tabs.indexOf(tab), 1)
        if (tabs[0] === 'network-tab')
            tabs[0] = 'sandbox-tab'
        window.tabManager.switchTab(tabs[0])
        window.tabManager.switchTab(tab)

        // Apply state based on tab
        if (!state) return
        switch (tab) {
            case 'circuit-tab':
                window.mainCircuitComponent.importCircuitJSON(state)
                break
            case 'network-tab':
                window.networkSimulator.importNetworkJSON(state)
                break
            case 'sandbox-tab':
                document.getElementById('sandbox-code').value = state
                break
        }
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

    onQCNSAppReady() {
        console.log('QCNSApp is ready')

        // Notify parent that QCNS is ready
        window.parent.postMessage({ type: 'qcns-initialized' }, '*')
    }
}

// Handle embedding scenario
if (window.parent !== window) {
    window.qulearn = new QuLearnApp()
    window.qulearn.init()
}
