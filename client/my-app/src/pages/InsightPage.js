import React from 'react';
import './InsightPage.css';

import ChoroplethMap from '../components/ChoroplethMap';
import Barchart from '../components/Barchart';

const InsightPage = () => {
    return (
        <div className="insight-page">
            <ChoroplethMap />
            <Barchart />
        </div>
    );
};

export default InsightPage;
