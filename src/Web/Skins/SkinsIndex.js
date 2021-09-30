const db = require("../../db");

module.exports = async function (req, res) {
    try {
        if(req.cookies.username == undefined){
            return res.redirect("/web/signin");
        } else {
            let skins = await db.mysqlQueryArray("SELECT * FROM skins LIMIT 25");
            console.log(skins);
            return res.render('skins/index', {
                skins: skins,
            });
        }
    } catch (error) {
        return res.status(200).json({ success : false, error : error || "Внутренняя ошибка системы" })
    }
}