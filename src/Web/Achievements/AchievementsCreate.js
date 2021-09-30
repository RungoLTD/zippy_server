const db = require("../../db");

module.exports = async function (req, res) {
    try {
        if(req.cookies.username == undefined){
            return res.redirect("/web/signin");
        } else {
            const name_ru = req.body.name_ru;
            const description_ru = req.body.description_ru;
            const name_en = req.body.name_en;
            const description_en = req.body.description_en;
            const cat_mood_append = req.body.cat_mood_append;
            const coins_count = req.body.coins_count;
            const color = req.body.color;
            await db.mysqlInsert('INSERT INTO achievements SET ?', {
                title_ru: name_ru,
                description_ru: description_ru,
                title_en: name_en,
                description_en: description_en,
                cat_mood_append: cat_mood_append,
                coins_count: coins_count,
                color: color
            });
            return res.redirect('/web/achievements');
        }
    } catch (error) {
        return res.status(200).json({ success : false, error : error || "Внутренняя ошибка системы" })
    }
}