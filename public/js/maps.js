/**
 * Casalinga Tours Maps Utility with enhanced error handling
 */
class CasalingaMaps {
    constructor() {
        this.maps = {};
        this.markers = {};
        this.initialized = false;
    }

    /**
     * Initialize maps only when API is ready
     */
    init() {
        // Check if API is loaded
        if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
            console.warn('Google Maps API not loaded yet');
            
            // Listen for API load event
            document.addEventListener('google-maps-loaded', () => {
                this.initialized = true;
                this.initAllMaps();
                this.initGeocoding();
            });
            
            // Listen for API errors
            document.addEventListener('google-maps-error', () => {
                this.showMapErrors();
            });
            
            return;
        }
        
        this.initialized = true;
        this.initAllMaps();
        this.initGeocoding();
    }

    /**
     * Show error messages for maps
     */
    showMapErrors() {
        const mapContainers = document.querySelectorAll('[id^="tour-map-"]');
        mapContainers.forEach(container => {
            container.innerHTML = `
                <div class="map-error" style="padding: 2rem; text-align: center; color: #666;">
                    <h3>⚠️ Map Unavailable</h3>
                    <p>Google Maps cannot be loaded at this time.</p>
                    <p><small>This may be due to API configuration issues.</small></p>
                    <a href="/maps-debug" class="btn btn-small">Check Configuration</a>
                </div>
            `;
        });
    }

    /**
     * Initialize a map with error handling
     */
    initMap(mapId, latitude, longitude, title, address) {
        if (!this.initialized) {
            console.warn('Maps not initialized yet');
            return;
        }

        const mapElement = document.getElementById(mapId);
        if (!mapElement) return;

        try {
            const position = { 
                lat: parseFloat(latitude), 
                lng: parseFloat(longitude) 
            };

            if (isNaN(position.lat) || isNaN(position.lng)) {
                throw new Error('Invalid coordinates');
            }

            const map = new google.maps.Map(mapElement, {
                zoom: 14,
                center: position,
                mapTypeControl: true,
                streetViewControl: true
            });

            const marker = new google.maps.Marker({
                position: position,
                map: map,
                title: title
            });

            this.maps[mapId] = map;
            this.markers[mapId] = marker;

        } catch (error) {
            console.error('Map initialization error:', error);
            mapElement.innerHTML = `
                <div class="map-error">
                    <p>⚠️ Map Loading Failed</p>
                    <small>${error.message}</small>
                </div>
            `;
        }
    }

    // ... rest of the methods remain the same ...
}

// Initialize when API is ready
document.addEventListener('DOMContentLoaded', function() {
    const maps = new CasalingaMaps();
    maps.init();
});

// Fallback initialization if API loads after DOM
if (window.mapsLoaded) {
    document.dispatchEvent(new Event('google-maps-loaded'));
}