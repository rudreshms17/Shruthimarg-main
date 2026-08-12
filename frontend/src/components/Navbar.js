import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from '../styles/Navbar.module.css';
import logo from '../assets/tsp_logo.png'; // Make sure the path is correct

const Navbar = () => {
  return (
    <motion.nav
      className={styles.navbar}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 14 }}
    >
      <div className={styles.navbarBrand}>
        <Link to="/">
          <img src={logo} alt="ShrutiMarg Logo" className={styles.logo} />
          <span>ShrutiMarg</span>
        </Link>
      </div>
      <ul className={styles.navbarNav}>
        <motion.li whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link to="/">Home</Link>
        </motion.li>
        <motion.li whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link to="/solve">Solve TSP</Link>
        </motion.li>
        <motion.li whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link to="/about">About Us</Link>
        </motion.li>
        <motion.li whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link to="/guidelines">Guidelines</Link>
        </motion.li>
      </ul>
    </motion.nav>
  );
};

export default Navbar;