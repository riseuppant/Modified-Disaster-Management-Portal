document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const steps = document.querySelectorAll('.step-content');
    const mobileInput = document.getElementById('mobile');
    const sendOtpBtn = document.getElementById('sendOtpBtn');
    const resendOtpBtn = document.getElementById('resendOtpBtn');
    const verifyOtpBtn = document.getElementById('verifyOtpBtn');
    const otpInputs = document.querySelectorAll('.otp-input');
    const timer = document.getElementById('timer');
    const backToMobileBtn = document.getElementById('backToMobileBtn');
    const backToOtpBtn = document.getElementById('backToOtpBtn');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const toggleNewPassword = document.getElementById('toggleNewPassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    const passwordMatchText = document.getElementById('passwordMatch');
    const resetPasswordBtn = document.getElementById('resetPasswordBtn');
    const loginBtn = document.getElementById('loginBtn');
    const btnLoader = document.querySelector('.btn-loader');
    const btnText = document.querySelector('.btn-text');
    
    // Password requirement elements
    const reqLength = document.getElementById('req-length');
    const reqUppercase = document.getElementById('req-uppercase');
    const reqLowercase = document.getElementById('req-lowercase');
    const reqNumber = document.getElementById('req-number');
    const reqSpecial = document.getElementById('req-special');
    
    let timerInterval;
    let remainingTime = 30;
    
    // Show specific step
    function showStep(stepNumber) {
        steps.forEach((step, index) => {
            step.classList.remove('active');
        });
        steps[stepNumber - 1].classList.add('active');
    }
    
    // Validate mobile number
    function validateMobile(mobile) {
        const mobileRegex = /^[0-9]{10}$/;
        return mobileRegex.test(mobile);
    }
    
    // Start OTP timer
    function startTimer() {
        clearInterval(timerInterval);
        remainingTime = 30;
        updateTimerDisplay();
        
        resendOtpBtn.disabled = true;
        
        timerInterval = setInterval(() => {
            remainingTime--;
            updateTimerDisplay();
            
            if (remainingTime <= 0) {
                clearInterval(timerInterval);
                resendOtpBtn.disabled = false;
            }
        }, 1000);
    }
    
    // Update timer display
    function updateTimerDisplay() {
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Evaluate password strength
    function evaluatePasswordStrength(password) {
        let score = 0;
        let feedback = '';
        
        // Check requirements
        const hasLength = password.length >= 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);
        
        // Update requirement indicators
        updateRequirement(reqLength, hasLength);
        updateRequirement(reqUppercase, hasUppercase);
        updateRequirement(reqLowercase, hasLowercase);
        updateRequirement(reqNumber, hasNumber);
        updateRequirement(reqSpecial, hasSpecial);
        
        // Calculate score
        if (hasLength) score += 20;
        if (hasUppercase) score += 20;
        if (hasLowercase) score += 20;
        if (hasNumber) score += 20;
        if (hasSpecial) score += 20;
        
        // Update strength bar and text
        strengthBar.style.width = `${score}%`;
        
        if (score < 40) {
            strengthBar.style.backgroundColor = '#ef4444'; // red
            feedback = 'Weak';
        } else if (score < 80) {
            strengthBar.style.backgroundColor = '#f59e0b'; // yellow
            feedback = 'Moderate';
        } else {
            strengthBar.style.backgroundColor = '#10b981'; // green
            feedback = 'Strong';
        }
        
        strengthText.textContent = `Password strength: ${feedback}`;
        
        return score >= 80;
    }
    
    // Update requirement indicator
    function updateRequirement(element, isValid) {
        if (isValid) {
            element.querySelector('i').className = 'fas fa-check-circle';
            element.style.color = 'var(--success-color)';
        } else {
            element.querySelector('i').className = 'fas fa-times-circle';
            element.style.color = 'var(--text-light)';
        }
    }
    
    // Check if passwords match
    function checkPasswordsMatch() {
        const newPass = newPasswordInput.value;
        const confirmPass = confirmPasswordInput.value;
        
        if (confirmPass === '') {
            passwordMatchText.textContent = '';
            return false;
        }
        
        if (newPass === confirmPass) {
            passwordMatchText.textContent = 'Passwords match';
            passwordMatchText.style.color = 'var(--success-color)';
            return true;
        } else {
            passwordMatchText.textContent = 'Passwords do not match';
            passwordMatchText.style.color = 'var(--error-color)';
            return false;
        }
    }
    
    // Show loading state
    function showLoading(button) {
        button.disabled = true;
        btnText.classList.add('hidden');
        btnLoader.classList.remove('hidden');
    }
    
    // Hide loading state
    function hideLoading(button) {
        button.disabled = false;
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');
    }
    
    // Send OTP
    async function sendOTP() {
        const mobile = mobileInput.value;
        
        if (!validateMobile(mobile)) {
            alert('Please enter a valid 10-digit mobile number');
            return;
        }
        
        showLoading(sendOtpBtn);
        
        try {
            // Simulate API call to send OTP via Fast2SMS
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // API call would look something like this:
            // const response = await fetch('/api/send-otp', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({ mobile }),
            // });
            // const data = await response.json();
            
            // For demo purposes, always succeed
            showStep(2);
            startTimer();
            otpInputs[0].focus();
        } catch (error) {
            console.error('Error sending OTP:', error);
            alert('Failed to send OTP. Please try again.');
        } finally {
            hideLoading(sendOtpBtn);
        }
    }
    
    // Verify OTP
    async function verifyOTP() {
        let otp = '';
        otpInputs.forEach(input => {
            otp += input.value;
        });
        
        if (otp.length !== 6) {
            alert('Please enter a valid 6-digit OTP');
            return;
        }
        
        try {
            // Simulate API call to verify OTP
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // API call would look something like this:
            // const response = await fetch('/api/verify-otp', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({ mobile: mobileInput.value, otp }),
            // });
            // const data = await response.json();
            
            // For demo purposes, always succeed
            showStep(3);
            newPasswordInput.focus();
        } catch (error) {
            console.error('Error verifying OTP:', error);
            alert('Invalid OTP. Please try again.');
        }
    }
    
    // Reset Password
    async function resetPassword() {
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (!evaluatePasswordStrength(newPassword)) {
            alert('Please create a stronger password');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        try {
            // Simulate API call to reset password
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // API call would look something like this:
            // const response = await fetch('/api/reset-password', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({ 
            //         mobile: mobileInput.value,
            //         newPassword
            //     }),
            // });
            // const data = await response.json();
            
            // For demo purposes, always succeed
            showStep(4);
        } catch (error) {
            console.error('Error resetting password:', error);
            alert('Failed to reset password. Please try again.');
        }
    }
    
    // Event Listeners
    sendOtpBtn.addEventListener('click', sendOTP);
    
    resendOtpBtn.addEventListener('click', async () => {
        await sendOTP();
        startTimer();
    });
    
    verifyOtpBtn.addEventListener('click', verifyOTP);
    
    resetPasswordBtn.addEventListener('click', resetPassword);
    
    backToMobileBtn.addEventListener('click', () => {
        showStep(1);
        clearInterval(timerInterval);
    });
    
    backToOtpBtn.addEventListener('click', () => {
        showStep(2);
        startTimer();
    });
    
    loginBtn.addEventListener('click', () => {
        window.location.href = 'login.html';
    });
    
    // Handle OTP input
    otpInputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value.length === 1) {
                const nextIndex = parseInt(this.getAttribute('data-index')) + 1;
                if (nextIndex < otpInputs.length) {
                    otpInputs[nextIndex].focus();
                }
            }
        });
        
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && this.value === '') {
                const prevIndex = parseInt(this.getAttribute('data-index')) - 1;
                if (prevIndex >= 0) {
                    otpInputs[prevIndex].focus();
                }
            }
        });
    });
    
    // Toggle password visibility
    toggleNewPassword.addEventListener('click', () => {
        const type = newPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        newPasswordInput.setAttribute('type', type);
        toggleNewPassword.querySelector('i').className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    });
    
    toggleConfirmPassword.addEventListener('click', () => {
        const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        confirmPasswordInput.setAttribute('type', type);
        toggleConfirmPassword.querySelector('i').className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    });
    
    // Password strength evaluation
    newPasswordInput.addEventListener('input', function() {
        evaluatePasswordStrength(this.value);
        if (confirmPasswordInput.value !== '') {
            checkPasswordsMatch();
        }
    });
    
    // Check passwords match
    confirmPasswordInput.addEventListener('input', checkPasswordsMatch);
});