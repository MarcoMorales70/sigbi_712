import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AppProvider } from './context/AppContext'; // ← Importa tu contexto

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppProvider> {/* esto para activar el estado global*/}
      <App />
    </AppProvider>
  </React.StrictMode>
);

reportWebVitals();