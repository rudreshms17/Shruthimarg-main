import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, PolylineF } from '@react-google-maps/api';
import { motion } from 'framer-motion';
import styles from '../styles/Solver.module.css';
import axios from 'axios';

function playKannadaTTS(text) {
    return new Promise((resolve) => {
        const url = `http://localhost:5000/api/kannada-tts?text=${encodeURIComponent(text)}`;
        const audio = new Audio(url);
        audio.type = "audio/mpeg";

        let resolved = false;

        audio.onended = () => {
            if (!resolved) resolve();
            resolved = true;
        };

        audio.onerror = (e) => {
            console.error("Kannada TTS play failed:", e);
            if (!resolved) resolve();
            resolved = true;
        };

        audio.oncanplaythrough = () => {
            audio.play().catch(err => {
                console.error("Kannada audio play error:", err);
                if (!resolved) resolve();
            });
        };
    });
}

// Google Maps API Key - In a real app, load from environment variable
const Maps_API_KEY = process.env.REACT_APP_Maps_API_KEY;

const containerStyle = {
    width: '100%',
    height: '600px',
    borderRadius: '10px',
    boxShadow: '0 5px 20px rgba(0, 0, 0, 0.5)',
};

const center = {
    lat: 12.9716, // Default to Bangalore coordinates
    lng: 77.5946,
};

const languageOptions = {
    'en': { name: 'English', sr_code: 'en-US', gtts_code: 'en' },
    'kn': { name: 'Kannada', sr_code: 'kn-IN', gtts_code: 'kn' }, // Ensure 'kn-IN' is recognized by browser TTS
    'hi': { name: 'Hindi', sr_code: 'hi-IN', gtts_code: 'hi' },
};

const MESSAGES = {
    'en': {
        'welcome': "Welcome to the Traveling Salesman Problem Solver with Multilingual Voice Support!",
        'choose_language': "Choose your preferred language:",
        'language_enabled': "{0} language enabled!",
        'choose_mode': "Choose input/output mode:",
        'voice_enabled': "Voice mode enabled! I will now use speech for input and output.",
        'text_enabled': "Text mode enabled!",
        'enter_points': "Enter the number of delivery points: ", // This input is not directly used in the UI flow now, but good to keep
        'enter_address': "Enter the address for Point {0}: ", // Changed to {0} for consistent indexing
        'looking_up': "Looking up coordinates for {0}...",
        'located_success': "Successfully located {0}",
        'location_error': "Could not find coordinates for address: {0}",
        'available_points': "Available points:",
        'your_locations': "Your locations are: ",
        'enter_start_point': "Enter the number of the starting point: ",
        'invalid_start': "Invalid starting point. Please enter a number between 1 and {0}.",
        'start_point_set': "Starting point set to: {0}",
        'precomputing': "Precomputing distance matrix...",
        'progress': "Progress: {0:.1f}% complete",
        'distance_complete': "Distance calculations complete",
        'distances_from_start': "Distances from starting point: {0}",
        'step_distances': "Step-by-step distances in the optimal path:",
        'total_distance': "Total Distance: {0:.2f} kilometers",
        'using_nn': "Using Nearest Neighbor Algorithm for small number of points",
        'using_hk': "Using Held-Karp Algorithm for optimal solution",
        'using_sa': "Using Enhanced Simulated Annealing Algorithm for large problem",
        'running_hk': "Running Held-Karp algorithm for optimal solution...",
        'hk_complete': "Held-Karp algorithm complete. Final cost: {0:.2f} kilometers",
        'sa_starting': "Starting enhanced simulated annealing optimization...",
        'sa_initial': "Initial solution cost: {0:.2f} kilometers",
        'sa_complete': "Enhanced Simulated Annealing complete. Final cost: {0:.2f} kilometers",
        'optimal_path': "Optimal Path: {0}",
        'route_complete': "Route optimization complete!",
        'listening': "Listening... (speak now)",
        'no_speech': "No speech detected. Please try again.",
        'not_understood': "I couldn't understand what you said. Please try again.",
        'speech_error': "There was an error with speech recognition. Please type your response.",
        'didnt_understand': "I didn't understand that. Please try again. (Attempt {0}/{1})",
        'switching_text': "Switching to text input for this question.",
        'is_kilometers_away': "is {0:.1f} kilometers away",
        'route_speech': "Your optimal route covers {0:.1f} kilometers. Starting from {1}, ",
        'then': "then {0}",
        'return_to': "and finally return to {0}",
        'from_to': "From {0} to {1}: {2:.1f} kilometers",
        'add_more_points': "Please add at least two points for a meaningful calculation.", // Added 'at least two'
        'enter_num_points': "Please enter the number of delivery points.",
        'invalid_num_points': "Invalid number of points. Please enter a number.",
        'processing_input': "Processing your input...",
    },
    'kn': {
        'welcome': "ಬಹುಭಾಷಾ ಧ್ವನಿ ಬೆಂಬಲದೊಂದಿಗೆ ಪ್ರಯಾಣಿಕ ಮಾರಾಟಗಾರ ಸಮಸ್ಯೆ ಪರಿಹಾರಕ್ಕೆ ಸ್ವಾಗತ!",
        'choose_language': "ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ:",
        'language_enabled': "{0} ಭಾಷೆ ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ!",
        'choose_mode': "ಇನ್‌ಪುಟ್/ಔಟ್‌ಪುಟ್ ಮೋಡ್ ಆಯ್ಕೆ ಮಾಡಿ:",
        'voice_enabled': "ಧ್ವನಿ ಮೋಡ್ ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ! ನಾನು ಈಗ ಇನ್‌ಪುಟ್ ಮತ್ತು ಔಟ್‌ಪುಟ್‌ಗಾಗಿ ಧ್ವನಿಯನ್ನು ಬಳಸುತ್ತೇನೆ.",
        'text_enabled': "ಪಠ್ಯ ಮೋಡ್ ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ!",
        'enter_points': "ವಿತರಣಾ ಬಿಂದುಗಳ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ: ",
        'enter_address': "ಬಿಂದು {0} ಗಾಗಿ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ: ",
        'looking_up': "{0} ಗಾಗಿ ನಿರ್ದೇಶಾಂಕಗಳನ್ನು ಹುಡುಕುತ್ತಿರುವೆ...",
        'located_success': "{0} ಅನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಪತ್ತೆ ಮಾಡಲಾಗಿದೆ",
        'location_error': "ವಿಳಾಸಕ್ಕೆ ನಿರ್ದೇಶಾಂಕಗಳನ್ನು ಕಂಡುಹಿಡಿಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ: {0}",
        'available_points': "ಲಭ್ಯವಿರುವ ಬಿಂದುಗಳು:",
        'your_locations': "ನಿಮ್ಮ ಸ್ಥಳಗಳು: ",
        'enter_start_point': "ಆರಂಭಿಕ ಬಿಂದುವಿನ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ: ",
        'invalid_start': "ಅಮಾನ್ಯ ಆರಂಭಿಕ ಬಿಂದು. ದಯವಿಟ್ಟು 1 ಮತ್ತು {0} ರ ನಡುವೆ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.",
        'start_point_set': "ಆರಂಭಿಕ ಬಿಂದುವನ್ನು ಹೊಂದಿಸಲಾಗಿದೆ: {0}",
        'precomputing': "ದೂರ ಮ್ಯಾಟ್ರಿಕ್ಸ್ ಅನ್ನು ಪೂರ್ವ-ಗಣನೆ ಮಾಡುತ್ತಿರುವೆ...",
        'progress': "ಪ್ರಗತಿ: {0:.1f}% ಪೂರ್ಣಗೊಂಡಿದೆ",
        'distance_complete': "ದೂರ ಲೆಕ್ಕಾಚಾರಗಳು ಪೂರ್ಣಗೊಂಡಿವೆ",
        'distances_from_start': "ಆರಂಭಿಕ ಬಿಂದುವಿನಿಂದ ದೂರಗಳು: {0}",
        'step_distances': "ಅತ್ಯುತ್ತಮ ಮಾರ್ಗದಲ್ಲಿ ಹಂತ-ಹಂತದ ದೂರಗಳು:",
        'total_distance': "ಒಟ್ಟು ದೂರ: {0:.2f} ಕಿಲೋಮೀಟರ್‌ಗಳು",
        'using_nn': "ಸಲ್ಪ ಸಂಖ್ಯೆಯ ಬಿಂದುಗಳಿಗಾಗಿ ಹತ್ತಿರದ ನೆರೆಹೊರೆಯವರ ಅಲ್ಗೋರಿದಮ್ ಬಳಸುತ್ತಿರುವೆ",
        'using_hk': "ಅತ್ಯುತ್ತಮ ಪರಿಹಾರಕ್ಕಾಗಿ ಹೆಲ್ಡ್-ಕಾರ್ಪ್ ಅಲ್ಗೋರಿದಮ್ ಬಳಸುತ್ತಿರುವೆ",
        'using_sa': "ದೊಡ್ಡ ಸಮಸ್ಯೆಗಾಗಿ ವರ್ಧಿತ ಸಿಮ್ಯುಲೇಟೆಡ್ ಅನ್ನೀಲಿಂಗ್ ಅಲ್ಗೋರಿದಮ್ ಬಳಸುತ್ತಿರುವೆ",
        'running_hk': "ಅತ್ಯುತ್ತಮ ಪರಿಹಾರಕ್ಕಾಗಿ ಹೆಲ್ಡ್-ಕಾರ್ಪ್ ಅಲ್ಗೋರಿದಮ್ ಚಾಲನೆ ಮಾಡುತ್ತಿರುವೆ...",
        'hk_complete': "ಹೆಲ್ಡ್-ಕಾರ್ಪ್ ಅಲ್ಗೋರಿದಮ್ ಪೂರ್ಣಗೊಂಡಿದೆ. ಅಂತಿಮ ವೆಚ್ಚ: {0:.2f} ಕಿಲೋಮೀಟರ್‌ಗಳು",
        'sa_starting': "ವರ್ಧಿತ ಸಿಮ್ಯುಲೇಟೆಡ್ ಅನ್ನೀಲಿಂಗ್ ಆಪ್ಟಿಮೈಸೇಶನ್ ಪ್ರಾರಂಭಿಸುತ್ತಿರುವೆ...",
        'sa_initial': "ಆರಂಭಿಕ ಪರಿಹಾರ ವೆಚ್ಚ: {0:.2f} ಕಿಲೋಮೀಟರ್‌ಗಳು",
        'sa_complete': "ವರ್ಧಿತ ಸಿಮ್ಯುಲೇಟೆಡ್ ಅನ್ನೀಲಿಂಗ್ ಪೂರ್ಣಗೊಂಡಿದೆ. ಅಂತಿಮ ವೆಚ್ಚ: {0:.2f} ಕಿಲೋಮೀಟರ್‌ಗಳು",
        'optimal_path': "ಅತ್ಯುತ್ತಮ ಮಾರ್ಗ: {0}",
        'route_complete': "ಮಾರ್ಗ ಆಪ್ಟಿಮೈಸೇಶನ್ ಪೂರ್ಣಗೊಂಡಿದೆ!",
        'listening': "ಆಲಿಸುತ್ತಿರುವೆ... (ಈಗ ಮಾತನಾಡಿ)",
        'no_speech': "ಯಾವುದೇ ಮಾತು ಪತ್ತೆಯಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
        'not_understood': "ನೀವು ಹೇಳಿದ್ದು ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
        'speech_error': "ಮಾತು ಗುರುತಿಸುವಲ್ಲಿ ದೋಷವಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಉತ್ತರವನ್ನು ಟೈಪ್ ಮಾಡಿ.",
        'didnt_understand': "ಅದು ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ. (ಪ್ರಯತ್ನ {0}/{1})",
        'switching_text': "ಈ ಪ್ರಶ್ನೆಗಾಗಿ ಪಠ್ಯ ಇನ್‌ಪುಟ್‌ಗೆ ಬದಲಾಯಿಸುತ್ತಿರುವೆ.",
        'is_kilometers_away': "{0:.1f} ಕಿಲೋಮೀಟರ್ ದೂರದಲ್ಲಿದೆ",
        'route_speech': "ನಿಮ್ಮ ಅತ್ಯುತ್ತಮ ಮಾರ್ಗವು {0:.1f} ಕಿಲೋಮೀಟರ್‌ಗಳನ್ನು ಒಳಗೊಂಡಿದೆ. {1} ನಿಂದ ಪ್ರಾರಂಭಿಸಿ, ",
        'then': "ನಂತರ {0}",
        'return_to': "ಮತ್ತು ಅಂತಿಮವಾಗಿ {0} ಗೆ ಹಿಂತಿರುಗಿ",
        'from_to': "{0} ನಿಂದ {1} ಗೆ: {2:.1f} ಕಿಲೋಮೀಟರ್‌ಗಳು",
        'add_more_points': "ದಯವಿಟ್ಟು ಅರ್ಥಪೂರ್ಣ ಲೆಕ್ಕಾಚಾರಕ್ಕಾಗಿ ಕನಿಷ್ಠ ಎರಡು ಬಿಂದುಗಳನ್ನು ಸೇರಿಸಿ.",
        'enter_num_points': "ದಯವಿಟ್ಟು ವಿತರಣಾ ಬಿಂದುಗಳ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.",
        'invalid_num_points': "ಬಿಂದುಗಳ ಅಮಾನ್ಯ ಸಂಖ್ಯೆ. ದಯವಿಟ್ಟು ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.",
        'processing_input': "ನಿಮ್ಮ ಇನ್‌ಪುಟ್ ಅನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗುತ್ತಿದೆ...",
    },
    'hi': {
        'welcome': "बहुभाषी वॉयस सपोर्ट के साथ ट्रैवलिंग सेल्समैन प्रॉब्लम सॉल्वर में आपका स्वागत है!",
        'choose_language': "अपनी पसंदीदा भाषा चुनें:",
        'language_enabled': "{0} भाषा सक्रिय की गई!",
        'choose_mode': "इनपुट/आउटपुट मोड चुनें:",
        'voice_enabled': "वॉयस मोड सक्रिय किया गया! मैं अब इनपुट और आउटपुट के लिए स्पीच का उपयोग करूंगा।",
        'text_enabled': "टेक्स्ट मोड सक्रिय किया गया!",
        'enter_points': "डिलीवरी पॉइंट्स की संख्या दर्ज करें: ",
        'enter_address': "पॉइंट {0} के लिए पता दर्ज करें: ",
        'looking_up': "{0} के लिए निर्देशांक खोज रहे हैं...",
        'located_success': "{0} को सफलतापूर्वक स्थित किया गया",
        'location_error': "पते के लिए निर्देशांक नहीं मिल सके: {0}",
        'available_points': "उपलब्ध पॉइंट्स:",
        'your_locations': "आपके स्थान हैं: ",
        'enter_start_point': "शुरुआती पॉइंट का नंबर दर्ज करें: ",
        'invalid_start': "अमान्य शुरुआती पॉइंट। कृपया 1 और {0} के बीच एक संख्या दर्ज करें।",
        'start_point_set': "शुरुआती पॉइंट सेट किया गया: {0}",
        'precomputing': "दूरी मैट्रिक्स की पूर्व-गणना कर रहे हैं...",
        'progress': "प्रगति: {0:.1f}% पूर्ण",
        'distance_complete': "दूरी की गणना पूर्ण",
        'distances_from_start': "शुरुआती पॉइंट से दूरियां: {0}",
        'step_distances': "इष्टतम पथ में चरण-दर-चरण दूरियां:",
        'total_distance': "कुल दूरी: {0:.2f} किलोमीटर",
        'using_nn': "कम संख्या के पॉइंट्स के लिए नियरेस्ट नेबर एल्गोरिदम का उपयोग कर रहे हैं",
        'using_hk': "इष्टतम समाधान के लिए हेल्ड-कार्प एल्गोरिदम का उपयोग कर रहे हैं",
        'using_sa': "बड़ी समस्या के लिए एन्हांस्ड सिम्युलेटेड एनीलिंग एल्गोरिदम का उपयोग कर रहे हैं",
        'running_hk': "इष्टतम समाधान के लिए हेल्ड-कार्p एल्गोरिदम चला रहे हैं...",
        'hk_complete': "हेल्ड-कार्प एल्गोरिदम पूर्ण। अंतिम लागत: {0:.2f} किलोमीटर",
        'sa_starting': "एन्हांस्ड सिम्युलेटेड एनीलिंग ऑप्टिमाइज़ेशन शुरू कर रहे हैं...",
        'sa_initial': "प्रारंभिक समाधान लागत: {0:.2f} किलोमीटर",
        'sa_complete': "एन्हांस्ड सिम्युलेटेड एनीलिंग पूर्ण। अंतिम लागत: {0:.2f} किलोमीटर",
        'optimal_path': "इष्टतम पथ: {0}",
        'route_complete': "रूट ऑप्टिमाइज़ेशन पूर्ण!",
        'listening': "सुन रहे हैं... (अब बोलें)",
        'no_speech': "कोई स्पीच डिटेक्ट नहीं हुई। कृपया फिर से कोशिश करें।",
        'not_understood': "मैं समझ नहीं पाया कि आपने क्या कहा। कृपया फिर से कोशिश करें।",
        'speech_error': "स्पीच रिकग्निशन में त्रुटि हुई। कृपया अपना उत्तर टाइप करें।",
        'didnt_understand': "मुझे वह समझ नहीं आया। कृपया फिर से कोशिश करें। (प्रयास {0}/{1})",
        'switching_text': "इस प्रश्न के लिए टेक्स्ट इनपुट पर स्विच कर रहे हैं।",
        'is_kilometers_away': "{0:.1f} किलोमीटर दूर है",
        'route_speech': "आपका इष्टतम रूट {0:.1f} किलोमीटर तक फैला है। {1} से शुरू करके, ",
        'then': "फिर {0}",
        'return_to': "और अंत में {0} पर वापस जाएं",
        'from_to': "{0} से {1} तक: {2:.1f} किलोमीटर",
        'add_more_points': "कृपया सार्थक गणना के लिए कम से कम दो बिंदु जोड़ें।",
        'enter_num_points': "कृपया डिलीवरी बिंदुओं की संख्या दर्ज करें।",
        'invalid_num_points': "बिंदुओं की अमान्य संख्या। कृपया एक संख्या दर्ज करें।",
        'processing_input': "आपके इनपुट को संसाधित किया जा रहा है...",
    }
};

const getMessage = (key, lang, ...args) => {
    let message = MESSAGES[lang]?.[key] || MESSAGES['en'][key];
    if (args.length > 0) {
        // Use a more robust regex for formatting, handling both {0} and {0:.1f}
        return message.replace(/{(\d+)(?::\.(\d+)f)?}/g, (match, indexStr, precisionStr) => {
            const argIndex = parseInt(indexStr, 10);
            const arg = args[argIndex];

            if (precisionStr !== undefined) {
                const precision = parseInt(precisionStr, 10);
                if (typeof arg === 'number') {
                    return arg.toFixed(precision);
                }
            }
            return arg;
        });
    }
    return message;
};


const Solver = () => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: Maps_API_KEY,
    });

    const [numPoints, setNumPoints] = useState('');
    const [addresses, setAddresses] = useState([]);
    const [currentAddress, setCurrentAddress] = useState('');
    const [locations, setLocations] = useState([]);
    const [startPointIndex, setStartPointIndex] = useState('');
    const [optimalPath, setOptimalPath] = useState([]);
    const [totalDistance, setTotalDistance] = useState(null);
    const [stepDistances, setStepDistances] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [useVoice, setUseVoice] = useState(false);
    const [speechRecognizer, setSpeechRecognizer] = useState(null);
    const [synth, setSynth] = useState(null);
    const speechQueue = useRef([]);
    const isSpeakingRef = useRef(false);
    const currentInputRef = useRef(null);

    // Initialize SpeechSynthesis and SpeechRecognition
    useEffect(() => {
        if ('SpeechSynthesisUtterance' in window && 'speechSynthesis' in window) {
            setSynth(window.speechSynthesis);
        }
        if ('webkitSpeechRecognition' in window) {
            const recognition = new window.webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = languageOptions[selectedLanguage].sr_code; // Set initial language
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                console.log(`You said: ${transcript}`);
                const inputEl = currentInputRef.current;

                if (inputEl && 'value' in inputEl && typeof inputEl.dispatchEvent === 'function') {
                    inputEl.value = transcript;
                    const inputEvent = new Event('input', { bubbles: true });
                    inputEl.dispatchEvent(inputEvent);
                } else {
                    console.warn("Speech result: inputRef is not a valid input element", inputEl);
    }
            };
            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                textToSpeech(getMessage('speech_error', selectedLanguage));
                setError(getMessage('speech_error', selectedLanguage));
                // Optionally switch to text input on persistent error
                setUseVoice(false);
            };
            recognition.onend = () => {
                console.log('Speech recognition ended.');
            };
            setSpeechRecognizer(recognition);
        } else {
            console.warn("Web Speech API is not supported in this browser.");
            setError("Your browser does not support Web Speech API. Voice features will not be available.");
            setUseVoice(false);
        }
    }, [selectedLanguage]);

    // Speech Queue Processor
    useEffect(() => {
        const processQueue = () => {
            if (speechQueue.current.length > 0 && !isSpeakingRef.current && synth) {
                isSpeakingRef.current = true;
                const textToSpeak = speechQueue.current[0];
                if (selectedLanguage === 'kn' && !window.speechSynthesis.getVoices().some(v => v.lang.startsWith('kn'))) {
                    playKannadaTTS(textToSpeak);
                    speechQueue.current.shift();
                    isSpeakingRef.current = false;
                    return;
              }
                const utterance = new SpeechSynthesisUtterance(textToSpeak);
                utterance.lang = languageOptions[selectedLanguage].sr_code; // CRITICAL CHANGE: Use sr_code for speaking
                
                utterance.onend = () => {
                    speechQueue.current.shift();
                    isSpeakingRef.current = false;
                    processQueue();
                };
                utterance.onerror = (event) => {
                    console.error('SpeechSynthesisUtterance.onerror', event);
                    setError(`Speech error in ${selectedLanguage}: ${event.error}. Trying next message.`);
                    speechQueue.current.shift();
                    isSpeakingRef.current = false;
                    processQueue();
                };
                synth.speak(utterance);
            }
        };
        // This effect runs when speechQueue.current.length changes or isSpeakingRef.current changes
        // It's also explicitly called below if a new item is added and nothing is speaking.
        processQueue(); 
    }, [speechQueue.current.length, synth, selectedLanguage, isSpeakingRef.current]);


    const textToSpeech = useCallback((text) => {
    if (!useVoice) return;

    const langCode = languageOptions[selectedLanguage].sr_code;

    // Cancel ongoing speech
    if (synth && synth.speaking) {
        synth.cancel();
        isSpeakingRef.current = false;
        speechQueue.current = [];
    }

    const supportedVoices = window.speechSynthesis.getVoices();
    const hasNativeSupport = supportedVoices.some(v => v.lang === langCode || v.lang.startsWith(langCode.split('-')[0]));

    // ✅ Use fallback ONLY for Kannada if not supported
    if (selectedLanguage === 'kn' && !hasNativeSupport) {
        console.log("Using fallback TTS for Kannada");
        playKannadaTTS(text);
        return;
    }

    // ✅ Else use built-in speech synthesis
    if (synth) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langCode;

        utterance.onstart = () => {
            isSpeakingRef.current = true;
        };
        utterance.onend = () => {
            isSpeakingRef.current = false;
        };
        utterance.onerror = (e) => {
            console.error("SpeechSynthesisUtterance error", e);
            isSpeakingRef.current = false;
        };

        synth.speak(utterance);
    }
}, [useVoice, synth, selectedLanguage]);

const speakAndWait = async (text) => {
      return new Promise(async (resolve) => {
        const langCode = languageOptions[selectedLanguage].sr_code;
        const supportedVoices = window.speechSynthesis.getVoices();
        const hasNativeSupport = supportedVoices.some(v => v.lang === langCode || v.lang.startsWith(langCode.split('-')[0]));

        // Fallback for Kannada
        if (selectedLanguage === 'kn' && !hasNativeSupport) {
           await playKannadaTTS(text);
            // rough estimate: 500ms per word + buffer
           resolve();
           return;
        }

        if (synth) {
           const utterance = new SpeechSynthesisUtterance(text);
           utterance.lang = langCode;
           utterance.onend = resolve;
           utterance.onerror = () => {
              console.error("TTS error, continuing anyway...");
              resolve();
        };
        synth.speak(utterance);
      } else {
        resolve();
    }
  });
};



    const startSpeechInput = useCallback(async (inputRef, promptText) => {
       if (useVoice && speechRecognizer && inputRef.current) {
          currentInputRef.current = inputRef.current;

          // Cancel ongoing speech
          if (synth && synth.speaking) {
             synth.cancel();
             isSpeakingRef.current = false;
             speechQueue.current = [];
            }

          try {
             await speakAndWait(promptText); // Wait for speech to finish fully

             setTimeout(() => {
               try {
                  speechRecognizer.start();
                  console.log("Speech recognition started.");
               } catch (err) {
                 console.error("SpeechRecognizer failed to start:", err);
            
            }
         }, 400); // Short buffer after speaking to avoid echo
    } catch (err) {
      console.error("Failed during speech+listen sequence:", err);
    }
  } else if (!useVoice) {
    inputRef.current?.focus();
  }
}, [useVoice, speechRecognizer, selectedLanguage, synth]);




    const getNumberFromText = (text) => {
    // First try to parse as a regular number
    const num = parseInt(text.trim(), 10);
    if (!isNaN(num)) return num;

    const wordToNumMap = {
        'en': { 
            'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 
            'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10, 
            'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15, 
            'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20 
        },
        'kn': { 
            'ಒಂದು': 1, 'ಎರಡು': 2, 'ಮೂರು': 3, 'ನಾಲ್ಕು': 4, 'ಐದು': 5, 
            'ಆರು': 6, 'ಏಳು': 7, 'ಎಂಟು': 8, 'ಒಂಬತ್ತು': 9, 'ಹತ್ತು': 10, 
            'ಹನ್ನೊಂದು': 11, 'ಹನ್ನೆರಡು': 12, 'ಹದಿಮೂರು': 13, 'ಹದಿನಾಲ್ಕು': 14, 'ಹದಿನೈದು': 15, 
            'ಹದಿನಾರು': 16, 'ಹದಿನೇಳು': 17, 'ಹದಿನೆಂಟು': 18, 'ಹದಿನೊಂಬತ್ತು': 19, 'ಇಪ್ಪತ್ತು': 20 
        },
        'hi': { 
            'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पांच': 5, 'पाँच': 5,
            'छह': 6, 'छः': 6, 'सात': 7, 'आठ': 8, 'नौ': 9, 'दस': 10, 
            'ग्यारह': 11, 'बारह': 12, 'तेरह': 13, 'चौदह': 14, 'पंद्रह': 15, 'पन्द्रह': 15,
            'सोलह': 16, 'सत्रह': 17, 'अठारह': 18, 'उन्नीस': 19, 'बीस': 20,
            // Also add some common variations
            'एक।': 1, 'दो।': 2, 'तीन।': 3, 'चार।': 4, 'पांच।': 5,
            'छह।': 6, 'सात।': 7, 'आठ।': 8, 'नौ।': 9, 'दस।': 10
        }
    };

    // Clean the text - remove punctuation and extra spaces
    const cleanText = text.trim().replace(/[।\.\,\!\?]/g, '');
    
    // Try exact match first
    if (wordToNumMap[selectedLanguage] && wordToNumMap[selectedLanguage][cleanText]) {
        return wordToNumMap[selectedLanguage][cleanText];
    }
    
    // Try case-insensitive match for English
    if (selectedLanguage === 'en') {
        const lowerText = cleanText.toLowerCase();
        if (wordToNumMap[selectedLanguage][lowerText]) {
            return wordToNumMap[selectedLanguage][lowerText];
        }
    }
    
    // Try partial matching as fallback
    const lowerText = cleanText.toLowerCase();
    for (const word in wordToNumMap[selectedLanguage]) {
        if (lowerText.includes(word) || word.includes(lowerText)) {
            return wordToNumMap[selectedLanguage][word];
        }
    }
    
    return NaN;
};


    const handleLanguageSelection = (value) => {
        let langCode = value; // Value is already 'en', 'kn', 'hi'
        setSelectedLanguage(langCode);
        const languageName = languageOptions[langCode]?.name || 'English';
        textToSpeech(getMessage('language_enabled', langCode, languageName));
        if (speechRecognizer) {
            speechRecognizer.lang = languageOptions[langCode].sr_code; // Update SR language
        }
    };

    const handleModeSelection = (value) => {
        const voiceEnabled = value === 'voice';
        setUseVoice(voiceEnabled);
        if (voiceEnabled) {
            textToSpeech(getMessage('voice_enabled', selectedLanguage));
        } else {
            textToSpeech(getMessage('text_enabled', selectedLanguage));
        }
    };

    const addAddress = async () => {
        if (currentAddress.trim() === '') {
            setError("Address cannot be empty.");
            textToSpeech("Address cannot be empty.");
            return;
        }

        setError(null);
        setLoading(true);
        try {
            textToSpeech(getMessage('looking_up', selectedLanguage, currentAddress));
            const response = await axios.post('http://localhost:5000/api/geocode', { address: currentAddress });
            const { lat, lng } = response.data;
            const newLocation = { name: currentAddress, lat, lng };
            setLocations((prevLocations) => [...prevLocations, newLocation]);
            setAddresses((prevAddresses) => [...prevAddresses, currentAddress]);
            setCurrentAddress('');
            textToSpeech(getMessage('located_success', selectedLanguage, currentAddress));
        } catch (err) {
            console.error("Error geocoding:", err.response ? err.response.data : err.message);
            setError(getMessage('location_error', selectedLanguage, currentAddress));
            textToSpeech(getMessage('location_error', selectedLanguage, currentAddress));
        } finally {
            setLoading(false);
        }
    };

    const solveTSP = async () => {
    if (locations.length < 2) {
        const message = getMessage('add_more_points', selectedLanguage);
        setError(message);
        textToSpeech(message);
        return;
    }
    
    let startIndexRaw;
    
    try {
        // Get start point index
        if (useVoice) {
            const prompt = getMessage('enter_start_point', selectedLanguage);
            startIndexRaw = await getVoiceStartPoint(prompt);
        } else {
            startIndexRaw = startPointIndex;
        }

        const startIndex = parseInt(startIndexRaw, 10) - 1;

        // Validate start index
        if (isNaN(startIndex) || startIndex < 0 || startIndex >= locations.length) {
            const message = getMessage('invalid_start', selectedLanguage, locations.length);
            setError(message);
            textToSpeech(message);
            return;
        }

        // Set loading state
        setStartPointIndex(startIndex + 1);
        setLoading(true);
        setError(null);
        setOptimalPath([]);
        setTotalDistance(null);
        setStepDistances([]);

        // Announce start point
        const startMessage = getMessage('start_point_set', selectedLanguage, locations[startIndex].name);
        textToSpeech(startMessage);
        textToSpeech(getMessage('precomputing', selectedLanguage));

        // Call backend API with proper headers
        const response = await axios.post('http://localhost:5000/api/solve-tsp', {
            num_points: locations.length,
            addresses: locations.map(loc => loc.name),
            start_point_idx: startIndex,
            language: selectedLanguage,
            use_voice: useVoice
        }, {
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        });

        const { 
            optimalPath: pathNames, 
            totalDistance: finalCost, 
            stepByStepDistances: steps, 
            backendMessages 
        } = response.data;

        // Process results
        const solvedPath = pathNames.map(name => 
            locations.find(loc => loc.name === name)
        ).filter(Boolean);

        setOptimalPath(solvedPath);
        setTotalDistance(finalCost);
        setStepDistances(steps);

        // Announce results
        if (backendMessages && backendMessages.length > 0) {
            backendMessages.forEach(msg => textToSpeech(msg));
                
        }

        await speakAndWait(getMessage('optimal_path', selectedLanguage, pathNames.join(' -> ')));
        await speakAndWait(getMessage('total_distance', selectedLanguage, finalCost));


        // Announce route details
        await announceRoute(solvedPath, finalCost);

    } catch (err) {
        console.error("Error solving TSP:", err);
        let errorMessage = "Failed to solve TSP. Please try again.";
        
        if (err.response) {
            // Server responded with error status
            const status = err.response.status;
            const data = err.response.data;
            
            if (status === 500) {
                errorMessage = "Server error occurred. Please check if the backend service is running properly.";
            } else if (status === 404) {
                errorMessage = "TSP service not found. Please check the backend URL.";
            } else {
                errorMessage = data?.message || `Server error: ${status}`;
            }
        } else if (err.request) {
            // Network error - server not reachable
            errorMessage = "Cannot connect to TSP service. Please check if the backend server is running on localhost:5000.";
        }
        
        console.error("Detailed error:", errorMessage);
        setError(errorMessage);
        textToSpeech(errorMessage);
    } finally {
        setLoading(false);
    }
};

// Helper function for voice input
const getVoiceStartPoint = (prompt) => {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 3;

        const listen = async () => {
    attempts++;

    await speakAndWait(prompt);

    // Slight delay to allow browser to settle before listening
    setTimeout(() => {
        if (!speechRecognizer) {
            reject(new Error("Speech recognition not available"));
            return;
        }

        speechRecognizer.onresult = (event) => {
            const transcript = event.results[0][0].transcript.trim();
            console.log(`Voice input received: ${transcript}`);

            const parsedNumber = getNumberFromText(transcript);
            resolve(isNaN(parsedNumber) ? transcript : parsedNumber.toString());
        };

        speechRecognizer.onerror = (event) => {
            console.error('Speech recognition error:', event.error);

            if (attempts < maxAttempts) {
                const retryMessage = getMessage('didnt_understand', selectedLanguage, attempts, maxAttempts);
                speakAndWait(retryMessage).then(() => setTimeout(listen, 1000));
            } else {
                speakAndWait(getMessage('switching_text', selectedLanguage)).then(() => {
                    const textInput = window.prompt(prompt);
                    resolve(textInput || "1");
                });
            }
        };

        speechRecognizer.onend = () => {
            if (attempts < maxAttempts) {
                setTimeout(listen, 1000);
            }
        };

        try {
            speechRecognizer.start();
        } catch (error) {
            console.error('Failed to start speech recognition:', error);
            reject(error);
        }
    }, 400);
};

        listen();
    });
};

// Helper function to announce route
const announceRoute = async(solvedPath, finalCost) => {
    if (solvedPath.length === 0) return;

    const routeParts = [
        getMessage('route_speech', selectedLanguage, finalCost, solvedPath[0].name)
    ];

    for (let i = 1; i < solvedPath.length; i++) {
        routeParts.push(getMessage('then', selectedLanguage, solvedPath[i].name));
    }

    if (solvedPath.length > 1) {
        routeParts.push(getMessage('return_to', selectedLanguage, solvedPath[0].name));
    }

    await speakAndWait(routeParts.join(', ') + '.');
    await speakAndWait(getMessage('route_complete', selectedLanguage));

};

    const currentAddressInputRef = useRef(null);
    const startPointInputRef = useRef(null);


    // Initial welcome message (triggered once on component mount, and when language changes)
    useEffect(() => {
        textToSpeech(getMessage('welcome', selectedLanguage));
    }, [selectedLanguage]); // Run on mount and when language changes


    return (
        <motion.div
            className={styles.solverContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <motion.h1
                className={styles.pageTitle}
                initial={{ y: -50 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
            >
                <span className={styles.highlightYellow}>Solve</span> Your TSP
            </motion.h1>

            <div className={styles.controlsSection}>
                <motion.div
                    className={styles.inputGroup}
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <label htmlFor="language-select">Choose Language:</label>
                    <select
                        id="language-select"
                        value={selectedLanguage}
                        onChange={(e) => handleLanguageSelection(e.target.value)}
                        disabled={loading}
                    >
                        {Object.keys(languageOptions).map((key) => (
                            <option key={key} value={key}>
                                {languageOptions[key].name}
                            </option>
                        ))}
                    </select>
                </motion.div>

                <motion.div
                    className={styles.inputGroup}
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <label htmlFor="mode-select">Choose Mode:</label>
                    <select
                        id="mode-select"
                        value={useVoice ? 'voice' : 'text'}
                        onChange={(e) => handleModeSelection(e.target.value)}
                        disabled={loading || !speechRecognizer}
                    >
                        <option value="text">Text Input/Output</option>
                        <option value="voice" disabled={!speechRecognizer}>Voice Input/Output</option>
                    </select>
                </motion.div>
            </div>

            <motion.div
                className={styles.inputSection}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
            >
                <h2>Add Delivery Points</h2>
                <div className={styles.addAddressForm}>
                    <input
                        type="text"
                        ref={currentAddressInputRef}
                        placeholder={getMessage('enter_address', selectedLanguage, addresses.length + 1)}
                        value={currentAddress}
                        onChange={(e) => setCurrentAddress(e.target.value)}
                        onFocus={() => startSpeechInput(currentAddressInputRef, getMessage('enter_address', selectedLanguage, addresses.length + 1))}
                        disabled={loading}
                    />
                    <button onClick={addAddress} disabled={loading}>
                        {loading ? 'Adding...' : 'Add Point'}
                    </button>
                </div>
                {error && <p className={styles.errorMessage}>{error}</p>}

                <div className={styles.pointsList}>
                    <h3>Current Points ({locations.length}):</h3>
                    {locations.length === 0 ? (
                        <p>No points added yet.</p>
                    ) : (
                        <ul>
                            {locations.map((loc, index) => (
                                <motion.li
                                    key={index}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    {index + 1}. {loc.name} ({loc.lat.toFixed(4)}, {loc.lng.toFixed(4)})
                                </motion.li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className={styles.startPointSelection}>
                    <label htmlFor="start-point">Starting Point Number:</label>
                    <input
                        type="number"
                        id="start-point"
                        ref={startPointInputRef}
                        min="1"
                        max={locations.length}
                        value={startPointIndex}
                        onChange={(e) => setStartPointIndex(e.target.value)}
                        onFocus={() => startSpeechInput(startPointInputRef, getMessage('enter_start_point', selectedLanguage))}
                        placeholder={getMessage('enter_start_point', selectedLanguage)}
                        disabled={locations.length === 0 || loading}
                    />
                    <button onClick={solveTSP} disabled={locations.length < 2 || loading}>
                        {loading ? 'Solving...' : 'Solve TSP'}
                    </button>
                </div>
            </motion.div>

            <motion.div
                className={styles.resultsSection}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
            >
                <h2>Optimal Route</h2>
                {isLoaded ? (
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={optimalPath.length > 0 ? { lat: optimalPath[0].lat, lng: optimalPath[0].lng } : center}
                        zoom={optimalPath.length > 0 ? 12 : 10}
                    >
                        {locations.map((location, index) => (
                            <MarkerF
                                key={index}
                                position={{ lat: location.lat, lng: location.lng }}
                                label={{
                                    text: (index + 1).toString(),
                                    color: 'white',
                                    fontWeight: 'bold',
                                }}
                                icon={{
                                    path: window.google.maps.SymbolPath.CIRCLE,
                                    scale: 10,
                                    fillColor: startPointIndex - 1 === index ? '#ffeb3b' : '#e91e63',
                                    fillOpacity: 1,
                                    strokeWeight: 1,
                                    strokeColor: 'white',
                                }}
                            />
                        ))}

                        {optimalPath.length > 1 && (
                            <PolylineF
                                path={optimalPath.map(loc => ({ lat: loc.lat, lng: loc.lng }))}
                                options={{
                                    strokeColor: '#9c27b0',
                                    strokeOpacity: 0.8,
                                    strokeWeight: 5,
                                    geodesic: true,
                                    icons: [{
                                        icon: {
                                            path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                                            scale: 3,
                                            strokeColor: '#ffffff',
                                        },
                                        offset: '100%',
                                        repeat: '50px'
                                    }]
                                }}
                            />
                        )}
                    </GoogleMap>
                ) : (
                    <p>Loading Maps...</p>
                )}

                {totalDistance !== null && (
                    <motion.div
                        className={styles.summary}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                    >
                        <h3>Total Distance: <span className={styles.highlightYellow}>{totalDistance.toFixed(2)} km</span></h3>
                        <h3>Optimal Path: <span className={styles.highlightPink}>{optimalPath.map(loc => loc.name).join(' → ')}</span></h3>
                    </motion.div>
                )}

                {stepDistances.length > 0 && (
                    <motion.div
                        className={styles.distanceTableContainer}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.8 }}
                    >
                        <h3>Step-by-Step Distances:</h3>
                        <table className={styles.distanceTable}>
                            <thead>
                                <tr>
                                    <th>From</th>
                                    <th>To</th>
                                    <th>Distance (km)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stepDistances.map((step, index) => (
                                    <motion.tr
                                        key={index}
                                        initial={{ x: -30, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 2 + index * 0.05 }}
                                    >
                                        <td>{step.from}</td>
                                        <td>{step.to}</td>
                                        <td>{step.distance.toFixed(2)}</td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default Solver;