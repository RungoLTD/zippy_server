const db = require('../db');

module.exports = async function(req, res) {
    try {
        var user = await db.mysqlQuery('SELECT * FROM users WHERE access_token = ?', [req.body.accessToken]);

        let challengeId = req.body.challengeId;

        await db.mysqlUpdate("UPDATE week_challenges SET state = 1 WHERE user_id = ? AND challenge_id = ?", [user.id, challengeId]);

        await db.mysqlInsert('INSERT INTO week_challenges SET ?', {
            user_id: user.id,
            challenge_id: challengeId,
            state: 0,
        });

        return res.status(200).json({ success: true, code: 1 });
    } catch (error) {
        return res.status(200).json({ success: false, code: 2, error: error });
    }
};
