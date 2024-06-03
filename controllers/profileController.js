const User = require('../models/User');

// Controller function to update user profile
const updateProfile = async (req, res) => {
    const { name, email, currentPassword, newPassword } = req.body;

    try {
        // Fetch the user from the database
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        
        // Check the current password
        const passwordMatch = await user.comparePassword(currentPassword);
        if (!passwordMatch) {
            return res.status(400).json({ message: 'Incorrect current password.' });
        }

        // Update the user's profile
        if (name) user.name = name;
        if (email) user.email = email;
        if (newPassword) user.password = newPassword;

        await user.save();

        res.status(200).json({ message: 'Profile updated successfully!' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

module.exports = {
    updateProfile
};
