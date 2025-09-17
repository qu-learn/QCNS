/**
 * FileExporter - Handles file download operations
 * Creates downloadable files from various data formats
 */

export class FileExporter {
    /**
     * Download data as JSON file
     * @param {Object} data - Data to export
     * @param {string} filename - Name of the file to download
     */
    downloadAsJSON(data, filename = 'export.json') {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        this.downloadBlob(blob, filename);
    }

    /**
     * Download QASM code as .qasm file
     * @param {string} qasmCode - QASM code to export
     * @param {string} filename - Name of the file to download
     */
    downloadAsQASM(qasmCode, filename = 'circuit.qasm') {
        const blob = new Blob([qasmCode], { type: 'text/plain' });
        this.downloadBlob(blob, filename);
    }

    /**
     * Download text content as file
     * @param {string} content - Text content to export
     * @param {string} filename - Name of the file to download
     * @param {string} mimeType - MIME type of the file
     */
    downloadAsText(content, filename = 'export.txt', mimeType = 'text/plain') {
        const blob = new Blob([content], { type: mimeType });
        this.downloadBlob(blob, filename);
    }

    /**
     * Download a Blob as a file
     * @param {Blob} blob - Blob to download
     * @param {string} filename - Name of the file
     */
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();

        // Cleanup
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
    }

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} Success status
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            return false;
        }
    }
}
