const db = require("../db");

module.exports = async function (req, res) {
    let user = await db.mysqlQuery("SELECT * FROM users WHERE access_token = ?", [req.body.accessToken]);

    let skinIdentifier = req.body.skinIdentifier;

    // Получаем скин
    let skin = await db.mysqlQuery("SELECT * FROM skins WHERE id = ?", [skinIdentifier]);

    if (skin == false){
        return res.status(200).json({ success : false, error : "Скин не существует" })
    }

    // Проверка покупал ли юзер сет
    let isPurchased = await db.mysqlQuery("SELECT * FROM user_skins WHERE user_id = ? AND skin_id = ?", [user.id, skin.id]);

    if (isPurchased == false){
        return res.status(200).json({ success : false, error : "Вы не покупали данный скин" })
    }else{
        // Make transaction
        let result = await db.mysqlUpdate('UPDATE users SET skin = ? WHERE id = ?', [skin.id, user.id])
        return res.status(200).json({ success : result != null })
    }
}