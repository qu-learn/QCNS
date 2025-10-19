# Testing the Reorganized QCNS

## Quick Test

1. **Start a local web server** (ES6 modules require a server):
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # OR using Node.js
   npx http-server
   
   # OR using VS Code Live Server extension
   ```

2. **Open in browser:**
   ```
   http://localhost:8000/app/index.html
   ```

3. **Check console** - Should see:
   ```
   QCNS Library loaded
   ```

4. **Test functionality:**
   - Click "Circuit Simulator" tab
   - Drag gates onto circuit
   - Click "Run Simulation"
   - Check visualizations appear

## If You Get Errors

### 404 Errors
- Make sure you're serving from the QCNS root directory
- Check that paths in browser dev tools match actual file locations

### Module Loading Errors
- Ensure using a web server (not file://)
- Check browser console for specific import errors

## File Structure Verification

Run this to verify all files exist:
```bash
cd QCNS
find lib app -name "*.js" | sort
```

Should show 25 JavaScript files total.
