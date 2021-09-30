const db = require("../../db");
const bcrypt = require("bcrypt");

module.exports = async function (req, res) {
    try {
        return res.render('signin/index');
    } catch (error) {
        return res.status(200).json({ success : false, error : error || "Внутренняя ошибка системы" })
    }
}