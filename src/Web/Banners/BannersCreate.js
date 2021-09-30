const db = require("../../db");

module.exports = async function (req, res) {
    try {
        if(req.cookies.username == undefined){
            return res.redirect("/web/signin");
        } else {
            const name = req.body.name;
            const html = req.body.html;
            const show_date_start = req.body.show_date_start;
            const show_date_end = req.body.show_date_end;
            await db.mysqlInsert('INSERT INTO banners SET ?', {
                name: name, 
                html_code: html,
                show_date_start: show_date_start,
                show_date_end: show_date_end
            });
            return res.redirect('/web/banners');
        }
    } catch (error) {
        return res.status(200).json({ success : false, error : error || "Внутренняя ошибка системы" })
    }
}