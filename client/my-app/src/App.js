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
            <a href="/location">Location</a>
            <a href="/profile">My profile</a>
            <button className="signin-button">Sign In</button>
          </div>
        </nav>
        <div className="hero">
          <img src="/images/melbournebike.jpg" alt="Melbourne Bicycle Path" className="hero-image" />
          <div className="hero-text">
            <h1>Ready to ride? Plan your trip now</h1>
            <button className="plan-button">Plan now</button>
          </div>
        </div>
      </header>
      <section className="features">
        <div className="feature-item">
          <img src="/images/accident.png" alt="Historical Accident" />
          <h2>Historical Accident</h2>
        </div>
        <div className="feature-item">
          <img src="/images/book.png" alt="Melbourne Traffic Rules" />
          <h2>Melbourne Traffic Rules</h2>
        </div>
        <div className="feature-item">
          <img src="/images/feedback.png" alt="Feedback" />
          <h2>Feedback</h2>
        </div>
      </section>
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
