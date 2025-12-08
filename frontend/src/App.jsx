import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import FleetPage from './pages/FleetPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota raiz redireciona para a empresa 1 (Fábrica) */}
        <Route path="/" element={<Navigate to="/tv-mapa/1" replace />} />

        {/* Rota /tv sem ID também redireciona para a empresa 1 */}
        <Route path="/tv-mapa" element={<Navigate to="/tv-mapa/1" replace />} />

        <Route path="/tv-mapa/:companyId" element={<FleetPage />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;