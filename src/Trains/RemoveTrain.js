const db = require("../db");


module.exports = async function (req, res) {    
    try {
        let user = await db.mysqlQuery("SELECT * FROM users WHERE access_token = ?", [req.body.accessToken]);

        // Обнуляем тренировки
        await db.mysqlUpdate("UPDATE user_trains SET end_day = ? WHERE end_day IS NULL AND user_id = ?", [new Date(), user.id]);

        return res.status(200).json({ success : true, code: 1 })
    } catch (error) {
        console.log(error);
        return res.status(200).json({ success : false, code: 2, error : "Внутренняя ошибка системы" })
    }
}