const nodemailer = require("nodemailer");

exports.transporter = nodemailer.createTransport({
    service: 'gmail',  // Specify the service explicitly
    host: 'smtp.gmail.com', // Use Gmail's actual SMTP server
    port: 587,
    secure: false,
    auth: {
        user: 'bebjdjbbansnwbh@gmail.com',
        pass: 'wmxk xlni plff xpeh',
    },
    debug: true, // Enable debug logging
});
