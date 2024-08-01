import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <nav className="navbar">
          <div className="navbar-brand">Melbourne Bicycle Route</div>
          <div className="navbar-links">
            <a href="/">Home</a>
            <a href="/route">Route</a>
            <a href="/insight">Insight</a>
          </div>
        </nav>
        <div className="hero">
          <img src="/images/melbournebike.jpg" alt="Melbourne Bicycle Path" className="hero-image" />
          <div className="hero-text">
            <h2>Ready to ride? Plan your trip now</h2>
            <button className="plan-button">Plan now</button>
          </div>
        </div>
      </header>

      <section className="landmarks">
        <img src="/images/yarrabike.jpeg" alt="Melbourne Landmarks" className="landmark-image" />
        <div className="landmark-text">
          <h2>Discover more Melbourne landmarks</h2>
          <button className="discover-button">Discover</button>
        </div>
      </section>
    </div>
  );
}

export default App;
