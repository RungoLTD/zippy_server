const db = require("../db");

module.exports = async function (req, res) {
    const history = await db.mysqlQueryArray("SELECT chat_log.*, CONVERT_TZ(chat_log.created, '+0:00', users.timezone) as created_timezone FROM chat_log LEFT JOIN users ON users.id = chat_log.user_id WHERE users.access_token = ? ORDER BY id DESC LIMIT 100", [req.body.accessToken]) || [];
    let user = await db.mysqlQuery("SELECT * FROM users WHERE access_token = ?", [req.body.accessToken]);
    await db.mysqlUpdate("UPDATE chat_log SET readed = '1' WHERE user_id = ?", [user.id]);
    return res.status(200).json({ success : history != null, code: 1, data : history.reverse() })
}
