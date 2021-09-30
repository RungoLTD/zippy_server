const db = require("../src/db.js");
const NotificationService = require('./NotificationService');

module.exports.notifySetMood = () => {
    return new Promise(async (resolve, reject) => {

        let users = await db.mysqlQueryArray("SELECT MAX(user_trains.id) AS last_train_id, MAX(user_trains.train_id) as train_id, user_trains.user_id, users.* FROM user_trains LEFT JOIN users ON user_trains.user_id = users.id WHERE end_day IS NULL AND users.id IS NOT NULL AND (DATE(start_day) < CURDATE() - INTERVAL 5 DAY) GROUP BY user_id", []);

        // Если пользователь очень круто тренируется
        let users = await db.mysqlQueryArray("SELECT id, name, DATE(CONVERT_TZ(users.mood_notify_sended, '+0:00', users.timezone)) as notified_with_timezone, DATE(CONVERT_TZ(now(), '+0:00', users.timezone)) as server_timezone FROM users HAVING server_timezone > notified_with_timezone");

        for (let index = 0; index < users.length; index++) {
            const user = users[index];

            let textMessage = {
                "ru" : user.name + ", давай сменим тип тренировки.",
                "en" : user.name + ", lets change train type."
            };

            await db.mysqlInsert("INSERT INTO chat_log SET ?", {
                user_id     : user.id,
                message     : "Введи настроение",
                from_cat    : true,
                type        : "changeMultiplayer",
                readed      : false
            });

            NotificationService.sendPush(user.id, textMessage);
        }
        
        await db.mysqlUpdate("UPDATE users SET mood_updated_date = now() WHERE DATE(CONVERT_TZ(users.mood_notify_sended, '+0:00', users.timezone)) < DATE(CONVERT_TZ(now(), '+0:00', users.timezone))", []);
    })
}
