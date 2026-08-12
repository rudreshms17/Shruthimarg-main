import React from 'react';
import { motion } from 'framer-motion';
import styles from '../styles/Footer.module.css';

const Footer = () => {
  return (
    <motion.footer
      className={styles.footer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <p>&copy; {new Date().getFullYear()} ShrutiMarg. All rights reserved.</p>
      <p>Speak. Discover. Reach.</p>
    </motion.footer>
  );
};

export default Footer;