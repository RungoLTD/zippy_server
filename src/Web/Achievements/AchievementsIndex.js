const db = require("../../db");

module.exports = async function (req, res) {
    try {
        if(req.cookies.username == undefined){
            return res.redirect("/web/signin");
        } else {
            let achievements = await db.mysqlQueryArray("SELECT * FROM achievements ORDER BY `id` DESC LIMIT 25");
            
            return res.render('achievements/index', {
                achievements: achievements,
            }); 
        }
    } catch (error) {
        return res.status(200).json({ success : false, error : error || "Внутренняя ошибка системы" })
    }
}