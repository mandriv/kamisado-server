const nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'wojciech.cichoradzki@gmail.com',
        pass: process.env.GMAIL_PASS
    }
});

exports.sendResetPassword = function (address, password) {
  // setup email data with unicode symbols
  let mailOptions = {
      from: '"Kamisado Admin" <wojciech.cichoradzki@gmail.com>', // sender address
      to: address, // list of receivers
      subject: 'Kamisado - Password reset', // Subject line
      text: 'New password: '+password, // plain text body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
      }
      console.log('Message %s sent: %s', info.messageId, info.response);
  });
}
