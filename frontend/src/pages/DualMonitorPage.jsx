import React from 'react';
import FleetPage from './FleetPage';

const DualMonitorPage = () => {
    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            width: '100vw', 
            height: '100vh',
            overflow: 'hidden'
        }}>
            {/* Metade de Cima - Empresa 1 (Padrão/Kerber) */}
            <div style={{ flex: 1, borderBottom: '3px solid #333', position: 'relative' }}>
                <FleetPage companyId="2" />
            </div>

            {/* Metade de Baixo - Empresa 3 (Filial/Outra) */}
            <div style={{ flex: 1, position: 'relative' }}>
                <FleetPage companyId="3" />
                
            </div>
        </div>
    );
};

export default DualMonitorPage;