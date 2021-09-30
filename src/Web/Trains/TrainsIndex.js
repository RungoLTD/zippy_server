const db = require("../../db");
const moment = require("moment");
 
module.exports = async function (req, res) {
    try {
        if(req.cookies.username == undefined){
            return res.redirect("/web/signin");
        } else {
            let user_trains = await db.mysqlQueryArray("SELECT * FROM user_trains ORDER BY `id` DESC LIMIT 25");
            // let friends = await db.mysqlQueryArray("SELECT users.id, users.name, users.avatar, users.mood FROM friends LEFT JOIN users ON (friends.user_id = users.id OR friends.friend_id = users.id) WHERE (friends.friend_id = ? OR friends.user_id = ?) AND friends.approved = '1' AND users.id != ? GROUP BY users.id", [user.id, user.id, user.id]) || [];
            // let notApprovedFriends = await db.mysqlQueryArray("SELECT users.id, users.name, users.avatar, users.mood FROM friends LEFT JOIN users ON friends.user_id = users.id WHERE friends.friend_id = ? AND friends.approved = 0", [user.id]) || [];
            if(user_trains != false){
                for (const user_train of user_trains){ 
                    let user = await db.mysqlQuery("SELECT name FROM users WHERE id = ?", [user_train.user_id]); 
                    user_train.start_day = moment(user_train.start_day).format('DD.MM.YYYY HH:mm');
                    user_train.end_day = moment(user_train.end_day).format('DD.MM.YYYY HH:mm');
                    user_train.user_name = user == false ? user_train.user_id : user.name;
                }
            }
            return res.render('trains/index', {
                user_trains: user_trains,
            });
        }
    } catch (error) {
        return res.status(200).json({ success : false, error : error || "Внутренняя ошибка системы" })
    }
}