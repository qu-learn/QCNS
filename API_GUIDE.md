# QCNS API Reference

Complete API documentation for the QCNS library.

## Table of Contents
1. [QuantumCircuit](#quantumcircuit)
2. [QuantumNetwork](#quantumnetwork)
3. [QuantumRegister](#quantumregister)
4. [Utility Classes](#utility-classes)

---

## QuantumCircuit

Main class for quantum circuit construction and simulation.

### Constructor

```javascript
new QuantumCircuit(qubits, classicalBits)
```

**Parameters:**
- `qubits` (number | QuantumRegister): Number of qubits or QuantumRegister object
- `classicalBits` (number | ClassicalRegister): Number of classical bits or ClassicalRegister object

**Examples:**
```javascript
// Simple construction
const circuit = new QuantumCircuit(3, 3);

// Using registers
const qreg = new QuantumRegister(3, 'q');
const creg = new ClassicalRegister(3, 'c');
const circuit = new QuantumCircuit(qreg, creg);
```

---

### Single-Qubit Gates

#### Pauli Gates

**`x(qubit)`** - Pauli-X (NOT) gate
```javascript
circuit.x(0);  // Apply X to qubit 0
```

**`y(qubit)`** - Pauli-Y gate
```javascript
circuit.y(1);
```

**`z(qubit)`** - Pauli-Z gate
```javascript
circuit.z(2);
```

#### Hadamard Gate

**`h(qubit)`** - Hadamard gate (creates superposition)
```javascript
circuit.h(0);  // |0⟩ → (|0⟩ + |1⟩)/√2
```

#### Phase Gates

**`s(qubit)`** - S gate (√Z)
```javascript
circuit.s(0);
```

**`sdg(qubit)`** - S† gate (inverse of S)
```javascript
circuit.sdg(0);
```

**`t(qubit)`** - T gate (√S)
```javascript
circuit.t(0);
```

**`tdg(qubit)`** - T† gate (inverse of T)
```javascript
circuit.tdg(0);
```

#### Rotation Gates

**`rx(qubit, theta)`** - Rotation around X-axis
```javascript
circuit.rx(0, Math.PI/4);  // Rotate by π/4
```

**`ry(qubit, theta)`** - Rotation around Y-axis
```javascript
circuit.ry(0, Math.PI/2);
```

**`rz(qubit, theta)`** - Rotation around Z-axis
```javascript
circuit.rz(0, Math.PI);
```

**Parameters:**
- `qubit` (number): Target qubit index
- `theta` (number): Rotation angle in radians

---

### Two-Qubit Gates

**`cx(control, target)`** - Controlled-NOT (CNOT)
```javascript
circuit.cx(0, 1);  // Control: qubit 0, Target: qubit 1
```

**`cy(control, target)`** - Controlled-Y
```javascript
circuit.cy(0, 1);
```

**`cz(control, target)`** - Controlled-Z
```javascript
circuit.cz(0, 1);
```

**`swap(qubit1, qubit2)`** - SWAP gate
```javascript
circuit.swap(0, 1);
```

**`ch(control, target)`** - Controlled-Hadamard
```javascript
circuit.ch(0, 1);
```

---

### Three-Qubit Gates

**`ccx(control1, control2, target)`** - Toffoli (CCNOT)
```javascript
circuit.ccx(0, 1, 2);
```

Aliases: `toffoli()`, `ccnot()`

---

### Measurement

**`measure(qubit, classicalBit)`** - Measure single qubit
```javascript
circuit.measure(0, 0);  // Measure qubit 0 into classical bit 0
```

**`measure_all()`** - Measure all qubits
```javascript
circuit.measure_all();  // Measure each qubit into corresponding classical bit
```

---

### Circuit Operations

**`addGate(name, column, qubits, options)`** - Low-level gate addition
```javascript
// Add H gate at column 0
circuit.addGate('h', 0, 0);

// Add CNOT at column 1
circuit.addGate('cx', 1, [0, 1]);

// Add rotation with parameter
circuit.addGate('rx', 2, 0, { params: { theta: Math.PI/4 } });
```

**`barrier(qubits)`** - Add barrier (visual separator)
```javascript
circuit.barrier();           // All qubits
circuit.barrier([0, 1]);     // Specific qubits
```

---

### Simulation

**`run(shots)`** - Run circuit simulation
```javascript
const results = circuit.run();
const results = circuit.run(1024);  // With specific shot count
```

**Returns:**
```javascript
{
    probabilities: { '00': 0.5, '11': 0.5 },  // Measurement probabilities
    stateVector: [...],                        // Complex amplitudes
    unitaryMatrix: [...],                      // Full unitary
    numQubits: 2                              // Number of qubits
}
```

---

### Export/Import

**`qasm()`** - Export to OpenQASM 3.0
```javascript
const qasmCode = circuit.qasm();
console.log(qasmCode);
```

**`toJSON()`** - Export to JSON
```javascript
const jsonData = circuit.toJSON();
```

**`QuantumCircuit.fromJSON(data)`** - Import from JSON (static)
```javascript
const circuit = QuantumCircuit.fromJSON(jsonData);
```

---

### Properties

```javascript
circuit.numQubits        // Number of qubits
circuit.numClassicalBits // Number of classical bits
circuit.gates            // 2D array of gates
circuit.qreg             // QuantumRegister object
circuit.creg             // ClassicalRegister object
```

---

### Method Chaining

All gate methods return `this`, enabling chaining:

```javascript
circuit
    .h(0)
    .cx(0, 1)
    .h(1)
    .measure_all()
    .run();
```

---

## QuantumNetwork

Manage multi-node quantum networks.

### Constructor

```javascript
new QuantumNetwork(name)
```

**Parameters:**
- `name` (string): Network name

**Example:**
```javascript
const network = new QuantumNetwork('MyNetwork');
```

---

### Node Management

**`addNode(name, numQubits, position)`** - Add network node
```javascript
const alice = network.addNode('Alice', 2, { x: 100, y: 100 });
```

**Returns:** QuantumNetworkNode object

**`getNode(nodeId)`** - Get node by ID
```javascript
const node = network.getNode('node-1');
```

**`removeNode(nodeId)`** - Remove node
```javascript
network.removeNode('node-1');
```

---

### Entanglement

**`entangle(nodeId1, qubit1, nodeId2, qubit2)`** - Create entanglement
```javascript
network.entangle(alice.id, 0, bob.id, 0);
```

**`getEntanglements()`** - Get all entanglements
```javascript
const entanglements = network.getEntanglements();
```

---

### Simulation

**`toCircuit()`** - Convert network to global circuit
```javascript
const globalCircuit = network.toCircuit();
const results = globalCircuit.run();
```

---

### QuantumNetworkNode

Properties of a network node:

```javascript
node.id          // Unique node ID
node.name        // Node name
node.numQubits   // Number of qubits
node.circuit     // QuantumCircuit object
node.position    // { x, y } coordinates
```

**Example:**
```javascript
const alice = network.addNode('Alice', 2);
alice.circuit.h(0);
alice.circuit.cx(0, 1);
```

---

## QuantumRegister

Quantum register management.

### Constructor

```javascript
new QuantumRegister(size, name)
```

**Parameters:**
- `size` (number): Number of qubits
- `name` (string): Register name (default: 'q')

**Example:**
```javascript
const qreg = new QuantumRegister(3, 'myQubits');
```

### Properties

```javascript
qreg.size  // Number of qubits
qreg.name  // Register name
```

---

## ClassicalRegister

Classical bit register.

### Constructor

```javascript
new ClassicalRegister(size, name)
```

**Parameters:**
- `size` (number): Number of classical bits
- `name` (string): Register name (default: 'c')

**Example:**
```javascript
const creg = new ClassicalRegister(3, 'results');
```

### Properties

```javascript
creg.size  // Number of bits
creg.name  // Register name
```

---

## Utility Classes

### CircuitMetrics

Analyze circuit properties.

```javascript
import { CircuitMetrics } from './lib/utils/CircuitMetrics.js';

const metrics = new CircuitMetrics();
const analysis = metrics.calculateAll(circuit);
```

**Returns:**
```javascript
{
    width: 3,                    // Number of qubits
    depth: 5,                    // Circuit depth
    gateCount: 12,               // Total gates
    gateCounts: {                // By type
        h: 3,
        cx: 2,
        measure: 3
    },
    executionCost: 45,           // Estimated cost
    stateSpaceDimension: 8       // 2^n
}
```

**Methods:**
- `calculateAll(circuit)` - Complete analysis
- `calculateDepth(gates)` - Circuit depth
- `calculateWidth(circuit)` - Number of qubits
- `calculateExecutionCost(gates)` - Cost estimation
- `formatForDisplay(metrics)` - Human-readable format

---

### CircuitSerializer

Serialize circuits to various formats.

```javascript
import { CircuitSerializer } from './lib/utils/CircuitSerializer.js';

const serializer = new CircuitSerializer();
```

**Methods:**

**`toJSON(circuit, metadata)`**
```javascript
const jsonData = serializer.toJSON(circuit, { author: 'Alice' });
```

**`fromJSON(jsonData)`**
```javascript
const circuit = serializer.fromJSON(jsonData);
```

**`toQASM(circuit)`**
```javascript
const qasmCode = serializer.toQASM(circuit);
```

**`fromQASM(qasmCode)`**
```javascript
const circuit = serializer.fromQASM(qasmCode);
```

---

### BlochSphereCalculator

Calculate Bloch sphere coordinates.

```javascript
import { BlochSphereCalculator } from './lib/utils/BlochSphereCalculator.js';

const calc = new BlochSphereCalculator();
```

**Methods:**

**`computeReducedDensityMatrix(stateVector, qubitIndex, totalQubits)`**
```javascript
const rho = calc.computeReducedDensityMatrix(stateVector, 0, 2);
```

**`densityMatrixToBlochVector(rho)`**
```javascript
const bloch = calc.densityMatrixToBlochVector(rho);
// Returns: { x, y, z, purity }
```

**`stateVectorToBlochVector(stateVector)`**
```javascript
const bloch = calc.stateVectorToBlochVector([
    { re: 1/Math.sqrt(2), im: 0 },
    { re: 1/Math.sqrt(2), im: 0 }
]);
```

**`identifyState(blochVector)`**
```javascript
const stateName = calc.identifyState(bloch);
// Returns: '|0⟩', '|1⟩', '|+⟩', '|−⟩', '|+i⟩', '|−i⟩', or null
```

---

### CircuitBuilder

Convert gate grids to circuits.

```javascript
import { CircuitBuilder } from './lib/utils/CircuitBuilder.js';

const builder = new CircuitBuilder();
```

**Methods:**

**`buildCircuitFromGrid(gateGrid, numQubits, numDepth)`**
```javascript
const gateGrid = [
    [{ name: 'H' }, null, { name: 'measure' }],
    [{ name: 'CNOT', target: 1 }, null, { name: 'measure' }]
];

const circuit = builder.buildCircuitFromGrid(gateGrid, 2, 3);
```

**`validateGateGrid(gateGrid, expectedQubits, expectedDepth)`**
```javascript
const validation = builder.validateGateGrid(gateGrid, 2, 3);
// Returns: { valid: true/false, errors: [...] }
```

---

## Complex Numbers

All quantum states use complex numbers in the format:

```javascript
{ re: real_part, im: imaginary_part }
```

**Example:**
```javascript
const amplitude = { re: 0.707, im: 0 };  // 1/√2
const phase = { re: 0, im: 1 };          // i
```

### ComplexMath Utility

```javascript
import { ComplexMath } from './lib/quantum/ComplexMath.js';

const sum = ComplexMath.add(c1, c2);
const product = ComplexMath.multiply(c1, c2);
const conjugate = ComplexMath.conjugate(c1);
const magnitude = ComplexMath.abs(c1);
```

---

## Error Handling

All methods validate inputs and throw descriptive errors:

```javascript
try {
    circuit.cx(0, 5);  // Invalid qubit index
} catch (error) {
    console.error('Error:', error.message);
    // "Qubit index 5 out of range"
}
```

Common errors:
- Invalid qubit indices
- Invalid gate parameters
- Measurement errors
- QASM parsing errors

---

## Performance Tips

1. **Qubit Limit**: Keep circuits under 10-12 qubits (state space grows as 2^n)
2. **Gate Count**: Minimize gates for faster simulation
3. **Reuse Circuits**: Create circuit once, modify and rerun
4. **Batch Operations**: Chain methods instead of multiple calls

---

## Version Information

```javascript
import { version } from './lib/index.js';
console.log('QCNS version:', version);  // "2.0.0"
```

---

## Full Example

```javascript
import {
    QuantumCircuit,
    QuantumNetwork,
    CircuitMetrics,
    BlochSphereCalculator
} from './lib/index.js';

// Create circuit
const circuit = new QuantumCircuit(3, 3);

// Build GHZ state
circuit
    .h(0)
    .cx(0, 1)
    .cx(1, 2)
    .measure_all();

// Run simulation
const results = circuit.run();

// Analyze
const metrics = new CircuitMetrics();
const analysis = metrics.calculateAll(circuit);

// Calculate Bloch vectors
const calc = new BlochSphereCalculator();
const bloch0 = calc.computeAllBlochVectors(results.stateVector, 3);

// Export
const qasmCode = circuit.qasm();
const jsonData = circuit.toJSON();

console.log('Results:', results.probabilities);
console.log('Analysis:', analysis);
console.log('Bloch vectors:', bloch0);
console.log('QASM:', qasmCode);
```

---

For usage examples, see [USER_GUIDE.md](USER_GUIDE.md)
