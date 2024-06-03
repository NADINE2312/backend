const nodemailer = require('nodemailer');

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'salmadjobbi6@gmail.com', // Your Gmail address
        pass: 'khlayelsalma7.', // Your Gmail password or app password
    },
});

/**
 * Send an email with the user's credentials.
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The subject of the email.
 * @param {string} text - The email text body.
 */
function sendEmail(to, subject, text) {
    console.log(`Envoi d'email à ${to}`);
    console.log(`Sujet : ${subject}`);
    console.log(`Corps : ${text}`);

    const mailOptions = {
        from: 'salmadjobbi6@gmail.com', // Your email address
        to,
        subject,
        text,
    };

    return transporter.sendMail(mailOptions)
        .then(info => {
            console.log('Email envoyé:', info.response);
        })
        .catch(error => {
            console.error('Échec de l\'envoi de l\'email:', error);
        });
     }

module.exports = { sendEmail };
