import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App/App';
const div = document.createElement('div');
document.body.appendChild(div);
div.className = 'llvm-coverage-viewer-root';
ReactDOM.render(<App/>, div);
