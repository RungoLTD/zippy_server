const db = require("../../db");

module.exports = async function (req, res) {
    try {
        if(req.cookies.username == undefined){
            return res.redirect("/web/signin");
        } else {
            let statistics = await db.mysqlQueryArray("SELECT * FROM statistics ORDER BY `id` DESC LIMIT 25");
            if(statistics != false){
                for (const statistic of statistics){
                    let user = await db.mysqlQuery("SELECT name FROM users WHERE id = ?", [statistic.user_id]);
                    // console.log(user.name);
                    statistic.user_name = user == false ? statistic.user_id : user.name;
                    statistic.meters = statistic.meters * 0.001;
                    statistic.time = toHHMMSS(statistic.time);
                }
            }
            // console.log(statistics); 
            return res.render('statistics/index', {
                statistics: statistics,
            });
        }
    } catch (error) {
        console.log(error)
        return res.status(200).json({ success : false, error : error || "Внутренняя ошибка системы" })
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