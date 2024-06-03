const express = require('express');
const router = express.Router();
const { updateProfile } = require('../controllers/profileController');
const authenticateUser = require('../middleware/authMiddleware');

// Sample route to update user profile
router.post('/update-profile', authenticateUser, updateProfile);

module.exports = router;
