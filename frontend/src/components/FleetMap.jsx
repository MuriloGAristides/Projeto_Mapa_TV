import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './FleetMap.module.css';
import L from 'leaflet';

// --- Caminho das imagens  ---
import IconFabrica from '../assets/truck-icon-fabrica.png';
import IconKerber from '../assets/truck-icon-kerber.png';
import IconDefault from '../assets/truck-icon-kerber.png';
import IconAmarelo from '../assets/truck-icon-kerber-amarelo.png';
import IconCarretas from '../assets/Volvo540.png';
import IconCinza from '../assets/truck-icon-kerber-cinza.png';

const iconOptions = { iconSize: [60, 60], iconAnchor: [30, 30], popupAnchor: [0, -50] };
const iconFabrica = L.icon({ iconUrl: IconFabrica, ...iconOptions });
const iconKerber = L.icon({ iconUrl: IconKerber, ...iconOptions });
const iconDefault = L.icon({ iconUrl: IconDefault, ...iconOptions });
const iconAmarelo = L.icon({ iconUrl: IconAmarelo, ...iconOptions });
const iconCarretas = L.icon({ iconUrl: IconCarretas, ...iconOptions });
const iconCinza = L.icon({ iconUrl: IconCinza, ...iconOptions });

const specialPlateIcons = {
    'ASA-7D62': iconAmarelo,
    'SDR-9J47': iconCarretas,
    'BCY-9E48': iconCarretas,
    'TAI-6D80': iconCarretas,
    'ATY-1H28': iconCarretas,
    'AVF-7I85': iconCinza,
};

// --- Componentes Auxiliares ---
const DeliveryImage = ({ photoUrl }) => {
    const fallbackImage = 'https://placehold.co/400x300/e0e0e0/555?text=Sem+Foto';
    if (!photoUrl) return <img src={fallbackImage} alt="Sem Foto" className={styles.deliveryImage} />;
    return <img src={photoUrl} alt="Foto" className={styles.deliveryImage} onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage }} />;
};

const formatDateTime = (dateString) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleString('pt-BR').replace(',', '');
};

const MapStatusList = ({ statusData = [] }) => {
    const emRota = statusData.filter(truck => truck.status === 3);
    const aguardando = statusData.filter(truck => truck.status === 1);

    if (emRota.length === 0 && aguardando.length === 0) return null;

    const TruckItem = ({ truck, colorClass }) => (
        <div className={styles.truckItem}>
            <div className={`${styles.statusIndicator} ${colorClass}`}></div>
            <div className={styles.truckInfo}>
                <span className={styles.truckPlate}>{truck.plate}</span>
                <span className={styles.truckClient} title={truck.client}>
                    {truck.client}
                </span>
            </div>
        </div>
    );

    return (
        <div className={styles.topStatusBar}>
            <div className={styles.scrollContainer}>
                {emRota.length > 0 && (
                    <div className={styles.statusSection}>
                        <div className={styles.sectionLabelBlue}>EM ROTA ({emRota.length})</div>
                        <div className={styles.truckList}>
                            {emRota.map((truck, i) => (
                                <TruckItem key={i} truck={truck} colorClass={styles.bgBlue} />
                            ))}
                        </div>
                    </div>
                )}
                {emRota.length > 0 && aguardando.length > 0 && (
                    <div className={styles.mainDivider}></div>
                )}
                {aguardando.length > 0 && (
                    <div className={styles.statusSection}>
                        <div className={styles.sectionLabelYellow}>AGUARDANDO ({aguardando.length})</div>
                        <div className={styles.truckList}>
                            {aguardando.map((truck, i) => (
                                <TruckItem key={i} truck={truck} colorClass={styles.bgYellow} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 0.5 - Math.cos(dLat) / 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * (1 - Math.cos(dLon)) / 2;
    return R * 2 * Math.asin(Math.sqrt(a));
}

const MapAutoFit = ({ gpsData }) => {
    const map = useMap();

    useEffect(() => {
        if (gpsData && gpsData.length > 0) {
            const points = gpsData.map(truck => [truck.lat, truck.lng]);
            const bounds = L.latLngBounds(points);

            map.fitBounds(bounds, {
                paddingTopLeft: [150, 0],
                paddingBottomRight: [150, 50],
                animate: true
            });
        }
    }, [gpsData, map]);

    return null;
};

// --- Componente Principal ---
const FleetMap = ({ gpsData = [], latestDelivery, liveStatus, baseLocation }) => {
    const defaultCenter = [-26.24, -51.08];
    const defaultZoom = 10;

    const getIconForTruck = (truck) => {
        if (specialPlateIcons[truck.plate]) return specialPlateIcons[truck.plate];
        if (truck.empresa === 1) return iconFabrica;
        if (truck.empresa === 2) return iconKerber;
        return iconDefault;
    };

    const getIsAtBase = (truck) => {
        if (!baseLocation) return false;
        const [baseLat, baseLng] = baseLocation;
        return getDistance(truck.lat, truck.lng, baseLat, baseLng) < 0.5;
    };

    const baseZoneOptions = { color: '#E60000', fillColor: '#E60000', fillOpacity: 0.1, weight: 2, dashArray: '5, 10' };

    return (
        <div className={styles.mapWrapper}>
            <MapContainer
                key="fleet-map-static"
                center={defaultCenter}
                zoom={defaultZoom}
                scrollWheelZoom={true}
                className={styles.mapContainer}
                zoomControl={false}
            >
                <MapAutoFit gpsData={gpsData} />

                <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {baseLocation && (
                    <Circle center={baseLocation} radius={500} pathOptions={baseZoneOptions}>
                        <Tooltip>Base</Tooltip>
                    </Circle>
                )}

                {gpsData && gpsData.map((truck) => (
                    <Marker
                        key={truck.plate}
                        position={[truck.lat, truck.lng]}
                        icon={getIconForTruck(truck)}
                    >
                        <Popup className={styles.popup}>
                            <span className={styles.popupPlate}>{truck.plate}</span>
                            <span className={styles.popupTime}>
                                {new Date(truck.eventTime).toLocaleTimeString('pt-BR')}
                            </span>
                        </Popup>

                        {!getIsAtBase(truck) && (
                            <Tooltip
                                permanent={true}
                                direction="right"
                                offset={[35, 0]}
                                className={`${styles.permanentLabel} ${truck.empresa === 1 ? styles.labelCinza : styles.labelVermelho}`}
                            >
                                <div className={styles.labelContent}>
                                    {truck.plate}
                                    <div className={styles.labelUnderline}></div>
                                </div>
                            </Tooltip>
                        )}
                    </Marker>
                ))}
            </MapContainer>

            {/* Barra Superior */}
            <MapStatusList statusData={liveStatus} />

            {latestDelivery && (
                <div className={`${styles.deliveryCard} ${latestDelivery.unit === 'UN' ? styles.accentUn : styles.accentTon}`}>
                    <h3 className={styles.deliveryTitle}>
                        <span>Última Entrega</span>
                        <span className={styles.deliveryTimestamp}>{formatDateTime(latestDelivery.eventTime)}</span>
                    </h3>

                    <div className={styles.deliveryDetails}>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Placa:</span>
                            <span className={styles.detailValue}>{latestDelivery.plate}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Produto:</span>
                            <span className={styles.detailValue}>{latestDelivery.productName}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Cliente:</span>
                            <span className={styles.detailValue}>{latestDelivery.client}</span>
                        </div>
                    </div>

                    <div className={styles.deliveryImageContainerCompact}>
                        <DeliveryImage photoUrl={latestDelivery.photoUrl} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default FleetMap;