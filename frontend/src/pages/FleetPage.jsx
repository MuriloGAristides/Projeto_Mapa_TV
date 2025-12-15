import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import FleetMap from '../components/FleetMap';
import styles from '../App.module.css';

const API_URL = import.meta.env.VITE_API_URL;

const FleetPage = ({ companyId: propId }) => {
    const { companyId: paramId } = useParams();
    const companyId = propId || paramId;

    const [data, setData] = useState({ gps: [], liveStatus: [], latestDelivery: null });

    const fetchData = async () => {
        if (!companyId) return;

        try {
            const res = await fetch(`${API_URL}/map-data/${companyId}`);
            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error("Erro ao buscar dados", error);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [companyId]);

    const getBaseLocation = () => {
        if (String(companyId) === '3') return [-26.0425, -50.3719];
        return [-26.2773, -51.1046];
    };

    const isDualMode = !!propId;

    return (
        <div style={{
            width: '100%',
            height: isDualMode ? '100%' : '100vh',
            position: 'relative'
        }}>
            <FleetMap
                mapKey={`map-${companyId}`}
                gpsData={data.gps}
                liveStatus={data.liveStatus}
                latestDelivery={data.latestDelivery}
                baseLocation={getBaseLocation()}
            />
        </div>
    );
};

export default FleetPage;