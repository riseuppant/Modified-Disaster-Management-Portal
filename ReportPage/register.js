// register.js
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    
    // Toggle password visibility
    const togglePassword = document.querySelector('.toggle-password');
    togglePassword.addEventListener('click', function() {
        const password = document.getElementById('password');
        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
        password.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });

    // Handle form submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form data
        const formData = {
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            country: document.getElementById('country').value,
            phone: document.getElementById('phone').value
        };

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('success', data.message);
                setTimeout(() => {
                    window.location.href = 'auth.html';
                }, 2000);
            } else {
                showMessage('error', data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('error', 'An error occurred during registration');
        }
    });

    // Function to show messages to user
    function showMessage(type, message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        // Add styles for the message
        messageDiv.style.padding = '10px';
        messageDiv.style.marginBottom = '10px';
        messageDiv.style.borderRadius = '5px';
        messageDiv.style.textAlign = 'center';
        messageDiv.style.color = 'white';
        
        if (type === 'error') {
            messageDiv.style.backgroundColor = '#ff4444';
        } else {
            messageDiv.style.backgroundColor = '#4CAF50';
        }

        // Insert message at the top of the form
        const form = document.querySelector('.register-form');
        form.insertBefore(messageDiv, form.firstChild);

        // Remove message after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
});
