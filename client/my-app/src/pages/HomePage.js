import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
    const navigate = useNavigate();

    const handlePlanNowClick = () => {
        navigate('/route');
    };

    const handleDiscoverClick = () => {
        navigate('/insight');
    };

    const handleScrollDown = () => {
        const landmarksSection = document.querySelector('.landmarks');
        landmarksSection.scrollIntoView({ behavior: 'smooth' });
    };

    const handleScrollUp = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div>
            <div className="hero">
                <img src="/images/melbournebike.jpg" alt="Melbourne Bicycle Path" className="hero-image" />
                <div className="hero-text">
                    <h2>Ready to plan for the trip?See how many accidents on the selected route</h2>
                    <button className="plan-button" onClick={handlePlanNowClick}>Plan now</button>
                </div>
                <div className="down-arrow" onClick={handleScrollDown}>&#x2193;</div>
            </div>

            <section className="landmarks">
                <img src="/images/yarrabike.jpeg" alt="Melbourne Landmarks" className="landmark-image" />
                <div className="landmark-text">
                    <h2>Discover Historical Accidents for insights</h2>
                    <button className="discover-button" onClick={handleDiscoverClick}>Discover</button>
                </div>
                <div className="up-arrow" onClick={handleScrollUp}>&#x2191;</div>
            </section>






        </div>
    );
};

export default HomePage;
