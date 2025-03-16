// Initialize AOS
AOS.init({
    duration: 1000,
    once: true,
    offset: 100,
    easing: 'ease-out-cubic'
});

// Check if user is authenticated (simulated for demo)
let isAuthenticated = false; // Set to false by default

// DOM Elements
const authSection = document.getElementById('auth-section');
const authStatus = document.getElementById('auth-status');
const disasterForm = document.getElementById('disaster-report-form');
const successMessage = document.getElementById('success-message');
const errorMessage = document.getElementById('error-message');
const errorDetails = document.getElementById('error-details');
const loadingIndicator = document.getElementById('loading');
const imageUpload = document.getElementById('image-upload');
const imagePreviewContainer = document.getElementById('image-preview-container');
const getLocationBtn = document.getElementById('get-location');
const locationSearchInput = document.getElementById('location-search');

// Map variables
let map;
let marker;
let accuracyCircle;
let watchId = null;
let locationUpdateCount = 0;
const MAX_LOCATION_UPDATES = 3; // Number of location updates to collect for averaging

// Store location readings for averaging
let locationReadings = [];

// Text animation function using GSAP
function animateText() {
    // Create a timeline for better control
    const tl = gsap.timeline();
    
    // Animate page title with a bounce effect
    tl.to('#page-title', {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.5)",
        onComplete: () => {
            document.getElementById('page-title').classList.add('animated');
        }
    });

    // Split text into characters for animation
    const subtitle = document.getElementById('page-subtitle');
    const subtitleText = subtitle.textContent;
    subtitle.textContent = '';
    
    for (let i = 0; i < subtitleText.length; i++) {
        const charSpan = document.createElement('span');
        charSpan.className = 'char';
        charSpan.textContent = subtitleText[i] === ' ' ? '\u00A0' : subtitleText[i];
        subtitle.appendChild(charSpan);
    }

    // Animate each character with a wave effect
    tl.to('.char', {
        opacity: 1,
        y: 0,
        stagger: {
            each: 0.02,
            from: "start",
            ease: "power2.out"
        },
        duration: 0.5,
        ease: "back.out(1.7)"
    }, "-=0.5");

    // Animate form with a nice reveal
    tl.to('.report-form', {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power3.out"
    }, "-=0.2");

    // Animate form section titles with a staggered fade
    tl.to('.form-section-title', {
        opacity: 1,
        x: 0,
        stagger: 0.2,
        duration: 0.3,
        ease: "power2.out"
    }, "-=0.5");

    // Animate form groups with a staggered fade
    tl.to('.form-group', {
        opacity: 1,
        y: 0,
        stagger: 0.1,
        duration: 0.4,
        ease: "power1.out"
    }, "-=0.3");

    // Animate map container with a scale effect
    tl.to('#map-container', {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: "back.out(1.2)"
    }, "-=0.2");

    // Animate location details
    tl.to('.location-details', {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: "power2.out"
    }, "-=0.4");

    // Animate location search
    tl.to('.location-search', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out"
    }, "-=0.6");

    // Animate file upload
    tl.to('.file-upload', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out"
    }, "-=0.4");

    // Animate form actions with a bounce effect
    tl.to('.form-actions', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "back.out(1.7)"
    }, "-=0.2");
    
    // Add hover animations to buttons
    addButtonAnimations();
}

// Add hover animations to buttons
function addButtonAnimations() {
    // Get all buttons
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        // Add hover animation
        button.addEventListener('mouseenter', function() {
            gsap.to(this, {
                scale: 1.05,
                duration: 0.3,
                ease: "power1.out",
                boxShadow: "0 10px 20px rgba(26, 35, 126, 0.3)"
            });
        });
        
        // Add leave animation
        button.addEventListener('mouseleave', function() {
            gsap.to(this, {
                scale: 1,
                duration: 0.3,
                ease: "power1.out",
                boxShadow: "none"
            });
        });
        
        // Add click animation
        button.addEventListener('mousedown', function() {
            gsap.to(this, {
                scale: 0.95,
                duration: 0.1,
                ease: "power1.out"
            });
        });
        
        // Add release animation
        button.addEventListener('mouseup', function() {
            gsap.to(this, {
                scale: 1.05,
                duration: 0.1,
                ease: "power1.out"
            });
        });
    });
}

// Check authentication status (simulated)
function checkAuthentication() {
    // Simulate authentication check with loading animation
    gsap.to(authStatus, {
        opacity: 0.5,
        duration: 0.3,
        ease: "power2.inOut",
        repeat: 3,
        yoyo: true
    });
    
    setTimeout(() => {
        // For demo purposes, we'll set this to true
        // In a real app, you would check if the user is logged in
        isAuthenticated = true;

        if (isAuthenticated) {
            gsap.to(authStatus, {
                opacity: 0,
                duration: 0.3,
                onComplete: () => {
                    authStatus.innerHTML = '<p class="success">✅ You are authenticated and can submit reports.</p>';
                    gsap.to(authStatus, {
                        opacity: 1,
                        duration: 0.5,
                        ease: "power2.out"
                    });
                }
            });
        } else {
            gsap.to(authStatus, {
                opacity: 0,
                duration: 0.3,
                onComplete: () => {
                    authStatus.innerHTML = `
                        <p class="error">❌ You need to be logged in to submit a report.</p>
                        <a href="login.html" class="btn btn-primary">Login Now</a>
                    `;
                    gsap.to(authStatus, {
                        opacity: 1,
                        duration: 0.5,
                        ease: "power2.out"
                    });
                    // Disable form submission
                    document.getElementById('submit-report').disabled = true;
                }
            });
        }
    }, 1500);
}

// Initialize Leaflet Map
function initMap() {
    // Default location (center of the map)
    const defaultLocation = [20, 0]; // [lat, lng]
    
    // Create map with better default settings
    map = L.map('map', {
        center: defaultLocation,
        zoom: 2,
        minZoom: 2,
        maxZoom: 19,
        zoomControl: true,
        scrollWheelZoom: true,
        zoomAnimation: true,
        fadeAnimation: true,
        markerZoomAnimation: true
    });
    
    // Add a more detailed tile layer for better visuals
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">HOT</a>',
        maxZoom: 19
    }).addTo(map);
    
    // Create marker with custom icon for better visibility
    const customIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    
    marker = L.marker(defaultLocation, {
        draggable: true,
        title: 'Drag to set location',
        icon: customIcon
    }).addTo(map);
    
    // Add a pulsing effect to the marker when added
    pulseMarker();
    
    // Update coordinates when marker is dragged
    marker.on('dragstart', function() {
        // Scale up the marker when dragging starts
        gsap.to(marker._icon, {
            scale: 1.2,
            duration: 0.3,
            ease: "power2.out"
        });
    });
    
    marker.on('dragend', function() {
        // Scale back the marker when dragging ends
        gsap.to(marker._icon, {
            scale: 1,
            duration: 0.3,
            ease: "power2.out"
        });
        
        const position = marker.getLatLng();
        updateCoordinates(position);
        reverseGeocode(position);
        
        // Add a ripple effect
        addRippleEffect(position);
    });
    
    // Update coordinates when map is clicked
    map.on('click', function(e) {
        // Animate marker movement
        animateMarkerMovement(e.latlng);
        updateCoordinates(e.latlng);
        reverseGeocode(e.latlng);
        
        // Add a ripple effect
        addRippleEffect(e.latlng);
    });
    
    // Connect the search input to our custom search function
    locationSearchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch(locationSearchInput.value);
        }
    });
    
    // Add search button with improved styling
    const searchButton = document.createElement('button');
    searchButton.type = 'button';
    searchButton.className = 'btn btn-secondary';
    searchButton.innerHTML = '<span class="search-icon">🔍</span> Search';
    searchButton.style.marginTop = '10px';
    searchButton.style.display = 'flex';
    searchButton.style.alignItems = 'center';
    searchButton.style.justifyContent = 'center';
    searchButton.style.gap = '8px';
    
    // Add click animation
    searchButton.addEventListener('click', function() {
        gsap.to(this, {
            scale: 0.95,
            duration: 0.1,
            ease: "power1.out",
            onComplete: () => {
                gsap.to(this, {
                    scale: 1,
                    duration: 0.3,
                    ease: "back.out(1.5)"
                });
                performSearch(locationSearchInput.value);
            }
        });
    });
    
    // Insert search button after the search input
    locationSearchInput.parentNode.appendChild(searchButton);
    
    // Add map zoom controls with animations
    map.on('zoomstart', function() {
        gsap.to('#map-container', {
            boxShadow: '0 0 20px rgba(26, 35, 126, 0.3)',
            duration: 0.3
        });
    });
    
    map.on('zoomend', function() {
        gsap.to('#map-container', {
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
            duration: 0.3
        });
    });
}

// Add ripple effect to the map
function addRippleEffect(latlng) {
    // Create a circle at the clicked position
    const ripple = L.circleMarker(latlng, {
        radius: 0,
        color: '#1a237e',
        fillColor: '#1a237e',
        fillOpacity: 0.5,
        weight: 2
    }).addTo(map);
    
    // Animate the circle expanding and fading
    let radius = 0;
    const interval = setInterval(() => {
        radius += 5;
        ripple.setRadius(radius);
        ripple.setStyle({
            fillOpacity: Math.max(0, 0.5 - radius / 100),
            opacity: Math.max(0, 0.7 - radius / 100)
        });
        
        if (radius > 50) {
            clearInterval(interval);
            map.removeLayer(ripple);
        }
    }, 20);
}

// Animate marker movement
function animateMarkerMovement(newPosition) {
    const startPosition = marker.getLatLng();
    const frames = 20;
    let i = 0;
    
    // Scale up the marker
    gsap.to(marker._icon, {
        scale: 1.2,
        duration: 0.2,
        ease: "power2.out"
    });
    
    const animateStep = () => {
        i++;
        const lat = startPosition.lat + ((newPosition.lat - startPosition.lat) / frames) * i;
        const lng = startPosition.lng + ((newPosition.lng - startPosition.lng) / frames) * i;
        
        marker.setLatLng([lat, lng]);
        
        if (i < frames) {
            requestAnimationFrame(animateStep);
        } else {
            // Scale back the marker
            gsap.to(marker._icon, {
                scale: 1,
                duration: 0.3,
                ease: "elastic.out(1, 0.5)"
            });
        }
    };
    
    requestAnimationFrame(animateStep);
}

// Add pulsing effect to marker
function pulseMarker() {
    gsap.to(marker._icon, {
        scale: 1.2,
        duration: 0.8,
        repeat: 3,
        yoyo: true,
        ease: "power1.inOut"
    });
}

// Perform search using Nominatim API with improved UX
function performSearch(query) {
    if (!query) {
        // Shake the input field if empty
        gsap.to(locationSearchInput, {
            x: 10,
            duration: 0.1,
            repeat: 5,
            yoyo: true,
            ease: "power1.inOut"
        });
        return;
    }
    
    // Show loading indicator with animation
    gsap.to(loadingIndicator, {
        display: 'flex',
        opacity: 1,
        duration: 0.3
    });
    
    // Use Nominatim API directly for better control
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`)
        .then(response => response.json())
        .then(data => {
            // Hide loading indicator with animation
            gsap.to(loadingIndicator, {
                opacity: 0,
                duration: 0.3,
                onComplete: () => {
                    loadingIndicator.style.display = 'none';
                }
            });
            
            if (data && data.length > 0) {
                const result = data[0];
                const latlng = L.latLng(parseFloat(result.lat), parseFloat(result.lon));
                
                // Fly to the location with smooth animation
                map.flyTo(latlng, 16, {
                    duration: 1.5,
                    easeLinearity: 0.25
                });
                
                // Animate marker movement
                setTimeout(() => {
                    animateMarkerMovement(latlng);
                }, 1000);
                
                // Update form fields with animation
                updateCoordinates(latlng);
                
                // Update search input with the found location name
                if (result.display_name) {
                    // Animate the text change
                    gsap.to(locationSearchInput, {
                        opacity: 0,
                        duration: 0.2,
                        onComplete: () => {
                            locationSearchInput.value = result.display_name;
                            gsap.to(locationSearchInput, {
                                opacity: 1,
                                duration: 0.3
                            });
                        }
                    });
                }
                
                // Add a success notification
                showNotification('Location found!', 'success');
            } else {
                // Shake the input field if no results
                gsap.to(locationSearchInput, {
                    x: 10,
                    duration: 0.1,
                    repeat: 5,
                    yoyo: true,
                    ease: "power1.inOut"
                });
                
                showNotification('Location not found. Please try a different search term.', 'error');
            }
        })
        .catch(error => {
            // Hide loading indicator with animation
            gsap.to(loadingIndicator, {
                opacity: 0,
                duration: 0.3,
                onComplete: () => {
                    loadingIndicator.style.display = 'none';
                }
            });
            
            console.error('Search error:', error);
            showNotification('Error searching for location. Please try again.', 'error');
        });
}// Function to update date and time
function updateDateTime() {
    const now = new Date();
    
    // Format date as YYYY-MM-DD
    const date = now.toISOString().split('T')[0];
    
    // Format time as HH:mm:ss
    const time = now.toTimeString().split(' ')[0];
    
    // Update hidden fields
    document.getElementById('report-date').value = date;
    document.getElementById('report-time').value = time;
}


// Show notification
function showNotification(message, type = 'info') {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.padding = '15px 20px';
        notification.style.borderRadius = '8px';
        notification.style.fontWeight = '500';
        notification.style.zIndex = '1000';
        notification.style.transform = 'translateX(150%)';
        notification.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
        document.body.appendChild(notification);
    }
    
    // Set notification style based on type
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#4CAF50';
            notification.style.color = 'white';
            break;
        case 'error':
            notification.style.backgroundColor = '#F44336';
            notification.style.color = 'white';
            break;
        default:
            notification.style.backgroundColor = '#2196F3';
            notification.style.color = 'white';
    }
    
    // Set message
    notification.textContent = message;
    
    // Animate notification
    gsap.to(notification, {
        x: 0,
        duration: 0.5,
        ease: "back.out(1.7)"
    });
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        gsap.to(notification, {
            x: '150%',
            duration: 0.5,
            ease: "power2.in"
        });
    }, 3000);
}

// Reverse geocode to get address from coordinates
function reverseGeocode(latlng) {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&zoom=18&addressdetails=1`)
        .then(response => response.json())
        .then(data => {
            if (data && data.display_name) {
                // Animate the text change
                gsap.to(locationSearchInput, {
                    opacity: 0.5,
                    duration: 0.2,
                    onComplete: () => {
                        locationSearchInput.value = data.display_name;
                        gsap.to(locationSearchInput, {
                            opacity: 1,
                            duration: 0.3
                        });
                    }
                });
            }
        })
        .catch(error => {
            console.error('Reverse geocoding error:', error);
        });
}
// Get user's current location with continuous updates
function startLocationTracking() {
    if (navigator.geolocation) {
        // Clear any existing watch
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            locationReadings = [];
            locationUpdateCount = 0;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 0
        };

        // Start continuous location tracking
        watchId = navigator.geolocation.watchPosition(
            function(position) {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp
                };

                // Add to readings array
                locationReadings.push(userLocation);

                // Keep only the last 5 readings
                if (locationReadings.length > 5) {
                    locationReadings.shift();
                }

                // Calculate average position from recent readings
                const avgPosition = calculateAveragePosition(locationReadings);

                // Update map and marker
                updateLocationDisplay(avgPosition);

                // Update coordinates in form
                updateCoordinates(avgPosition);

                // Get address
                reverseGeocode(avgPosition);
            },
            function(error) {
                handleLocationError(error);
            },
            options
        );
    } else {
        showNotification('Geolocation is not supported by your browser', 'error');
    }
}

// Update location display on map
function updateLocationDisplay(position) {
    // Update map view if accuracy is good enough (less than 100 meters)
    if (position.accuracy < 100) {
        map.setView([position.lat, position.lng], 18);
        marker.setLatLng([position.lat, position.lng]);

        // Update accuracy circle
        if (accuracyCircle) {
            map.removeLayer(accuracyCircle);
        }

        accuracyCircle = L.circle([position.lat, position.lng], {
            radius: position.accuracy,
            color: '#3388ff',
            fillColor: '#3388ff',
            fillOpacity: 0.15,
            weight: 2
        }).addTo(map);
    }
}

// Update coordinates in form fields with animation
function updateCoordinates(position) {
    const latField = document.getElementById('latitude');
    const lngField = document.getElementById('longitude');
    
    // Animate the text change
    gsap.to([latField, lngField], {
        backgroundColor: '#e8f5e9',
        duration: 0.3,
        onComplete: () => {
            latField.value = position.lat.toFixed(6);
            lngField.value = position.lng.toFixed(6);
            
            gsap.to([latField, lngField], {
                backgroundColor: 'white',
                duration: 1
            });
        }
    });
}

// Get user's current location with significantly improved accuracy
getLocationBtn.addEventListener('click', function() {
    // Animate button
    gsap.to(this, {
        scale: 0.95,
        duration: 0.1,
        ease: "power1.out",
        onComplete: () => {
            gsap.to(this, {
                scale: 1,
                duration: 0.3,
                ease: "back.out(1.5)"
            });
        }
    });

    // Start location tracking
    startLocationTracking();
    
    // Update date and time
    updateDateTime();
    
    // Show loading indicator
    showNotification('Tracking your location...', 'info');
});


// Calculate average position from multiple readings
function calculateAveragePosition(readings) {
    // If we have no readings, return a default
    if (readings.length === 0) {
        return { lat: 0, lng: 0, accuracy: 1000 };
    }
    
    // Sort readings by accuracy (lower is better)
    readings.sort((a, b) => a.accuracy - b.accuracy);
    
    // Take the top 3 most accurate readings or all if less than 3
    const topReadings = readings.slice(0, Math.min(3, readings.length));
    
    // Calculate weighted average based on accuracy
    let totalWeight = 0;
    let weightedLat = 0;
    let weightedLng = 0;
    
    topReadings.forEach(reading => {
        // Weight is inverse of accuracy (higher weight for more accurate readings)
        const weight = 1 / reading.accuracy;
        totalWeight += weight;
        weightedLat += reading.lat * weight;
        weightedLng += reading.lng * weight;
    });
    
    // Calculate weighted average
    const avgLat = weightedLat / totalWeight;
    const avgLng = weightedLng / totalWeight;
    
    // Use the best accuracy value from our readings
    const bestAccuracy = topReadings[0].accuracy;
    
    return {
        lat: avgLat,
        lng: avgLng,
        accuracy: bestAccuracy
    };
}

// Handle image upload and preview with animations
imageUpload.addEventListener('change', function() {
    // Clear existing previews with animation
    const existingPreviews = imagePreviewContainer.querySelectorAll('.image-preview');
    if (existingPreviews.length > 0) {
        gsap.to(existingPreviews, {
            opacity: 0,
            scale: 0.8,
            stagger: 0.1,
            duration: 0.3,
            onComplete: () => {
                imagePreviewContainer.innerHTML = '';
                addNewPreviews(this.files);
            }
        });
    } else {
        addNewPreviews(this.files);
    }
});

// Add new image previews with animation
function addNewPreviews(files) {
    if (!files || files.length === 0) return;
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Check if file is an image
        if (!file.type.match('image.*')) continue;
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const imgContainer = document.createElement('div');
            imgContainer.className = 'image-preview-container';
            imgContainer.style.position = 'relative';
            imgContainer.style.opacity = '0';
            imgContainer.style.transform = 'scale(0.8)';
            
            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'image-preview';
            
            // Add remove button
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-image';
            removeBtn.innerHTML = '×';
            removeBtn.style.position = 'absolute';
            removeBtn.style.top = '-10px';
            removeBtn.style.right = '-10px';
            removeBtn.style.backgroundColor = '#F44336';
            removeBtn.style.color = 'white';
            removeBtn.style.borderRadius = '50%';
            removeBtn.style.width = '25px';
            removeBtn.style.height = '25px';
            removeBtn.style.border = 'none';
            removeBtn.style.cursor = 'pointer';
            removeBtn.style.display = 'flex';
            removeBtn.style.alignItems = 'center';
            removeBtn.style.justifyContent = 'center';
            removeBtn.style.fontSize = '18px';
            removeBtn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
            
            removeBtn.addEventListener('click', function() {
                gsap.to(imgContainer, {
                    opacity: 0,
                    scale: 0.8,
                    duration: 0.3,
                    onComplete: () => {
                        imgContainer.remove();
                    }
                });
            });
            
            imgContainer.appendChild(img);
            imgContainer.appendChild(removeBtn);
            imagePreviewContainer.appendChild(imgContainer);
            
            // Animate the preview appearance
            gsap.to(imgContainer, {
                opacity: 1,
                scale: 1,
                duration: 0.5,
                delay: i * 0.1,
                ease: "back.out(1.7)"
            });
        };
        
        reader.readAsDataURL(file);
    }
}

// Form submission with enhanced animations
disasterForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validate form
    const disasterType = document.getElementById('disaster-type').value;
    const latitude = document.getElementById('latitude').value;
    const longitude = document.getElementById('longitude').value;
    const description = document.getElementById('description').value;
    
    if (!disasterType || !latitude || !longitude || !description) {
        // Shake the form to indicate error
        gsap.to(disasterForm, {
            x: 10,
            duration: 0.1,
            repeat: 3,
            yoyo: true,
            ease: "power1.inOut"
        });
        
        // Show error message with animation
        errorMessage.style.display = 'block';
        errorMessage.style.opacity = 0;
        errorMessage.style.transform = 'translateY(-20px)';
        errorDetails.textContent = 'Please fill in all required fields.';
        
        gsap.to(errorMessage, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "back.out(1.7)"
        });
        
        // Highlight missing fields
        const fields = [
            { id: 'disaster-type', value: disasterType },
            { id: 'latitude', value: latitude },
            { id: 'longitude', value: longitude },
            { id: 'description', value: description }
        ];
        
        fields.forEach(field => {
            if (!field.value) {
                const element = document.getElementById(field.id);
                gsap.to(element, {
                    borderColor: '#F44336',
                    boxShadow: '0 0 0 3px rgba(244, 67, 54, 0.2)',
                    duration: 0.3
                });
                
                // Reset after 2 seconds
                setTimeout(() => {
                    gsap.to(element, {
                        borderColor: '#e0e0e0',
                        boxShadow: 'none',
                        duration: 0.3
                    });
                }, 2000);
            }
        });
        
        // Hide error message after 5 seconds
        setTimeout(() => {
            gsap.to(errorMessage, {
                opacity: 0,
                y: -20,
                duration: 0.5,
                onComplete: () => {
                    errorMessage.style.display = 'none';
                }
            });
        }, 5000);
        
        return;
    }
    
    // Show loading indicator with animation
    gsap.to(loadingIndicator, {
        display: 'flex',
        opacity: 1,
        duration: 0.3
    });
    
    // Add a "submitting" animation to the form
    gsap.to(disasterForm, {
        opacity: 0.7,
        scale: 0.98,
        duration: 0.5
    });
    
    // Simulate form submission (in a real app, you would send data to server)
    setTimeout(() => {
        // Hide loading indicator with animation
        gsap.to(loadingIndicator, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                loadingIndicator.style.display = 'none';
            }
        });
        
        // Show success message with animation
        successMessage.style.display = 'block';
        successMessage.style.opacity = 0;
        successMessage.style.transform = 'translateY(30px)';
        
        gsap.to(successMessage, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "back.out(1.7)"
        });
        
        // Hide form with animation
        gsap.to(disasterForm, {
            opacity: 0,
            y: 50,
            duration: 0.8,
            onComplete: () => {
                disasterForm.style.display = 'none';
            }
        });
        
        // Scroll to top with smooth animation
        gsap.to(window, {
            scrollTo: { y: 0, autoKill: false },
            duration: 1.5,
            ease: "power2.inOut"
        });
        
        // Add confetti effect for success
        addConfettiEffect();
        
        // Redirect after 5 seconds
        setTimeout(() => {
            // In a real app, redirect to homepage or reports page
            // window.location.href = 'index.html';
            
            // For demo, just reload the page with a fade out effect
            gsap.to('body', {
                opacity: 0,
                duration: 1,
                onComplete: () => {
                    window.location.reload();
                }
            });
        }, 5000);
    }, 2000);
});

// Add confetti effect for success
function addConfettiEffect() {
    // Create canvas for confetti
    const canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '1000';
    document.body.appendChild(canvas);
    
    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Get context
    const ctx = canvas.getContext('2d');
    
    // Confetti particles
    const particles = [];
    const particleCount = 150;
    const colors = ['#1a237e', '#283593', '#3949ab', '#3f51b5', '#5c6bc0'];
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 8 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            speed: Math.random() * 3 + 2,
            rotationSpeed: Math.random() * 2 - 1
        });
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw particles
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.y += p.speed;
            p.rotation += p.rotationSpeed;
            
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation * Math.PI / 180);
            
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            
            ctx.restore();
            
            // Reset particle if it's off screen
            if (p.y > canvas.height) {
                particles[i].y = -p.size;
                particles[i].x = Math.random() * canvas.width;
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    // Start animation
    animate();
    
    // Remove canvas after 5 seconds
    setTimeout(() => {
        gsap.to(canvas, {
            opacity: 0,
            duration: 1,
            onComplete: () => {
                canvas.remove();
            }
        });
    }, 4000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add a page load animation
    gsap.from('body', {
        opacity: 0,
        duration: 1,
        ease: "power2.inOut"
    });
    
    checkAuthentication();
    animateText();
    
    // Initialize the map with a slight delay for better animation
    setTimeout(() => {
        initMap();
    }, 500);
    
    // Add drag and drop functionality for image upload
    const fileUploadArea = document.querySelector('.file-upload');
    
    fileUploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        gsap.to(this, {
            backgroundColor: '#e8eaf6',
            borderColor: '#1a237e',
            duration: 0.3
        });
    });
    
    fileUploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        gsap.to(this, {
            backgroundColor: '#f0f2f5',
            borderColor: '#ccc',
            duration: 0.3
        });
    });
    
    fileUploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        gsap.to(this, {
            backgroundColor: '#f0f2f5',
            borderColor: '#ccc',
            duration: 0.3
        });
        
        if (e.dataTransfer.files.length) {
            imageUpload.files = e.dataTransfer.files;
            
            // Trigger the change event
            const event = new Event('change', { bubbles: true });
            imageUpload.dispatchEvent(event);
        }
    });
    
    // Add input focus animations
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            gsap.to(this, {
                borderColor: '#1a237e',
                boxShadow: '0 0 0 3px rgba(26, 35, 126, 0.2)',
                duration: 0.3
            });
        });
        
        input.addEventListener('blur', function() {
            gsap.to(this, {
                borderColor: this.value ? '#1a237e' : '#e0e0e0',
                boxShadow: 'none',
                duration: 0.3
            });
        });
    });
});

// Handle window resize
window.addEventListener('resize', function() {
    if (map) {
        map.invalidateSize();
    }
});
function stopLocationTracking() {
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
}
// Function to update date and time with console logging
function updateDateTime() {
    const now = new Date();
    
    // Format date as YYYY-MM-DD
    const date = now.toISOString().split('T')[0];
    
    // Format time as HH:mm:ss
    const time = now.toTimeString().split(' ')[0];
    
    // Update hidden fields
    document.getElementById('report-date').value = date;
    document.getElementById('report-time').value = time;
    
    // Log to console
    console.log('Current Date:', date);
    console.log('Current Time:', time);
    
    return { date, time };
}

// Add this to your DOM content loaded event listener
document.addEventListener('DOMContentLoaded', function() {
    // ... (existing initialization code) ...

    // Set initial date and time
    const initialDateTime = updateDateTime();
    console.log('Initial Date/Time Set:', initialDateTime);

    // Update date and time every second
    setInterval(() => {
        const updatedDateTime = updateDateTime();
        console.log('Date/Time Updated:', updatedDateTime);
    }, 1000);
});

// Modify your form submission to include date/time logging
disasterForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get current date and time at submission
    const submissionDateTime = updateDateTime();
    console.log('Form Submission Date/Time:', submissionDateTime);
    
    // ... (rest of your form submission code) ...
});
