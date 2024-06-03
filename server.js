const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Firestore } = require('@google-cloud/firestore');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const os = require('os');

// Load environment variables from a .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(bodyParser.json());
app.use(cors());



// Specify the path to your service account key file
const keyFilePath = 'C:/Users/Lenovo/backend/service-account-key.json.json'; 

// Initialize Firestore with the key file
const firestore = new Firestore({
    projectId: 'database-pfe-65cd4',
    keyFilename: keyFilePath,
});

// Firestore instance
const db = firestore;
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASSWORD,  
    },
});
const getServerIPAddress = () => {
    const interfaces = os.networkInterfaces();
    for (const key in interfaces) {
        for (const iface of interfaces[key]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'Unknown';
};
const serverIPAddress = getServerIPAddress();
console.log(`Server running at http://${serverIPAddress}:${port}/`);

// Sample route to update user profile
// Sample route to update user profile
app.post('/api/users', async (req, res) => {
    const { name, email, phone, address, password, fields } = req.body;

    try {
        const emailExists = await isEmailRegistered(email);
        if (emailExists) {
            return res.status(400).json({ message: 'Email already registered' });
        }
        // Add a new user document to Firestore
        const userRef = await db.collection('users').add({
            name,
            email,
            phone,
            address,
            password,
        });
        // Add fields subcollection for the user
        const fieldsCollectionRef = userRef.collection('fields');

        // Add each field document to the fields subcollection
        for (const field of fields) {
            const fieldRef = await fieldsCollectionRef.add(field);

            // Add subcollection 'nodes' under each 'field'
            const nodesCollectionRef = fieldRef.collection('nodes');
            if (field.nodes) {
                field.nodes.forEach(async (node) => {
                    await nodesCollectionRef.add(node);
                });
            }
        }

        res.status(201).json({ message: 'User created successfully!', id: userRef.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create user.' });
    }
});



app.post('/send-email', (req, res) => {
    const { to, subject, body } = req.body;
  
    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'nadineamdouni09@gmail.com', // Replace with your email address
        pass: 'vflw vibp ybwv llgf'    // Replace with your email password
      }
    });
  
    // Email options
    const mailOptions = {
      from: 'nadineamdouni09@gmail.com',
      to: to,
      subject: subject,
      html: `<p>${body}</p>`
    };
  
    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        res.status(500).send('Failed to send email');
      } else {
        console.log('Email sent:', info.response);
        res.status(200).send('Email sent successfully');
      }
    });
  });


// API endpoint to fetch all users (READ)
// API endpoint to fetch all users and their subcollections (READ)
// API endpoint to fetch all users and their subcollections (READ)
app.get('/api/users', async (req, res) => {
    try {
        // Fetch all user documents from Firestore
        const usersSnapshot = await db.collection('users').get();
        const users = [];

        // Iterate through each user document
        for (const userDoc of usersSnapshot.docs) {
            const userData = userDoc.data();
            const userId = userDoc.id;
            
            // Fetch subcollection data for the user
            const fieldsSnapshot = await db.collection('users').doc(userId).collection('fields').get();
            const fields = [];

            // Iterate through each field document
            for (const fieldDoc of fieldsSnapshot.docs) {
                const fieldData = fieldDoc.data();
                const fieldId = fieldDoc.id;

                // Fetch subcollection 'nodes' data for each 'field'
                const nodesSnapshot = await fieldDoc.ref.collection('nodes').get();
                const nodes = nodesSnapshot.docs.map(doc => {
                    return {
                        nodeId: doc.id,
                        fieldId,
                        userId,
                        ...doc.data()
                    };
                });

                // Append field data and nodes to the fields array
                fields.push({
                    id: fieldId,
                    ...fieldData,
                    nodes: nodes
                });
            }

            // Append user data and fields to the users array
            users.push({
                id: userId,
                ...userData,
                fields: fields
            });
        }

        return res.status(200).json(users);
    } catch (error) {
        console.error('Failed to fetch users and subcollections:', error);
        return res.status(500).json({ message: 'Failed to fetch users and subcollections.' });
    }
});



// API endpoint to log in a user
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Query Firestore to find a user with the provided email and password
        const userSnapshot = await db.collection('users')
            .where('email', '==', email)
            .where('password', '==', password)
            .get();

        if (userSnapshot.empty) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const userData = userSnapshot.docs[0].data();
        console.log('User authenticated successfully:', userData);
        const userId = userSnapshot.docs[0].id;

        // Fetch subcollection 'fields' data for the user
        const fieldsSnapshot = await userSnapshot.docs[0].ref.collection('fields').get();
        const fields = [];

        // Iterate through each field document
        for (const fieldDoc of fieldsSnapshot.docs) {
            const fieldData = fieldDoc.data();
            const fieldId = fieldDoc.id;

            // Fetch subcollection 'nodes' data for each 'field'
            const nodesSnapshot = await fieldDoc.ref.collection('nodes').get();
            const nodes = nodesSnapshot.docs.map(doc => {
                return {
                    fieldId,
                    userId,
                    nodeId: doc.id,
                    ...doc.data()
                };
            });

            // Append field data and nodes to the fields array
            fields.push({
                id: fieldId,
                ...fieldData,
                nodes: nodes
            });
        }

        // User authenticated successfully, return user data and fields
        return res.status(200).json({ userData, fields });
    } catch (error) {
        console.error('Failed to authenticate user:', error);
        return res.status(500).json({ message: 'Failed to authenticate user' });
    }
});


// API endpoint to delete a user by ID (DELETE)
app.delete('/api/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        // Delete the user document from Firestore
        await db.collection('users').doc(userId).delete();
        return res.status(204).json({ message: 'User deleted successfully.' });
    } catch (error) {
        console.error('Failed to delete user:', error);
        return res.status(500).json({ message: 'Failed to delete user.' });
    }
});
let authenticatedUsers = [];

// Route for user logout
app.post('/api/logout', (req, res) => {
    const token = req.body.token;

    // Find the user by token and remove it from the authenticated users list
    authenticatedUsers = authenticatedUsers.filter(user => user.token !== token);

    // Send a response indicating successful logout
    return res.status(200).json({ message: 'User logged out successfully' });
});
app.post('/update-password', (req, res) => {
    const { userId, password } = req.body;
  
    // Logic to update the password in the database
    // Assuming you have a User model and a method to find and update a user by ID
    User.findById(userId, (err, user) => {
      if (err || !user) {
        return res.status(404).send('User not found');
      }
  
      user.password = password; // Ensure you hash the password before saving
      user.save((err) => {
        if (err) {
          return res.status(500).send('Error updating password');
        }
  
        res.status(200).send('Password updated successfully');
      });
    });
  });

// Start the server
app.listen(port, () => {
    console.log(`Express server running at http://${serverIPAddress}:${port}/`);
});
async function isEmailRegistered(email) {
    const snapshot = await db.collection('users').where('email', '==', email).get();
    return !snapshot.empty;
}
