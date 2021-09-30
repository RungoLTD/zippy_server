const db = require("../../db");

module.exports = async function (req, res) {
    try {
        if(req.cookies.username == undefined){
            return res.redirect("/web/signin");
        } else {
            let fishcoins = await db.mysqlQueryArray("SELECT * FROM fishcoins ORDER BY `id` DESC LIMIT 25");
            console.log(fishcoins);
            return res.render('fishcoins/index', {
                fishcoins: fishcoins,
            }); 
        }
    } catch (error) {
        return res.status(200).json({ success : false, error : error || "Внутренняя ошибка системы" })
    }
}