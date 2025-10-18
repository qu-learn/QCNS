/**
 * QCNS Library - Quantum Circuit and Network Simulator
 * Core quantum computing library
 */

// Quantum Core
export { QuantumCircuit } from './quantum/QuantumCircuit.js';
export { QuantumRegister } from './quantum/QuantumRegister.js';
export { ClassicalRegister } from './quantum/ClassicalRegister.js';
export { QuantumGates } from './quantum/QuantumGates.js';
export { ComplexMath } from './quantum/ComplexMath.js';
export { QuantumSimulator } from './quantum/QuantumSimulator.js';
export { QuantumNetwork, QuantumNetworkNode, QuantumEntanglement } from './quantum/QuantumNetwork.js';

// Transpiler
export { QasmTranspiler } from './transpiler/QasmTranspiler.js';

// Utilities
export { CircuitSerializer } from './utils/CircuitSerializer.js';
export { CircuitBuilder } from './utils/CircuitBuilder.js';
export { CircuitMetrics } from './utils/CircuitMetrics.js';
export { BlochSphereCalculator } from './utils/BlochSphereCalculator.js';

export const version = '2.0.0';
