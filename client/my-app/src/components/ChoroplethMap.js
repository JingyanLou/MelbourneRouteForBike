import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import './ChoroplethMap.css';

const ChoroplethMap = () => {
    const mapContainerRef = useRef(null);
    const [hoverInfo, setHoverInfo] = useState(null);
    const [year, setYear] = useState('all');
    const [timeZone, setTimeZone] = useState('all');
    const accessToken = process.env.REACT_APP_MAPBOX_CHOROPLETH_ACCESS_TOKEN;

    const melbourneCoordinates = {
        lat: -37.8136,
        lon: 144.9631,
        zoom: 12
    };

    useEffect(() => {
        if (!accessToken) return;

        mapboxgl.accessToken = accessToken;
        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/jyoti6797/clzfg75cv00g801oh8lvt52tu',
            center: [melbourneCoordinates.lon, melbourneCoordinates.lat],
            zoom: melbourneCoordinates.zoom
        });

        map.on('load', () => {
            map.addSource('accidents', {
                type: 'vector',
                url: 'mapbox://jyoti6797.dmrhc5p9' // Replace with your tileset ID
            });

            const filters = [];
            if (year !== 'all') {
                filters.push(['==', 'YEAR', parseInt(year)]);
            }
            if (timeZone !== 'all') {
                filters.push(['==', 'TIME_ZONE', timeZone]);
            }

            map.addLayer({
                id: 'accidents-layer',
                type: 'fill',
                source: 'accidents',
                'source-layer': 'final_output-6xnx9a', // Replace with the source layer name from your tileset
                filter: filters.length > 0 ? ['all', ...filters] : true,
                layout: {},
                paint: {
                    'fill-color': [
                        'interpolate',
                        ['linear'],
                        ['get', 'TOTAL_ACCIDENT_COUNT'],
                        1, '#f1eef6',
                        10, '#bdc9e1',
                        20, '#74a9cf',
                        30, '#2b8cbe',
                        40, '#045a8d'
                    ],
                    'fill-opacity': 0.75
                }
            });

            map.on('mousemove', 'accidents-layer', (e) => {
                if (e.features.length > 0) {
                    setHoverInfo({
                        postcode: e.features[0].properties.POSTCODE,
                        total: e.features[0].properties.TOTAL_ACCIDENT_COUNT
                    });
                }
            });

            map.on('mouseleave', 'accidents-layer', () => {
                setHoverInfo(null);
            });
        });

        return () => map.remove();
    }, [accessToken, year, timeZone]);

    return (
        <div className="choropleth-map-container">
            <div className="filters">
                <label>
                    Year:
                    <select value={year} onChange={(e) => setYear(e.target.value)}>
                        <option value="all">All Years</option>
                        <option value="2022">2022</option>
                        <option value="2023">2023</option>
                    </select>
                </label>
                <label>
                    Time Zone:
                    <select value={timeZone} onChange={(e) => setTimeZone(e.target.value)}>
                        <option value="all">All Timezones</option>
                        <option value="morning">Morning</option>
                        <option value="afternoon">Afternoon</option>
                        <option value="night">Night</option>
                    </select>
                </label>
            </div>
            <div ref={mapContainerRef} className="map-container" />
            <div className="info-box">
                {hoverInfo ? (
                    <p>Postcode {hoverInfo.postcode}: {hoverInfo.total} accidents</p>
                ) : (
                    <p>Hover over a suburb!</p>
                )}
            </div>
        </div>
    );
};

export default ChoroplethMap;
