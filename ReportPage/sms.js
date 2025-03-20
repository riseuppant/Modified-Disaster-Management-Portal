// server.js
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const axios = require('axios');
const bcrypt = require('bcrypt');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from 'public' directory

// In-memory storage (replace with your database in production)
const users = {};
const otpStore = {};

// Fast2SMS Configuration
const FAST2SMS_API_KEY = 'YOUR_FAST2SMS_API_KEY'; // Replace with your actual API key

// Generate a random 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via Fast2SMS
async function sendSMS(mobile, message) {
    try {
        const response = await axios({
            method: 'post',
            url: 'https://www.fast2sms.com/dev/bulkV2',
            headers: {
                'authorization': 'NzI1NjY1NjM2MzRiNTM2ODZmMzQ3ODczNjk2MjRiNGM=',
                'Content-Type': 'application/json'
            },
            data: {
                route: 'otp',
                variables_values: message,
                numbers: mobile
            }
        });
        
        return response.data;
    } catch (error) {
        console.error('Error sending SMS:', error.response ? error.response.data : error.message);
        throw new Error('Failed to send SMS');
    }
}

// API endpoint to send OTP
app.post('/api/send-otp', async (req, res) => {
    try {
        const { mobile } = req.body;
        
        // Validate mobile number
        if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
            return res.status(400).json({ success: false, message: 'Invalid mobile number' });
        }
        
        // Generate OTP
        const otp = generateOTP();
        
        // Store OTP with expiration time (5 minutes)
        otpStore[mobile] = {
            otp,
            expiresAt: Date.now() + 5 * 60 * 1000  // 5 minutes
        };
        
        // Send OTP via Fast2SMS
        const message = `Your OTP for password reset is ${otp}. Valid for 5 minutes.`;
        await sendSMS(mobile, message);
        
        res.json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error in send-otp endpoint:', error);
        res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }
});

// API endpoint to verify OTP
app.post('/api/verify-otp', (req, res) => {
    try {
        const { mobile, otp } = req.body;
        
        // Check if OTP exists and is valid
        const otpData = otpStore[mobile];
        if (!otpData || otpData.otp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }
        
        // Check if OTP has expired
        if (Date.now() > otpData.expiresAt) {
            delete otpStore[mobile]; // Clean up expired OTP
            return res.status(400).json({ success: false, message: 'OTP has expired' });
        }
        
        // OTP is valid, create a temporary token for this session
        const resetToken = crypto.randomBytes(32).toString('hex');
        users[mobile] = { ...users[mobile], resetToken };
        
        // Clean up used OTP
        delete otpStore[mobile];
        
        res.json({ success: true, message: 'OTP verified successfully', resetToken });
    } catch (error) {
        console.error('Error in verify-otp endpoint:', error);
        res.status(500).json({ success: false, message: 'Failed to verify OTP' });
    }
});

// API endpoint to reset password
app.post('/api/reset-password', async (req, res) => {
    try {
        const { mobile, newPassword, resetToken } = req.body;
        
        // Validate input
        if (!mobile || !newPassword || !resetToken) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        
        // Check if user exists and token is valid
        const userData = users[mobile];
        if (!userData || userData.resetToken !== resetToken) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
        }
        
        // Password validation (should be done on client side too)
        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
        }
        
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        
        // Update user password (in a real app, you'd update your database)
        users[mobile] = { 
            ...userData, 
            password: hashedPassword,
            resetToken: null // Invalidate the reset token
        };
        
        // Send confirmation SMS
        try {
            const message = `Your password has been reset successfully. If you didn't request this change, please contact our support team.`;
            await sendSMS(mobile, message);
        } catch (smsError) {
            console.error('Error sending confirmation SMS:', smsError);
            // Continue with the process even if confirmation SMS fails
        }
        
        res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error in reset-password endpoint:', error);
        res.status(500).json({ success: false, message: 'Failed to reset password' });
    }
});

// API endpoint to resend OTP
app.post('/api/resend-otp', async (req, res) => {
    try {
        const { mobile } = req.body;
        
        // Validate mobile number
        if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
            return res.status(400).json({ success: false, message: 'Invalid mobile number' });
        }
        
        // Generate new OTP
        const otp = generateOTP();
        
        // Store OTP with expiration time (5 minutes)
        otpStore[mobile] = {
            otp,
            expiresAt: Date.now() + 5 * 60 * 1000  // 5 minutes
        };
        
        // Send OTP via Fast2SMS
        const message = `Your new OTP for password reset is ${otp}. Valid for 5 minutes.`;
        await sendSMS(mobile, message);
        
        res.json({ success: true, message: 'New OTP sent successfully' });
    } catch (error) {
        console.error('Error in resend-otp endpoint:', error);
        res.status(500).json({ success: false, message: 'Failed to send new OTP' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// For production use, you would want to add:
// 1. Rate limiting to prevent abuse
// 2. Proper database integration
// 3. Logging middleware
// 4. Error handling middleware
// 5. HTTPS
// 6. User authentication
// 7. Environment variable configuration

module.exports = app; // For testing purposes