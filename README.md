# QCNS - Quantum Circuit and Network Simulator

A modular quantum computing simulator with visual circuit editing, network simulation, and interactive programming.

## Project Structure

```
QCNS/
├── lib/                   # Core quantum library
│   ├── quantum/          # Quantum primitives  
│   ├── transpiler/       # QASM transpilation
│   ├── utils/            # Pure utilities
│   └── index.js
├── app/                  # Application layer
│   ├── components/       # UI components
│   ├── utils/            # UI utilities
│   ├── styles/
│   └── index.html
└── README.md
```

## Running the Application

Open `app/index.html` in a web browser.

## Architecture

- `/lib` - Standalone quantum computing library
- `/app` - Web application interface

All modules use ES6 imports/exports.
