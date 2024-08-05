import React from 'react';
import './InsightPage.css';

import ChoroplethMap from '../components/ChoroplethMap';
import Barchart from '../components/Barchart';

const InsightPage = () => {
    return (
        <div className="insight-page">
            <div className="map-section">
                <ChoroplethMap />
            </div>
            <div className="sidebar">
                <div className="barchart-section">
                    <Barchart />
                </div>
            </div>
        </div>
    );
};

export default InsightPage;
