document.addEventListener('DOMContentLoaded', function() {
    // Initialize Easter Egg
    initEasterEgg();
});

// Initialize Easter Egg
function initEasterEgg() {
    const meteor = document.getElementById('meteor');
    
    if (!meteor) return;
    
    let clickCount = 0;
    
    // Meteor click handler
    meteor.addEventListener('click', () => {
        clickCount++;
        
        // Add pulse effect on click
        meteor.style.transform = 'scale(1.3)';
        setTimeout(() => {
            meteor.style.transform = '';
        }, 300);
        
        // After 3 clicks, trigger the transition to a new page
        if (clickCount === 3) {
            // Start falling animation
            meteor.classList.add('falling');
            
            // Calculate impact point (where the meteor will hit)
            const impactX = window.innerWidth / 2;
            const impactY = window.innerHeight - 100;
            
            // Show impact effect and transition
            setTimeout(() => {
                // Create impact effect
                createImpactEffect(impactX, impactY);
                
                // Create curtain unwrapping effect
                createCurtainEffect();
                
                // Create burn effect for final transition
                createBurnEffect();
                
                // Navigate to new page after effects complete
                setTimeout(() => {
                    window.location.href = "comingsoon.html";
                }, 2700); // Wait for curtain and burn effects to complete
            }, 2000);
        }
    });
}

// Create impact effect when meteor hits
function createImpactEffect(x, y) {
    const impact = document.createElement('div');
    impact.className = 'impact-effect';
    impact.style.left = `${x}px`;
    impact.style.top = `${y}px`;
    document.body.appendChild(impact);
    
    // Add shockwave effect
    const shockwave = document.createElement('div');
    shockwave.className = 'shockwave';
    document.body.appendChild(shockwave);
    
    // Add screen shake effect
    document.body.classList.add('screen-shake');
    setTimeout(() => {
        document.body.classList.remove('screen-shake');
    }, 1000);
}

// Create curtain unwrapping effect
function createCurtainEffect() {
    const curtainContainer = document.createElement('div');
    curtainContainer.className = 'curtain-container';
    
    // Create four curtains (left, right, top, bottom)
    const curtainLeft = document.createElement('div');
    curtainLeft.className = 'curtain curtain-left';
    
    const curtainRight = document.createElement('div');
    curtainRight.className = 'curtain curtain-right';
    
    const curtainTop = document.createElement('div');
    curtainTop.className = 'curtain curtain-top';
    
    const curtainBottom = document.createElement('div');
    curtainBottom.className = 'curtain curtain-bottom';
    
    // Add curtains to container
    curtainContainer.appendChild(curtainLeft);
    curtainContainer.appendChild(curtainRight);
    curtainContainer.appendChild(curtainTop);
    curtainContainer.appendChild(curtainBottom);
    
    // Add container to body
    document.body.appendChild(curtainContainer);
}

// Create burn effect for final transition
function createBurnEffect() {
    const burnEffect = document.createElement('div');
    burnEffect.className = 'burn-effect';
    document.body.appendChild(burnEffect);
}
