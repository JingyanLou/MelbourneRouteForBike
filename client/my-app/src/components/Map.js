import React, { useRef, useEffect, useState, useCallback } from 'react';
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

    const countAccidentsOnRoute = useCallback((routeCoordinates, accidentData) => {
        const thresholdDistance = 7; // Adjust this threshold distance as necessary for testing
        console.log(`Threshold distance: ${thresholdDistance} meters`);
        let count = 0;

        const accidentGrid = buildGrid(accidentData, 0.0001); // Build a grid with a smaller cell size for higher precision
        console.log('Accident grid:', accidentGrid);

        for (let routeCoord of routeCoordinates) {
            const potentialAccidents = getNearbyPoints(routeCoord, accidentGrid, 0.0001);
            for (let accidentPoint of potentialAccidents) {
                const distance = calculateDistance(routeCoord, accidentPoint.geometry.coordinates);
                console.log(`Distance between route point ${routeCoord} and accident point ${accidentPoint.geometry.coordinates}: ${distance} meters`);
                if (distance <= thresholdDistance) {
                    count++;
                    break;
                }
            }
        }
        return count;
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
    }, [routeCoordinates, accidentData, countAccidentsOnRoute]);

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

        const distance = R * c;
        console.log(`Calculated distance: ${distance} meters`);
        return distance;
    };

    const buildGrid = (data, cellSize) => {
        const grid = {};
        for (let point of data) {
            const [lon, lat] = point.geometry.coordinates;
            const x = Math.floor(lon / cellSize);
            const y = Math.floor(lat / cellSize);
            const key = `${x},${y}`;
            if (!grid[key]) {
                grid[key] = [];
            }
            grid[key].push(point);
        }
        return grid;
    };

    const getNearbyPoints = (coord, grid, cellSize) => {
        const [lon, lat] = coord;
        const x = Math.floor(lon / cellSize);
        const y = Math.floor(lat / cellSize);

        let points = [];
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const neighborKey = `${x + i},${y + j}`;
                if (grid[neighborKey]) {
                    points = points.concat(grid[neighborKey]);
                }
            }
        }
        console.log(`Nearby points for coordinate ${coord}:`, points);
        return points;
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
