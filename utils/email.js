const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  //create a transporter

  const transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //define email options

  const mailOptions = {
    from: "Ivan Riumkin <ivan.riumkin@protonmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //Sent the email
  await transport.sendMail(mailOptions);
};

module.exports = sendEmail;
