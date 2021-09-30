const db = require("../../db");

module.exports = async function (req, res) {
    try {
        return res.render('index/index');
    } catch (error) {
        console.log(error);
        return res.status(200).json({ success : false, error : error || "Внутренняя ошибка системы" })
    }
}