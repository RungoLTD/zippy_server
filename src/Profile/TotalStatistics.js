const db = require("../db");


module.exports = async function (req, res) {
    var interval = req.body.interval;

    var statistics = null;

    let user = await db.mysqlQuery("SELECT * FROM users WHERE access_token = ?", [req.body.accessToken]);
    
    switch (interval) {
        case "week":
            interval = 7;
            break;
        case "month":
            interval = 30;
            break;
        case "year":
            interval = 365;
            break;
        default:
            interval = 7;
            break;
    }

    var minDate = new Date();
    minDate.setDate(minDate.getDate() - interval);
    minDate = minDate.toISOString().slice(0, 19).replace('T', ' ');

    statistics = await db.mysqlQuery("SELECT SUM(meters) as distance, COUNT(id) as trainCount, AVG(avgSpeed) as avgSpeed, AVG(avgPace) as avgPace FROM statistics WHERE user_id = ? AND created > ?", [user.id, minDate]);
    return res.status(200).json({ success : statistics != null, data : statistics })
}