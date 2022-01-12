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
            let current_month = moment().format('M')
            let current_year = moment().format('Y')

            var arr_month_in_year = [];
            var arr_km_in_month = [];
            for (var i = 1; i <= current_month; i++) {
                let created1 = current_year+"-"+String("0" + i).slice(-2)+"-01" + " 00:00:00";
                let asd = i + 1
                var created2 = ""
                if(asd > 12){
                    created2 = moment().subtract(1, "years").format('Y')+"-01-01" + " 00:00:00";
                } else {
                    created2 = current_year+"-"+String("0" + asd).slice(-2)+"-01" + " 00:00:00";
                }

                let statistics_month = await db.mysqlQuery("SELECT SUM(meters) as meters FROM statistics WHERE created >= ? AND created < ?", [ created1, created2]);
                
                arr_km_in_month.push(parseInt(statistics_month.meters) * 0.001)
                arr_month_in_year.push(moment(current_year+"-"+String("0" + i).slice(-2)+"-01").format('MMM'))
            }

            return res.render('index/index', {
                arr_dates: arr_dates1,
                arr_install_clients_week: arr_install_clients_week,
                arr_active_clients_week: arr_active_clients_week,
                arr_month_in_year: arr_month_in_year,
                arr_km_in_month: arr_km_in_month
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(200).json({ success : false, error : error || "Внутренняя ошибка системы" })
    }
}