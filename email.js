const nodemailer = require('nodemailer');

// const sendEmail = (option) => {
//   const transporter = nodemailer.createTransport({
//     service: 'Gmail',
//     auth: {
//       user: process.env.EMAIL_NAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });
// };

const sendEmail = async (option) => {
  const transport = nodemailer.createTransport({
    //create a transporter
    host: 'smtp.mailtrap.io',
    port: 25,
    auth: {
      user: process.env.EMAIL_NAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // email option
  const mailOptions = {
    from: 'tanim rahman',
    to: option.email,
    subject: option.subject,
    text: option.message,
  };
  // sending email
  await transport.sendMail(mailOptions);
};

module.exports = sendEmail;
