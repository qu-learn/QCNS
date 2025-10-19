# QCNS User Guide

Complete guide to using the Quantum Circuit and Network Simulator.

## Table of Contents
1. [Quick Start](#quick-start)
2. [Basic Circuits](#basic-circuits)
3. [Advanced Circuits](#advanced-circuits)
4. [Quantum Networks](#quantum-networks)
5. [Measurement & Results](#measurement--results)
6. [Export & Import](#export--import)

---

## Quick Start

### Using the Visual Interface

1. Open `app/index.html` in a web browser
2. Navigate using the three tabs:
   - **Circuit Simulator**: Drag-and-drop circuit building
   - **Network Simulator**: Multi-node quantum networks
   - **JS Sandbox**: Programmatic circuit creation

### Using the Library Programmatically

```javascript
import { QuantumCircuit } from './lib/index.js';

// Create a 2-qubit circuit
const circuit = new QuantumCircuit(2, 2);
circuit.h(0);         // Hadamard on qubit 0
circuit.cx(0, 1);     // CNOT from qubit 0 to 1
circuit.measure_all(); // Measure all qubits

// Run simulation
const results = circuit.run();
console.log(results.probabilities);
```

---

## Basic Circuits

### Example 1: Bell State (Quantum Entanglement)

Creates a maximally entangled state where measuring one qubit instantly determines the other.

**Visual Method:**
1. Add 2 qubits, depth 3
2. Place **H** gate on qubit 0, column 0
3. Place **CNOT** gate on qubit 0, column 1 (target: qubit 1)
4. Place **M** (measure) on both qubits, column 2

**Code Method:**
```javascript
const circuit = new QuantumCircuit(2, 2);
circuit.h(0);
circuit.cx(0, 1);
circuit.measure(0, 0);
circuit.measure(1, 1);

const results = circuit.run();
// Results: 50% chance of |00⟩, 50% chance of |11⟩
console.log('Probabilities:', results.probabilities);
```

**Expected Results:**
- States: `|00⟩` and `|11⟩` each with ~50% probability
- Bloch spheres show entangled state

---

### Example 2: Superposition

Creates an equal superposition of all basis states.

**Code:**
```javascript
const circuit = new QuantumCircuit(3, 3);

// Apply Hadamard to all qubits
circuit.h(0);
circuit.h(1);
circuit.h(2);

circuit.measure_all();

const results = circuit.run();
// Results: Equal probability for all 8 states (000, 001, 010, ..., 111)
console.log('Probabilities:', results.probabilities);
```

**Expected Results:**
- 8 states, each with 12.5% (1/8) probability

---

### Example 3: Quantum Interference

Demonstrates destructive interference in quantum mechanics.

**Code:**
```javascript
const circuit = new QuantumCircuit(1, 1);

// Create superposition
circuit.h(0);

// Apply phase flip
circuit.z(0);

// Interference
circuit.h(0);

circuit.measure(0, 0);

const results = circuit.run();
// Result: 100% in |1⟩ state due to interference
console.log('Probabilities:', results.probabilities);
```

---

## Advanced Circuits

### Example 4: GHZ State (3-Qubit Entanglement)

The GHZ state is a maximally entangled state of 3 qubits.

**Code:**
```javascript
const circuit = new QuantumCircuit(3, 3);

// Create GHZ state: (|000⟩ + |111⟩) / √2
circuit.h(0);
circuit.cx(0, 1);
circuit.cx(1, 2);

circuit.measure_all();

const results = circuit.run();
// Results: 50% |000⟩, 50% |111⟩
console.log('GHZ state probabilities:', results.probabilities);
```

---

### Example 5: Quantum Teleportation

Teleport a quantum state from qubit 0 to qubit 2 using entanglement.

**Code:**
```javascript
const circuit = new QuantumCircuit(3, 3);

// Prepare state to teleport (e.g., |+⟩ state)
circuit.h(0);

// Create Bell pair (qubits 1 and 2)
circuit.h(1);
circuit.cx(1, 2);

// Bell measurement on qubits 0 and 1
circuit.cx(0, 1);
circuit.h(0);
circuit.measure(0, 0);
circuit.measure(1, 1);

// Note: In a real implementation, classical control would apply corrections
// Based on measurement results. This is a simplified version.

const results = circuit.run();
console.log('Teleportation results:', results.probabilities);
```

---

### Example 6: Quantum Fourier Transform (2 qubits)

**Code:**
```javascript
const circuit = new QuantumCircuit(2, 2);

// Prepare initial state |11⟩
circuit.x(0);
circuit.x(1);

// QFT circuit
circuit.h(1);
circuit.addGate('cp', 0, [0, 1], { params: { theta: Math.PI/2 } });
circuit.h(0);

// Swap qubits
circuit.swap(0, 1);

circuit.measure_all();

const results = circuit.run();
console.log('QFT results:', results.probabilities);
```

---

### Example 7: Grover's Algorithm (2 qubits)

Search for a marked item in an unsorted database.

**Code:**
```javascript
const circuit = new QuantumCircuit(2, 2);

// Initialize superposition
circuit.h(0);
circuit.h(1);

// Oracle (marks state |11⟩)
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
// Results: High probability of finding |11⟩
console.log('Grover results:', results.probabilities);
```

---

### Example 8: Rotation Gates

Use parameterized rotation gates.

**Code:**
```javascript
const circuit = new QuantumCircuit(1, 1);

// Rotate around X-axis by π/4
circuit.rx(0, Math.PI/4);

// Rotate around Y-axis by π/2
circuit.ry(0, Math.PI/2);

// Rotate around Z-axis by π
circuit.rz(0, Math.PI);

circuit.measure(0, 0);

const results = circuit.run();
console.log('Rotation results:', results.probabilities);
```

---

## Quantum Networks

### Example 9: Two-Node Network

**Code:**
```javascript
const network = new QuantumNetwork('MyNetwork');

// Add two nodes
const alice = network.addNode('Alice', 2);
const bob = network.addNode('Bob', 2);

// Build circuits on each node
alice.circuit.h(0);
alice.circuit.cx(0, 1);

bob.circuit.h(0);
bob.circuit.h(1);

// Create entanglement between nodes
network.entangle(alice.id, 0, bob.id, 0);

// Convert to global circuit and run
const globalCircuit = network.toCircuit();
const results = globalCircuit.run();

console.log('Network results:', results.probabilities);
```

---

### Example 10: Quantum Repeater Network

**Code:**
```javascript
const network = new QuantumNetwork('Repeater');

// Create three nodes: sender, repeater, receiver
const sender = network.addNode('Sender', 2);
const repeater = network.addNode('Repeater', 2);
const receiver = network.addNode('Receiver', 2);

// Sender creates Bell pair
sender.circuit.h(0);
sender.circuit.cx(0, 1);

// Entangle sender-repeater
network.entangle(sender.id, 1, repeater.id, 0);

// Repeater performs Bell measurement and creates new entanglement
repeater.circuit.cx(0, 1);
repeater.circuit.h(0);

// Entangle repeater-receiver
network.entangle(repeater.id, 1, receiver.id, 0);

const globalCircuit = network.toCircuit();
const results = globalCircuit.run();

console.log('Repeater network:', results.probabilities);
```

---

## Measurement & Results

### Understanding Results

```javascript
const results = circuit.run();

// Available data:
results.probabilities  // Object: { '00': 0.5, '11': 0.5 }
results.stateVector    // Array of complex amplitudes
results.unitaryMatrix  // Full unitary transformation
results.numQubits      // Number of qubits
```

### Visualizing Results

The QuantumVisualizer component automatically displays:
- **Probability Chart**: Bar chart of measurement outcomes
- **State Vector**: All quantum amplitudes
- **Bloch Spheres**: Visual representation of each qubit
- **Circuit Metrics**: Depth, gate count, execution cost

---

## Export & Import

### Export to QASM

**Visual Interface:**
Click "Export QASM" button

**Code:**
```javascript
const qasmCode = circuit.qasm();
console.log(qasmCode);
```

**Output:**
```qasm
OPENQASM 3.0;
include "stdgates.inc";
qubit[2] q;
bit[2] c;
h q[0];
cx q[0], q[1];
measure q[0] -> c[0];
measure q[1] -> c[1];
```

### Export to JSON

```javascript
const jsonData = circuit.toJSON();
const jsonString = JSON.stringify(jsonData, null, 2);
// Save or transmit jsonString
```

### Import from JSON

```javascript
const circuit = QuantumCircuit.fromJSON(jsonData);
const results = circuit.run();
```

---

## Tips & Best Practices

### 1. Start Simple
Begin with 1-2 qubits and basic gates (H, X, CNOT) before building complex circuits.

### 2. Use Barriers
Add barriers to visually separate logical sections of your circuit.

### 3. Measure Strategically
- Measurement collapses the quantum state
- Measure at the end for final results
- Mid-circuit measurements for conditional operations

### 4. Check Bloch Spheres
- Bloch spheres show individual qubit states
- Pure states lie on the surface
- Mixed states are inside the sphere

### 5. Verify with Metrics
- Check circuit depth (affects error rates on real hardware)
- Monitor gate count (more gates = more errors)
- Use execution cost as a rough estimate

### 6. Experiment in Sandbox
The JavaScript Sandbox allows rapid prototyping and testing.

---

## Common Patterns

### Creating Specific States

**|+⟩ state:**
```javascript
circuit.h(0);
```

**|−⟩ state:**
```javascript
circuit.x(0);
circuit.h(0);
```

**|i⟩ state:**
```javascript
circuit.h(0);
circuit.s(0);
```

### Multi-Qubit Operations

**Apply gate to all qubits:**
```javascript
for (let i = 0; i < numQubits; i++) {
    circuit.h(i);
}
```

**Chain CNOT gates:**
```javascript
for (let i = 0; i < numQubits - 1; i++) {
    circuit.cx(i, i + 1);
}
```

---

## Troubleshooting

### Circuit doesn't run
- Ensure measurements are present
- Check qubit indices are within range
- Verify gate parameters are valid

### Unexpected results
- Check gate order (quantum gates don't commute)
- Verify qubit targeting for multi-qubit gates
- Review Bloch spheres for state visualization

### Import fails
- Ensure JSON format matches export format
- Check file encoding (UTF-8)
- Validate QASM syntax

---

## Next Steps

- **Experiment**: Try modifying examples
- **Build**: Create your own circuits
- **Learn**: Study quantum computing fundamentals
- **Share**: Export and share your circuits

For API details, see [API_GUIDE.md](API_GUIDE.md)
