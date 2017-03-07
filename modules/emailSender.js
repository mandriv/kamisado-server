const nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    service: 'Yandex',
    auth: {
        user: process.env.YANDEX_USERNAME,
        pass: process.env.YANDEX_PASSWORD
    }
});

exports.sendResetPassword = function (address, password, callback) {
  // setup email data with unicode symbols
  let mailOptions = {
      from: 'kamisado-cs207@yandex.com', // sender address
      to: address, // list of receivers
      subject: 'Kamisado - Password reset', // Subject line
      text: 'New password: ' + password, // plain text body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function (error, info) {
      callback(error, info);
  });
}
