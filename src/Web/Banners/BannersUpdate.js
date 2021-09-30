const db = require("../../db");

module.exports = async function (req, res) {
    try {
        if(req.cookies.username == undefined){
            return res.redirect("/web/signin");
        } else {
            const id = req.body.fishcoin_id;
            const fishcoin = req.body.fishcoin;
            const fishcoin_money = req.body.fishcoin_money;
            const fishcoin_type = req.body.fishcoin_type;
            let result = await db.mysqlUpdate(
                'UPDATE fishcoins SET fishcoin = ?, fishcoin_money = ?, fishcoin_type = ? WHERE id = ?',
                [fishcoin, fishcoin_money, fishcoin_type, id],
            ); 
            if( result != null)
                return res.redirect('/web/fishcoins');
        }
    } catch (error) {
        return res.status(200).json({ success : false, error : error || "Внутренняя ошибка системы" })
    }
}