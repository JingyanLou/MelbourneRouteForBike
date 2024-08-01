import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import InsightPage from './pages/InsightPage';
import RoutePage from './pages/RoutePage';
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route exact path="/" element={<HomePage />} />
        <Route path="/insight" element={<InsightPage />} />
        <Route path="/route" element={<RoutePage />} />
      </Routes>
    </Router>
  );
}

export default App;
