const db = require("../db");
const fs = require('fs');


module.exports = async function (req, res) {
    try {
        let user = await db.mysqlQuery("SELECT * FROM users WHERE access_token = ?", [req.body.accessToken]);
        let userSkin = user.skin;

        let animationRaw = fs.readFileSync(__dirname + "/../../config/animation.json");
        let animation = JSON.parse(animationRaw);  
        
        // TODO: Set skin for user
        
        return res.status(200).json({ success : user != null, code: 1, data : animation })
    } catch (error) {
        console.log(error);
        return res.status(200).json({ success: false, code: 2, error: 'Внутренняя ошибка системы' });
    }
}