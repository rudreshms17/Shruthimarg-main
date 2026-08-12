import React from 'react';
import { motion } from 'framer-motion';
import styles from '../styles/About.module.css';

const About = () => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  return (
    <motion.div
      className={styles.aboutContainer}
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
    >
      <motion.h1 variants={itemVariants} className={styles.pageTitle}>
        About <span className={styles.highlightPink}>ShrutiMarg</span>
      </motion.h1>

      <motion.section variants={sectionVariants} className={styles.aboutSection}>
        <h2 className={styles.sectionHeading}>Our Mission</h2>
        <p>
          At ShrutiMarg, we are revolutionizing how you plan your routes. Our mission is to
          provide an intelligent, intuitive, and accessible solution to the classic Traveling
          Salesman Problem (TSP) by leveraging cutting-edge AI and multilingual voice recognition.
          We aim to empower individuals and businesses to optimize their journeys effortlessly.
        </p>
      </motion.section>

      <motion.section variants={sectionVariants} className={styles.aboutSection}>
        <h2 className={styles.sectionHeading}>What We Offer</h2>
        <ul>
          <motion.li variants={itemVariants}>
            <strong>AI-Powered Route Optimization:</strong> Utilizing advanced algorithms like Held-Karp,
            Nearest Neighbor, and Simulated Annealing to find the most efficient paths.
          </motion.li>
          <motion.li variants={itemVariants}>
            <strong>Multilingual Voice Support:</strong> Speak your addresses and commands in English,
            Kannada, or Hindi, making our tool accessible to a diverse user base.
          </motion.li>
          <motion.li variants={itemVariants}>
            <strong>Interactive Map Visualization:</strong> See your optimal route clearly laid out
            on a Google Map, with markers for each point and a path connecting them.
          </motion.li>
          <motion.li variants={itemVariants}>
            <strong>Detailed Route Breakdown:</strong> Get a step-by-step summary of distances between
            each point in your optimized journey.
          </motion.li>
        </ul>
      </motion.section>

      <motion.section variants={sectionVariants} className={styles.aboutSection}>
        <h2 className={styles.sectionHeading}>Our Technology</h2>
        <p>
          ShrutiMarg combines the power of Google Maps APIs for accurate geocoding and distance calculations,
          with robust backend algorithms implemented in Python to solve the TSP. Our React frontend
          provides a dynamic and user-friendly interface, integrating Web Speech APIs for seamless
          voice interaction. We are committed to continuous innovation, enhancing our algorithms and
          expanding language support to serve you better.
        </p>
      </motion.section>

      <motion.section variants={sectionVariants} className={styles.aboutSection}>
        <h2 className={styles.sectionHeading}>Contact Us</h2>
        <p>
          Have questions or feedback? We'd love to hear from you.
          Please reach out to us at <a href="mailto:info@shrutimarg.com" className={styles.contactLink}>info@shrutimarg.com</a>.
        </p>
      </motion.section>
    </motion.div>
  );
};

export default About;