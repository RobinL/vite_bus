import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import routesData from '../assets/routes.json';

const LeafletMap = () => {
    const mapRef = useRef(null);
    const mapContainerRef = useRef(null);

    // Function to generate distinct colors for each route
    const getRouteColor = (index) => {
        const colors = [
            '#FF0000', '#00FF00', '#0000FF', '#FFA500', '#800080', '#00FFFF',
            '#FF00FF', '#008000', '#000080', '#800000', '#808000', '#008080',
        ];
        return colors[index % colors.length];
    };

    useEffect(() => {
        if (!mapRef.current) {
            mapRef.current = L.map(mapContainerRef.current).setView([51.5074, -0.1278], 10);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
            }).addTo(mapRef.current);

            // Plot each bus route
            routesData.forEach((bus, index) => {
                try {
                    if (bus.geom && bus.geom.features && bus.geom.features[0]?.geometry) {
                        const color = getRouteColor(index);

                        // Create a GeoJSON layer for the route
                        L.geoJSON(bus.geom, {
                            style: {
                                color: color,
                                weight: 3,
                                opacity: 0.7
                            }
                        }).addTo(mapRef.current);

                        // Add a label for the bus number at the first coordinate
                        const firstFeature = bus.geom.features[0];
                        if (firstFeature.geometry.coordinates && firstFeature.geometry.coordinates[0]) {
                            const coords = firstFeature.geometry.coordinates[0];
                            // For Point, use coords directly. For LineString/Polygon, use first point
                            const [lng, lat] = Array.isArray(coords[0]) ? coords[0] : coords;

                            L.marker([lat, lng], {
                                icon: L.divIcon({
                                    className: 'bus-label',
                                    html: `<div style="
                                        background-color: ${color};
                                        color: white;
                                        padding: 5px 8px;
                                        border-radius: 3px;
                                        white-space: nowrap;
                                        display: inline-block;
                                        font-size: 14px;
                                    ">${bus.bus_number}</div>`,
                                })
                            }).addTo(mapRef.current);
                        }
                    }
                } catch (error) {
                    console.error(`Error handling route for bus ${bus.bus_number}:`, error);
                }
            });

            // Fit bounds to show all routes
            const allLayers = L.geoJSON(routesData.map(bus => bus.geom));
            const bounds = allLayers.getBounds();
            if (bounds.isValid()) {
                mapRef.current.fitBounds(bounds, { padding: [50, 50] });
            }
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    return <div ref={mapContainerRef} style={{ height: '100vh', width: '100%' }} />;
};

export default LeafletMap;