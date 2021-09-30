const db = require("../../db");
const path = require("path");

module.exports = async function (req, res) {
    try {
        if(req.cookies.username == undefined){
            return res.redirect("/web/signin");
        } else {
            var search = req.query.search;
            var page = req.query.page;
            let user_list = null;
            let user_count = 0;
            const limit = 25;
            if(search != undefined){
                var query = "";
                if(page != undefined){
                    var offset = (page - 1) * limit;
                    query = "SELECT * FROM users WHERE `name` LIKE ? ORDER BY `id` DESC LIMIT "+offset+","+limit;
                } else
                    query = "SELECT * FROM users WHERE `name` LIKE ? ORDER BY `id` DESC LIMIT "+limit;
                user_list = await db.mysqlQueryArray(query,['%'+search+'%']);
                let user_count_query = await db.mysqlQuery("SELECT COUNT(*) count FROM users WHERE `name` LIKE ?",['%'+search+'%']);
                user_count = user_count_query.count
            } else {
                var query = "";
                if(page != undefined){
                    var offset = (page - 1) * limit;
                    query = "SELECT * FROM users ORDER BY `id` DESC LIMIT "+offset+","+limit;
                } else
                    query = "SELECT * FROM users ORDER BY `id` DESC LIMIT "+limit;
                user_list = await db.mysqlQueryArray(query);
                let user_count_query = await db.mysqlQuery("SELECT COUNT(*) count FROM users");
                user_count = user_count_query.count;
            }
            let pagination_len = Math.floor(user_count/limit) + 1;
            return res.render('users/index', {
                user_list: user_list,
                pagination_len: pagination_len,
            });
        }
    } catch (error) {
        return res.status(200).json({ success : false, error : error || "Внутренняя ошибка системы" })
    }
}