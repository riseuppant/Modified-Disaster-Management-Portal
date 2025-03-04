document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const formsContainer = document.querySelector('.forms-container');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // Toggle between login and register forms
    loginBtn.addEventListener('click', () => {
        formsContainer.classList.remove('slide-left');
        formsContainer.classList.remove('slide-right');
    });

    registerBtn.addEventListener('click', () => {
        formsContainer.classList.add('slide-left');
    });

    // Toggle password visibility
    document.querySelectorAll('.toggle-password').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            const passwordInput = e.target.previousElementSibling;
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            e.target.classList.toggle('fa-eye');
            e.target.classList.toggle('fa-eye-slash');
        });
    });

    // Form submissions
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Add your login logic here
        console.log('Login submitted');
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Add your registration logic here
        console.log('Registration submitted');
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const formsContainer = document.querySelector('.forms-container');

    // Redirect to registration page
    registerBtn.addEventListener('click', () => {
        window.location.href = 'register.html';
    });

    // Handle login form
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Add your login logic here
        const email = loginForm.querySelector('[type="email"]').value;
        const password = loginForm.querySelector('[type="password"]').value;
        
        // Send login request to your server
        console.log('Login attempt:', { email, password });
    });
});