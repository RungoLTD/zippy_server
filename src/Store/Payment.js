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
            coinsCount = 10;
            type = "ads"
            break;
        default:
            return res.status(200).json({ success : false, error : "Неправильный идентификатор платежа" })
    }
    await db.mysqlInsert("INSERT INTO transactions SET ?", { user_id: user.id, operation: "+", type: type, detail_id: -1, amount : coinsCount })

    AchievmentService(user.id, 20);
    let transactions = await db.mysqlQuery('SELECT SUM(amount) FROM transactions WHERE user_id = ?', [user.id]);
        
    return res.status(200).json({ success : true, data: { fishcoins: transactions['SUM(amount)'] } })
}