import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import FleetMap from '../components/FleetMap';
import styles from '../App.module.css';

const API_URL = import.meta.env.VITE_API_URL;

const FleetPage = () => {
    // 1. Pega o ID dinâmico da URL
    const { companyId } = useParams();

    const [data, setData] = useState({ gps: [], liveStatus: [], latestDelivery: null });

    const fetchData = async () => {
        try {
            // 2. Usa o companyId na requisição para o backend
            const res = await fetch(`${API_URL}/map-data/${companyId}`);
            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error("Erro ao buscar dados", error);
        }
    };

    useEffect(() => {
        fetchData();
        // Reinicia o intervalo sempre que o ID mudar
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [companyId]);

    // 3. Define a localização da base conforme a empresa selecionada
    const getBaseLocation = () => {
        if (String(companyId) === '3') return [-26.0425, -50.3719]; 
        return [-26.2773, -51.1046];
    };

    return (
        <div className={styles.appContainer}>
            <FleetMap
                gpsData={data.gps}
                liveStatus={data.liveStatus}
                latestDelivery={data.latestDelivery}
                baseLocation={getBaseLocation()}
            />
        </div>
    );
};

export default FleetPage;