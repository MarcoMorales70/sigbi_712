import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { ContenedorGlobalProvider } from './context/ContenedorGlobal';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ContenedorGlobalProvider>
      <App />
    </ContenedorGlobalProvider>
  </React.StrictMode>
);

reportWebVitals();