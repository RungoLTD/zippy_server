const db = require("../../db");
const moment = require("moment");

module.exports = async function (req, res) {
    try {
        if(req.cookies.username == undefined){
            return res.redirect("/web/signin");
        } else {
            var arr_dates = [];
            var arr_dates1 = [];
            for (var i = 13; i >= 0; i--) {
                arr_dates.push(moment().subtract(i, "days").format('Y-MM-DD'));
                arr_dates1.push(moment().subtract(i, "days").format('D MMM'));
            }
            var arr_install_clients_week = [];
            var arr_active_clients_week = [];

            for (const date of arr_dates){
                let created1 = date + " 00:00:00";
                let created2 = date + " 23:59:59";
                let users_installs = await db.mysqlQuery("SELECT COUNT(id) as count FROM users WHERE created >= ? AND created <= ?", [ created1, created2]);
                
                let users_active = await db.mysqlQuery("SELECT COUNT(id) as count FROM users WHERE last_active_date >= ? AND last_active_date <= ?", [ created1, created2]);
                
                arr_install_clients_week.push(users_installs.count)
                arr_active_clients_week.push(users_active.count)
            }  
            return res.render('index/index', {
                arr_dates: arr_dates1,
                arr_install_clients_week: arr_install_clients_week,
                arr_active_clients_week: arr_active_clients_week
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(200).json({ success : false, error : error || "Внутренняя ошибка системы" })
    }
}