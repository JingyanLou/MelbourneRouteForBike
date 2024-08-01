import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-brand">Melbourne Bicycle Route</div>
            <div className="navbar-links">
                <Link to="/">Home</Link>
                <Link to="/route">Route</Link>
                <Link to="/insight">Insight</Link>
            </div>
        </nav>
    );
};

export default Navbar;
