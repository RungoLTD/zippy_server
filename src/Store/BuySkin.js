const db = require("../db");
const ChatService = require("../Chat/ChatService");
const AchievmentService = require("../AchievmentService");

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

        // Get user balance
        let transactions = await db.mysqlQuery("SELECT SUM(amount) FROM transactions WHERE user_id = ?", [user.id]);
        let balance = parseInt(transactions["SUM(amount)"]);

        if (balance >= skin.cost){
            // Make transaction        
            let result1 = await db.mysqlInsert("INSERT INTO transactions SET ?", { user_id: user.id, operation: "-", type: "skin", detail_id: skin.id, amount : -1 * skin.cost });
            let result2 = await db.mysqlInsert("INSERT INTO user_skins SET ?", { user_id: user.id, skin_id: skin.id });
            await db.mysqlUpdate("UPDATE users SET mood = ? WHERE id = ?", [(user.mood + 5), user.id]);

            // Если у юзера это первый скин
            let purchasedSkinsCount = await db.mysqlQuery("SELECT COUNT(*) as count FROM user_skins WHERE user_id = ?", [user.id]);
            if (purchasedSkinsCount["count"] == 2){
                ChatService(user.id, "Спасибо за одежду, наконец я не голый!", "firstSkin", true);
            }else{
                if (purchasedSkinsCount["count"] == 3){
                    AchievmentService(user.id, 15)
                }
                if (purchasedSkinsCount["count"] == 6){
                    AchievmentService(user.id, 16)
                }
                if (purchasedSkinsCount["count"] == 11){
                    AchievmentService(user.id, 17)
                }

                ChatService(user.id, "Ура спасибо!!!Теперь я точно выгляжу круто!", "newSkin", true);
            }

            return res.status(200).json({ success : result1 && result2 })
        }else{
            return res.status(200).json({ success : false, error : "Недостаточно средств на счете" });
        }
        
    }else{
        return res.status(200).json({ success : false, error : "Вы уже покупали данный скин" });
    }
}