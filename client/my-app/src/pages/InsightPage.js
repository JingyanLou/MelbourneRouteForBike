import React from 'react';
import './InsightPage.css';

import ChoroplethMap from '../components/ChoroplethMap';
const InsightPage = () => {
    return (
        <div className="insight-page">
            <ChoroplethMap></ChoroplethMap>
        </div>
    );
};

export default InsightPage;
