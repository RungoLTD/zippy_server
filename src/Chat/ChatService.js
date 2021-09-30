const db = require("../db");
const NotificationService = require("../NotificationService");

// Mood from 0 to 9
module.exports = async function (userId, message, type, notify){
    
    var message = message;

    let textMessage = {
        "ru" : message,
        "en" : message
    };

    await db.mysqlInsert("INSERT INTO chat_log SET ?", {
        user_id     : userId,
        message     : message,
        from_cat    : true,
        type        : type,
        readed      : false
    });

    NotificationService.sendPush(userId, textMessage);

}