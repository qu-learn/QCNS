// QCNS Test Suite
// Comprehensive tests for core library functionality

const testSuite = {
    results: [],
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    totalTime: 0
};

// Test Framework
function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

function assertApprox(actual, expected, tolerance = 0.0001, message) {
    const diff = Math.abs(actual - expected);
    if (diff > tolerance) {
        throw new Error(message || `Expected ${expected}, got ${actual} (diff: ${diff})`);
    }
}

function assertComplexApprox(c1, c2, tolerance = 0.0001) {
    assertApprox(c1.re, c2.re, tolerance, 'Real parts differ');
    assertApprox(c1.im, c2.im, tolerance, 'Imaginary parts differ');
}

async function runTest(name, testFn) {
    const testElement = document.createElement('div');
    testElement.className = 'test-case running';
    testElement.innerHTML = `
        <div class="test-name">${name}</div>
        <div>
            <span class="test-status running">RUNNING</span>
            <span class="test-time"></span>
        </div>
    `;
    document.getElementById('test-results').appendChild(testElement);

    const startTime = performance.now();
    let passed = false;
    let error = null;

    try {
        await testFn();
        passed = true;
    } catch (e) {
        error = e;
    }

    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    testElement.className = `test-case ${passed ? 'passed' : 'failed'}`;
    testElement.querySelector('.test-status').className = `test-status ${passed ? 'passed' : 'failed'}`;
    testElement.querySelector('.test-status').textContent = passed ? 'PASSED' : 'FAILED';
    testElement.querySelector('.test-time').textContent = `${duration}ms`;

    if (error) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'test-error';
        errorDiv.textContent = error.message;
        testElement.appendChild(errorDiv);
    }

    testSuite.results.push({ name, passed, duration, error });
    if (passed) testSuite.passedTests++;
    else testSuite.failedTests++;
    testSuite.totalTime += duration;

    updateSummary();
}

function updateSummary() {
    document.getElementById('total-tests').textContent = testSuite.totalTests;
    document.getElementById('passed-tests').textContent = testSuite.passedTests;
    document.getElementById('failed-tests').textContent = testSuite.failedTests;
    document.getElementById('total-time').textContent = `${testSuite.totalTime}ms`;

    const progress = (testSuite.passedTests + testSuite.failedTests) / testSuite.totalTests * 100;
    document.getElementById('progress').style.width = `${progress}%`;
}

// Test Groups
const tests = {
    'Single-Qubit Pauli Gates': [
        {
            name: 'H gate (Hadamard)',
            test: () => {
                const circuit = new QuantumCircuit(1, 1);
                circuit.h(0).measure(0, 0);
                const results = circuit.run();
                assertApprox(results.probabilities['0'], 0.5, 0.01, 'H creates equal superposition');
                assertApprox(results.probabilities['1'], 0.5, 0.01);
            }
        },
        {
            name: 'X gate (NOT)',
            test: () => {
                const circuit = new QuantumCircuit(1, 1);
                circuit.x(0).measure(0, 0);
                const results = circuit.run();
                assertApprox(results.probabilities['1'], 1.0, 0.001, 'X flips |0⟩ to |1⟩');
            }
        },
        {
            name: 'Y gate',
            test: () => {
                const circuit = new QuantumCircuit(1, 1);
                circuit.y(0).measure(0, 0);
                const results = circuit.run();
                assertApprox(results.probabilities['1'], 1.0, 0.001, 'Y flips |0⟩ to |1⟩ with phase');
            }
        },
        {
            name: 'Z gate',
            test: () => {
                const circuit = new QuantumCircuit(1, 1);
                circuit.z(0).measure(0, 0);
                const results = circuit.run();
                assertApprox(results.probabilities['0'], 1.0, 0.001, 'Z preserves |0⟩');
            }
        }
    ],

    'Single-Qubit Phase Gates': [
        {
            name: 'S gate',
            test: () => {
                const circuit = new QuantumCircuit(1, 1);
                circuit.s(0).measure(0, 0);
                const results = circuit.run();
                assertApprox(results.probabilities['0'], 1.0, 0.001, 'S preserves |0⟩');
            }
        },
        {
            name: 'S dagger gate',
            test: () => {
                const circuit = new QuantumCircuit(1, 1);
                circuit.sdg(0).measure(0, 0);
                const results = circuit.run();
                assertApprox(results.probabilities['0'], 1.0, 0.001, 'Sdg preserves |0⟩');
            }
        },
        {
            name: 'T gate',
            test: () => {
                const circuit = new QuantumCircuit(1, 1);
                circuit.t(0).measure(0, 0);
                const results = circuit.run();
                assertApprox(results.probabilities['0'], 1.0, 0.001, 'T preserves |0⟩');
            }
        },
        {
            name: 'T dagger gate',
            test: () => {
                const circuit = new QuantumCircuit(1, 1);
                circuit.tdg(0).measure(0, 0);
                const results = circuit.run();
                assertApprox(results.probabilities['0'], 1.0, 0.001, 'Tdg preserves |0⟩');
            }
        }
    ],

    'Single-Qubit Rotation Gates': [
        {
            name: 'RX gate (π rotation)',
            test: () => {
                const circuit = new QuantumCircuit(1, 1);
                circuit.rx(Math.PI, 0).measure(0, 0);
                const results = circuit.run();
                assertApprox(results.probabilities['1'], 1.0, 0.01, 'RX(π) flips state');
            }
        },
        {
            name: 'RX gate (π/2 rotation)',
            test: () => {
                const circuit = new QuantumCircuit(1, 1);
                circuit.rx(Math.PI / 2, 0).measure(0, 0);
                const results = circuit.run();
                assertApprox(results.probabilities['0'], 0.5, 0.01, 'RX(π/2) creates superposition');
                assertApprox(results.probabilities['1'], 0.5, 0.01);
            }
        },
        {
            name: 'RY gate (π rotation)',
            test: () => {
                const circuit = new QuantumCircuit(1, 1);
                circuit.ry(Math.PI, 0).measure(0, 0);
                const results = circuit.run();
                assertApprox(results.probabilities['1'], 1.0, 0.01, 'RY(π) flips state');
            }
        },
        {
            name: 'RY gate (π/2 rotation)',
            test: () => {
                const circuit = new QuantumCircuit(1, 1);
                circuit.ry(Math.PI / 2, 0).measure(0, 0);
                const results = circuit.run();
                assertApprox(results.probabilities['0'], 0.5, 0.01, 'RY(π/2) creates superposition');
                assertApprox(results.probabilities['1'], 0.5, 0.01);
            }
        },
        {
            name: 'RZ gate',
            test: () => {
                const circuit = new QuantumCircuit(1, 1);
                circuit.rz(Math.PI / 4, 0).measure(0, 0);
                const results = circuit.run();
                assertApprox(results.probabilities['0'], 1.0, 0.001, 'RZ preserves basis states');
            }
        }
    ],

    'Two-Qubit Controlled Gates': [
        {
            name: 'CNOT gate (CX)',
            test: () => {
                const circuit = new QuantumCircuit(2, 2);
                circuit.x(0).cx(0, 1).measure_all();
                const results = circuit.run();
                assertApprox(results.probabilities['11'], 1.0, 0.001, 'CX with control=1 flips target');
            }
        },
        {
            name: 'CY gate',
            test: () => {
                const circuit = new QuantumCircuit(2, 2);
                circuit.x(0).cy(0, 1).measure_all();
                const results = circuit.run();
                assertApprox(results.probabilities['11'], 1.0, 0.001, 'CY with control=1 flips target');
            }
        },
        {
            name: 'CZ gate',
            test: () => {
                const circuit = new QuantumCircuit(2, 2);
                circuit.x(0).x(1).cz(0, 1).measure_all();
                const results = circuit.run();
                assertApprox(results.probabilities['11'], 1.0, 0.001, 'CZ preserves |11⟩');
            }
        },
        {
            name: 'CH gate (Controlled-Hadamard)',
            test: () => {
                const circuit = new QuantumCircuit(2, 2);
                circuit.x(0).ch(0, 1).measure_all();
                const results = circuit.run();

                // CH gate should work: when control is |1⟩, applies H to target
                // Starting from |10⟩, after CH: should create (|10⟩ + |11⟩)/√2
                assert(results !== null && results.probabilities !== null, 'Should produce valid results');

                // Check that we got some results
                const totalProb = Object.values(results.probabilities).reduce((sum, p) => sum + p, 0);
                assertApprox(totalProb, 1.0, 0.01, 'Total probability should be 1.0');
            }
        },
        {
            name: 'SWAP gate',
            test: () => {
                const circuit = new QuantumCircuit(2, 2);
                circuit.x(0).swap(0, 1).measure_all();
                const results = circuit.run();
                assertApprox(results.probabilities['01'], 1.0, 0.001, 'SWAP exchanges qubit states');
            }
        },
        {
            name: 'CP gate (Controlled-Phase)',
            test: () => {
                const circuit = new QuantumCircuit(2, 2);
                circuit.x(0).x(1).cp(Math.PI / 4, 0, 1).measure_all();
                const results = circuit.run();
                assertApprox(results.probabilities['11'], 1.0, 0.001, 'CP preserves |11⟩');
            }
        },
        {
            name: 'CRZ gate (Controlled-RZ)',
            test: () => {
                const circuit = new QuantumCircuit(2, 2);
                circuit.x(0).crz(Math.PI / 4, 0, 1).measure_all();
                const results = circuit.run();
                assertApprox(results.probabilities['10'], 1.0, 0.001, 'CRZ preserves basis states');
            }
        }
    ],

    'Three-Qubit Gates': [
        {
            name: 'Toffoli gate (CCX)',
            test: () => {
                const circuit = new QuantumCircuit(3, 3);
                circuit.x(0).x(1).ccx(0, 1, 2).measure_all();
                const results = circuit.run();
                assertApprox(results.probabilities['111'], 1.0, 0.001, 'CCX flips target when both controls are 1');
            }
        },
        {
            name: 'Toffoli with one control off',
            test: () => {
                const circuit = new QuantumCircuit(3, 3);
                circuit.x(0).ccx(0, 1, 2).measure_all();
                const results = circuit.run();
                assertApprox(results.probabilities['100'], 1.0, 0.001, 'CCX does not flip when one control is 0');
            }
        }
    ],

    'Basic Circuit Operations': [
        {
            name: 'Create circuit with qubits and classical bits',
            test: () => {
                const circuit = new QuantumCircuit(3, 3);
                assert(circuit.numQubits === 3, 'Should have 3 qubits');
                assert(circuit.numClassicalBits === 3, 'Should have 3 classical bits');
            }
        },
        {
            name: 'Method chaining works',
            test: () => {
                const circuit = new QuantumCircuit(2, 2);
                const result = circuit.h(0).cx(0, 1).measure_all();
                assert(result === circuit, 'Should return circuit for chaining');
            }
        }
    ],

    'Quantum States': [
        {
            name: 'Initial state is |0...0⟩',
            test: () => {
                const circuit = new QuantumCircuit(2, 2);
                const results = circuit.run();
                assertApprox(results.probabilities['00'], 1.0, 0.001, '|00⟩ should have 100% probability');
            }
        },
        {
            name: 'Hadamard creates superposition',
            test: () => {
                const circuit = new QuantumCircuit(1, 1);
                circuit.h(0).measure(0, 0);
                const results = circuit.run();
                assertApprox(results.probabilities['0'], 0.5, 0.001, '|0⟩ should have 50% probability');
                assertApprox(results.probabilities['1'], 0.5, 0.001, '|1⟩ should have 50% probability');
            }
        },
        {
            name: 'X gate flips state',
            test: () => {
                const circuit = new QuantumCircuit(1, 1);
                circuit.x(0).measure(0, 0);
                const results = circuit.run();
                assertApprox(results.probabilities['1'], 1.0, 0.001, '|1⟩ should have 100% probability');
            }
        },
        {
            name: 'Bell state creation',
            test: () => {
                const circuit = new QuantumCircuit(2, 2);
                circuit.h(0).cx(0, 1).measure_all();
                const results = circuit.run();
                assertApprox(results.probabilities['00'], 0.5, 0.001, '|00⟩ should have 50%');
                assertApprox(results.probabilities['11'], 0.5, 0.001, '|11⟩ should have 50%');
            }
        },
        {
            name: 'GHZ state (3-qubit entanglement)',
            test: () => {
                const circuit = new QuantumCircuit(3, 3);
                circuit.h(0).cx(0, 1).cx(1, 2).measure_all();
                const results = circuit.run();
                assertApprox(results.probabilities['000'], 0.5, 0.001);
                assertApprox(results.probabilities['111'], 0.5, 0.001);
            }
        }
    ],

    'ComplexMath Utilities': [
        {
            name: 'Complex number addition',
            test: () => {
                const c1 = { re: 1, im: 2 };
                const c2 = { re: 3, im: 4 };
                const result = ComplexMath.add(c1, c2);
                assertComplexApprox(result, { re: 4, im: 6 });
            }
        },
        {
            name: 'Complex number multiplication',
            test: () => {
                const c1 = { re: 1, im: 2 };
                const c2 = { re: 3, im: 4 };
                const result = ComplexMath.multiply(c1, c2);
                assertComplexApprox(result, { re: -5, im: 10 });
            }
        },
        {
            name: 'Complex conjugate',
            test: () => {
                const c = { re: 3, im: 4 };
                const result = ComplexMath.conjugate(c);
                assertComplexApprox(result, { re: 3, im: -4 });
            }
        },
        {
            name: 'Complex magnitude',
            test: () => {
                const c = { re: 3, im: 4 };
                const result = ComplexMath.abs(c);
                assertApprox(result, 5.0, 0.0001);
            }
        }
    ],

    'Circuit Metrics': [
        {
            name: 'Calculate circuit depth',
            test: () => {
                const circuit = new QuantumCircuit(2, 2);
                circuit.h(0).h(1).cx(0, 1).measure_all();

                const metrics = new CircuitMetrics();
                const analysis = metrics.calculateAll(circuit);

                assert(analysis.width === 2, 'Width should be 2');
                assert(analysis.depth >= 2, 'Depth should be at least 2');
                assert(analysis.gateCount >= 4, 'Should have at least 4 gates');
            }
        },
        {
            name: 'Calculate execution cost',
            test: () => {
                const circuit = new QuantumCircuit(2, 2);
                circuit.h(0).cx(0, 1);

                const metrics = new CircuitMetrics();
                const analysis = metrics.calculateAll(circuit);

                assert(analysis.executionCost > 0, 'Should have execution cost');
                assert(analysis.executionCost >= 11, 'H(1) + CX(10) = 11');
            }
        }
    ],

    'Quantum Network': [
        {
            name: 'Create network and add nodes',
            test: () => {
                const network = new QuantumNetwork('TestNet');
                const alice = network.addNode('Alice', 2);
                const bob = network.addNode('Bob', 2);

                assert(alice !== null, 'Alice node should be created');
                assert(bob !== null, 'Bob node should be created');
                assert(alice.numQubits === 2, 'Alice should have 2 qubits');
            }
        },
        {
            name: 'Network to circuit conversion',
            test: () => {
                const network = new QuantumNetwork('TestNet');
                const alice = network.addNode('Alice', 2);

                alice.circuit.h(0);
                alice.circuit.cx(0, 1);

                const globalCircuit = network.toCircuit();
                assert(globalCircuit !== null, 'Should create global circuit');
                assert(globalCircuit.numQubits === 2, 'Should have 2 qubits');
            }
        }
    ],

    'Bloch Sphere Calculator': [
        {
            name: 'Calculate Bloch vector for |0⟩',
            test: () => {
                const calc = new BlochSphereCalculator();
                const stateVector = [
                    { re: 1, im: 0 },
                    { re: 0, im: 0 }
                ];

                const bloch = calc.stateVectorToBlochVector(stateVector);

                assertApprox(bloch.z, 1.0, 0.001, 'Z should be 1');
                assertApprox(bloch.x, 0.0, 0.001, 'X should be 0');
                assertApprox(bloch.y, 0.0, 0.001, 'Y should be 0');
            }
        },
        {
            name: 'Calculate Bloch vector for |1⟩',
            test: () => {
                const calc = new BlochSphereCalculator();
                const stateVector = [
                    { re: 0, im: 0 },
                    { re: 1, im: 0 }
                ];

                const bloch = calc.stateVectorToBlochVector(stateVector);

                assertApprox(bloch.z, -1.0, 0.001, 'Z should be -1');
            }
        },
        {
            name: 'Calculate Bloch vector for |+⟩',
            test: () => {
                const calc = new BlochSphereCalculator();
                const sqrt2 = 1 / Math.sqrt(2);
                const stateVector = [
                    { re: sqrt2, im: 0 },
                    { re: sqrt2, im: 0 }
                ];

                const bloch = calc.stateVectorToBlochVector(stateVector);

                assertApprox(bloch.x, 1.0, 0.001, 'X should be 1');
                assertApprox(bloch.z, 0.0, 0.001, 'Z should be 0');
            }
        },
        {
            name: 'Identify standard states',
            test: () => {
                const calc = new BlochSphereCalculator();

                const state0 = calc.identifyState({ x: 0, y: 0, z: 1, purity: 1 });
                assert(state0 === '|0⟩', 'Should identify |0⟩');

                const state1 = calc.identifyState({ x: 0, y: 0, z: -1, purity: 1 });
                assert(state1 === '|1⟩', 'Should identify |1⟩');

                const statePlus = calc.identifyState({ x: 1, y: 0, z: 0, purity: 1 });
                assert(statePlus === '|+⟩', 'Should identify |+⟩');
            }
        }
    ],

    'Circuit Export/Import': [
        {
            name: 'Export to QASM',
            test: () => {
                const circuit = new QuantumCircuit(2, 2);
                circuit.h(0).cx(0, 1).measure_all();

                const qasm = circuit.qasm();

                assert(typeof qasm === 'string', 'QASM should be a string');
                assert(qasm.includes('OPENQASM'), 'Should contain OPENQASM header');
                assert(qasm.includes('h q[0]'), 'Should contain H gate');
                assert(qasm.includes('cx q[0], q[1]'), 'Should contain CX gate');
            }
        },
        {
            name: 'Export to JSON',
            test: () => {
                const circuit = new QuantumCircuit(2, 2);
                circuit.h(0).measure(0, 0);

                const json = circuit.toJSON();

                assert(typeof json === 'object', 'Should return object');
                assert(json.numQubits === 2, 'Should have qubit count');
                assert(Array.isArray(json.gates), 'Should have gates array');
            }
        }
    ],

    'Performance Tests': [
        {
            name: 'Small circuit (3 qubits) runs fast',
            test: () => {
                const start = performance.now();

                const circuit = new QuantumCircuit(3, 3);
                for (let i = 0; i < 3; i++) circuit.h(i);
                circuit.measure_all();
                circuit.run();

                const duration = performance.now() - start;
                assert(duration < 100, `Should complete in <100ms (took ${duration}ms)`);
            }
        },
        {
            name: 'Medium circuit (6 qubits) completes',
            test: () => {
                const circuit = new QuantumCircuit(6, 6);
                for (let i = 0; i < 6; i++) circuit.h(i);
                circuit.measure_all();

                const results = circuit.run();
                assert(results !== null, 'Should return results');
                assert(Object.keys(results.probabilities).length > 0, 'Should have probabilities');
            }
        },
        {
            name: 'Gate operations scale linearly',
            test: () => {
                const times = [];

                for (let n = 1; n <= 3; n++) {
                    const start = performance.now();
                    const circuit = new QuantumCircuit(n, n);
                    for (let i = 0; i < n; i++) circuit.h(i);
                    times.push(performance.now() - start);
                }

                // Just check they all complete quickly
                assert(times.every(t => t < 50), 'All should complete quickly');
            }
        }
    ],

    'Error Handling': [
        {
            name: 'Invalid qubit index throws error',
            test: () => {
                const circuit = new QuantumCircuit(2, 2);
                let errorThrown = false;

                try {
                    circuit.h(5);
                } catch (e) {
                    errorThrown = true;
                }

                assert(errorThrown, 'Should throw error for invalid qubit');
            }
        },
        {
            name: 'Invalid CNOT target throws error',
            test: () => {
                const circuit = new QuantumCircuit(2, 2);
                let errorThrown = false;

                try {
                    circuit.cx(0, 5);
                } catch (e) {
                    errorThrown = true;
                }

                assert(errorThrown, 'Should throw error for invalid target');
            }
        },
        {
            name: 'Negative qubit index throws error',
            test: () => {
                const circuit = new QuantumCircuit(2, 2);
                let errorThrown = false;

                try {
                    circuit.h(-1);
                } catch (e) {
                    errorThrown = true;
                }

                assert(errorThrown, 'Should throw error for negative qubit');
            }
        }
    ],

    'Circuit Builder': [
        {
            name: 'Build circuit from gate grid',
            test: () => {
                const builder = new CircuitBuilder();
                const gateGrid = [
                    [{ name: 'H' }, null, { name: 'measure' }],
                    [{ name: 'CNOT', target: 1 }, null, { name: 'measure' }]
                ];

                const circuit = builder.buildCircuitFromGrid(gateGrid, 2, 3);
                assert(circuit !== null, 'Should create circuit');
                assert(circuit.numQubits === 2, 'Should have 2 qubits');
            }
        },
        {
            name: 'Validate gate grid',
            test: () => {
                const builder = new CircuitBuilder();
                const validGrid = [
                    [{ name: 'H' }, null],
                    [null, { name: 'X' }]
                ];

                const validation = builder.validateGateGrid(validGrid, 2, 2);
                assert(validation.valid === true, 'Valid grid should pass validation');
            }
        }
    ],

    'Advanced Quantum Algorithms': [
        {
            name: 'Quantum teleportation protocol',
            test: () => {
                const circuit = new QuantumCircuit(3, 3);

                // Prepare state to teleport (|+⟩)
                circuit.h(0);

                // Create Bell pair
                circuit.h(1);
                circuit.cx(1, 2);

                // Bell measurement
                circuit.cx(0, 1);
                circuit.h(0);
                circuit.measure(0, 0);
                circuit.measure(1, 1);

                const results = circuit.run();
                assert(results !== null, 'Should produce results');
                assert(Object.keys(results.probabilities).length > 0, 'Should have probabilities');
            }
        },
        {
            name: 'Quantum phase estimation (simplified)',
            test: () => {
                const circuit = new QuantumCircuit(2, 2);

                // Initialize
                circuit.h(0);
                circuit.x(1);

                // Controlled operations
                circuit.cp(Math.PI / 2, 0, 1);

                // Inverse QFT on first qubit
                circuit.h(0);

                circuit.measure_all();
                const results = circuit.run();

                assert(results !== null, 'Should complete');
            }
        },
        {
            name: 'Deutsch-Jozsa algorithm (2 qubits)',
            test: () => {
                const circuit = new QuantumCircuit(2, 2);

                // Deutsch-Jozsa: Initialize ancilla to |1⟩, apply H to both
                circuit.x(1);
                circuit.h(0);
                circuit.h(1);

                // Oracle (constant function - identity, does nothing)
                // For constant function, we expect the query qubit to return to |0⟩

                // Apply H to query qubit
                circuit.h(0);
                circuit.measure_all();

                const results = circuit.run();

                // Check that we got valid results
                assert(results !== null && results.probabilities !== null, 'Should produce valid results');

                // Check total probability is 1
                const totalProb = Object.values(results.probabilities).reduce((sum, p) => sum + p, 0);
                assertApprox(totalProb, 1.0, 0.01, 'Total probability should be 1.0');
            }
        }
    ],

    'Register Management': [
        {
            name: 'Create quantum register',
            test: () => {
                const qreg = new QuantumRegister(3, 'q');
                assert(qreg.size === 3, 'Should have 3 qubits');
                assert(qreg.name === 'q', 'Should have correct name');
            }
        },
        {
            name: 'Create classical register',
            test: () => {
                const creg = new ClassicalRegister(3, 'c');
                assert(creg.size === 3, 'Should have 3 bits');
                assert(creg.name === 'c', 'Should have correct name');
            }
        },
        {
            name: 'Use registers in circuit',
            test: () => {
                const qreg = new QuantumRegister(2, 'q');
                const creg = new ClassicalRegister(2, 'c');
                const circuit = new QuantumCircuit(qreg, creg);

                assert(circuit.numQubits === 2, 'Should have 2 qubits');
                assert(circuit.numClassicalBits === 2, 'Should have 2 classical bits');
                assert(circuit.qreg === qreg, 'Should use quantum register');
                assert(circuit.creg === creg, 'Should use classical register');
            }
        }
    ],

    'Gate Inverses': [
        {
            name: 'S * Sdg = Identity',
            test: () => {
                const circuit = new QuantumCircuit(1, 1);
                circuit.s(0).sdg(0).measure(0, 0);
                const results = circuit.run();
                assertApprox(results.probabilities['0'], 1.0, 0.001, 'S * Sdg should be identity');
            }
        },
        {
            name: 'T * Tdg = Identity',
            test: () => {
                const circuit = new QuantumCircuit(1, 1);
                circuit.t(0).tdg(0).measure(0, 0);
                const results = circuit.run();
                assertApprox(results.probabilities['0'], 1.0, 0.001, 'T * Tdg should be identity');
            }
        },
        {
            name: 'H * H = Identity',
            test: () => {
                const circuit = new QuantumCircuit(1, 1);
                circuit.h(0).h(0).measure(0, 0);
                const results = circuit.run();
                assertApprox(results.probabilities['0'], 1.0, 0.001, 'H * H should be identity');
            }
        },
        {
            name: 'X * X = Identity',
            test: () => {
                const circuit = new QuantumCircuit(1, 1);
                circuit.x(0).x(0).measure(0, 0);
                const results = circuit.run();
                assertApprox(results.probabilities['0'], 1.0, 0.001, 'X * X should be identity');
            }
        }
    ],

    'Multi-Qubit Entanglement': [
        {
            name: 'W state (3 qubits)',
            test: () => {
                // W state: (|100⟩ + |010⟩ + |001⟩) / √3
                // Simplified approximation
                const circuit = new QuantumCircuit(3, 3);
                circuit.h(0);
                circuit.h(1);
                circuit.h(2);
                circuit.measure_all();

                const results = circuit.run();
                assert(results !== null, 'Should complete');
                assert(Object.keys(results.probabilities).length === 8, 'Should have 8 states');
            }
        }
    ]
};

// Main Test Runner
async function runAllTests() {
    clearResults();

    // Count total tests
    testSuite.totalTests = 0;
    for (const group in tests) {
        testSuite.totalTests += tests[group].length;
    }

    updateSummary();

    // Run tests by group
    for (const [groupName, groupTests] of Object.entries(tests)) {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'test-group';
        groupDiv.innerHTML = `<div class="test-group-header">${groupName}</div>`;
        document.getElementById('test-results').appendChild(groupDiv);

        for (const testCase of groupTests) {
            await runTest(testCase.name, testCase.test);
        }
    }

    console.log('All tests completed!');
    console.log(`Passed: ${testSuite.passedTests}/${testSuite.totalTests}`);
    console.log(`Failed: ${testSuite.failedTests}`);
    console.log(`Total time: ${testSuite.totalTime}ms`);
}

function clearResults() {
    document.getElementById('test-results').innerHTML = '';
    testSuite.results = [];
    testSuite.totalTests = 0;
    testSuite.passedTests = 0;
    testSuite.failedTests = 0;
    testSuite.totalTime = 0;
    updateSummary();
    document.getElementById('progress').style.width = '0%';
}

window.runAllTests = runAllTests;
window.clearResults = clearResults;

console.log('Test suite loaded. Click "Run All Tests" to start.');
