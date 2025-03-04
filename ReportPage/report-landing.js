document.addEventListener('DOMContentLoaded', function() {
    /* ...existing animation code... */

    // Handle proceed button click
    document.querySelector('.proceed-btn').addEventListener('click', function() {
        document.body.style.opacity = '0';
        setTimeout(() => {
            window.location.href = 'auth.html';
        }, 300);
    });

    // Update back button click handler to return to about.html
    document.querySelector('.back-btn').addEventListener('click', function() {
        document.body.style.opacity = '0';
        setTimeout(() => {
            window.location.href = '../Home/about.html';
        }, 300);
    });
});
