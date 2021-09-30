const db = require("../db");
const ChatService = require("../Chat/ChatService");
const AchievmentService = require("../AchievmentService");

module.exports = async function addStatistics(req, res) {
    let stepCount = req.body.stepCount;    

    try{
        let user = await db.mysqlQuery("SELECT * FROM users WHERE access_token = ?", [req.body.accessToken]);


        let todaySteps = await db.mysqlQuery("SELECT * FROM user_step_statistics WHERE user_id = ? AND DATE(created) = CURDATE()", [user.id]);

        if (todaySteps) {
            await db.mysqlUpdate("UPDATE user_step_statistics SET step_count = ? WHERE id = ?", [stepCount, todaySteps.id]);
        }else{
            await db.mysqlInsert("INSERT INTO user_step_statistics SET ?", {
                user_id : user.id,
                step_count : stepCount
            });
        }

        if (stepCount > 30000){
            AchievmentService(user.id, 10);
        } else if (stepCount > 20000){
            AchievmentService(user.id, 9);
        }else if (stepCount > 10000){
            AchievmentService(user.id, 8);
        }else if (stepCount > 3000){
            AchievmentService(user.id, 7);
        }
        
        return res.status(200).json({ success : true })
    } catch (error) {
        console.log(error);
        return res.status(200).json({ success : false, error : "Внутренняя ошибка системы" })
    }

}