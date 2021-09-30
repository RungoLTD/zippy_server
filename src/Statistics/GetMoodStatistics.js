const db = require("../db");

module.exports = async function (req, res) {
    try {
        let user = await db.mysqlQuery("SELECT * FROM users WHERE access_token = ?", [req.body.accessToken]);

        // Получаем статистику в зависимости от месяца
        let month = req.body.month + "%";

        let moods = await db.mysqlQueryArray("SELECT * FROM user_mood_log WHERE created LIKE ? AND user_id = ? ORDER BY created ASC", [month, user.id]);
        return res.status(200).json({ success : true, data : moods });
    } catch (error) {
        console.log(error);
        return res.status(200).json({ success : false, error : "Внутренняя ошибка системы" })
    }

}