const db = require("../db");


module.exports = async function (req, res) {
    try {
        let timezone = req.body.timezone;

        let result = await db.mysqlUpdate('UPDATE users SET timezone = ? WHERE access_token = ?',[timezone, req.body.accessToken])
        return res.status(200).json({ success : result != null, code: 1 })
    } catch (error) {
        console.log(error);
        return res.status(200).json({ success : false, code: 2, error : "Внутренняя ошибка системы" })
    }

}