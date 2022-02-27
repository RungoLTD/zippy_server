const db = require("../db");
const AchievmentService = require('../AchievmentService');

module.exports = async function (req, res) {
    let user = await db.mysqlQuery("SELECT * FROM users WHERE access_token = ?", [req.body.accessToken]);

    let paymentIdentifier = req.body.paymentIdentifier;
    let transactionId = req.body.transactionId;

    // TODO : Validate transacton @transactionId

    var coinsCount = 0;
    var type = "IAP";

    switch (paymentIdentifier) {
        case "com.myrungo.ios.app.80.coins":
            coinsCount = 80;
            break;
        case "com.myrungo.ios.app.500.coins":
            coinsCount = 500;
            break;
        case "com.myrungo.ios.app.1200.coins":
            coinsCount = 1200;
            break;
        case "ads":
            coinsCount = 3;
            type = "ads"
            break;
        default:
            return res.status(200).json({ success : false, code: 2, error : "Неправильный идентификатор платежа" })
    }
    await db.mysqlInsert("INSERT INTO transactions SET ?", { user_id: user.id, operation: "+", type: type, detail_id: -1, amount : coinsCount })
    
    if (paymentIdentifier != "ads"){
        let result = await AchievmentServicePromise(user.id, 20);
        let transactions = await db.mysqlQuery('SELECT SUM(amount) FROM transactions WHERE user_id = ?', [user.id]);
        let user_mood = await db.mysqlQuery('SELECT mood FROM users WHERE id = ?', [user.id]);
        return res.status(200).json({ success : true, data: { fishcoins: transactions['SUM(amount)'], mood: user_mood.mood }, code: 1 })
    } else {
        let user_mood = await db.mysqlQuery('SELECT mood FROM users WHERE id = ?', [user.id]);
        let transactions = await db.mysqlQuery('SELECT SUM(amount) FROM transactions WHERE user_id = ?', [user.id]);
        return res.status(200).json({ success : true, data: { fishcoins: transactions['SUM(amount)'], mood: user_mood.mood }, code: 1 })
    }

        
    function AchievmentServicePromise(user_id, achievement_id){
        return new Promise((resolve, reject) => {
            resolve(AchievmentService(user_id, achievement_id))
        })
    }
    
        
}