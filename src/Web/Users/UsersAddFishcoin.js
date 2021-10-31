const db = require("../../db");
const moment = require("moment");

module.exports = async function (req, res) {
    try {
        if(req.cookies.username == undefined){
            return res.redirect("/web/signin");
        } else {
            var user_id = req.query.user_id;
            var fishcoin = req.query.fishcoin;
            if(user_id != undefined && fishcoin != undefined){
                let result1 = await db.mysqlInsert("INSERT INTO transactions SET ?", 
                { user_id: user_id, operation: "+", type: "web_add", detail_id: 0, amount : fishcoin });
            
            }
            return res.status(200).redirect('/web/users/view?id='+user_id);
        }
    } catch (error) {
        console.log(error)
        return res.status(200).json({ success : false, error : error || "Внутренняя ошибка системы" })
    }
}