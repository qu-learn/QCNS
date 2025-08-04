# QCNS
# QCNS - Quantum Circuit & Network Simulator

A comprehensive quantum computing simulation platform featuring both circuit simulation and network simulation capabilities, now available as separate deployable modules.

## Project Structure

The project has been separated into modular components for flexible deployment:

### Core Files
- **`quantum-core.js`** - Shared quantum mathematics library
- **`styles.css`** - Shared CSS styling for both simulators

### Simulator Modules
- **`CircuitSimulator.html`** - Standalone quantum circuit simulator
- **`NetworkSimulator.html`** - Standalone quantum network simulator
- **`index.html`** - Original combined interface (legacy)

### Deployment Files
- **`iframe-test.html`** - Example of iframe deployment

## Features

### Circuit Simulator
- **Drag & Drop Interface**: Intuitive gate placement
- **Quantum Gates**: H, X, Y, Z, S, T, CNOT, CZ, SWAP, TOFFOLI
- **Real-time Simulation**: Instant state vector calculation
- **Visualization**: State vector display, probability charts, Bloch sphere
- **Import/Export**: Save and load circuit configurations

### Network Simulator
- **Multi-Node Networks**: Create and manage quantum network nodes
- **Entanglement Configuration**: Set up EPR pairs between nodes
- **Individual Node Circuits**: Design circuits for each network node
- **Network Circuit Generation**: Combine individual circuits into unified network
- **Network Simulation**: Simulate entire quantum networks

## Deployment Options

### Option 1: Iframe Deployment (Recommended)
Deploy each simulator as an independent iframe:

```html
<!-- Circuit Simulator -->
<iframe src="CircuitSimulator.html" width="100%" height="800px"></iframe>

<!-- Network Simulator -->
<iframe src="NetworkSimulator.html" width="100%" height="800px"></iframe>
```

### Option 2: Direct Integration
Include the HTML files directly in your web application or copy the relevant code sections.

### Option 3: Legacy Combined Interface
Use `index.html` for the original tabbed interface with both simulators.

## Dependencies

- **Chart.js** (CDN): For probability visualization charts
- **Math.js** (CDN): For mathematical operations
- Modern web browser with ES6+ support

## File Dependencies

Each simulator requires:
1. `quantum-core.js` - Core quantum computation library
2. `styles.css` - Styling
3. Chart.js and Math.js from CDN

## Getting Started

1. **Local Development**:
   ```bash
   # Clone the repository
   git clone <repository-url>
   cd QCNS
   
   # Open in browser
   open iframe-test.html
   ```

2. **Web Deployment**:
   - Upload all files to your web server
   - Ensure proper MIME types for .js and .css files
   - Test iframe integration using `iframe-test.html`

## Usage Examples

### Circuit Simulator
1. Drag gates from the palette to the circuit grid
2. Configure multi-qubit gates (CNOT, SWAP, etc.)
3. Click "Simulate" to run the quantum simulation
4. View results in State Vector, Probabilities, or Bloch Sphere tabs
5. Export/import circuit configurations as JSON

### Network Simulator
1. Add network nodes using "Add Node" button
2. Design individual circuits for each node
3. Configure entanglement pairs between nodes
4. Generate the combined network circuit
5. Run network simulation to see entangled state evolution

## Technical Details

### Quantum Core Library
The `quantum-core.js` file provides:
- Complex number arithmetic
- Matrix operations (multiplication, Kronecker product)
- Quantum gate definitions
- State vector simulation
- Quantum measurement simulation

### Validation Functions
Both simulators include validation for:
- Circuit dimensions (1-8 qubits, 1-20 steps)
- Gate placement constraints
- Entanglement configuration validity
- JSON import/export format validation

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

See LICENSE file for details.
