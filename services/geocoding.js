const axios = require('axios');

class GeocodingService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
    }

    /**
     * Convert a human-readable address to geographic coordinates
     * @param {string} address - The address to geocode
     * @returns {Promise<Object>} - Object with success status and coordinates
     */
    async geocodeAddress(address) {
        try {
            console.log(`Geocoding address: ${address}`);
            
            const response = await axios.get(this.baseUrl, {
                params: {
                    address: address,
                    key: this.apiKey
                },
                timeout: 10000 // 10 second timeout
            });

            console.log('Google Geocoding API response status:', response.data.status);

            if (response.data.status === 'OK' && response.data.results.length > 0) {
                const location = response.data.results[0].geometry.location;
                const formattedAddress = response.data.results[0].formatted_address;
                
                console.log(`Geocoding successful: ${formattedAddress} -> ${location.lat}, ${location.lng}`);
                
                return {
                    success: true,
                    latitude: location.lat,
                    longitude: location.lng,
                    formattedAddress: formattedAddress
                };
            } else {
                const errorMessage = this.getErrorMessage(response.data.status);
                console.log('Geocoding failed:', errorMessage);
                
                return {
                    success: false,
                    error: errorMessage
                };
            }
        } catch (error) {
            console.error('Geocoding error:', error.message);
            
            let errorMsg = 'Network error. Please check your connection.';
            if (error.code === 'ECONNABORTED') {
                errorMsg = 'Request timeout. Please try again.';
            } else if (error.response) {
                errorMsg = `API error: ${error.response.status} - ${error.response.statusText}`;
            }
            
            return {
                success: false,
                error: errorMsg
            };
        }
    }

    /**
     * Convert Google Maps API status codes to user-friendly messages
     * @param {string} status - Google Maps API status code
     * @returns {string} - User-friendly error message
     */
    getErrorMessage(status) {
        const errorMessages = {
            'ZERO_RESULTS': 'No results found for this address. Please check the address and try again.',
            'OVER_QUERY_LIMIT': 'Query limit exceeded. Please try again later.',
            'REQUEST_DENIED': 'Geocoding service is currently unavailable.',
            'INVALID_REQUEST': 'Invalid address format. Please provide a complete address.',
            'UNKNOWN_ERROR': 'Temporary error. Please try again.',
            '': 'Unknown error occurred.'
        };

        return errorMessages[status] || `Geocoding failed: ${status}`;
    }

    /**
     * Reverse geocode - convert coordinates to address
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @returns {Promise<Object>} - Object with success status and address
     */
    async reverseGeocode(lat, lng) {
        try {
            const response = await axios.get(this.baseUrl, {
                params: {
                    latlng: `${lat},${lng}`,
                    key: this.apiKey
                },
                timeout: 10000
            });

            if (response.data.status === 'OK' && response.data.results.length > 0) {
                return {
                    success: true,
                    address: response.data.results[0].formatted_address
                };
            } else {
                return {
                    success: false,
                    error: this.getErrorMessage(response.data.status)
                };
            }
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            return {
                success: false,
                error: 'Reverse geocoding failed'
            };
        }
    }
}

module.exports = GeocodingService;