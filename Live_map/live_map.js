document.addEventListener('DOMContentLoaded', function() {
    const menu = document.getElementById('disaster-menu');
    const toggleBtn = document.querySelector('.toggle-btn');
    const disasterItems = document.querySelectorAll('.disaster-item');
    const mapFrame = document.getElementById('map-frame');
    const loading = document.querySelector('.loading');
    const homeLink = document.getElementById('home-link');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const locateBtn = document.getElementById('locate-me');
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const infoPanel = document.getElementById('disaster-info-panel');
    const animatedTexts = document.querySelectorAll('.animated-text');

    // Check URL parameters to see if a specific disaster should be opened
    const urlParams = new URLSearchParams(window.location.search);
    const disasterParam = urlParams.get('disaster');

    // Set the home link href - REPLACE THIS WITH YOUR ACTUAL HOME PAGE URL
    homeLink.href = "../Home/about.html"; // You can manually change this to your home page URL

    // Add text animation classes with delay for visual appeal
    animatedTexts.forEach((text, index) => {
        setTimeout(() => {
            text.classList.add('text-fade-in');
        }, 100 * index);
    });

    // Toggle menu
    toggleBtn.addEventListener('click', function() {
        menu.classList.toggle('collapsed');
        toggleBtn.innerHTML = menu.classList.contains('collapsed') 
            ? '<i class="fas fa-bars"></i>' 
            : '<i class="fas fa-times"></i>';
    });

    // Handle disaster selection
    disasterItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            disasterItems.forEach(i => i.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Get map URL
            const mapUrl = this.getAttribute('data-map');
            
            // Show loading indicator
            loading.classList.remove('hidden');
            
            // Load the map
            mapFrame.src = mapUrl;
            
            // Hide loading indicator when map is loaded
            mapFrame.onload = function() {
                loading.classList.add('hidden');
                
                // Show info panel after map loads
                if (infoPanel) {
                    setTimeout(() => {
                        infoPanel.classList.remove('hidden');
                        
                        // Add animation to info panel text
                        const infoPanelTexts = infoPanel.querySelectorAll('.animated-text');
                        infoPanelTexts.forEach((text, index) => {
                            setTimeout(() => {
                                text.classList.add('text-pop');
                            }, 200 * index);
                        });
                    }, 500);
                }
                
                // Remove default Leaflet zoom controls
                try {
                    const iframeDocument = mapFrame.contentDocument || mapFrame.contentWindow.document;
                    const style = iframeDocument.createElement('style');
                    style.textContent = '.leaflet-top.leaflet-left { display: none !important; }';
                    iframeDocument.head.appendChild(style);
                } catch (e) {
                    console.log("Could not access iframe content due to same-origin policy");
                }
            };
            
            // Update status bar
            const updateTime = document.getElementById('update-time');
            if (updateTime) {
                updateTime.textContent = 'Just now';
                updateTime.classList.add('text-glow');
                setTimeout(() => {
                    updateTime.classList.remove('text-glow');
                }, 2000);
            }
            
            // Collapse menu on mobile
            if (window.innerWidth < 768) {
                menu.classList.add('collapsed');
                toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    });

    // Map zoom controls
    zoomInBtn.addEventListener('click', function() {
        // Send message to iframe to zoom in
        mapFrame.contentWindow.postMessage({ action: 'zoomIn' }, '*');
    });

    zoomOutBtn.addEventListener('click', function() {
        // Send message to iframe to zoom out
        mapFrame.contentWindow.postMessage({ action: 'zoomOut' }, '*');
    });

    locateBtn.addEventListener('click', function() {
        // Send message to iframe to locate user
        mapFrame.contentWindow.postMessage({ action: 'locateUser' }, '*');
        
        // Visual feedback
        this.classList.add('pulse');
        setTimeout(() => {
            this.classList.remove('pulse');
        }, 2000);
    });

    // Search functionality
    searchBtn.addEventListener('click', function() {
        searchDisasters();
    });

    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchDisasters();
        }
    });

    function searchDisasters() {
        const searchTerm = searchInput.value.toLowerCase();
        let foundResults = false;
        
        disasterItems.forEach(item => {
            const disasterName = item.querySelector('.disaster-name').textContent.toLowerCase();
            
            if (searchTerm === '' || disasterName.includes(searchTerm)) {
                item.style.display = 'flex';
                foundResults = true;
                
                // Highlight matching text if there's a search term
                if (searchTerm !== '') {
                    const nameElement = item.querySelector('.disaster-name');
                    const name = nameElement.textContent;
                    const regex = new RegExp(searchTerm, 'gi');
                    nameElement.innerHTML = name.replace(regex, match => `<span class="text-glow">${match}</span>`);
                }
            } else {
                item.style.display = 'none';
            }
        });
        
        // Visual feedback for search
        searchBtn.classList.add('pulse');
        setTimeout(() => {
            searchBtn.classList.remove('pulse');
        }, 500);
        
        // Reset highlighting after some time
        setTimeout(() => {
            disasterItems.forEach(item => {
                const nameElement = item.querySelector('.disaster-name');
                if (nameElement.innerHTML.includes('<span class="text-glow">')) {
                    nameElement.textContent = nameElement.textContent;
                }
            });
        }, 3000);
    }

    // Filter functionality
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all filter buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            disasterItems.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
            
            // Visual feedback for filter change
            this.classList.add('pulse');
            setTimeout(() => {
                this.classList.remove('pulse');
            }, 500);
        });
    });

    // Tooltips for map controls
    const mapControlBtns = document.querySelectorAll('.map-control-btn');
    mapControlBtns.forEach(btn => {
        const tooltip = btn.nextElementSibling;
        if (tooltip && tooltip.classList.contains('tooltip')) {
            btn.addEventListener('mouseenter', () => {
                const btnRect = btn.getBoundingClientRect();
                tooltip.style.top = btnRect.top + 'px';
                tooltip.style.left = (btnRect.right + 10) + 'px';
                tooltip.style.opacity = '1';
            });
            
            btn.addEventListener('mouseleave', () => {
                tooltip.style.opacity = '0';
            });
        }
    });

    // Simulate live data updates if disaster counts exist
    function simulateLiveUpdates() {
        const counts = document.querySelectorAll('.disaster-count');
        if (counts.length > 0) {
            const randomIndex = Math.floor(Math.random() * counts.length);
            const randomCount = counts[randomIndex];
            const currentValue = parseInt(randomCount.textContent || '0');
            
            // Randomly increase or decrease count
            const newValue = Math.max(1, currentValue + (Math.random() > 0.5 ? 1 : -1));
            randomCount.textContent = newValue;
            
            // Add visual feedback
            randomCount.classList.add('pulse');
            setTimeout(() => {
                randomCount.classList.remove('pulse');
            }, 1000);
        }
        
        // Update last updated time
        const updateTime = document.getElementById('update-time');
        if (updateTime) {
            updateTime.textContent = 'Just now';
            updateTime.classList.add('text-glow');
            setTimeout(() => {
                updateTime.classList.remove('text-glow');
                updateTime.textContent = '1 minute ago';
            }, 2000);
        }
        
        // Schedule next update
        setTimeout(simulateLiveUpdates, 30000 + Math.random() * 30000);
    }

    // Start simulating live updates after a delay
    setTimeout(simulateLiveUpdates, 10000);

    // If a specific disaster was requested in the URL, select it
    if (disasterParam) {
        // Try to find the disaster item by ID first
        let targetDisaster = document.getElementById(disasterParam + '-item');
        
        // If not found by ID, try other methods
        if (!targetDisaster) {
            targetDisaster = Array.from(disasterItems).find(item => {
                const mapUrl = item.getAttribute('data-map');
                const disasterName = item.querySelector('.disaster-name').textContent.toLowerCase();
                
                return mapUrl.includes(disasterParam.toLowerCase()) || 
                       disasterName.includes(disasterParam.toLowerCase()) ||
                       item.getAttribute('data-category') === disasterParam;
            });
        }
        
        // If found, simulate a click on it
        if (targetDisaster) {
            console.log('Auto-selecting disaster:', disasterParam);
            setTimeout(() => {
                targetDisaster.click();
            }, 500); // Small delay to ensure everything is loaded
        }
    }
    // Otherwise set default map (first disaster)
    else if (disasterItems.length > 0) {
        disasterItems[0].click();
    }
});
