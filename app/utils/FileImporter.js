/**
 * FileImporter - Handles file upload and reading operations
 * Provides utilities for importing files from user's file system
 */

export class FileImporter {
    /**
     * Load a file from the user's file system
     * @param {string} acceptTypes - Accepted file types (e.g., '.json,.qasm')
     * @returns {Promise<Object>} Promise resolving to {content: string, filename: string, type: string}
     */
    loadFromFile(acceptTypes = '*') {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = acceptTypes;
            input.style.display = 'none';

            input.onchange = async (event) => {
                const file = event.target.files[0];
                if (!file) {
                    reject(new Error('No file selected'));
                    return;
                }

                try {
                    const content = await this.readFile(file);
                    resolve({
                        content,
                        filename: file.name,
                        type: file.type,
                        size: file.size
                    });
                } catch (error) {
                    reject(error);
                } finally {
                    document.body.removeChild(input);
                }
            };

            input.oncancel = () => {
                document.body.removeChild(input);
                reject(new Error('File selection cancelled'));
            };

            document.body.appendChild(input);
            input.click();
        });
    }

    /**
     * Read a File object as text
     * @param {File} file - File object to read
     * @returns {Promise<string>} Promise resolving to file content
     */
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                resolve(event.target.result);
            };

            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };

            reader.readAsText(file);
        });
    }

    /**
     * Load and parse JSON file
     * @param {string} acceptTypes - Accepted file types
     * @returns {Promise<Object>} Promise resolving to parsed JSON data
     */
    async loadJSONFile(acceptTypes = '.json') {
        const { content, filename } = await this.loadFromFile(acceptTypes);
        try {
            return {
                data: JSON.parse(content),
                filename
            };
        } catch (error) {
            throw new Error(`Failed to parse JSON: ${error.message}`);
        }
    }

    /**
     * Load QASM file
     * @returns {Promise<Object>} Promise resolving to {content: string, filename: string}
     */
    async loadQASMFile() {
        return await this.loadFromFile('.qasm,.txt');
    }

    /**
     * Read text from clipboard
     * @returns {Promise<string>} Promise resolving to clipboard text
     */
    async readFromClipboard() {
        try {
            return await navigator.clipboard.readText();
        } catch (error) {
            throw new Error('Failed to read from clipboard. Please grant clipboard permission.');
        }
    }
}
