const nodemailer = require('nodemailer');

const sendEmail = async (option) => {
    // Create a transporter
    var transport = nodemailer.createTransport({

        host: process.env.EMAIL_HOST,
      
        port: process.env.MAIL_PORT,
      secure: false,
        auth: {
      
          user: process.env.EMAIL_USER,
      
          pass: process.env.EMAIL_PASSWORD
      
        },
      });

    // DEFINE EMAIL OPTIONS
    const emailOptions = {
        from: 'Cineflix support<support@cineflix.com>',
        to: option.email,
        subject: option.subject,
        text: option.message
    }

    await transport.sendMail(emailOptions);

} 

module.exports = sendEmail;