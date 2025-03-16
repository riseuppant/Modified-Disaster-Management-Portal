document.addEventListener('DOMContentLoaded', function() {
    // Global variables for maps
    let earthquakeMap = null;
    let floodMap = null;
    
    // Initialize translations
    initializeTranslations();
    const languageSelector = document.querySelectorAll('.dropdown-item');
languageSelector.forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        const lang = this.getAttribute('data-lang');
        
        // Save language preference
        localStorage.setItem('userLanguage', lang);
        
        // Update all translatable elements
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = getTranslation(key, lang);
            if (translation) {
                element.textContent = translation;
            }
        });
        
        // Update dropdown button text
        const dropdownButton = document.querySelector('#languageDropdown');
        dropdownButton.textContent = this.textContent;
    });
});

    // Tab switching functionality with animations
    const tabs = document.querySelectorAll('.disaster-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => {
                c.classList.remove('active');
                c.style.display = 'none'; // Hide immediately
            });
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Get the content to show
            const contentToShow = document.getElementById(`${tabId}-content`);
            
            // Reset animations on cards
            const cards = contentToShow.querySelectorAll('.preparedness-card');
            cards.forEach((card, index) => {
                card.classList.remove('animate__fadeInUp');
                card.style.opacity = '0';
                
                // Trigger reflow
                void card.offsetWidth;
                
                // Add animation with delay based on index
                setTimeout(() => {
                    card.classList.add('animate__fadeInUp');
                    card.style.opacity = '1';
                }, index * 100);
            });
            
            // Show the content with animation
            contentToShow.style.display = 'block';
            contentToShow.classList.add('active');
            
            // Initialize map if needed
            if (tabId === 'earthquake' && typeof L !== 'undefined') {
                setTimeout(() => {
                    if (earthquakeMap) {
                        earthquakeMap.invalidateSize();
                    } else {
                        initializeEarthquakeMap();
                    }
                }, 300);
            } else if (tabId === 'flood' && typeof L !== 'undefined') {
                setTimeout(() => {
                    if (floodMap) {
                        floodMap.invalidateSize();
                    } else {
                        initializeFloodMap();
                    }
                }, 300);
            }
        });
    });
    
    // Checkbox functionality for checklists with animations
    const checkboxes = document.querySelectorAll('.preparedness-checkbox');
    
    checkboxes.forEach(checkbox => {
        // Load saved state from localStorage
        const checkboxId = checkbox.getAttribute('id');
        const savedState = localStorage.getItem(`checkbox-${checkboxId}`);
        
        if (savedState === 'checked') {
            checkbox.checked = true;
            checkbox.closest('.checklist-item').classList.add('checked');
        }
        
        checkbox.addEventListener('change', function() {
            const checklistItem = this.closest('.checklist-item');
            
            if (this.checked) {
                // Add checked class with animation
                checklistItem.classList.add('checked');
                localStorage.setItem(`checkbox-${checkboxId}`, 'checked');
                
                // Add a subtle animation
                checklistItem.style.animation = 'fadeInUp 0.5s ease';
                setTimeout(() => {
                    checklistItem.style.animation = '';
                }, 500);
            } else {
                // Remove checked class with animation
                checklistItem.classList.remove('checked');
                localStorage.setItem(`checkbox-${checkboxId}`, 'unchecked');
            }
            
            updatePreparednessScore();
        });
    });
    
    const quizOptions = document.querySelectorAll('.quiz-option');
quizOptions.forEach(option => {
    option.addEventListener('click', function() {
        const questionContainer = this.closest('.quiz-question');
        const allOptions = questionContainer.querySelectorAll('.quiz-option');
        
        // Remove previous selections
        allOptions.forEach(opt => {
            opt.classList.remove('selected', 'correct', 'incorrect');
        });
        
        // Add selected class
        this.classList.add('selected');
        
        // Check if correct
        if (this.getAttribute('data-correct') === 'true') {
            this.classList.add('correct');
            // Add success animation
            this.animate([
                { transform: 'scale(1)' },
                { transform: 'scale(1.05)' },
                { transform: 'scale(1)' }
            ], {
                duration: 500,
                easing: 'ease'
            });
        } else {
            this.classList.add('incorrect');
            // Show correct answer
            allOptions.forEach(opt => {
                if (opt.getAttribute('data-correct') === 'true') {
                    opt.classList.add('correct');
                }
            });
            // Add shake animation
            this.animate([
                { transform: 'translateX(0)' },
                { transform: 'translateX(-10px)' },
                { transform: 'translateX(10px)' },
                { transform: 'translateX(0)' }
            ], {
                duration: 500,
                easing: 'ease'
            });
        }
    });

    });
    function updatePreparednessScore() {
        const totalCheckboxes = document.querySelectorAll('.preparedness-checkbox').length;
        const checkedCheckboxes = document.querySelectorAll('.preparedness-checkbox:checked').length;
        const scorePercentage = Math.round((checkedCheckboxes / totalCheckboxes) * 100);
        
        const scoreValueElement = document.querySelector('.score-value');
        const scoreProgressElement = document.querySelector('.preparedness-score-progress');
        
        // Update score text
        scoreValueElement.textContent = `${scorePercentage}%`;
        
        // Update progress bar width with animation
        scoreProgressElement.style.transition = 'width 0.5s ease-in-out';
        scoreProgressElement.style.width = `${scorePercentage}%`;
        
        // Update color based on score
        if (scorePercentage < 30) {
            scoreProgressElement.style.backgroundColor = 'var(--danger-color)';
        } else if (scorePercentage < 70) {
            scoreProgressElement.style.backgroundColor = 'var(--warning-color)';
        } else {
            scoreProgressElement.style.backgroundColor = 'var(--success-color)';
        }
    }
    
    
    // Helper function to animate number change
    function animateValue(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            element.textContent = `${value}%`;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
    
    // Helper function to animate progress bar
    function animateProgressBar(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            element.style.width = `${value}%`;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
    
    // Initialize score on page load
    updatePreparednessScore();
    
    // Safety demo modal functionality with enhanced animations
    const safetyDemoButtons = document.querySelectorAll('[id$="-demo"]');
    
    safetyDemoButtons.forEach(button => {
        button.addEventListener('click', function() {
            const disasterType = this.id.replace('show-', '').replace('-demo', '');
            
            // Add click animation
            this.animate([
                { transform: 'scale(1)' },
                { transform: 'scale(0.95)' },
                { transform: 'scale(1)' }
            ], {
                duration: 300,
                easing: 'ease'
            });
            
            // Create modal dynamically
            const modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.id = `${disasterType}DemoModal`;
            modal.setAttribute('tabindex', '-1');
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-labelledby', `${disasterType}DemoModalLabel`);
            modal.setAttribute('aria-hidden', 'true');
            
            modal.innerHTML = `
                <div class="modal-dialog modal-lg" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="${disasterType}DemoModalLabel">${capitalizeFirstLetter(disasterType)} Safety Demonstration</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div class="embed-responsive embed-responsive-16by9">
                                <iframe class="embed-responsive-item" src="${getSafetyVideoUrl(disasterType)}" allowfullscreen></iframe>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Show the modal
            $(`#${disasterType}DemoModal`).modal('show');
            
            // Remove modal from DOM when hidden
            $(`#${disasterType}DemoModal`).on('hidden.bs.modal', function() {
                $(this).remove();
            });
        });
    });
    
    // Helper function to get safety video URL based on disaster type
    function getSafetyVideoUrl(disasterType) {
        const videoUrls = {
            'earthquake': 'https://www.youtube.com/embed/BLEPakj1YTY',
            'flood': 'https://www.youtube.com/embed/43M5mZuzHF8',
            'cyclone': 'https://www.youtube.com/embed/BNFTu1v3c6I',
            'fire': 'https://www.youtube.com/embed/FQqAXvuBCUE',
            'landslide': 'https://www.youtube.com/embed/ZVpYEt4775w'
        };
        
        return videoUrls[disasterType] || 'https://www.youtube.com/embed/dQw4w9WgXcQ'; // Default video
    }
    
    // Helper function to capitalize first letter
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }


// Add event listeners for emergency contact call buttons
    document.querySelectorAll('.call-button').forEach(button => {
        button.addEventListener('click', function(e) {
            const phoneNumber = this.getAttribute('data-phone');
            if (phoneNumber) {
                // Add click animation
                this.animate([
                    { transform: 'scale(1)' },
                    { transform: 'scale(0.95)' },
                    { transform: 'scale(1)' }
                ], {
                    duration: 300,
                    easing: 'ease'
                });
                
                // On mobile devices, this will open the phone dialer
                window.location.href = `tel:${phoneNumber}`;
            }
        });
    });
    
    // Download checklist functionality
    document.querySelectorAll('.download-checklist').forEach(button => {
        button.addEventListener('click', function() {
            const disasterType = this.getAttribute('data-disaster');
            
            // Add click animation
            this.animate([
                { transform: 'scale(1)' },
                { transform: 'scale(0.95)' },
                { transform: 'scale(1)' }
            ], {
                duration: 300,
                easing: 'ease'
            });
            
            // Generate PDF content based on disaster type
            generatePDF(disasterType);
        });
    });
    
    // Function to generate and download PDF checklist
    function generatePDF(disasterType) {
        // This would normally use a library like jsPDF
        // For demo purposes, we'll just show an alert
        alert(`Downloading ${capitalizeFirstLetter(disasterType)} preparedness checklist. In a real application, this would generate a PDF with all checklist items.`);
    }
    
    // Font size adjustment functionality
    const fontSizeBtn = document.getElementById('font-size-toggle');
    let currentFontSize = 0; // 0: normal, 1: large, 2: extra large
    
    if (fontSizeBtn) {
        // Check if user previously changed font size
        const savedFontSize = localStorage.getItem('fontSize');
        if (savedFontSize) {
            currentFontSize = parseInt(savedFontSize);
            applyFontSize(currentFontSize);
        }
        
        fontSizeBtn.addEventListener('click', function() {
            // Cycle through font sizes
            currentFontSize = (currentFontSize + 1) % 3;
            
            // Apply font size
            applyFontSize(currentFontSize);
            
            // Save preference
            localStorage.setItem('fontSize', currentFontSize);
            
            // Add animation
            this.animate([
                { transform: 'scale(1)' },
                { transform: 'scale(1.2)' },
                { transform: 'scale(1)' }
            ], {
                duration: 300,
                easing: 'ease'
            });
        });
    }
    
    // Function to apply font size
    function applyFontSize(size) {
        const html = document.documentElement;
        
        // Remove existing font size classes
        html.classList.remove('font-size-large', 'font-size-xl');
        
        // Apply appropriate class based on size
        if (size === 1) {
            html.classList.add('font-size-large');
        } else if (size === 2) {
            html.classList.add('font-size-xl');
        }
        
        // Update button icon
        if (fontSizeBtn) {
            if (size === 0) {
                fontSizeBtn.innerHTML = '<i class="fas fa-text-height"></i>';
            } else if (size === 1) {
                fontSizeBtn.innerHTML = '<i class="fas fa-text-height"></i><sup>+</sup>';
            } else {
                fontSizeBtn.innerHTML = '<i class="fas fa-text-height"></i><sup>++</sup>';
            }
        }
    }
    
    // High contrast mode toggle
    const contrastBtn = document.getElementById('contrast-toggle');
    
    if (contrastBtn) {
        // Check if user previously enabled high contrast
        if (localStorage.getItem('highContrast') === 'enabled') {
            document.body.classList.add('high-contrast');
            contrastBtn.classList.add('active');
        }
        
        contrastBtn.addEventListener('click', function() {
            document.body.classList.toggle('high-contrast');
            this.classList.toggle('active');
            
            if (document.body.classList.contains('high-contrast')) {
                localStorage.setItem('highContrast', 'enabled');
            } else {
                localStorage.setItem('highContrast', 'disabled');
            }
            
            // Add animation
            this.animate([
                { transform: 'scale(1)' },
                { transform: 'scale(1.2)' },
                { transform: 'scale(1)' }
            ], {
                duration: 300,
                easing: 'ease'
            });
        });
    }
    
    // Share functionality
    const shareBtn = document.getElementById('share-btn');
    
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            // Add animation
            this.animate([
                { transform: 'scale(1)' },
                { transform: 'scale(1.2)' },
                { transform: 'scale(1)' }
            ], {
                duration: 300,
                easing: 'ease'
            });
            
            // Use Web Share API if available
            if (navigator.share) {
                navigator.share({
                    title: 'Disaster Preparedness Hub',
                    text: 'Check out this disaster preparedness resource!',
                    url: window.location.href
                })
                .catch(error => console.log('Error sharing:', error));
            } else {
                // Fallback for browsers that don't support Web Share API
                const url = window.location.href;
                const tempInput = document.createElement('input');
                document.body.appendChild(tempInput);
                tempInput.value = url;
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
                
                // Show toast notification
                showToast('Link copied to clipboard!');
            }
        });
    }
    
    // Function to show toast notification
    function showToast(message) {
        // Create toast element if it doesn't exist
        let toast = document.getElementById('toast-notification');
        
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast-notification';
            toast.className = 'toast-notification';
            document.body.appendChild(toast);
        }
        
        // Set message and show toast
        toast.textContent = message;
        toast.classList.add('show');
        
        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    // Print checklist functionality
    document.querySelectorAll('.print-checklist').forEach(button => {
        button.addEventListener('click', function() {
            const disasterType = this.getAttribute('data-disaster');
            
            // Add animation
            this.animate([
                { transform: 'scale(1)' },
                { transform: 'scale(0.95)' },
                { transform: 'scale(1)' }
            ], {
                duration: 300,
                easing: 'ease'
            });
            
            // Get the content to print
            const contentToPrint = document.getElementById(`${disasterType}-content`);
            
            if (contentToPrint) {
                // Create a new window for printing
                const printWindow = window.open('', '_blank');
                
                // Add content and styles to the new window
                printWindow.document.write(`
                    <html>
                    <head>
                        <title>${capitalizeFirstLetter(disasterType)} Preparedness Checklist</title>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 20px; }
                            h1 { color: #3498db; }
                            .checklist-item { margin-bottom: 10px; }
                            .section { margin-bottom: 30px; }
                            @media print {
                                .no-print { display: none; }
                            }
                        </style>
                    </head>
                    <body>
                        <h1>${capitalizeFirstLetter(disasterType)} Preparedness Checklist</h1>
                        <div class="content">
                            ${contentToPrint.innerHTML}
                        </div>
                        <div class="no-print">
                            <button onclick="window.print()">Print</button>
                        </div>
                    </body>
                    </html>
                `);
                
                // Focus on the new window
                printWindow.focus();
            }
        });
    });
    
    // Initialize the first tab by default
    if (tabs.length > 0) {
        tabs[0].click();
    }
    const swiper = new Swiper('.swiper-container', {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
      });

     
document.addEventListener('DOMContentLoaded', function() {
    // Get all quiz options
    const quizOptions = document.querySelectorAll('.quiz-option');

    // Add click event listener to each option
    quizOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove previous selections in this question
            console.log("working")
            const questionContainer = this.closest('.quiz-question');
            questionContainer.querySelectorAll('.quiz-option').forEach(opt => {
                opt.classList.remove('selected', 'correct', 'incorrect');
            });

            // Add selected class to clicked option
            this.classList.add('selected');

            // Check if answer is correct
            if(this.getAttribute('data-correct') === 'true') {
                this.classList.add('correct');
            } else {
                this.classList.add('incorrect');
                // Show correct answer
                questionContainer.querySelector('[data-correct="true"]').classList.add('correct');
            }
        });
    });
})


})
