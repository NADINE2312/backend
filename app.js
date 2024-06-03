const { body, validationResult } = require('express-validator');

// Sample route to update user profile
app.post('/update-profile', [
    // Validate name
    body('name').optional().isString().withMessage('Name must be a string.'),
    // Validate email
    body('email').optional().isEmail().withMessage('Email must be valid.'),
    // Validate current password
    body('currentPassword')
        .optional()
        .isString()
        .withMessage('Current password must be provided.')
        .notEmpty()
        .withMessage('Current password cannot be empty.'),
    // Validate new password
    body('newPassword')
        .optional()
        .isString()
        .withMessage('New password must be a string.')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters long.')
        .matches(/[A-Z]/)
        .withMessage('New password must contain at least one uppercase letter.')
        .matches(/[a-z]/)
        .withMessage('New password must contain at least one lowercase letter.')
        .matches(/[0-9]/)
        .withMessage('New password must contain at least one digit.')
        .matches(/[\W]/)
        .withMessage('New password must contain at least one special character.'),
    // Validate confirm password
    body('confirmPassword')
        .optional()
        .isString()
        .withMessage('Confirmation password must be provided.')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Confirmation password must match the new password.');
            }
            return true;
        }),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    // Handle the profile update logic here
    // Your database interaction logic goes here.
    
    res.status(200).json({ message: 'Profile updated successfully!' });
});
