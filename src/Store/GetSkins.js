const db = require("../db");


module.exports = async function (req, res) {
    let user = await db.mysqlQuery("SELECT * FROM users WHERE access_token = ?", [req.body.accessToken]);

    // let appVersion = req.body.appVersion;

    // if (appVersion == undefined){
    //     return res.status(200).json({ success : false, error : "App version is missing" })
    // }

    // Получение всех скинов
    let skins = await db.mysqlQueryArray("SELECT * FROM skins");

    // Получение скинов юзера
    let purchasedSkins = await db.mysqlQueryArray("SELECT * FROM user_skins WHERE user_id = ?", [user.id])

    var result = new Array();

    skins.forEach(element => {
        var skin = element;
        skin.purchased = false;
        if (purchasedSkins != false){
            purchasedSkins.forEach(purchasedSkin => {
                if (skin.id == purchasedSkin.skin_id){
                    skin.purchased = true;
                }
            });
        }
        result.push(skin);
    });

    return res.status(200).json({ success : skins != null, data : result, code: 1 })
}