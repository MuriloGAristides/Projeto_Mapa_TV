import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import FleetPage from './pages/FleetPage';
import DualMonitorPage from './pages/DualMonitorPage'; 

function App() {
  return (
    <BrowserRouter basename="/tv2">
      <Routes>

        {/* 1. Rota Específica (Monitor) */}
        <Route path="/monitor" element={<DualMonitorPage />} />

        {/* 2. Rota Raiz (Redireciona) */}
        <Route path="/" element={<Navigate to="/1" replace />} />

        {/* 3. Rota Dinâmica */}
        <Route path="/:companyId" element={<FleetPage />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;