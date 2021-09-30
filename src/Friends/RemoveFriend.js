const db = require("../db");

module.exports = async function (req, res) {

    try {

        let friendId = req.body.friendId;
        let user = await db.mysqlQuery("SELECT * FROM users WHERE access_token = ?", [req.body.accessToken]);

        console.log(user.id);
        console.log(friendId);
        await db.mysqlQuery("DELETE FROM friends WHERE (friend_id = ? AND user_id = ?) OR (friend_id = ? AND user_id = ?)", [user.id, friendId, friendId, user.id]);
        
        return res.status(200).json({ success : true })
    } catch (error) {
        console.log(error);
        return res.status(200).json({ success : false, error : error || "Внутренняя ошибка системы" })
    }
}