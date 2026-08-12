import math
import random
import itertools
import googlemaps
from dotenv import load_dotenv
import os
import time
import numpy as np
import sys
import json
import locale

# Set proper encoding for stdout/stderr
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')
# Set locale for proper character handling
try:
    locale.setlocale(locale.LC_ALL, 'en_US.UTF-8')
except:
    try:
        locale.setlocale(locale.LC_ALL, 'C.UTF-8')
    except:
        pass  # Fallback to default
    
# Load the environment variables from .env file
load_dotenv()
API_KEY = os.getenv('Maps_API_KEY')

# Initialize Google Maps Client
gmaps = googlemaps.Client(key=API_KEY)

# Language messages (simplified for text output - frontend handles full localization)
# This dictionary is primarily for internal logging/error messages from the Python script.
# The frontend will manage the actual user-facing multilingual voice/text.
MESSAGES = {
    'en': {
        'welcome': "Welcome to the Traveling Salesman Problem Solver!",
        'looking_up': "Looking up coordinates for {}...",
        'located_success': "Successfully located {}",
        'location_error': "Could not find coordinates for address: {}",
        'precomputing': "Precomputing distance matrix...",
        'distance_complete': "Distance calculations complete",
        'using_nn': "Using Nearest Neighbor Algorithm for small number of points",
        'using_hk': "Using Held-Karp Algorithm for optimal solution",
        'using_sa': "Using Enhanced Simulated Annealing Algorithm for large problem",
        'running_hk': "Running Held-Karp algorithm for optimal solution...",
        'hk_complete': "Held-Karp algorithm complete. Final cost: {:.2f} km",
        'sa_starting': "Starting enhanced simulated annealing optimization...",
        'sa_initial': "Initial solution cost: {:.2f} km",
        'sa_complete': "Enhanced Simulated Annealing complete. Final cost: {:.2f} km",
        'route_complete': "Route optimization complete!"
    },
    # Add Kannada and Hindi messages if you want internal Python stderr logs to be localized,
    # but for user-facing messages, the frontend handles this.
    'kn': {
        'welcome': "ಬಹುಭಾಷಾ ಧ್ವನಿ ಬೆಂಬಲದೊಂದಿಗೆ ಪ್ರಯಾಣಿಕ ಮಾರಾಟಗಾರ ಸಮಸ್ಯೆ ಪರಿಹಾರಕ್ಕೆ ಸ್ವಾಗತ!",
        'choose_language': "ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ:",
        'language_options': ["1. English", "2. ಕನ್ನಡ (Kannada)", "3. हिंदी (Hindi)"],
        'language_selection': "ನಿಮ್ಮ ಆಯ್ಕೆಯನ್ನು ನಮೂದಿಸಿ (1, 2, ಅಥವಾ 3): ",
        'language_enabled': "ಭಾಷೆ ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ!",
        'choose_mode': "ಇನ್‌ಪುಟ್/ಔಟ್‌ಪುಟ್ ಮೋಡ್ ಆಯ್ಕೆ ಮಾಡಿ:",
        'mode_options': ["1. ಪಠ್ಯ ಇನ್‌ಪುಟ್/ಔಟ್‌ಪುಟ್", "2. ಧ್ವನಿ ಇನ್‌ಪುಟ್/ಔಟ್‌ಪುಟ್"],
        'mode_selection': "ನಿಮ್ಮ ಆಯ್ಕೆಯನ್ನು ನಮೂದಿಸಿ (1 ಅಥವಾ 2): ",
        'voice_enabled': "ಧ್ವನಿ ಮೋಡ್ ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ! ನಾನು ಈಗ ಇನ್‌ಪುಟ್ ಮತ್ತು ಔಟ್‌ಪುಟ್‌ಗಾಗಿ ಧ್ವನಿಯನ್ನು ಬಳಸುತ್ತೇನೆ.",
        'text_enabled': "ಪಠ್ಯ ಮೋಡ್ ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ!",
        'enter_points': "ವಿತರಣಾ ಬಿಂದುಗಳ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ: ",
        'enter_address': "ಬಿಂದು {} ಗಾಗಿ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ: ",
        'looking_up': "{} ಗಾಗಿ ನಿರ್ದೇಶಾಂಕಗಳನ್ನು ಹುಡುಕುತ್ತಿರುವೆ...",
        'located_success': "{} ಅನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಪತ್ತೆ ಮಾಡಲಾಗಿದೆ",
        'location_error': "ವಿಳಾಸಕ್ಕೆ ನಿರ್ದೇಶಾಂಕಗಳನ್ನು ಕಂಡುಹಿಡಿಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ: {}",
        'available_points': "ಲಭ್ಯವಿರುವ ಬಿಂದುಗಳು:",
        'your_locations': "ನಿಮ್ಮ ಸ್ಥಳಗಳು: ",
        'enter_start_point': "ಆರಂಭಿಕ ಬಿಂದುವಿನ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ: ",
        'invalid_start': "ಅಮಾನ್ಯ ಆರಂಭಿಕ ಬಿಂದು",
        'start_point_set': "ಆರಂಭಿಕ ಬಿಂದುವನ್ನು ಹೊಂದಿಸಲಾಗಿದೆ: {}",
        'precomputing': "ದೂರ ಮ್ಯಾಟ್ರಿಕ್ಸ್ ಅನ್ನು ಪೂರ್ವ-ಗಣನೆ ಮಾಡುತ್ತಿರುವೆ...",
        'progress': "ಪ್ರಗತಿ: {:.1f}% ಪೂರ್ಣಗೊಂಡಿದೆ",
        'distance_complete': "ದೂರ ಲೆಕ್ಕಾಚಾರಗಳು ಪೂರ್ಣಗೊಂಡಿವೆ",
        'distances_from_start': "ಆರಂಭಿಕ ಬಿಂದುವಿನಿಂದ ದೂರಗಳು: {}",
        'step_distances': "ಅತ್ಯುತ್ತಮ ಮಾರ್ಗದಲ್ಲಿ ಹಂತ-ಹಂತದ ದೂರಗಳು:",
        'total_distance': "ಒಟ್ಟು ದೂರ: {:.2f} ಕಿ.ಮೀ",
        'using_nn': "ಸಲ್ಪ ಸಂಖ್ಯೆಯ ಬಿಂದುಗಳಿಗಾಗಿ ಹತ್ತಿರದ ನೆರೆಹೊರೆಯವರ ಅಲ್ಗೋರಿದಮ್ ಬಳಸುತ್ತಿರುವೆ",
        'using_hk': "ಅತ್ಯುತ್ತಮ ಪರಿಹಾರಕ್ಕಾಗಿ ಹೆಲ್ಡ್-ಕಾರ್ಪ್ ಅಲ್ಗೋರಿದಮ್ ಬಳಸುತ್ತಿರುವೆ",
        'using_sa': "ದೊಡ್ಡ ಸಮಸ್ಯೆಗಾಗಿ ವರ್ಧಿತ ಸಿಮ್ಯುಲೇಟೆಡ್ ಅನ್ನೀಲಿಂಗ್ ಅಲ್ಗೋರಿದಮ್ ಬಳಸುತ್ತಿರುವೆ",
        'running_hk': "ಅತ್ಯುತ್ತಮ ಪರಿಹಾರಕ್ಕಾಗಿ ಹೆಲ್ಡ್-ಕಾರ್ಪ್ ಅಲ್ಗೋರಿದಮ್ ಚಾಲನೆ ಮಾಡುತ್ತಿರುವೆ...",
        'hk_complete': "ಹೆಲ್ಡ್-ಕಾರ್ಪ್ ಅಲ್ಗೋರಿದಮ್ ಪೂರ್ಣಗೊಂಡಿದೆ. ಅಂತಿಮ ವೆಚ್ಚ: {:.2f} ಕಿ.ಮೀ",
        'sa_starting': "ವರ್ಧಿತ ಸಿಮ್ಯುಲೇಟೆಡ್ ಅನ್ನೀಲಿಂಗ್ ಆಪ್ಟಿಮೈಸೇಶನ್ ಪ್ರಾರಂಭಿಸುತ್ತಿರುವೆ...",
        'sa_initial': "ಆರಂಭಿಕ ಪರಿಹಾರ ವೆಚ್ಚ: {:.2f} ಕಿ.ಮೀ",
        'sa_complete': "ವರ್ಧಿತ ಸಿಮ್ಯುಲೇಟೆಡ್ ಅನ್ನೀಲಿಂಗ್ ಪೂರ್ಣಗೊಂಡಿದೆ. ಅಂತಿಮ ವೆಚ್ಚ: {:.2f} ಕಿ.ಮೀ",
        'optimal_path': "ಅತ್ಯುತ್ತಮ ಮಾರ್ಗ: {}",
        'route_complete': "ಮಾರ್ಗ ಆಪ್ಟಿಮೈಸೇಶನ್ ಪೂರ್ಣಗೊಂಡಿದೆ!",
        'listening': "ಆಲಿಸುತ್ತಿರುವೆ... (ಈಗ ಮಾತನಾಡಿ)",
        'no_speech': "ಯಾವುದೇ ಮಾತು ಪತ್ತೆಯಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
        'not_understood': "ನೀವು ಹೇಳಿದ್ದು ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
        'speech_error': "ಮಾತು ಗುರುತಿಸುವಲ್ಲಿ ದೋಷವಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಉತ್ತರವನ್ನು ಟೈಪ್ ಮಾಡಿ.",
        'didnt_understand': "ಅದು ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ. (ಪ್ರಯತ್ನ {}/{})",
        'switching_text': "ಈ ಪ್ರಶ್ನೆಗಾಗಿ ಪಠ್ಯ ಇನ್‌ಪುಟ್‌ಗೆ ಬದಲಾಯಿಸುತ್ತಿರುವೆ.",
        'is_kilometers_away': "{:.1f} ಕಿಲೋಮೀಟರ್ ದೂರದಲ್ಲಿದೆ",
        'route_speech': "ನಿಮ್ಮ ಅತ್ಯುತ್ತಮ ಮಾರ್ಗವು {:.1f} ಕಿಲೋಮೀಟರ್‌ಗಳನ್ನು ಒಳಗೊಂಡಿದೆ. {} ನಿಂದ ಪ್ರಾರಂಭಿಸಿ, ",
        'then': "ನಂತರ {}",
        'return_to': "ಮತ್ತು ಅಂತಿಮವಾಗಿ {} ಗೆ ಹಿಂತಿರುಗಿ",
        'from_to': "{} ನಿಂದ {} ಗೆ: {:.1f} ಕಿಲೋಮೀಟರ್‌ಗಳು"
    },
    'hi': {
        'welcome': "बहुभाषी वॉयस सपोर्ट के साथ ट्रैवलिंग सेल्समैन प्रॉब्लम सॉल्वर में आपका स्वागत है!",
        'choose_language': "अपनी पसंदीदा भाषा चुनें:",
        'language_options': ["1. English", "2. ಕನ್ನಡ (Kannada)", "3. हिंदी (Hindi)"],
        'language_selection': "अपना विकल्प दर्ज करें (1, 2, या 3): ",
        'language_enabled': "भाषा सक्रिय की गई!",
        'choose_mode': "इनपुट/आउटपुट मोड चुनें:",
        'mode_options': ["1. टेक्स्ट इनपुट/आउटपुट", "2. वॉयस इनपुट/आउटपुट"],
        'mode_selection': "अपना विकल्प दर्ज करें (1 या 2): ",
        'voice_enabled': "वॉयस मोड सक्रिय किया गया! मैं अब इनपुट और आउटपुट के लिए स्पीच का उपयोग करूंगा।",
        'text_enabled': "टेक्स्ट मोड सक्रिय किया गया!",
        'enter_points': "डिलीवरी पॉइंट्स की संख्या दर्ज करें: ",
        'enter_address': "पॉइंट {} के लिए पता दर्ज करें: ",
        'looking_up': "{} के लिए निर्देशांक खोज रहे हैं...",
        'located_success': "{} को सफलतापूर्वक स्थित किया गया",
        'location_error': "पते के लिए निर्देशांक नहीं मिल सके: {}",
        'available_points': "उपलब्ध पॉइंट्स:",
        'your_locations': "आपके स्थान हैं: ",
        'enter_start_point': "शुरुआती पॉइंट का नंबर दर्ज करें: ",
        'invalid_start': "अमान्य शुरुआती पॉइंट",
        'start_point_set': "शुरुआती पॉइंट सेट किया गया: {}",
        'precomputing': "दूरी मैट्रिक्स की पूर्व-गणना कर रहे हैं...",
        'progress': "प्रगति: {:.1f}% पूर्ण",
        'distance_complete': "दूरी की गणना पूर्ण",
        'distances_from_start': "शुरुआती पॉइंट से दूरियां: {}",
        'step_distances': "इष्टतम पथ में चरण-दर-चरण दूरियां:",
        'total_distance': "कुल दूरी: {:.2f} किमी",
        'using_nn': "कम संख्या के पॉइंट्स के लिए नियरेस्ट नेबर एल्गोरिदम का उपयोग कर रहे हैं",
        'using_hk': "इष्टतम समाधान के लिए हेल्ड-कार्प एल्गोरिदम का उपयोग कर रहे हैं",
        'using_sa': "बड़ी समस्या के लिए एन्हांस्ड सिम्युलेटेड एनीलिंग एल्गोरिदम का उपयोग कर रहे हैं",
        'running_hk': "इष्टतम समाधान के लिए हेल्ड-कार्p एल्गोरिदम चला रहे हैं...",
        'hk_complete': "हेल्ड-कार्प एल्गोरिदम पूर्ण। अंतिम लागत: {:.2f} किमी",
        'sa_starting': "एन्हांस्ड सिम्युलेटेड एनीलिंग ऑप्टिमाइज़ेशन शुरू कर रहे हैं...",
        'sa_initial': "प्रारंभिक समाधान लागत: {:.2f} किमी",
        'sa_complete': "एन्हांस्ड सिम्युलेटेड एनीलिंग पूर्ण। अंतिम लागत: {:.2f} किमी",
        'optimal_path': "इष्टतम पथ: {}",
        'route_complete': "रूट ऑप्टिमाइज़ेशन पूर्ण!",
        'listening': "सुन रहे हैं... (अब बोलें)",
        'no_speech': "कोई स्पीच डिटेक्ट नहीं हुई। कृपया फिर से कोशिश करें।",
        'not_understood': "मैं समझ नहीं पाया कि आपने क्या कहा। कृपया फिर से कोशिश करें।",
        'speech_error': "स्पीच रिकग्निशन में त्रुटि हुई। कृपया अपना उत्तर टाइप करें।",
        'didnt_understand': "मुझे वह समझ नहीं आया। कृपया फिर से कोशिश करें। (प्रयास {}/{})",
        'switching_text': "इस प्रश्न के लिए टेक्स्ट इनपुट पर स्विच कर रहे हैं।",
        'is_kilometers_away': "{:.1f} किलोमीटर दूर है",
        'route_speech': "आपका इष्टतम रूट {:.1f} किलोमीटर तक फैला है। {} से शुरू करके, ",
        'then': "फिर {}",
        'return_to': "और अंत में {} पर वापस जाएं",
        'from_to': "{} से {} तक: {:.1f} किलोमीटर"
    }
}

# Global variable for selected language (populated from input_data)
SELECTED_LANGUAGE = 'en' # Default, will be overridden by input

def get_message(key, *args):
    """
    Retrieves a message based on the key and formats it with provided arguments.
    This version uses a global SELECTED_LANGUAGE (from input_data) for internal logging,
    but defaults to English if the key is missing or language is not found.
    """
    global SELECTED_LANGUAGE # Access the global language setting

    # Attempt to get messages for the selected language, fallback to English if not found
    lang_messages = MESSAGES.get(SELECTED_LANGUAGE, MESSAGES['en'])
    message = lang_messages.get(key, MESSAGES['en'].get(key, f"Missing message for key: {key}"))
    
    try:
        return message.format(*args)
    except (IndexError, KeyError):
        return message # Return as is if formatting fails
    
def clean_text(text):
    """Clean text to remove invalid Unicode characters"""
    if not isinstance(text, str):
        return text
    
    # Remove surrogate characters that cause encoding issues
    cleaned = text.encode('utf-8', errors='ignore').decode('utf-8')
    return cleaned

def get_geocode(address):
    """
    Geocodes an address to latitude and longitude coordinates using Google Maps Geocoding API.
    """
    try:
        clean_address = clean_text(address)
        geocode_result = gmaps.geocode(clean_address)
        if geocode_result:
            lat = geocode_result[0]['geometry']['location']['lat']
            lng = geocode_result[0]['geometry']['location']['lng']
            return lat, lng
        return None, None
    except Exception as e:
        sys.stderr.write(f"Error geocoding '{address}': {e}\n")
        return None, None

def get_distance(origin, destination):
    """
    Calculates the driving distance between two points using Google Maps Distance Matrix API.
    Returns distance in kilometers.
    """
    try:
        distance_result = gmaps.distance_matrix(origins=[origin],
                                                 destinations=[destination],
                                                 mode="driving")
        if distance_result['rows'][0]['elements'][0]['status'] == 'OK':
            distance_meters = distance_result['rows'][0]['elements'][0]['distance']['value']
            return distance_meters / 1000.0  # Convert to kilometers
        else:
            sys.stderr.write(f"Google Maps Distance Matrix API status not OK for {origin} to {destination}: {distance_result['rows'][0]['elements'][0]['status']}\n")
            return float('inf') # Indicate unreachable
    except Exception as e:
        sys.stderr.write(f"Error getting distance between {origin} and {destination}: {e}\n")
        return float('inf') # Return infinity for unreachable points

def precompute_distance_matrix(points):
    """
    Precomputes the distance matrix for all pairs of points.
    """
    num_points = len(points)
    dist_matrix = np.full((num_points, num_points), float('inf'))

    for i in range(num_points):
        dist_matrix[i][i] = 0.0 # Distance to self is 0
        for j in range(i + 1, num_points):
            # sys.stderr.write(f"Calculating distance from point {i} to {j}...\n") # For verbose logging
            dist = get_distance(points[i], points[j])
            dist_matrix[i][j] = dist
            dist_matrix[j][i] = dist # Symmetric matrix for travel time
    return dist_matrix

def calculate_total_cost(path_indices, dist_matrix):
    """
    Calculates the total cost (distance) of a given path.
    Assumes path_indices include the return to start for a complete circuit.
    """
    total_cost = 0
    for i in range(len(path_indices) - 1):
        total_cost += dist_matrix[path_indices[i]][path_indices[i+1]]
    return total_cost

# --- TSP Algorithms ---

def nearest_neighbor_algorithm(dist_matrix, city_names, start_node_idx, backend_messages):
    """
    Implements the Nearest Neighbor Algorithm for TSP.
    Modified to append messages to backend_messages list.
    """
    num_nodes = len(city_names)
    visited = [False] * num_nodes
    path = [start_node_idx]
    visited[start_node_idx] = True
    current_node = start_node_idx
    
    backend_messages.append(get_message('using_nn')) # Collect message
    sys.stderr.write(get_message('using_nn') + "\n") # Internal logging

    for _ in range(num_nodes - 1):
        min_dist = float('inf')
        next_node = -1
        for i in range(num_nodes):
            if not visited[i] and dist_matrix[current_node][i] < min_dist:
                min_dist = dist_matrix[current_node][i]
                next_node = i
        if next_node != -1:
            path.append(next_node)
            visited[next_node] = True
            current_node = next_node
        else:
            sys.stderr.write("Error: Nearest neighbor not found, path incomplete.\n")
            break

    # Return to the starting node to complete the circuit
    path.append(start_node_idx)
    total_cost = calculate_total_cost(path, dist_matrix)

    return [city_names[i] for i in path], total_cost

def improved_held_karp_algorithm(dist_matrix, city_names, start_node_idx, backend_messages):
    """
    Implements an improved version of the Held-Karp (Dynamic Programming) Algorithm for TSP.
    Modified to append messages to backend_messages list.
    """
    num_nodes = len(city_names)
    backend_messages.append(get_message('using_hk')) # Collect message
    backend_messages.append(get_message('running_hk')) # Collect message
    sys.stderr.write(get_message('running_hk') + "\n") # Internal logging

    # dp[mask][i] stores the minimum cost to visit all cities in 'mask' ending at city 'i'
    dp = {}
    parent = {} # To reconstruct the path

    # Initialize for paths of length 1 (from start_node_idx to each other node)
    for i in range(num_nodes):
        if i == start_node_idx:
            continue
        mask = (1 << start_node_idx) | (1 << i)
        dp[(mask, i)] = dist_matrix[start_node_idx][i]
        parent[(mask, i)] = start_node_idx

    # Iterate over subsets of increasing size
    for subset_size in range(3, num_nodes + 1):
        # Generate all masks (subsets) of the current size
        for mask_combo in itertools.combinations(range(num_nodes), subset_size):
            mask_bit = 0
            for bit in mask_combo:
                mask_bit |= (1 << bit)

            # Ensure starting node is in the current subset
            if not (mask_bit & (1 << start_node_idx)):
                continue

            for j in mask_combo: # j is the current ending node
                if j == start_node_idx:
                    continue

                prev_mask = mask_bit ^ (1 << j) # Mask without j

                min_cost_for_j = float('inf')
                prev_node_for_j = -1

                for k in mask_combo: # k is the previous node in the path to j
                    if k == j or not (prev_mask & (1 << k)): # k must be in prev_mask
                        continue
                    
                    if (prev_mask, k) in dp:
                        current_cost = dp[(prev_mask, k)] + dist_matrix[k][j]
                        if current_cost < min_cost_for_j:
                            min_cost_for_j = current_cost
                            prev_node_for_j = k
                
                if min_cost_for_j != float('inf'):
                    dp[(mask_bit, j)] = min_cost_for_j
                    parent[(mask_bit, j)] = prev_node_for_j
    
    # Find the minimum cost to return to the starting node
    all_visited_mask = (1 << num_nodes) - 1 # Mask where all bits are set
    min_total_cost = float('inf')
    last_node_in_path = -1

    for i in range(num_nodes):
        if i == start_node_idx:
            continue
        if (all_visited_mask, i) in dp:
            cost_to_return = dp[(all_visited_mask, i)] + dist_matrix[i][start_node_idx]
            if cost_to_return < min_total_cost:
                min_total_cost = cost_to_return
                last_node_in_path = i

    # Reconstruct the path
    path_indices = []
    if last_node_in_path != -1:
        current_mask = all_visited_mask
        current_node = last_node_in_path
        
        # Backtrack from last_node_in_path to start_node_idx
        while current_node != start_node_idx:
            path_indices.append(current_node)
            if (current_mask, current_node) not in parent:
                sys.stderr.write("Error: Could not reconstruct path in Held-Karp (parent not found).\n")
                return [], float('inf') # Return empty path and infinity cost on error
            
            prev_node = parent[(current_mask, current_node)]
            current_mask ^= (1 << current_node) # Remove current_node from mask
            current_node = prev_node
        
        path_indices.append(start_node_idx) # Add the starting node at the beginning
        path_indices.reverse() # Reverse to get correct order from start

        path_indices.append(start_node_idx) # Complete the cycle

    backend_messages.append(get_message('hk_complete', min_total_cost)) # Collect message
    sys.stderr.write(get_message('hk_complete', min_total_cost) + "\n") # Internal logging
    return [city_names[i] for i in path_indices], min_total_cost


def enhanced_simulated_annealing(dist_matrix, city_names, start_node_idx, backend_messages,
                                 initial_temperature=10000, cooling_rate=0.003, iterations_per_temp=1000):
    """
    Implements an enhanced Simulated Annealing Algorithm for TSP.
    Modified to append messages to backend_messages list.
    """
    num_nodes = len(city_names)
    backend_messages.append(get_message('using_sa')) # Collect message
    backend_messages.append(get_message('sa_starting')) # Collect message
    sys.stderr.write(get_message('sa_starting') + "\n") # Internal logging

    # Initial solution (Nearest Neighbor to get a reasonable start)
    # Pass backend_messages to nearest_neighbor_algorithm as well
    initial_path_names, initial_cost = nearest_neighbor_algorithm(dist_matrix, city_names, start_node_idx, backend_messages)
    # Convert path names back to indices for internal calculations, excluding the duplicate end node for internal path representation
    current_path_indices = [city_names.index(name) for name in initial_path_names[:-1]] 
    # Calculate cost of this initial path (which includes return to start)
    current_cost = calculate_total_cost(current_path_indices + [current_path_indices[0]], dist_matrix)

    backend_messages.append(get_message('sa_initial', current_cost)) # Collect message
    sys.stderr.write(get_message('sa_initial', current_cost) + "\n") # Internal logging

    best_path_indices = list(current_path_indices)
    best_cost = current_cost
    temperature = initial_temperature

    while temperature > 1:
        for _ in range(iterations_per_temp):
            # Generate a neighbor solution using 2-opt swap
            temp_path = list(current_path_indices)
            
            # Ensure start_node_idx is fixed at the beginning/end for the swap operation.
            # We will operate on the permutation of other nodes.
            # Create a list of indices of nodes that are NOT the start node.
            non_start_node_indices = [i for i in range(num_nodes) if i != start_node_idx]
            
            if len(non_start_node_indices) < 2: # Cannot perform a 2-opt swap if fewer than 2 movable nodes
                break

            # Pick two random unique indices from the non-start nodes to swap
            swap_node_idx1, swap_node_idx2 = random.sample(non_start_node_indices, 2)
            
            # Find their positions within the current_path_indices (excluding the first element if it's the start_node_idx)
            # We need to find the actual positions in the path permutation.
            pos1 = -1
            pos2 = -1
            for i, node_idx in enumerate(temp_path):
                if node_idx == swap_node_idx1:
                    pos1 = i
                if node_idx == swap_node_idx2:
                    pos2 = i
            
            if pos1 == -1 or pos2 == -1: # Should not happen if non_start_node_indices are in temp_path
                sys.stderr.write("Error: Nodes for 2-opt swap not found in path.\n")
                continue

            # Ensure pos1 < pos2 for slicing
            if pos1 > pos2:
                pos1, pos2 = pos2, pos1

            # Perform the 2-opt swap: reverse the segment between pos1 and pos2 (inclusive)
            temp_path[pos1:pos2+1] = temp_path[pos1:pos2+1][::-1]

            # Calculate cost for the new path (remembering to complete the circuit)
            new_cost = calculate_total_cost(temp_path + [temp_path[0]], dist_matrix)

            # Acceptance probability
            if new_cost < current_cost or random.random() < math.exp((current_cost - new_cost) / temperature):
                current_path_indices = list(temp_path)
                current_cost = new_cost

            if current_cost < best_cost:
                best_cost = current_cost
                best_path_indices = list(current_path_indices)

        temperature *= (1 - cooling_rate)
        # sys.stderr.write(f"Temperature: {temperature:.2f}, Current Best: {best_cost:.2f}\n") # For verbose logging

    # Ensure the best path starts and ends at the designated start_node_idx
    # The internal best_path_indices only store the unique nodes in order.
    # We need to rotate it if it doesn't start with start_node_idx
    if best_path_indices and best_path_indices[0] != start_node_idx:
        try:
            start_pos = best_path_indices.index(start_node_idx)
            best_path_indices = best_path_indices[start_pos:] + best_path_indices[:start_pos]
        except ValueError:
            sys.stderr.write(f"Warning: Start node {start_node_idx} not found in best path.\n")
            # Fallback: if start node is not in path, use the current best as is (might be an issue)

    # Add the start node at the end to complete the circuit for output
    final_path_for_output = list(best_path_indices)
    if final_path_for_output: # Only append if path is not empty
        final_path_for_output.append(start_node_idx)
    
    # Recalculate final cost for the complete circuit for accuracy
    final_cost_calculated = calculate_total_cost(final_path_for_output, dist_matrix)

    backend_messages.append(get_message('sa_complete', final_cost_calculated)) # Collect message
    sys.stderr.write(get_message('sa_complete', final_cost_calculated) + "\n") # Internal logging
    return [city_names[i] for i in final_path_for_output], final_cost_calculated


# --- Main Logic ---

def main():
    global SELECTED_LANGUAGE # Declare to modify the global variable

    # Read input from stdin
    input_data_raw = sys.stdin.read()
    try:
        input_data = json.loads(input_data_raw)
        addresses = [clean_text(addr) for addr in input_data.get('addresses', [])]
    except json.JSONDecodeError as e:
        sys.stderr.write(f"Error decoding JSON input: {e}\n")
        sys.stderr.write(f"Received raw input: {input_data_raw}\n")
        sys.exit(1)

    # Extract inputs and set global language
    num_points = input_data.get('num_points')
    addresses = input_data.get('addresses')
    start_point_idx = input_data.get('start_point_idx')
    SELECTED_LANGUAGE = input_data.get('language', 'en') # Set global language for internal messages
    # The 'use_voice' flag from frontend is no longer used directly in backend for speech output
    # USE_VOICE = input_data.get('use_voice', False) 

    backend_messages = [] # Initialize list to collect messages for the frontend

    # Basic validation of input
    if num_points is None or addresses is None or start_point_idx is None:
        backend_messages.append(get_message('welcome')) # Collect message
        sys.stderr.write(get_message('welcome') + "\n") # Log welcome for initial run
        sys.stderr.write("Missing required input parameters (num_points, addresses, start_point_idx).\n")
        
        # Output error JSON to stdout for frontend to pick up
        print(json.dumps({"error": "Missing required input parameters.", "backendMessages": backend_messages}))
        sys.exit(1)
    
    if not isinstance(addresses, list) or not all(isinstance(a, str) for a in addresses):
        sys.stderr.write("Addresses must be a list of strings.\n")
        print(json.dumps({"error": "Addresses must be a list of strings.", "backendMessages": backend_messages}))
        sys.exit(1)

    if not isinstance(num_points, int) or num_points <= 0:
        sys.stderr.write("num_points must be a positive integer.\n")
        print(json.dumps({"error": "num_points must be a positive integer.", "backendMessages": backend_messages}))
        sys.exit(1)

    if len(addresses) != num_points:
        sys.stderr.write(f"Mismatch: num_points ({num_points}) does not match number of provided addresses ({len(addresses)}).\n")
        print(json.dumps({"error": f"Mismatch: num_points ({num_points}) does not match number of provided addresses ({len(addresses)}).", "backendMessages": backend_messages}))
        sys.exit(1)
        
    if not isinstance(start_point_idx, int) or not (0 <= start_point_idx < num_points):
        sys.stderr.write(f"Invalid start_point_idx: {start_point_idx}. Must be between 0 and {num_points - 1}.\n")
        print(json.dumps({"error": f"Invalid start_point_idx: {start_point_idx}. Must be between 0 and {num_points - 1}.", "backendMessages": backend_messages}))
        sys.exit(1)


    points_coords = []
    for i, address in enumerate(addresses):
        msg_looking_up = get_message('looking_up', address)
        backend_messages.append(msg_looking_up) # Collect message
        sys.stderr.write(msg_looking_up + "\n") # For verbose logging
        
        lat, lng = get_geocode(address)
        if lat is not None and lng is not None:
            points_coords.append((lat, lng))
            msg_located_success = get_message('located_success', address)
            backend_messages.append(msg_located_success) # Collect message
            sys.stderr.write(msg_located_success + "\n") # For verbose logging
        else:
            msg_location_error = get_message('location_error', address)
            backend_messages.append(msg_location_error) # Collect message
            sys.stderr.write(msg_location_error + "\n")
            # Output error JSON and exit
            print(json.dumps({"error": msg_location_error, "backendMessages": backend_messages}))
            sys.exit(1) # Exit if even one address cannot be geocoded

    # Precompute distances
    msg_precomputing = get_message('precomputing')
    backend_messages.append(msg_precomputing) # Collect message
    sys.stderr.write(msg_precomputing + "\n") # For verbose logging
    
    dist_matrix = precompute_distance_matrix(points_coords)
    
    msg_distance_complete = get_message('distance_complete')
    backend_messages.append(msg_distance_complete) # Collect message
    sys.stderr.write(msg_distance_complete + "\n") # For verbose logging

    path = []
    cost = float('inf')

    # Algorithm selection based on num_points
    if num_points <= 10:
        path, cost = nearest_neighbor_algorithm(dist_matrix, addresses, start_point_idx, backend_messages)
    elif 11 <= num_points <= 20:
        path, cost = improved_held_karp_algorithm(dist_matrix, addresses, start_point_idx, backend_messages)
    else: # For larger number of points, use Simulated Annealing
        path, cost = enhanced_simulated_annealing(dist_matrix, addresses, start_point_idx, backend_messages)
    
    # Final check to ensure the path is a complete circuit for output.
    # The algorithms should already ensure this, but a robust check is good.
    if path and (path[0] != path[-1]):
        path.append(path[0]) # Make sure it ends at the start if not already
        
        # Recalculate cost if path was explicitly modified here to ensure accuracy
        path_indices_for_cost_recalc = [addresses.index(city) for city in path]
        cost = calculate_total_cost(path_indices_for_cost_recalc, dist_matrix)

    # Prepare step-by-step distances for output
    step_details = []
    if path and len(path) > 1: # Ensure there's a path with at least two points (start and then end)
        path_indices_for_steps = [addresses.index(city) for city in path]
        for i in range(len(path_indices_for_steps) - 1):
            from_idx = path_indices_for_steps[i]
            to_idx = path_indices_for_steps[i+1]
            distance = dist_matrix[from_idx][to_idx]
            step_details.append({
                "from": addresses[from_idx],
                "to": addresses[to_idx],
                "distance": round(distance, 2)
            })

    # Output the result as JSON to stdout
    result = {
        "optimalPath": path,
        "totalDistance": round(cost, 2),
        "stepByStepDistances": step_details,
        "backendMessages": backend_messages # Include all collected backend messages
    }
    print(json.dumps(result))
    
    msg_route_complete = get_message('route_complete')
    backend_messages.append(msg_route_complete) # Collect final message
    sys.stderr.write(msg_route_complete + "\n") # Internal logging

if __name__ == "__main__":
    main()