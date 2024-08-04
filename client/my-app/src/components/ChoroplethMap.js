import React from 'react';
import './ChoroplethMap.css';

const ChoroplethMap = () => {
    const accessToken = process.env.REACT_APP_MAPBOX_CHOROPLETH_ACCESS_TOKEN;

    console.log("Mapbox Choropleth Access Token:", accessToken);

    return (
        <div className="choropleth-map-container">
            {accessToken ? (
                <iframe
                    width='100%'
                    height='400px'
                    src={`https://api.mapbox.com/styles/v1/jyoti6797/clzfg75cv00g801oh8lvt52tu.html?title=false&access_token=${accessToken}&zoomwheel=false#2/38/-34`}
                    title="Choropleth Map"
                    style={{ border: 'none' }}
                ></iframe>
            ) : (
                <p>Loading map...</p>
            )}
        </div>
    );
};

export default ChoroplethMap;
