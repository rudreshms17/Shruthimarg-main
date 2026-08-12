import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from '../styles/Home.module.css';
import refImage from '../assets/ref.png'; // Assuming you put ref.jpg in assets

const Home = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className={styles.homeContainer}>
      <motion.section
        className={styles.heroSection}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className={styles.heroContent}>
          <motion.h1 variants={itemVariants} className={styles.heroTitle}>
            Unlock The Power Of <span className={styles.highlightPink}>ShrutiMarg</span> With <br />
            <span className={styles.highlightYellow}>Smartest AI</span>
          </motion.h1>
          <motion.p variants={itemVariants} className={styles.heroSubtitle}>
            Your Voice, Our Way. Where Directions Follow Your Voice.
          </motion.p>
          <motion.div variants={itemVariants} className={styles.heroActions}>
            <Link to="/solve">
              <motion.button
                className={styles.primaryButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Solving for Free
              </motion.button>
            </Link>
            <motion.a
              href="#how-it-works"
              className={styles.secondaryLink}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              See how it works
            </motion.a>
          </motion.div>
        </div>
        <motion.div variants={itemVariants} className={styles.heroImageContainer}>
          <img src={refImage} alt="AI Content Generation" className={styles.heroImage} />
        </motion.div>
      </motion.section>

      <motion.section
        className={styles.featuresSection}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.h2 variants={itemVariants} className={styles.sectionTitle}>
          Instant Route Optimization with AI
        </motion.h2>
        <div className={styles.featuresGrid}>
          <motion.div variants={itemVariants} className={styles.featureCard}>
            <h3 className={styles.cardTitle}>Effortless Routing</h3>
            <p className={styles.cardDescription}>
              Input your delivery points easily and let our AI optimize the route. Save time, achieve more.
            </p>
          </motion.div>
          <motion.div variants={itemVariants} className={styles.featureCard}>
            <h3 className={styles.cardTitle}>Your Voice, Our Tech</h3>
            <p className={styles.cardDescription}>
              Discover how AI can transform your voice into precise commands for seamless route planning.
            </p>
          </motion.div>
          <motion.div variants={itemVariants} className={styles.featureCard}>
            <h3 className={styles.cardTitle}>AI-Powered Optimization</h3>
            <p className={styles.cardDescription}>
              Access AI-generated solutions for your complex routing problems with our powerful convention service.
            </p>
          </motion.div>
          <motion.div variants={itemVariants} className={styles.featureCard}>
            <h3 className={styles.cardTitle}>Multilingual Support</h3>
            <p className={styles.cardDescription}>
              Experience the ease of communication with our AI service. Speak any language, we'll lead the way.
            </p>
          </motion.div>
          <motion.div variants={itemVariants} className={styles.featureCard}>
            <h3 className={styles.cardTitle}>Quality AI Content</h3>
            <p className={styles.cardDescription}>
              Get professionally optimized routes in no time with our AI service. Quality meets efficiency.
            </p>
          </motion.div>
          <motion.div variants={itemVariants} className={styles.featureCard}>
            <h3 className={styles.cardTitle}>Your Routing Assistant</h3>
            <p className={styles.cardDescription}>
              Collaborate with AI to generate optimal routes that resonate with your needs. Try it now.
            </p>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        id="how-it-works"
        className={styles.howItWorksSection}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.h2 variants={itemVariants} className={styles.sectionTitle}>
          Guide Our AI to Create Your Route
        </motion.h2>
        <div className={styles.stepsGrid}>
          <motion.div variants={itemVariants} className={styles.stepCard}>
            <span className={styles.stepNumber}>1.</span>
            <h3 className={styles.stepTitle}>Select Language & Mode</h3>
            <p className={styles.stepDescription}>
              Choose your preferred language (English, Kannada, Hindi) and input mode (text or voice).
            </p>
          </motion.div>
          <motion.div variants={itemVariants} className={styles.stepCard}>
            <span className={styles.stepNumber}>2.</span>
            <h3 className={styles.stepTitle}>Describe Locations</h3>
            <p className={styles.stepDescription}>
              Enter your delivery points, either by typing or speaking their addresses.
            </p>
          </motion.div>
          <motion.div variants={itemVariants} className={styles.stepCard}>
            <span className={styles.stepNumber}>3.</span>
            <h3 className={styles.stepTitle}>Generate Optimal Route</h3>
            <p className={styles.stepDescription}>
              Our AI processes your input and provides the most efficient route on a map.
            </p>
          </motion.div>
        </div>
        <motion.div variants={itemVariants} className={styles.howItWorksActions}>
          <Link to="/solve">
            <motion.button
              className={styles.primaryButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Solving for Free
            </motion.button>
          </Link>
          {/* <motion.a
            href="#"
            className={styles.secondaryLink}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            See action in video
          </motion.a> */}
        </motion.div>
      </motion.section>
    </div>
  );
};

export default Home;