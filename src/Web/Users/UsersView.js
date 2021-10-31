const db = require("../../db");
const moment = require("moment");

module.exports = async function (req, res) {
    try {
        if(req.cookies.username == undefined){
            return res.redirect("/web/signin");
        } else {
            var id = req.query.id;
            if(id != undefined){
                let user_data = await db.mysqlQuery("SELECT * FROM users WHERE id = ?", [id]);
                console.log(user_data);
                if(user_data != false){
                    user_data.last_active_date = moment(user_data.last_active_date).format('DD.MM.YYYY HH:mm');
                    user_data.created = moment(user_data.created).format('DD.MM.YYYY HH:mm');
                    let transactions = await db.mysqlQuery('SELECT SUM(amount) FROM transactions WHERE user_id = ?', [user_data.id]);
                    user_data.coins = transactions['SUM(amount)'];
                    return res.render('users/view', {
                        user_data: user_data,
                    });
                }
                console.log(user_data);
            }
            return res.status(200).redirect('/web/users');
        }
    } catch (error) {
        console.log(error)
        return res.status(200).json({ success : false, error : error || "Внутренняя ошибка системы" })
    }
}