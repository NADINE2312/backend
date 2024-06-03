const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const fieldSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    Surface: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    }
    

    
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    fields: [fieldSchema] 
});

// Compare provided password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
