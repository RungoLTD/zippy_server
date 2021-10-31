const db = require("../../db");
const moment = require("moment");

module.exports = async function (req, res) {
    try {
        var arr_dates = [];
        var arr_dates1 = [];
        for (var i = 13; i != 0; i--) {
            arr_dates.push(moment().subtract(i, "days").format('Y-MM-DD'));
            arr_dates1.push(moment().subtract(i, "days").format('D'));
        }
        console.log(arr_dates);
        
        var arr_clients_week = [];

        for (const date of arr_dates){
            let users = await db.mysqlQuery("SELECT COUNT(id) as count FROM users WHERE created >= ? AND created <= ?", [ date +  " 00:00:00", date +  " 23:59:59"]);
            console.log(users.count);
            arr_clients_week.push(users.count)
        }  
        console.log(arr_dates1);
        return res.render('index/index', {
            arr_dates: arr_dates1,
            arr_clients_week: arr_clients_week,
        });
    } catch (error) {
        console.log(error);
        return res.status(200).json({ success : false, error : error || "Внутренняя ошибка системы" })
    }
}