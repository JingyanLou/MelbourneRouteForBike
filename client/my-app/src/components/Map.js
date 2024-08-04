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
    const directionsContainer = useRef(null);
    const map = useRef(null);
    const [accidentData, setAccidentData] = useState([]);
    const [accidentsOnRoute, setAccidentsOnRoute] = useState(0);
    const [routeCoordinates, setRouteCoordinates] = useState([]);

    useEffect(() => {
        console.log("Map container reference: ", mapContainer.current);
        if (map.current) return; // initialize map only once

        if (mapContainer.current) {
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

            directionsContainer.current.appendChild(directions.onAdd(map.current));

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

                    setAccidentData(geojson.features);

                    map.current.on('load', () => {
                        map.current.addSource('accidents', {
                            type: 'geojson',
                            data: geojson,
                            cluster: true,
                            clusterMaxZoom: 14,
                            clusterRadius: 50,
                        });

                        map.current.addLayer({
                            id: 'accidents-heatmap',
                            type: 'heatmap',
                            source: 'accidents',
                            maxzoom: 15,
                            paint: {
                                'heatmap-weight': [
                                    'interpolate',
                                    ['linear'],
                                    ['get', 'severity'],
                                    0, 0,
                                    6, 2,
                                ],
                                'heatmap-intensity': [
                                    'interpolate',
                                    ['linear'],
                                    ['zoom'],
                                    0, 1,
                                    15, 5,
                                ],
                                'heatmap-color': [
                                    'interpolate',
                                    ['linear'],
                                    ['heatmap-density'],
                                    0, 'rgba(33,102,172,0)',
                                    0.2, 'rgb(103,169,207)',
                                    0.4, 'rgb(209,229,240)',
                                    0.6, 'rgb(253,219,199)',
                                    0.8, 'rgb(239,138,98)',
                                    1, 'rgb(178,24,43)',
                                ],
                                'heatmap-radius': [
                                    'interpolate',
                                    ['linear'],
                                    ['zoom'],
                                    0, 20,
                                    15, 40,
                                ],
                                'heatmap-opacity': [
                                    'interpolate',
                                    ['linear'],
                                    ['zoom'],
                                    0, 1,
                                    15, 0.5,
                                ],
                            },
                        });

                        map.current.addLayer({
                            id: 'clusters',
                            type: 'circle',
                            source: 'accidents',
                            filter: ['has', 'point_count'],
                            paint: {
                                'circle-color': [
                                    'step',
                                    ['get', 'point_count'],
                                    '#51bbd6',
                                    100,
                                    '#f1f075',
                                    750,
                                    '#f28cb1'
                                ],
                                'circle-radius': [
                                    'step',
                                    ['get', 'point_count'],
                                    20,
                                    100,
                                    30,
                                    750,
                                    40
                                ]
                            }
                        });

                        map.current.addLayer({
                            id: 'cluster-count',
                            type: 'symbol',
                            source: 'accidents',
                            filter: ['has', 'point_count'],
                            layout: {
                                'text-field': '{point_count_abbreviated}',
                                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                                'text-size': 12
                            }
                        });

                        map.current.addLayer({
                            id: 'unclustered-point',
                            type: 'circle',
                            source: 'accidents',
                            filter: ['!', ['has', 'point_count']],
                            paint: {
                                'circle-color': '#FF0000',
                                'circle-radius': 8,
                                'circle-stroke-width': 1,
                                'circle-stroke-color': '#fff',
                                'circle-opacity': 0.9
                            }
                        });

                        map.current.on('click', 'clusters', (e) => {
                            const features = map.current.queryRenderedFeatures(e.point, {
                                layers: ['clusters']
                            });
                            const clusterId = features[0].properties.cluster_id;
                            map.current.getSource('accidents').getClusterExpansionZoom(
                                clusterId,
                                (err, zoom) => {
                                    if (err) return;

                                    map.current.easeTo({
                                        center: features[0].geometry.coordinates,
                                        zoom: zoom
                                    });
                                }
                            );
                        });

                        map.current.on('click', 'unclustered-point', (e) => {
                            const coordinates = e.features[0].geometry.coordinates.slice();
                            const severity = e.features[0].properties.severity;

                            new mapboxgl.Popup()
                                .setLngLat(coordinates)
                                .setHTML(`Severity: ${severity}`)
                                .addTo(map.current);
                        });

                        map.current.on('mouseenter', 'clusters', () => {
                            map.current.getCanvas().style.cursor = 'pointer';
                        });
                        map.current.on('mouseleave', 'clusters', () => {
                            map.current.getCanvas().style.cursor = '';
                        });
                    });
                })
                .catch(error => console.error('Error fetching accident data:', error));

            directions.on('route', (event) => {
                const route = event.route[0];
                const decodedCoordinates = polyline.decode(route.geometry);
                setRouteCoordinates(decodedCoordinates.map(coord => [coord[1], coord[0]]));
            });
        }
    }, []);

    const countAccidentsOnRoute = useCallback((routeCoordinates, accidentData) => {
        const thresholdDistance = 7; // Adjust this threshold distance as necessary for testing
        let count = 0;

        const accidentGrid = buildGrid(accidentData, 0.0001); // Build a grid with a smaller cell size for higher precision

        for (let routeCoord of routeCoordinates) {
            const potentialAccidents = getNearbyPoints(routeCoord, accidentGrid, 0.0001);
            for (let accidentPoint of potentialAccidents) {
                const distance = calculateDistance(routeCoord, accidentPoint.geometry.coordinates);
                if (distance <= thresholdDistance) {
                    count++;
                    break;
                }
            }
        }
        return count;
    }, []);

    useEffect(() => {
        if (routeCoordinates.length > 0 && accidentData.length > 0) {
            const accidentsOnRoute = countAccidentsOnRoute(routeCoordinates, accidentData);
            setAccidentsOnRoute(accidentsOnRoute);
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

        return R * c;
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
        return points;
    };

    return (
        <div className="map-wrapper">
            <div className="sidebar">
                <div ref={directionsContainer} className="directions-container" />
                <div className="accident-info">
                    Warning: There have been {accidentsOnRoute} accidents along this route.
                </div>

            </div>
            <div ref={mapContainer} className="map-container" />
        </div>
    );
};

export default Map;
