const db = require("../../db");
const bcrypt = require("bcrypt");
const passport = require('passport');

module.exports = async function (req, res) {
    try {
        passport.authenticate('local', {
            successRedirect: '/home',
            failureRedirect: '/login',
            failureFlash: true,
          })
        return res.render('signup/index');
    } catch (error) { 
        console.log(error);
        return res.status(200).json({ success : false, error : error || "Внутренняя ошибка системы" })
    }
}