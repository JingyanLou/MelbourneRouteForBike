import React, { useState } from 'react';
import './InsightPage.css';

import ChoroplethMap from '../components/ChoroplethMap';
import Barchart from '../components/Barchart';

const InsightPage = () => {
    const [year, setYear] = useState('2022');
    const [timezone, setTimezone] = useState('Morning');

    return (
        <div className="insight-page">
            <div className="map-section">
                <ChoroplethMap year={year} timezone={timezone} />
            </div>
            <div className="sidebar">
                <div className="filters">
                    <label>
                        Year:
                        <select value={year} onChange={(e) => setYear(e.target.value)}>
                            <option value="2022">2022</option>
                            <option value="2023">2023</option>
                        </select>
                    </label>
                    <label>
                        Time Zone:
                        <select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                            <option value="Morning">Morning</option>
                            <option value="Afternoon">Afternoon</option>
                            <option value="Night">Night</option>
                        </select>
                    </label>
                </div>
                <div className="barchart-section">
                    <Barchart year={year} timezone={timezone} />
                </div>
            </div>
        </div>
    );
};

export default InsightPage;
