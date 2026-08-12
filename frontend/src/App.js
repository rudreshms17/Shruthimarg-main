import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Solver from './pages/Solver';
import About from './pages/About';
import Guidelines from './pages/Guidelines';
import styles from './styles/App.module.css'; // For App-specific styles

function App() {
  return (
    <Router>
      <div className={styles.appContainer}>
        <Navbar />
        <main className={styles.mainContent}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/solve" element={<Solver />} />
            <Route path="/about" element={<About />} />
            <Route path="/guidelines" element={<Guidelines />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;