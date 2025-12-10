import React, { useEffect, useContext } from 'react';
import Layout from './components/Layout';
import { AppContext } from './context/AppContext';

function App() {
  const { cargarTecnico } = useContext(AppContext);

  useEffect(() => {
    cargarTecnico(6754321); // se define qué técnico inicia sesión
  }, []);

  return <Layout />;
}

export default App;