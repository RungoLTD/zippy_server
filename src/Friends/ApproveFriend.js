const db = require("../db");

module.exports = async function (req, res) {

    try {
        let user = await db.mysqlQuery("SELECT * FROM users WHERE access_token = ?", [req.body.accessToken]);
        let friendId = req.body.friendId;

        let relationship = await db.mysqlQuery("SELECT * FROM friends WHERE user_id = ? AND friend_id = ?", [friendId, user.id]);

        if (relationship == false) {
            throw "Заявки не существует";
        }

        await db.mysqlUpdate("UPDATE friends SET approved = ? WHERE id = ?", [true, relationship.id]);
        
        return res.status(200).json({ success : true })
    } catch (error) {
        console.log(error);
        return res.status(200).json({ success : false, error : error || "Внутренняя ошибка системы" })
    }
}