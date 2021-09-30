const db = require("./db");
var CryptoJS = require("crypto-js");
var EmailService = require("./EmailService");

function getSHA256(key) {
    return CryptoJS.SHA256(key).toString();
}

function getPW(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

module.exports = async function (req, res) {
    let email = req.body.email;
    
    try {

        let user = await db.mysqlQuery("SELECT * FROM users WHERE auth_type = ? AND email = ?", ['email', email]);

        if (user){
            // генерим пароль
            let pw = getPW(8);

            // отправляем пароль по email
            EmailService.sendEmail(email, pw);

            let pwsha256 = getSHA256(pw);
            
            await db.mysqlUpdate("UPDATE users SET social_user_id = ? WHERE email = ?", [pwsha256, email]);
            return res.status(200).json({ success : true, code: 1 });
        } else {
            return res.status(200).json({ success : false, code: 1, error : "Пользователь с данным email не существует." });
        }
    } catch (error) {
        console.log(error);
        return res.status(200).json({ success : false, code: 2, error : "Внутренняя ошибка системы" })
    }

}