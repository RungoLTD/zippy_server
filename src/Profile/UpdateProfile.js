const db = require('../db');

module.exports = async function (req, res) {
    let name = req.body.name;
    let avatar = req.body.avatar;
    let moodNotifyTime = req.body.moodNotifyTime;
    let height = req.body.height;
    let weight = req.body.weight;
    let trophyName = req.body.trophyName;
    let rebukeName = req.body.rebukeName;
    let lang = req.body.lang || 'ru';

    try {
        let result = await db.mysqlUpdate(
            'UPDATE users SET name = ?, avatar = ?, mood_notify_time = ?, height = ?, weight = ?, trophy_name = ?, rebuke_name = ?, lang = ? WHERE access_token = ?',
            [name, avatar, moodNotifyTime, height, weight, trophyName, rebukeName, lang, req.body.accessToken],
        );
        return res.status(200).json({ success: result != null });
    } catch (error) {
        console.log(error);
        return res.status(200).json({ success: false, error: 'Внутренняя ошибка системы' });
    }
};
