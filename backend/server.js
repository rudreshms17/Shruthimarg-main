const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const { Client } = require('@googlemaps/google-maps-services-js');
const { spawn } = require('child_process');
const path = require('path'); // ADDED: For robust path handling

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const googleMapsClient = new Client({});

app.use(cors());
app.use(express.json({ charset: 'utf-8' }));
app.use(express.urlencoded({ extended: true, charset: 'utf-8' }));

app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
});

// Endpoint to get geocode for an address
app.post('/api/geocode', async (req, res) => {
    const { address } = req.body;
    try {
        const response = await googleMapsClient.geocode({
            params: {
                address: address,
                key: process.env.Maps_API_KEY, // *** CORRECTED API KEY VARIABLE NAME ***
            },
            timeout: 5000, // Increased timeout to 5 seconds
        });
        if (response.data.results.length > 0) {
            const { lat, lng } = response.data.results[0].geometry.location;
            res.json({ lat, lng });
        } else {
            res.status(404).json({ message: 'Address not found' });
        }
    } catch (error) {
        console.error('Geocoding error:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Error geocoding address', error: error.message });
    }
});

// Endpoint to get distance matrix
app.post('/api/distancematrix', async (req, res) => {
    const { origins, destinations } = req.body;
    try {
        const response = await googleMapsClient.distanceMatrix({
            params: {
                origins: origins,
                destinations: destinations,
                mode: 'driving',
                key: process.env.Maps_API_KEY, // *** CORRECTED API KEY VARIABLE NAME ***
            },
            timeout: 5000, // Increased timeout to 5 seconds
        });
        res.json(response.data);
    } catch (error) {
        console.error('Distance Matrix error:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Error calculating distance matrix', error: error.message });
    }
});

// Endpoint to run TSP solver (integrating Python script)
app.post('/api/solve-tsp', async (req, res) => {
    try {
        const { addresses, num_points, start_point_idx, language, use_voice } = req.body;
        
        // Clean and validate addresses before sending to Python
        const cleanAddresses = addresses.map(addr => {
            // Ensure proper UTF-8 encoding
            if (typeof addr === 'string') {
                // Remove any invalid Unicode characters
                return addr.replace(/[\uDC00-\uDFFF]/g, '');
            }
            return addr;
        });
        
        console.log('Cleaned addresses:', cleanAddresses);
        
        // Spawn Python process with proper encoding
        const { spawn } = require('child_process');
        const pythonProcess = spawn('python', [
            'tsp_logic/tsptrial.py'
        ], {
            stdio: ['pipe', 'pipe', 'pipe'],
            encoding: 'utf8',
            env: { 
                ...process.env, 
                PYTHONIOENCODING: 'utf-8',
                PYTHONPATH: process.cwd()
            }
        });
        
        // Send data to Python script with proper encoding
        const inputData = JSON.stringify({
            addresses: cleanAddresses,
            num_points,
            start_point_idx,
            language,
            use_voice
        });
        
        console.log('Sending to Python:', inputData);
        pythonProcess.stdin.write(inputData, 'utf8');
        pythonProcess.stdin.end();
        
        let stdout = '';
        let stderr = '';
        
        pythonProcess.stdout.on('data', (data) => {
            stdout += data.toString('utf8');
        });
        
        pythonProcess.stderr.on('data', (data) => {
            stderr += data.toString('utf8');
        });
        
        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Python script exited with code ${code}`);
                console.error('stderr:', stderr);
                return res.status(500).json({ 
                    error: 'TSP calculation failed', 
                    details: stderr,
                    code: code 
                });
            }
            
            try {
                const result = JSON.parse(stdout);
                res.json(result);
            } catch (parseError) {
                console.error('Error parsing Python output:', parseError);
                console.error('Raw output:', stdout);
                res.status(500).json({ 
                    error: 'Invalid response from TSP service',
                    details: parseError.message 
                });
            }
        });
        
    } catch (error) {
        console.error('TSP API error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});
app.get('/api/kannada-tts', async (req, res) => {
    const text = req.query.text;
    if (!text) return res.status(400).send('Missing text');

    try {
        const ttsURL = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=kn&client=tw-ob`;
        const response = await axios.get(ttsURL, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0', // Required by Google
            }
        });

        res.set('Content-Type', 'audio/mpeg');
        res.send(response.data);
    } catch (err) {
        console.error('TTS proxy error:', err.message);
        res.status(500).send('Failed to fetch TTS');
    }
});



app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});