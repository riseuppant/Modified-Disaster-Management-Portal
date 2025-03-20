document.addEventListener('DOMContentLoaded', function() {
    // Initialize the disaster selector functionality
    initDisasterSelector();
    
    // Initialize any other interactive elements
    initScrollAnimation();
    initContactForm();
    initStatCounters();
});
// Add this function to preparedness.js
function initPreparednessScore() {
    const checklistItems = document.querySelectorAll('.checklist-item input[type="checkbox"]');
    const totalItems = checklistItems.length;
    
    // Create score display if it doesn't exist
    let scoreDisplay = document.querySelector('.preparedness-score');
    if (!scoreDisplay) {
        // Create a container for the score
        const kitSection = document.querySelector('.emergency-kit');
        scoreDisplay = document.createElement('div');
        scoreDisplay.className = 'preparedness-score';
        
        // Create score components
        const scoreTitle = document.createElement('h3');
        scoreTitle.textContent = 'Your Preparedness Score';
        
        const scoreValue = document.createElement('div');
        scoreValue.className = 'score-value';
        scoreValue.innerHTML = '<span id="current-score">0</span>/<span id="total-score">' + totalItems + '</span>';
        
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.style.width = '0%';
        
        const scoreMessage = document.createElement('p');
        scoreMessage.className = 'score-message';
        scoreMessage.textContent = 'Start checking items to see your preparedness level!';
        
        // Assemble score display
        progressContainer.appendChild(progressBar);
        scoreDisplay.appendChild(scoreTitle);
        scoreDisplay.appendChild(scoreValue);
        scoreDisplay.appendChild(progressContainer);
        scoreDisplay.appendChild(scoreMessage);
        
        // Add the score display after the kit-container
        const kitContainer = kitSection.querySelector('.kit-container');
        kitSection.insertBefore(scoreDisplay, kitContainer.nextSibling);
        
        // Add styles for score components
        addPreparednessScoreStyles();
    }
    
    // Function to update score
    function updateScore() {
        const checkedItems = document.querySelectorAll('.checklist-item input[type="checkbox"]:checked').length;
        const scorePercent = Math.round((checkedItems / totalItems) * 100);
        
        const currentScoreElement = document.getElementById('current-score');
        const progressBar = document.querySelector('.progress-bar');
        const scoreMessage = document.querySelector('.score-message');
        
        if (currentScoreElement && progressBar && scoreMessage) {
            currentScoreElement.textContent = checkedItems;
            progressBar.style.width = scorePercent + '%';
            
            // Update message based on score
            if (scorePercent < 25) {
                scoreMessage.textContent = 'Your preparedness level is low. Add more items to your kit!';
                progressBar.style.backgroundColor = '#e74c3c'; // Red
            } else if (scorePercent < 50) {
                scoreMessage.textContent = 'Getting better! You have some essentials covered.';
                progressBar.style.backgroundColor = '#f39c12'; // Orange
            } else if (scorePercent < 75) {
                scoreMessage.textContent = 'Good progress! Your emergency kit is coming together.';
                progressBar.style.backgroundColor = '#3498db'; // Blue
            } else {
                scoreMessage.textContent = 'Excellent! You\'re well prepared for emergency situations.';
                progressBar.style.backgroundColor = '#27ae60'; // Green
            }
        }
    }
    
    // Add event listeners to checkboxes
    checklistItems.forEach(item => {
        item.addEventListener('change', updateScore);
    });
    
    // Initialize with current state
    updateScore();
}

// Add function for fluid background

/**
 * Handles the disaster type selector in the Do's and Don'ts section
 * Improved to ensure proper switching between disaster types
 */
function initDisasterSelector() {
    const selectorButtons = document.querySelectorAll('.selector-btn');
    const disasterContents = document.querySelectorAll('.disaster-content');
    
    // Set the first disaster type as active by default if none is active
    if (!document.querySelector('.selector-btn.active') && selectorButtons.length > 0) {
        selectorButtons[0].classList.add('active');
        
        // Get the target disaster type from the first button's data attribute
        const firstDisaster = selectorButtons[0].getAttribute('data-disaster');
        const firstTarget = firstDisaster + '-content';
        document.getElementById(firstTarget)?.classList.add('active');
    }
    
    // Add click event listeners to each selector button
    selectorButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get the target disaster type from the button's data attribute
            const disasterType = this.getAttribute('data-disaster');
            const target = disasterType + '-content';
            
            // Only proceed if we have a valid target
            if (target && document.getElementById(target)) {
                // Remove active class from all buttons and contents
                selectorButtons.forEach(btn => btn.classList.remove('active'));
                disasterContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to the clicked button
                this.classList.add('active');
                
                // Add active class to the corresponding content with fade effect
                const targetContent = document.getElementById(target);
                targetContent.style.opacity = '0';
                targetContent.classList.add('active');
                
                // Trigger reflow to ensure animation works
                void targetContent.offsetWidth;
                
                // Fade in the content
                targetContent.style.opacity = '1';
                targetContent.style.transition = 'opacity 0.3s ease';
            }
        });
    });
}

/**
 * Adds smooth scroll animation to navigation links
 */
function initScrollAnimation() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Smooth scroll to the target element
                window.scrollTo({
                    top: targetElement.offsetTop - 70, // Offset for fixed header if exists
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Handles the contact form submission and validation
 */
function initContactForm() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic form validation
            const nameInput = contactForm.querySelector('input[name="name"]');
            const emailInput = contactForm.querySelector('input[name="email"]');
            const messageInput = contactForm.querySelector('textarea[name="message"]');
            
            if (!nameInput || !emailInput || !messageInput) {
                showNotification('Form is missing required fields', 'error');
                return;
            }
            
            const name = nameInput.value;
            const email = emailInput.value;
            const message = messageInput.value;
            
            let isValid = true;
            let errorMessage = '';
            
            // Validate name
            if (!name.trim()) {
                isValid = false;
                errorMessage += 'Name is required.\n';
                nameInput.classList.add('error');
            } else {
                nameInput.classList.remove('error');
            }
            
            // Validate email
            if (!isValidEmail(email)) {
                isValid = false;
                errorMessage += 'Please enter a valid email address.\n';
                emailInput.classList.add('error');
            } else {
                emailInput.classList.remove('error');
            }
            
            // Validate message
            if (!message.trim()) {
                isValid = false;
                errorMessage += 'Message is required.\n';
                messageInput.classList.add('error');
            } else {
                messageInput.classList.remove('error');
            }
            
            if (isValid) {
                // Simulate form submission
                const submitButton = contactForm.querySelector('.submit-btn');
                const originalText = submitButton.textContent;
                
                submitButton.disabled = true;
                submitButton.textContent = 'Sending...';
                
                // Simulate an AJAX request
                setTimeout(() => {
                    // Reset form
                    contactForm.reset();
                    
                    // Show success message
                    showNotification('Your message has been sent successfully!', 'success');
                    
                    // Reset button
                    submitButton.disabled = false;
                    submitButton.textContent = originalText;
                }, 1500);
            } else {
                // Show error message
                showNotification(errorMessage, 'error');
            }
        });
    }
}

/**
 * Validates email format
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether the email is valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Shows a notification message
 * @param {string} message - The message to display
 * @param {string} type - The type of message (success, error)
 */
function showNotification(message, type) {
    // Check if notification container exists, create if not
    let notificationContainer = document.querySelector('.notification-container');
    
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
        
        // Add styles for the notification container
        notificationContainer.style.position = 'fixed';
        notificationContainer.style.top = '20px';
        notificationContainer.style.right = '20px';
        notificationContainer.style.zIndex = '1000';
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Handle multi-line messages
    if (message.includes('\n')) {
        const messageLines = message.split('\n').filter(line => line.trim() !== '');
        const messageList = document.createElement('ul');
        messageList.style.margin = '5px 0 5px 20px';
        messageList.style.padding = '0';
        
        messageLines.forEach(line => {
            if (line.trim()) {
                const listItem = document.createElement('li');
                listItem.textContent = line;
                messageList.appendChild(listItem);
            }
        });
        
        notification.appendChild(messageList);
    } else {
        notification.textContent = message;
    }
    
    // Style the notification
    notification.style.backgroundColor = type === 'success' ? '#27ae60' : '#e74c3c';
    notification.style.color = 'white';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '5px';
    notification.style.marginBottom = '10px';
    notification.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.2)';
    notification.style.transform = 'translateX(100%)';
    notification.style.opacity = '0';
    notification.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
    
    // Add notification to container
    notificationContainer.appendChild(notification);
    
    // Trigger animation to show notification
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
    }, 10);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        
        // Remove from DOM after animation completes
        setTimeout(() => {
            notification.remove();
        }, 400);
    }, 5000);
}

/**
 * Adds an active class to navigation items based on scroll position
 */
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY + 100; // Offset for header
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`nav a[href="#${sectionId}"]`);
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLink?.classList.add('active');
            } else {
                navLink?.classList.remove('active');
            }
        });
    });
}

/**
 * Create counters for statistics
 */
function initStatCounters() {
    // Check for IntersectionObserver support
    if ('IntersectionObserver' in window) {
        const counters = document.querySelectorAll('.counter');
        
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target') || '0');
            const duration = 2000; // 2 seconds
            const step = Math.max(1, Math.floor(target / (duration / 16))); // 60fps approx
            
            // Only animate if we have a valid target
            if (target > 0) {
                counter.textContent = '0';
                
                const updateCounter = () => {
                    let current = parseInt(counter.textContent.replace(/,/g, ''));
                    current += step;
                    
                    if (current >= target) {
                        counter.textContent = target.toLocaleString();
                    } else {
                        counter.textContent = current.toLocaleString();
                        requestAnimationFrame(updateCounter);
                    }
                };
                
                // Start animation when counter comes into view
                const observer = new IntersectionObserver(entries => {
                    if (entries[0].isIntersecting) {
                        updateCounter();
                        observer.disconnect();
                    }
                }, { threshold: 0.5 });
                
                observer.observe(counter);
            }
        });
    }
}

/**
 * Initialize category card flip interactions
 */
function initCategoryCards() {
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        // Add keyboard accessibility for card flipping
        card.setAttribute('tabindex', '0');
        
        // Handle keyboard events
        card.addEventListener('keydown', function(e) {
            // Toggle on Enter or Space
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                
                const cardFront = this.querySelector('.card-front');
                const cardBack = this.querySelector('.card-back');
                
                if (cardFront && cardBack) {
                    if (cardFront.style.transform === 'rotateY(180deg)') {
                        cardFront.style.transform = '';
                        cardBack.style.transform = 'rotateY(180deg)';
                    } else {
                        cardFront.style.transform = 'rotateY(180deg)';
                        cardBack.style.transform = '';
                    }
                }
            }
        });
    });
}

// Call all initialization functions when document is loaded
document.addEventListener('DOMContentLoaded', function() {
    initDisasterSelector();
    initScrollAnimation();
    initContactForm();
    initStatCounters();
    initScrollSpy();
    initCategoryCards();
});