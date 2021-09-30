const db = require("../db");
const AchievmentService = require("../AchievmentService");

// Mood from 0 to 9
module.exports = async function (userId, userTimeZone, moodLevel, isAfterTrain){
    // check mood avail in today

    let currentMood = await db.mysqlQuery("SELECT *, DATE(CONVERT_TZ(user_mood_log.created, '+0:00', ?)) as created_zime_zone FROM user_mood_log HAVING created_zime_zone = DATE(CONVERT_TZ(now(), '+0:00', ?)) AND user_id = ?", [userTimeZone, userTimeZone, userId]);

    if (isAfterTrain){
        if (currentMood) {
            await db.mysqlUpdate("UPDATE user_mood_log SET mood2 = ? WHERE id = ?", [moodLevel, currentMood.id]);
        }else{
            await db.mysqlInsert("INSERT INTO user_mood_log SET ?", {
                user_id : userId,
                mood1 : null,
                mood2 : moodLevel
            });
        }
    }else{
        let currentMood = await db.mysqlQuery("SELECT *, DATE(CONVERT_TZ(user_mood_log.created, '+0:00', ?)) as created_zime_zone FROM user_mood_log HAVING created_zime_zone = DATE(CONVERT_TZ(now(), '+0:00', ?)) AND user_id = ?", [userTimeZone, userTimeZone, userId]);

        if (currentMood) {
            await db.mysqlUpdate("UPDATE user_mood_log SET mood1 = ?, count = count + 1 WHERE id = ?", [moodLevel, currentMood.id]);

            let updatedCount = db.mysqlQuery("SELECT count FROM user_mood_log WHERE id = ?", [currentMood.id]);
            if (updatedCount.count > 3) {
                AchievmentService(userId, 12);
            }
            if (updatedCount.count > 7) {
                AchievmentService(userId, 13);
            }
            if (updatedCount.count > 30) {
                AchievmentService(userId, 14);
            }

        }else{
            await db.mysqlInsert("INSERT INTO user_mood_log SET ?", {
                user_id : userId,
                mood1 : moodLevel,
                mood2 : null,
                count : 1
            });
            AchievmentService(userId, 11);
        }
    }
    
}