// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize fluid background
    initFluidBackground();
    
    // Initialize tilt effect on cards
    initTiltEffect();
    
    // Initialize subtle animations that don't hide content
    initSubtleAnimations();
    
    // Handle form submission
    initFormHandler();
});

// Fluid Background Animation
function initFluidBackground() {
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Particle class
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 5 + 2;
            this.speedX = Math.random() * 3 - 1.5;
            this.speedY = Math.random() * 3 - 1.5;
            this.color = this.getRandomColor();
        }
        
        getRandomColor() {
            const colors = [
                'rgba(74, 108, 247, 0.5)',  // Primary
                'rgba(249, 115, 22, 0.5)',  // Secondary
                'rgba(16, 185, 129, 0.5)'   // Accent
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            // Bounce off edges
            if (this.x > canvas.width || this.x < 0) {
                this.speedX = -this.speedX;
            }
            
            if (this.y > canvas.height || this.y < 0) {
                this.speedY = -this.speedY;
            }
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }
    
    // Create particles
    const particles = [];
    const particleCount = Math.min(100, Math.floor(window.innerWidth / 20));
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    // Mouse interaction
    let mouse = {
        x: null,
        y: null,
        radius: 150
    };
    
    window.addEventListener('mousemove', (event) => {
        mouse.x = event.x;
        mouse.y = event.y;
    });
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw connections between particles
        for (let i = 0; i < particles.length; i++) {
            for (let j = i; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - distance/150)})`;
                    ctx.lineWidth = 1;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        
        // Update and draw particles
        particles.forEach(particle => {
            // Mouse interaction
            if (mouse.x && mouse.y) {
                const dx = particle.x - mouse.x;
                const dy = particle.y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < mouse.radius) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (mouse.radius - distance) / mouse.radius;
                    
                    particle.x += forceDirectionX * force * 5;
                    particle.y += forceDirectionY * force * 5;
                }
            }
            
            particle.update();
            particle.draw();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// Initialize Tilt Effect
function initTiltEffect() {
    VanillaTilt.init(document.querySelectorAll("[data-tilt]"), {
        max: 10,
        speed: 400,
        glare: true,
        "max-glare": 0.3,
    });
    
    // Smaller tilt for feature cards
    VanillaTilt.init(document.querySelectorAll(".feature-card"), {
        max: 5,
        speed: 400,
        glare: true,
        "max-glare": 0.1,
    });
}

// Initialize Subtle Animations (that don't hide content)
function initSubtleAnimations() {
    // Only animate properties that don't affect visibility
    if (typeof gsap !== 'undefined') {
        // Subtle animations for feature cards - only animate y position, not opacity
        gsap.from(".feature-card", {
            y: 20,  // Reduced from 50 to 20
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: ".features-section",
                start: "top 80%"
            }
        });
        
        // Subtle header animations - only animate y position, not opacity
        gsap.from(".title", { 
            y: -20,  // Reduced from -50 to -20
            duration: 1, 
            ease: "power3.out" 
        });
        
        gsap.from(".subtitle", { 
            y: -10,  // Reduced from -30 to -10
            duration: 1, 
            delay: 0.3, 
            ease: "power3.out" 
        });
        
        gsap.from(".tagline", { 
            y: -5,  // Reduced from -20 to -5
            duration: 1, 
            delay: 0.6, 
            ease: "power3.out" 
        });
        
        // Subtle animation for signup section - only animate y position, not opacity
        gsap.from(".signup-section", {
            y: 10,  // Reduced from 30 to 10
            duration: 1,
            scrollTrigger: {
                trigger: ".signup-section",
                start: "top 80%"
            }
        });
        
        // Subtle animation for social links - only animate scale, not opacity
        gsap.from(".social-link", {
            scale: 0.8,  // Changed from 0 to 0.8
            duration: 0.5,
            stagger: 0.1,
            ease: "back.out(1.7)",
            scrollTrigger: {
                trigger: ".social-links",
                start: "top 90%"
            }
        });
    }
}

// Form Submission Handler
function initFormHandler() {
    const form = document.getElementById('signup-form');
    const successMessage = document.getElementById('signup-success');
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Simulate form submission
            const email = form.querySelector('input[type="email"]').value;
            
            // Show loading state
            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;
            submitButton.innerHTML = 'Submitting...';
            submitButton.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                // Reset form
                form.reset();
                
                // Show success message
                successMessage.style.display = 'block';
                
                // Reset button
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
                
                // Hide success message after 5 seconds
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 5000);
                
                console.log('Signup submitted with email:', email);
            }, 1500);
        });
    }
}

// Add cursor effect
document.addEventListener('mousemove', (e) => {
    const cursor = document.createElement('div');
    cursor.className = 'cursor-trail';
    cursor.style.left = e.pageX + 'px';
    cursor.style.top = e.pageY + 'px';
    
    document.body.appendChild(cursor);
    
    setTimeout(() => {
        cursor.remove();
    }, 1000);
});
