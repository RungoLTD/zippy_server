'use strict';

const nodemailer = require('nodemailer');

module.exports.sendEmail = async function(email, text) {

    let transporter = nodemailer.createTransport({
        host: 'smtp.mail.ru',
        port: 465,
        secure: true,
        auth: {
            user: 'zippy.rungo@mail.ru',
            pass: 'ZippyZippy2022'
        }
    });

    // send mail with defined transport object
    await transporter.sendMail({
        from: '"Zippy bot" <zippy.rungo@mail.ru>',
        to: email,
        subject: 'Автоматическое сообщение Zippy',
        text: 'Ваш пароль: ' + text,
        html: 'Ваш пароль: <b>'+text+'</b>'
    });
}
