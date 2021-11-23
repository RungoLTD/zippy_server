const db = require("../db");
const NotificationService = require("../NotificationService");

module.exports = async function (req, res) {
    try{
        let _user = await db.mysqlQuery("SELECT * FROM users WHERE access_token = ?", [req.body.accessToken]);

        setTimeout(function(user) {
            var message = "";
            var trophyТame = user.trophy_name || "Ты молодец";
            var variant = Math.floor(Math.random() * Math.floor(4));

            if (variant == 0) {
                message = trophyТame + ", что сегодня пошел на тренировку."
            } else if (variant == 1) {
                message = trophyТame + ", что начал сегодня тренироваться."
            } else if (variant == 2) {
                message = "Бег продлевает тебе жизнь! Ты молодец " + trophyТame + ", что начал тренироваться!"
            } else {
                message = "Здорово, ты начал тренироваться. Я рад за тебя!"
            }
            
            let textMessage = {
                "title": "Zippy",
                "body" : message,
            };

            await db.mysqlInsert("INSERT INTO chat_log SET ?", {
                user_id     : user.id,
                message     : message,
                from_cat    : true,
                type        : "message",
                readed      : false
            });
            if (user.fcm_token != null && user.fcm_token != "") {
                NotificationService.sendPush(user.fcm_token, textMessage);
            }
        }, 300000, _user);
        
        return res.status(200).json({ success : true, code: 1, error: ""})
    } catch (error) {
        console.log(error);
        return res.status(200).json({ success : false, code: 2, error : "Внутренняя ошибка системы"})
    }

}