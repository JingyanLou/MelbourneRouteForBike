import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import polyline from '@mapbox/polyline';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';
import './Map.css';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const Map = () => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [accidentData, setAccidentData] = useState([]);
    const [accidentsOnRoute, setAccidentsOnRoute] = useState(0);
    const [routeCoordinates, setRouteCoordinates] = useState([]);

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

        // Fetch accident data from the backend
        fetch('http://localhost:5000/api/accidents')
            .then(response => response.json())
            .then(data => {
                const geojson = {
                    type: 'FeatureCollection',
                    features: data.map(point => ({
                        type: 'Feature',
                        properties: {
                            severity: point.SEVERITY
                        },
                        geometry: {
                            type: 'Point',
                            coordinates: [point.LONGITUDE, point.LATITUDE]
                        }
                    }))
                };

                console.log('Fetched accident data:', geojson.features); // Debug log
                setAccidentData(geojson.features);

                map.current.on('load', () => {
                    map.current.addSource('accidents', {
                        type: 'geojson',
                        data: geojson
                    });

                    map.current.addLayer({
                        id: 'accidents-layer',
                        type: 'circle',
                        source: 'accidents',
                        paint: {
                            'circle-radius': 5,
                            'circle-color': '#FF0000', // Red color for all points
                            'circle-stroke-width': 1,
                            'circle-stroke-color': '#fff'
                        }
                    });
                });
            })
            .catch(error => console.error('Error fetching accident data:', error));

        // Listen for the route event
        directions.on('route', (event) => {
            const route = event.route[0];
            const decodedCoordinates = polyline.decode(route.geometry);
            console.log('Route coordinates:', decodedCoordinates);
            setRouteCoordinates(decodedCoordinates.map(coord => [coord[1], coord[0]])); // Correct the order of coordinates
        });
    }, []);

    useEffect(() => {
        console.log('routeCoordinates:', routeCoordinates);
        console.log('accidentData:', accidentData);

        if (routeCoordinates.length > 0 && accidentData.length > 0) {
            // Check how many accidents are on the route
            const accidentsOnRoute = countAccidentsOnRoute(routeCoordinates, accidentData);
            setAccidentsOnRoute(accidentsOnRoute);
            console.log('Accidents on route:', accidentsOnRoute);
        }
    }, [routeCoordinates, accidentData]);

    const countAccidentsOnRoute = (routeCoordinates, accidentData) => {
        const thresholdDistance = 500; // Adjust this threshold distance as necessary for testing
        let count = 0;

        for (let point of accidentData) {
            for (let routeCoord of routeCoordinates) {
                const distance = calculateDistance(routeCoord, point.geometry.coordinates);
                console.log(`Distance between route point ${routeCoord} and accident point ${point.geometry.coordinates}: ${distance} meters`);
                if (distance <= thresholdDistance) {
                    count++;
                    break;
                }
            }
        }
        return count;
    };

    const calculateDistance = (coord1, coord2) => {
        const [lat1, lon1] = coord1;
        const [lat2, lon2] = coord2;

        const R = 6371e3; // Earth radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    };

    return (
        <div>
            <div ref={mapContainer} className="map-container" />
            {accidentsOnRoute > 0 && (
                <div className="accident-info">
                    Warning: There have been {accidentsOnRoute} accidents along this route.
                </div>
            )}
        </div>
    );
};

export default Map;
