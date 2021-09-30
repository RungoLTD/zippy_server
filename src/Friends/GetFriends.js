const db = require("../db");

module.exports = async function (req, res) {
    try {
        let user = await db.mysqlQuery("SELECT * FROM users WHERE access_token = ?", [req.body.accessToken]);
        let friends = await db.mysqlQueryArray("SELECT users.id, users.name, users.avatar, users.mood FROM friends LEFT JOIN users ON (friends.user_id = users.id OR friends.friend_id = users.id) WHERE (friends.friend_id = ? OR friends.user_id = ?) AND friends.approved = '1' AND users.id != ? GROUP BY users.id", [user.id, user.id, user.id]) || [];
        let notApprovedFriends = await db.mysqlQueryArray("SELECT users.id, users.name, users.avatar, users.mood FROM friends LEFT JOIN users ON friends.user_id = users.id WHERE friends.friend_id = ? AND friends.approved = 0", [user.id]) || [];
        return res.status(200).json({ success : true, data : { approved : friends, notApproved : notApprovedFriends }});
    } catch (error) {
        return res.status(200).json({ success : false, error : error || "Внутренняя ошибка системы" })
    }
    
}