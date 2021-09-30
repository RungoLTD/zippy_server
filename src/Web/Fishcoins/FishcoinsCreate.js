const db = require("../../db");

module.exports = async function (req, res) {
    try {
        if(req.cookies.username == undefined){
            return res.redirect("/web/signin");
        } else {
            const fishcoin = req.body.fishcoin;
            const fishcoin_money = req.body.fishcoin_money;
            const fishcoin_type = req.body.fishcoin_type;
            await db.mysqlInsert('INSERT INTO fishcoins SET ?', {
                fishcoin: fishcoin, 
                fishcoin_money: fishcoin_money,
                fishcoin_type: fishcoin_type
            });
            return res.redirect('/web/fishcoins');
        }
    } catch (error) {
        return res.status(200).json({ success : false, error : error || "Внутренняя ошибка системы" })
    }
}