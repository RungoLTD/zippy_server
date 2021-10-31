const db = require("./db");


module.exports = async function (req, res) {
    let email = req.body.email;
    
    try {
        if (req.body.fcmToken != null){
            await db.mysqlUpdate("UPDATE users SET fcm = ? WHERE access_token = ?", [req.body.fcmToken, req.body.accessToken]);
            return res.status(200).json({ success : true, code: 1 });
        } else {
            return res.status(200).json({ success : false, code: 2, error : "Не правильно отправлен токен" })
        }
    } catch (error) {
        console.log(error);
        return res.status(200).json({ success : false, code: 2, error : "Внутренняя ошибка системы" })
    }

}