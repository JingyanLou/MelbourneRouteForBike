import React, { useRef, useEffect, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './ChoroplethMap.css';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const ChoroplethMap = () => {
    const mapContainer = useRef(null);
    const map = useRef(null);

    const generateMockAccidentData = (numPoints) => {
        const data = [];
        const minLng = 144.9470;
        const maxLng = 144.9850;
        const minLat = -37.8250;
        const maxLat = -37.8050;
        for (let i = 0; i < numPoints; i++) {
            const longitude = Math.random() * (maxLng - minLng) + minLng;
            const latitude = Math.random() * (maxLat - minLat) + minLat;
            const severity = Math.floor(Math.random() * 6) + 1; // Severity between 1 and 6
            data.push({ longitude, latitude, severity });
        }
        return data;
    };

    const accidentData = useMemo(() => generateMockAccidentData(1000), []);

    useEffect(() => {
        if (map.current) return; // initialize map only once
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [144.9631, -37.8136], // Melbourne coordinates
            zoom: 14
        });

        map.current.on('load', () => {
            // Add a GeoJSON source with the accident data and enable clustering
            map.current.addSource('accidents', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: accidentData.map(point => ({
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [point.longitude, point.latitude],
                        },
                        properties: {
                            severity: point.severity,
                        },
                    })),
                },
                cluster: true,
                clusterMaxZoom: 14, // Max zoom to cluster points on
                clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
            });

            // Add a heatmap layer
            map.current.addLayer({
                id: 'accidents-heatmap',
                type: 'heatmap',
                source: 'accidents',
                maxzoom: 15,
                paint: {
                    // Increase the heatmap weight based on frequency and severity
                    'heatmap-weight': [
                        'interpolate',
                        ['linear'],
                        ['get', 'severity'],
                        0, 0,
                        6, 2, // Increased weight
                    ],
                    // Increase the heatmap color weight by zoom level
                    // heatmap-intensity is a multiplier on top of heatmap-weight
                    'heatmap-intensity': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        0, 1,
                        15, 5, // Increased intensity
                    ],
                    // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
                    // Begin color ramp at 0-stop with a 0-transparancy color
                    // to create a blur-like effect.
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
                    // Adjust the heatmap radius by zoom level
                    'heatmap-radius': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        0, 20, // Increased radius
                        15, 40, // Increased radius
                    ],
                    // Adjust the heatmap opacity by zoom level
                    'heatmap-opacity': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        0, 1,
                        15, 0.5,
                    ],
                },
            });

            // Add cluster circles
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

            // Add cluster count labels
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

            // Add unclustered points
            map.current.addLayer({
                id: 'unclustered-point',
                type: 'circle',
                source: 'accidents',
                filter: ['!', ['has', 'point_count']],
                paint: {
                    'circle-color': 'rgba(33,102,172,0)',
                    'circle-radius': 8,
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#fff'
                }
            });

            // Event listener for cluster clicks
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

            // Event listener for unclustered points
            map.current.on('click', 'unclustered-point', (e) => {
                const coordinates = e.features[0].geometry.coordinates.slice();
                const severity = e.features[0].properties.severity;

                new mapboxgl.Popup()
                    .setLngLat(coordinates)
                    .setHTML(`Severity: ${severity}`)
                    .addTo(map.current);
            });

            // Change the cursor to a pointer when over clusters
            map.current.on('mouseenter', 'clusters', () => {
                map.current.getCanvas().style.cursor = 'pointer';
            });
            map.current.on('mouseleave', 'clusters', () => {
                map.current.getCanvas().style.cursor = '';
            });
        });
    }, [accidentData]);

    return <div ref={mapContainer} className="map-container" />;
};

export default ChoroplethMap;
