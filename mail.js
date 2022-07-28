const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "smtp-mail.outlook.com", // hostname smtp.live.com //smtp-mail.outlook.com
  secureConnection: false, // TLS requires secureConnection to be false
  port: 587, // port for secure SMTP
  tls: {
     ciphers:'SSLv3'
  },
  auth: {
      user: 'bytes.drunken@hotmail.com',
      pass: 'FlipkartGrid4.0'
  }
});


module.exports = transporter;
