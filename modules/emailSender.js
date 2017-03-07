const nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'wojciech.cichoradzki@gmail.com',
        pass: process.env.GMAIL_PASS
    }
});

exports.sendResetPassword = function (address, password, callback) {
  // setup email data with unicode symbols
  let mailOptions = {
      from: '"Kamisado Admin" <wojciech.cichoradzki@gmail.com>', // sender address
      to: address, // list of receivers
      subject: 'Kamisado - Password reset', // Subject line
      text: 'New password: '+password, // plain text body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function (error, info) {
      callback(error, info);
  });
}
