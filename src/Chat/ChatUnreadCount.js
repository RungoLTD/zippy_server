const db = require("../db");

module.exports = async function (req, res) {
    let user = await db.mysqlQuery("SELECT * FROM users WHERE access_token = ?", [req.body.accessToken]);
    let countObj = await db.mysqlQuery("SELECT COUNT(*) as unreadCount FROM chat_log WHERE user_id = ? AND readed = '0'", [user.id]);

    var count = 0;
    if (countObj) {
        count = countObj.unreadCount;
        if (count > 99){
            count = 99
        }
    }

    return res.status(200).json({ success : count != null, data : count });
}