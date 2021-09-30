const db = require("../../db");
const moment = require("moment");

module.exports = async function (req, res) {
    try {
        if(req.cookies.username == undefined){
            return res.redirect("/web/signin");
        } else { 
            let banners = await db.mysqlQueryArray("SELECT * FROM banners ORDER BY `id` DESC LIMIT 25");
            if(banners != false){
                for (const banner of banners){
                    banner.show_date_start = moment(banner.show_date_start).format('DD.MM.YYYY HH:mm');
                    banner.show_date_end = moment(banner.show_date_end).format('DD.MM.YYYY HH:mm');
                } 
            }
            console.log(banners);
            return res.render('banners/index', {
                banners: banners,
            });
        }
    } catch (error) {
        return res.status(200).json({ success : false, error : error || "Внутренняя ошибка системы" })
    }
}