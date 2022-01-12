const db = require("../../db");
const moment = require("moment");
 
module.exports = async function (req, res) {
    try {
        if(req.cookies.username == undefined){
            return res.redirect("/web/signin");
        } else {
            var page = req.query.page;
            let user_train_count = 0;
            const limit = 25;

            var query = "";
            if(page != undefined){
                var offset = (page - 1) * limit;
                query = "SELECT * FROM user_trains ORDER BY `id` DESC LIMIT "+offset+","+limit;
            } else {
                query = "SELECT * FROM user_trains ORDER BY `id` DESC LIMIT "+limit;
                page = 1;
            }
            let user_trains = await db.mysqlQueryArray(query);
            let user_train_count_query = await db.mysqlQuery("SELECT COUNT(*) count FROM user_trains");
            user_train_count = user_train_count_query.count;

            if(user_trains != false){
                for (const user_train of user_trains){ 
                    let user = await db.mysqlQuery("SELECT name FROM users WHERE id = ?", [user_train.user_id]); 
                    user_train.start_day = moment(user_train.start_day).format('DD.MM.YYYY HH:mm');
                    if(user_train.end_day != null)
                        user_train.end_day = moment(user_train.end_day).format('DD.MM.YYYY HH:mm');
                    else
                        user_train.end_day = "Тренировка не закончился"
                    user_train.user_name = user == false ? user_train.user_id : user.name;
                }
            }
            let pagination_len = Math.floor(user_train_count/limit) + 1;
            return res.render('trains/index', {
                user_trains: user_trains,
                pagination_len: pagination_len,
                page: page,
            });
        }
    } catch (error) {
        return res.status(200).json({ success : false, error : error || "Внутренняя ошибка системы" })
    }
}