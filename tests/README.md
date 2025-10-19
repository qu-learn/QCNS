# QCNS Test Suite

Comprehensive automated testing for the QCNS library.

## Running Tests

Open `test-suite.html` in a web browser and click "Run All Tests".

## Test Coverage

### Single-Qubit Pauli Gates (4 tests)
- H gate (Hadamard)
- X gate (NOT)
- Y gate
- Z gate

### Single-Qubit Phase Gates (4 tests)
- S gate
- S dagger gate
- T gate
- T dagger gate

### Single-Qubit Rotation Gates (5 tests)
- RX gate (π rotation)
- RX gate (π/2 rotation)
- RY gate (π rotation)
- RY gate (π/2 rotation)
- RZ gate

### Two-Qubit Controlled Gates (7 tests)
- CNOT gate (CX)
- CY gate
- CZ gate
- CH gate (Controlled-Hadamard)
- SWAP gate
- CP gate (Controlled-Phase)
- CRZ gate (Controlled-RZ)

### Three-Qubit Gates (2 tests)
- Toffoli gate (CCX)
- Toffoli with one control off

### Gate Inverses (4 tests)
- S * Sdg = Identity
- T * Tdg = Identity
- H * H = Identity
- X * X = Identity

### Basic Circuit Operations (2 tests)
- Create circuit with qubits and classical bits
- Method chaining works

### Quantum States (4 tests)
- Initial state is |0...0⟩
- Hadamard creates superposition
- X gate flips state
- Bell state creation
- GHZ state (3-qubit entanglement)

### ComplexMath Utilities (4 tests)
- Complex number addition
- Complex number multiplication
- Complex conjugate
- Complex magnitude

### Circuit Metrics (2 tests)
- Calculate circuit depth
- Calculate execution cost

### Quantum Network (2 tests)
- Create network and add nodes
- Network to circuit conversion

### Bloch Sphere Calculator (4 tests)
- Calculate Bloch vector for |0⟩
- Calculate Bloch vector for |1⟩
- Calculate Bloch vector for |+⟩
- Identify standard states

### Circuit Export/Import (2 tests)
- Export to QASM
- Export to JSON

### Performance Tests (3 tests)
- Small circuit (3 qubits) runs fast
- Medium circuit (6 qubits) completes
- Gate operations scale linearly

### Error Handling (3 tests)
- Invalid qubit index throws error
- Invalid CNOT target throws error
- Negative qubit index throws error

### Circuit Builder (2 tests)
- Build circuit from gate grid
- Validate gate grid

### Advanced Quantum Algorithms (3 tests)
- Quantum teleportation protocol
- Quantum phase estimation (simplified)
- Deutsch-Jozsa algorithm (2 qubits)

### Register Management (3 tests)
- Create quantum register
- Create classical register
- Use registers in circuit

### Multi-Qubit Entanglement (1 test)
- W state (3 qubits)

## Total Tests: 60+

All tests include:
- Proper assertions with tolerance checking
- Error messages for failed tests
- Performance timing
- Visual feedback in the test runner

## Test Framework

The test suite uses a custom lightweight testing framework with:
- `assert(condition, message)` - Basic assertion
- `assertApprox(actual, expected, tolerance, message)` - Floating point comparison
- `assertComplexApprox(c1, c2, tolerance)` - Complex number comparison

## Test Results Display

The test runner provides:
- Real-time progress bar
- Summary cards (Total, Passed, Failed, Time)
- Grouped test results by category
- Detailed error messages for failed tests
- Color-coded pass/fail indicators

## Known Issues

All tests are designed to pass with the current QCNS implementation. If tests fail:
1. Check that all library files are correctly loaded
2. Verify the browser supports ES6 modules
3. Check the browser console for import errors
4. Ensure no conflicting global variables

## Adding New Tests

To add a new test:

```javascript
'Your Test Group': [
    {
        name: 'Test description',
        test: () => {
            const circuit = new QuantumCircuit(2, 2);
            // Your test code here
            assert(condition, 'Error message');
        }
    }
]
```

Add the test group to the `tests` object in `tests.js`.
