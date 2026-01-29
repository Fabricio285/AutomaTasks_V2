import React from 'react';
import ReactDOM from 'react-dom/client';
import { html } from 'htm';
import App from './App.js';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  // Renderizamos usando htm, que es JavaScript válido
  root.render(
    React.createElement(React.StrictMode, null, 
      React.createElement(App)
    )
  );
}