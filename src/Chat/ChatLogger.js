const db = require("../db");


module.exports = async function (userId, message, fromCat){
    await db.mysqlInsert("INSERT INTO chat_log SET ?", {
        user_id     : userId,
        message     : message,
        from_cat    : fromCat,
        type        : "register"
    });
}