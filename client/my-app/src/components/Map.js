import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';
import './Map.css';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const Map = () => {
    const mapContainer = useRef(null);
    const map = useRef(null);

    useEffect(() => {
        if (map.current) return; // initialize map only once
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [144.9631, -37.8136], // Melbourne coordinates
            zoom: 10,
        });

        const directions = new MapboxDirections({
            accessToken: mapboxgl.accessToken,
            unit: 'metric',
            profile: 'mapbox/cycling'
        });

        map.current.addControl(directions, 'top-left');

        const accidentData = [
            { longitude: 144.9631, latitude: -37.8136 }, // Example point in Melbourne
            { longitude: 144.9671, latitude: -37.8138 },
            { longitude: 144.9681, latitude: -37.8126 },
            // Add more points as needed
        ];

        // Add accident points to the map
        accidentData.forEach(point => {
            new mapboxgl.Marker({ color: 'red' })
                .setLngLat([point.longitude, point.latitude])
                .addTo(map.current);
        });
    }, []);

    return (
        <div>
            <div ref={mapContainer} className="map-container" />
        </div>
    );
};

export default Map;
