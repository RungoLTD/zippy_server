const db = require("../../db");
const moment = require("moment");

module.exports = async function (req, res) {
    try {
        if(req.cookies.username == undefined){
            return res.redirect("/web/signin");
        } else {
            var page = req.query.page;
            let statistic_count = 0;
            const limit = 25;

            var query = "";
            if(page != undefined){
                var offset = (page - 1) * limit;
                query = "SELECT * FROM statistics ORDER BY `id` DESC LIMIT "+offset+","+limit;
            } else {
                query = "SELECT * FROM statistics ORDER BY `id` DESC LIMIT "+limit;
                page = 1;
            }
            let statistics = await db.mysqlQueryArray(query);
            let statistic_count_query = await db.mysqlQuery("SELECT COUNT(*) count FROM statistics");
            statistic_count = statistic_count_query.count;

            if(statistics != false){
                for (const statistic of statistics){
                    let user = await db.mysqlQuery("SELECT name FROM users WHERE id = ?", [statistic.user_id]);
                    // console.log(user.name);
                    statistic.user_name = user == false ? statistic.user_id : user.name;
                    statistic.meters = statistic.meters * 0.001;
                    statistic.time = toHHMMSS(statistic.time);
                    statistic.created = moment(statistic.created).format('DD.MM.YYYY HH:mm');
                }
            } 
            let pagination_len = Math.floor(statistic_count/limit) + 1;
            return res.render('statistics/index', {
                statistics: statistics,
                pagination_len: pagination_len,
                page: page,
            });
        }
    } catch (error) {
        console.log(error)
        return res.status(200).json({ success : false, error : error })
    }
}

var toHHMMSS = (secs) => {
    var sec_num = parseInt(secs, 10)
    var hours   = Math.floor(sec_num / 3600)
    var minutes = Math.floor(sec_num / 60) % 60
    var seconds = sec_num % 60

    return [hours,minutes,seconds]
        .map(v => v < 10 ? "0" + v : v)
        .filter((v,i) => v !== "00" || i > 0)
        .join(":")
}