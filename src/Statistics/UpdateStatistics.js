const db = require("../db");
const moodLogger = require("../Chat/MoodLogger");
const AchievmentService = require("../AchievmentService");

module.exports = async function (req, res) {
    try {
        let statisticId = req.body.statisticId;

        console.log(req.body);

        let user = await db.mysqlQuery("SELECT * FROM users WHERE access_token = ?", [req.body.accessToken]);

        let mood = req.body.mood;
        moodLogger(user.id, user.timezone, mood, true);
        trainName = req.body.trainName;

        if (trainName.length == 0) {
            trainName = null;
        }

        await db.mysqlUpdate("UPDATE statistics SET name = ? WHERE id = ?", [trainName, statisticId]);

        if (req.body.isSharedInSociety){
            AchievmentService(user.id, 18);
        }
        
        return res.status(200).json({ success : true, code: 1 });
    } catch (error) {
        console.log(error);
        return res.status(200).json({ success : false, code: 2, error : "Внутренняя ошибка системы" })
    }

}