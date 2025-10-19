/**
 * KeyboardShortcuts - Manages keyboard shortcuts for the application
 * Provides a configurable, extensible keyboard shortcut system
 */

export class KeyboardShortcuts {
    constructor() {
        this.shortcuts = new Map();
        this.enabled = true;
        this.listener = null;
    }

    /**
     * Register a keyboard shortcut
     * @param {string} key - Key combination (e.g., 'Ctrl+1', 'Ctrl+Shift+S')
     * @param {Function} callback - Function to execute
     * @param {Object} options - Additional options
     */
    register(key, callback, options = {}) {
        const normalizedKey = this.normalizeKey(key);
        this.shortcuts.set(normalizedKey, {
            callback,
            description: options.description || '',
            preventDefault: options.preventDefault !== false,
            context: options.context || null
        });
    }

    /**
     * Unregister a keyboard shortcut
     * @param {string} key - Key combination to remove
     */
    unregister(key) {
        const normalizedKey = this.normalizeKey(key);
        this.shortcuts.delete(normalizedKey);
    }

    /**
     * Register multiple shortcuts at once
     * @param {Object} shortcuts - Object mapping keys to callbacks
     */
    registerMany(shortcuts) {
        Object.entries(shortcuts).forEach(([key, config]) => {
            if (typeof config === 'function') {
                this.register(key, config);
            } else {
                this.register(key, config.callback, config.options || {});
            }
        });
    }

    /**
     * Start listening for keyboard events
     * @param {Element} element - DOM element to attach listener (defaults to document)
     */
    enable(element = document) {
        if (this.listener) {
            this.disable();
        }

        this.listener = (event) => this.handleKeyDown(event);
        element.addEventListener('keydown', this.listener);
        this.enabled = true;
    }

    /**
     * Stop listening for keyboard events
     * @param {Element} element - DOM element to remove listener from
     */
    disable(element = document) {
        if (this.listener) {
            element.removeEventListener('keydown', this.listener);
            this.listener = null;
        }
        this.enabled = false;
    }

    /**
     * Handle keydown events
     * @private
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyDown(event) {
        if (!this.enabled) return;

        const keyCombo = this.getKeyComboFromEvent(event);
        const shortcut = this.shortcuts.get(keyCombo);

        if (shortcut) {
            // Check context if specified
            if (shortcut.context && !shortcut.context()) {
                return;
            }

            // Prevent default if configured
            if (shortcut.preventDefault) {
                event.preventDefault();
            }

            // Execute callback
            shortcut.callback(event);
        }
    }

    /**
     * Extract key combination from keyboard event
     * @private
     * @param {KeyboardEvent} event - Keyboard event
     * @returns {string} Normalized key combination
     */
    getKeyComboFromEvent(event) {
        const parts = [];

        if (event.ctrlKey || event.metaKey) parts.push('ctrl');
        if (event.altKey) parts.push('alt');
        if (event.shiftKey) parts.push('shift');

        const key = event.key.toLowerCase();
        parts.push(key);

        return parts.join('+');
    }

    /**
     * Normalize key combination string
     * @private
     * @param {string} key - Key combination string
     * @returns {string} Normalized key combination
     */
    normalizeKey(key) {
        return key
            .toLowerCase()
            .replace(/command|cmd/g, 'ctrl')
            .replace(/\s+/g, '')
            .split('+')
            .sort((a, b) => {
                const order = ['ctrl', 'alt', 'shift'];
                const aIndex = order.indexOf(a);
                const bIndex = order.indexOf(b);
                if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                if (aIndex !== -1) return -1;
                if (bIndex !== -1) return 1;
                return 0;
            })
            .join('+');
    }

    /**
     * Get all registered shortcuts
     * @returns {Array} Array of shortcut info
     */
    getAll() {
        const shortcuts = [];
        this.shortcuts.forEach((config, key) => {
            shortcuts.push({
                key,
                description: config.description
            });
        });
        return shortcuts;
    }

    /**
     * Clear all registered shortcuts
     */
    clear() {
        this.shortcuts.clear();
    }

    /**
     * Check if a shortcut is registered
     * @param {string} key - Key combination
     * @returns {boolean} True if registered
     */
    has(key) {
        const normalizedKey = this.normalizeKey(key);
        return this.shortcuts.has(normalizedKey);
    }

    /**
     * Create a standard set of application shortcuts
     * @param {Object} handlers - Object with handler functions
     * @returns {KeyboardShortcuts} This instance for chaining
     */
    setupStandardShortcuts(handlers) {
        this.registerMany({
            'Ctrl+1': {
                callback: () => handlers.switchTab && handlers.switchTab('circuit-tab'),
                options: { description: 'Switch to Circuit Simulator' }
            },
            'Ctrl+2': {
                callback: () => handlers.switchTab && handlers.switchTab('network-tab'),
                options: { description: 'Switch to Network Simulator' }
            },
            'Ctrl+3': {
                callback: () => handlers.switchTab && handlers.switchTab('sandbox-tab'),
                options: { description: 'Switch to JS Sandbox' }
            },
            'Ctrl+r': {
                callback: () => handlers.run && handlers.run(),
                options: { description: 'Run simulation in active tab' }
            },
            'Ctrl+k': {
                callback: () => handlers.clear && handlers.clear(),
                options: { description: 'Clear active tab' }
            },
            'Ctrl+Enter': {
                callback: () => handlers.execute && handlers.execute(),
                options: {
                    description: 'Execute code in Sandbox',
                    context: () => handlers.isInSandbox && handlers.isInSandbox()
                }
            }
        });

        return this;
    }

    /**
     * Get help text for all shortcuts
     * @returns {string} Formatted help text
     */
    getHelpText() {
        const shortcuts = this.getAll();
        if (shortcuts.length === 0) {
            return 'No keyboard shortcuts registered';
        }

        return shortcuts
            .map(s => `${s.key.toUpperCase()}: ${s.description}`)
            .join(' | ');
    }
}
