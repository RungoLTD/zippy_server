const db = require("../db");
const NotificationService = require("../NotificationService");

module.exports = async function (req, res) {

    try {
        let user = await db.mysqlQuery("SELECT * FROM users WHERE access_token = ?", [req.body.accessToken]);
        let friend = await db.mysqlQuery("SELECT * FROM users WHERE id = ?", [req.body.friendId]);

        if (user.id == friend.id) {
            throw "Нельзя добавить в друзья себя";
        }

        if (friend == false) {
            throw "Пользователь не существует";
        }

        await db.mysqlInsert("INSERT INTO friends SET ?", {
            user_id : user.id,
            friend_id : friend.id,
            approved : false
        });
        
        let textMessage = {
            "ru" : user.name + " хочет добавить Вас в друзья",
            "en" : user.name + " want add you to friends"
        };
        NotificationService.sendPush(friend.id, textMessage);
        
        return res.status(200).json({ success : true })
    } catch (error) {
        console.log(error);
        return res.status(200).json({ success : false, error : error || "Внутренняя ошибка системы" })
    }
}