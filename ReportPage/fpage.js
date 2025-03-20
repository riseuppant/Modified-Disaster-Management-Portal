let map = L.map("map").setView([20.5937, 78.9629], 5);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

let marker = L.marker([20.5937, 78.9629]).addTo(map);

function useMyLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateLocation(position.coords.latitude, position.coords.longitude);
        getLocationName(position.coords.latitude, position.coords.longitude);
      },
      () => alert("Failed to get location")
    );
  } else {
    alert("Geolocation is not supported by your browser.");
  }
}

function updateLocation(lat, lng) {
  document.getElementById("latitude").value = lat;
  document.getElementById("longitude").value = lng;
  map.setView([lat, lng], 12);
  marker.setLatLng([lat, lng]);
}

function getLocationName(lat, lng) {
  fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.address) {
        let city =
          data.address.city || data.address.town || data.address.village || "";
        let state = data.address.state || "";
        let country = data.address.country || "";
        document.getElementById("search-box").value =
          `${city}, ${state}, ${country}`.trim();
      }
    })
    .catch((error) => console.error("Error fetching location name:", error));
}
// Initialize map variables
let circle;
let forestMarkers = [];
let terrainLayers = [];

// Initialize the map when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    setupEventListeners();
});

// Initialize the Leaflet map
function initializeMap() {
    // Create the map centered at a default location (can be changed)
    map = L.map('map').setView([20, 0], 2);
    
    // Add the main tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Add satellite imagery layer
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });
    
    // Add terrain layer
    const terrainLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
    
    // Create a layer control for switching between map types
    const baseMaps = {
        "Street Map": map.getPane('tilePane').firstChild,
        "Satellite": satelliteLayer,
        "Terrain": terrainLayer
    };
    
    // Add layer control to the map
    L.control.layers(baseMaps).addTo(map);
    
    // Add scale control to the map
    L.control.scale().addTo(map);
    
    // Add forest and terrain features
    addForestAndTerrainFeatures();
    
    // Initial click event to place a marker
    map.on('click', function(e) {
        updateMarkerPosition(e.latlng);
    });
}

// Add forest and terrain features to the map
function addForestAndTerrainFeatures() {
    // Add some sample forest areas (these would typically come from a database or API)
    const forests = [
        { lat: 37.7749, lng: -122.4194, name: "Muir Woods", size: 554 },
        { lat: 46.8787, lng: -121.7269, name: "Mount Rainier National Forest", size: 976 },
        { lat: 28.3852, lng: 84.1240, name: "Sagarmatha National Park", size: 1148 },
        { lat: -2.3348, lng: 34.6857, name: "Serengeti National Park", size: 14763 },
        { lat: -3.4653, lng: -62.2159, name: "Amazon Rainforest", size: 5500000 }
    ];
    
    // Add forest markers to the map
    forests.forEach(forest => {
        const forestIcon = L.divIcon({
            className: 'leaflet-forest-marker',
            html: '<i class="fas fa-tree" style="color: #228B22; font-size: 1.5rem;"></i>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        
        const forestMarker = L.marker([forest.lat, forest.lng], {icon: forestIcon}).addTo(map);
        forestMarker.bindPopup(`<b>${forest.name}</b><br>Area: ${forest.size} hectares`);
        forestMarkers.push(forestMarker);
    });
    
    // Add terrain polygons to the map
    const terrains = [
        {
            name: "Rocky Mountains",
            type: "mountainous",
            coordinates: [
                [40.3772, -105.5217],
                [39.0639, -106.6303],
                [38.8456, -104.7999],
                [41.0885, -104.7999]
            ]
        },
        {
            name: "Lake Victoria",
            type: "water",
            coordinates: [
                [-0.7667, 33.4667],
                [-0.7667, 32.8833],
                [-1.2500, 32.8833],
                [-1.2500, 33.4667]
            ]
        },
        {
            name: "Black Forest",
            type: "forest",
            coordinates: [
                [48.5000, 8.0000],
                [48.5000, 8.5000],
                [48.0000, 8.5000],
                [48.0000, 8.0000]
            ]
        },
        {
            name: "Urban Area",
            type: "urban",
            coordinates: [
                [51.5074, -0.1278],
                [51.5074, -0.0778],
                [51.4574, -0.0778],
                [51.4574, -0.1278]
            ]
        }
    ];
    
    // Add terrain polygons to the map
    terrains.forEach(terrain => {
        const polygonCoords = terrain.coordinates.map(coord => [coord[0], coord[1]]);
        
        const terrainColor = getTerrainColor(terrain.type);
        const terrainPolygon = L.polygon(polygonCoords, {
            color: terrainColor,
            fillColor: terrainColor,
            fillOpacity: 0.5,
            className: `leaflet-terrain-${terrain.type}`
        }).addTo(map);
        
        terrainPolygon.bindPopup(`<b>${terrain.name}</b><br>Terrain Type: ${terrain.type}`);
        terrainLayers.push(terrainPolygon);
    });
}

// Get color based on terrain type
function getTerrainColor(type) {
    switch(type) {
        case 'mountainous': return '#8B4513';
        case 'water': return '#4682B4';
        case 'forest': return '#228B22';
        case 'urban': return '#808080';
        default: return '#A9A9A9';
    }
}

// Set up event listeners for the page
function setupEventListeners() {
    // Add event listener for the "Use My Location" button
    document.querySelector('.btn-location').addEventListener('click', useMyLocation);
    
    // Add event listener for the search box
    const searchBox = document.getElementById('search-box');
    searchBox.addEventListener('input', debounce(searchLocation, 500));
    
    // Add event listener for form submission
    document.querySelector('form').addEventListener('submit', validateForm);
    
    // Add event listener for file upload
    const fileInput = document.getElementById('image');
    fileInput.addEventListener('change', handleFileUpload);
}

// Handle the "Use My Location" button click
function useMyLocation() {
    if (navigator.geolocation) {
        // Show loading indicator
        document.querySelector('.btn-location').innerHTML = 
            '<i class="fas fa-spinner fa-spin"></i> Locating...';
        
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const latlng = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                updateMarkerPosition(latlng);
                map.setView(latlng, 13);
                
                // Restore button text
                document.querySelector('.btn-location').innerHTML = 
                    '<i class="fas fa-crosshairs"></i> Use My Location';
                
                // Fetch and display address
                reverseGeocode(latlng);
            },
            function(error) {
                // Handle errors
                let errorMessage;
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "Location permission denied.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Location information unavailable.";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "Location request timed out.";
                        break;
                    default:
                        errorMessage = "An unknown error occurred.";
                }
                
                // Show error notification
                showNotification(errorMessage, 'error');
                
                // Restore button text
                document.querySelector('.btn-location').innerHTML = 
                    '<i class="fas fa-crosshairs"></i> Use My Location';
            }
        );
    } else {
        showNotification("Geolocation is not supported by this browser.", 'error');
    }
}

// Update marker position on the map
function updateMarkerPosition(latlng) {
    // Remove existing marker and circle if they exist
    if (marker) {
        map.removeLayer(marker);
    }
    if (circle) {
        map.removeLayer(circle);
    }
    
    // Create a new marker and circle
    marker = L.marker(latlng, {draggable: true}).addTo(map);
    circle = L.circle(latlng, {
        color: 'rgba(66, 133, 244, 0.5)',
        fillColor: 'rgba(66, 133, 244, 0.2)',
        fillOpacity: 0.5,
        radius: 500
    }).addTo(map);
    
    // Bind a popup to the marker
    marker.bindPopup('<b>Selected Location</b><br>Drag to adjust.').openPopup();
    
    // Update the latitude and longitude input fields
    document.getElementById('latitude').value = latlng.lat.toFixed(6);
    document.getElementById('longitude').value = latlng.lng.toFixed(6);
    
    // Add drag event for the marker
    marker.on('dragend', function(e) {
        const position = marker.getLatLng();
        circle.setLatLng(position);
        document.getElementById('latitude').value = position.lat.toFixed(6);
        document.getElementById('longitude').value = position.lng.toFixed(6);
        
        // Update the location search box
        reverseGeocode(position);
    });
}

// Search for a location by name
function searchLocation() {
    const searchTerm = document.getElementById('search-box').value.trim();
    
    if (searchTerm.length < 3) return;
    
    // Use Nominatim geocoding API
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}`)
    .then(response => response.json())
    .then(data => {
        if (data && data.length > 0) {
            const result = data[0];
            const latlng = {
                lat: parseFloat(result.lat),
                lng: parseFloat(result.lon)
            };
            
            updateMarkerPosition(latlng);
            map.setView(latlng, 13);
        } else {
            showNotification("Location not found. Please try a different search term.", 'warning');
        }
    })
    .catch(error => {
        console.error("Error searching for location:", error);
        showNotification("An error occurred while searching for the location.", 'error');
    });
}

// Reverse geocode a location to get the address
function reverseGeocode(latlng) {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`)
    .then(response => response.json())
    .then(data => {
        if (data && data.display_name) {
            document.getElementById('search-box').value = data.display_name;
        }
    })
    .catch(error => {
        console.error("Error reverse geocoding:", error);
    });
}

// Validate the form before submission
function validateForm(event) {
    let isValid = true;
    
    // Check if disaster type is selected
    const disasterType = document.getElementById('disaster-type').value;
    if (!disasterType) {
        showNotification("Please select a disaster type.", 'error');
        isValid = false;
    }
    
    // Check if location is selected
    const latitude = document.getElementById('latitude').value;
    const longitude = document.getElementById('longitude').value;
    if (!latitude || !longitude) {
        showNotification("Please select a location on the map.", 'error');
        isValid = false;
    }
    
    // Check if description is provided
    const description = document.getElementById('description').value.trim();
    if (!description) {
        showNotification("Please provide a description of the disaster.", 'error');
        isValid = false;
    }
    
    // If the form is not valid, prevent submission
    if (!isValid) {
        event.preventDefault();
    } else {
        // Show loading indicator
        const submitButton = document.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitButton.disabled = true;
        
        // Simulate form submission (you would remove this in production)
        setTimeout(() => {
            // Restore button state
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            
            // Show success message
            showNotification("Report submitted successfully!", 'success');
        }, 2000);
    }
}

// Handle file upload and preview
function handleFileUpload(event) {
    const fileInput = event.target;
    const filePreview = document.getElementById('file-preview');
    filePreview.innerHTML = '';
    
    if (fileInput.files && fileInput.files.length > 0) {
        for (let i = 0; i < fileInput.files.length; i++) {
            const file = fileInput.files[i];
            
            // Check if the file is an image
            if (!file.type.startsWith('image/')) {
                showNotification("Please upload only image files.", 'error');
                continue;
            }
            
            // Create a preview image
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = file.name;
                img.title = file.name;
                
                filePreview.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Check if notification container exists, if not create it
    let notificationContainer = document.querySelector('.notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Set icon based on type
    let icon;
    switch(type) {
        case 'success': icon = 'fa-check-circle'; break;
        case 'error': icon = 'fa-exclamation-circle'; break;
        case 'warning': icon = 'fa-exclamation-triangle'; break;
        default: icon = 'fa-info-circle';
    }
    
    // Set notification content
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    // Add notification to container
    notificationContainer.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
            // Remove container if it's empty
            if (notificationContainer.children.length === 0) {
                notificationContainer.remove();
            }
        }, 300);
    }, 5000);
}

// Utility function for debouncing
function debounce(func, delay) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

// Add disaster risk level visualization
function addDisasterRiskLevels() {
    // This function would typically fetch data from an API
    // For demonstration, we'll use sample data
    const riskLevels = [
        { lat: 37.7749, lng: -122.4194, risk: 'high', type: 'earthquake' },
        { lat: 25.7617, lng: -80.1918, risk: 'high', type: 'hurricane' },
        { lat: 34.0522, lng: -118.2437, risk: 'medium', type: 'fire' },
        { lat: 41.8781, lng: -87.6298, risk: 'low', type: 'flood' }
    ];
    
    // Add risk level markers to the map
    riskLevels.forEach(location => {
        const riskIcon = L.divIcon({
            className: `risk-marker risk-${location.risk}`,
            html: `<div class="risk-icon"><i class="fas fa-exclamation-triangle"></i></div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        
        const riskMarker = L.marker([location.lat, location.lng], {icon: riskIcon}).addTo(map);
        riskMarker.bindPopup(`
            <b>Risk Level: ${location.risk.toUpperCase()}</b><br>
            Type: ${location.type}<br>
            <a href="#" onclick="showRiskDetails('${location.type}', '${location.risk}')">View Details</a>
        `);
    });
}

// Show risk details - this would be implemented in a real application
function showRiskDetails(type, risk) {
    console.log(`Showing details for ${type} risk level: ${risk}`);
    // Implementation would depend on your application's requirements
}

// Function to add weather layer
function addWeatherLayer() {
    // This would typically use a weather API
    // For demonstration, we'll create a simple weather overlay
    const weatherLayer = L.tileLayer('https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=YOUR_API_KEY', {
        attribution: 'Weather data &copy; <a href="https://openweathermap.org">OpenWeatherMap</a>',
        opacity: 0.5
    });
    
    // Add weather layer to layer control
    map.addLayer(weatherLayer);
}