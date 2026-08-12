import React from 'react';
import { motion } from 'framer-motion';
import styles from '../styles/Guidelines.module.css';

const Guidelines = () => {
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
      className={styles.guidelinesContainer}
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
    >
      <motion.h1 variants={itemVariants} className={styles.pageTitle}>
        <span className={styles.highlightYellow}>Guidelines</span> for Use
      </motion.h1>

      <motion.section variants={sectionVariants} className={styles.guidelineSection}>
        <h2 className={styles.sectionHeading}>1. Getting Started</h2>
        <ul>
          <motion.li variants={itemVariants}>
            <strong>Choose Your Language:</strong> On the "Solve TSP" page, select your preferred
            language (English, Kannada, or Hindi) from the dropdown. This will affect both
            text prompts and voice recognition.
          </motion.li>
          <motion.li variants={itemVariants}>
            <strong>Select Input Mode:</strong> Decide whether you want to use "Text Input/Output"
            or "Voice Input/Output." If you choose voice, ensure your microphone is enabled.
          </motion.li>
        </ul>
      </motion.section>

      <motion.section variants={sectionVariants} className={styles.guidelineSection}>
        <h2 className={styles.sectionHeading}>2. Adding Delivery Points</h2>
        <ul>
          <motion.li variants={itemVariants}>
            <strong>Enter Addresses:</strong> Type or speak the full address for each delivery point
            you want to include in your route. Press "Add Point" after each entry.
          </motion.li>
          <motion.li variants={itemVariants}>
            <strong>Accuracy Matters:</strong> For best results, use precise and complete addresses
            (e.g., "1600 Amphitheatre Parkway, Mountain View, CA").
          </motion.li>
          <motion.li variants={itemVariants}>
            <strong>Monitor Status:</strong> The system will confirm if the address was successfully
            located. If an error occurs, please check the address and try again.
          </motion.li>
        </ul>
      </motion.section>

      <motion.section variants={sectionVariants} className={styles.guidelineSection}>
        <h2 className={styles.sectionHeading}>3. Selecting a Starting Point</h2>
        <ul>
          <motion.li variants={itemVariants}>
            <strong>Choose from List:</strong> After adding all your points, you'll see a numbered
            list. Enter the number corresponding to your desired starting point in the input field.
          </motion.li>
          <motion.li variants={itemVariants}>
            <strong>Validity Check:</strong> Ensure the starting point number is valid (within the
            range of your added points).
          </motion.li>
        </ul>
      </motion.section>

      <motion.section variants={sectionVariants} className={styles.guidelineSection}>
        <h2 className={styles.sectionHeading}>4. Solving the TSP</h2>
        <ul>
          <motion.li variants={itemVariants}>
            <strong>Initiate Calculation:</strong> Click the "Solve TSP" button. The system will
            then precompute distances and run the appropriate TSP algorithm.
          </motion.li>
          <motion.li variants={itemVariants}>
            <strong>Algorithm Selection:</strong>
            <ul>
              <motion.li variants={itemVariants}>
                For <strong>10 or fewer points</strong>, the Nearest Neighbor algorithm is used (fast, good approximation).
              </motion.li>
              <motion.li variants={itemVariants}>
                For <strong>11 to 20 points</strong>, the Held-Karp (Dynamic Programming) algorithm is used (optimal, but slower for more points).
              </motion.li>
              <motion.li variants={itemVariants}>
                For <strong>more than 20 points</strong>, an Enhanced Simulated Annealing algorithm is used (heuristic, finds good solutions for large problems).
              </motion.li>
            </ul>
          </motion.li>
          <motion.li variants={itemVariants}>
            <strong>View Results:</strong> The optimal path will be displayed on the Google Map,
            along with the total distance and a step-by-step breakdown in a table below the map.
          </motion.li>
        </ul>
      </motion.section>

      <motion.section variants={sectionVariants} className={styles.guidelineSection}>
        <h2 className={styles.sectionHeading}>5. Voice Input Specifics</h2>
        <ul>
          <motion.li variants={itemVariants}>
            <strong>Clear Speech:</strong> Speak clearly and at a moderate pace for accurate
            recognition.
          </motion.li>
          <motion.li variants={itemVariants}>
            <strong>Environmental Noise:</strong> Minimize background noise for better
            performance.
          </motion.li>
          <motion.li variants={itemVariants}>
            <strong>Retries:</strong> If the system doesn't understand, it will prompt you
            to try again. After a few attempts, it may switch to text input.
          </motion.li>
        </ul>
      </motion.section>
    </motion.div>
  );
};

export default Guidelines;