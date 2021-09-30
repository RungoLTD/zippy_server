const db = require("../../db");
const moment = require("moment");

module.exports = async function (req, res) {
    try {
        if(req.cookies.username == undefined){
            return res.redirect("/web/signin");
        } else {
            var id = req.query.id;
            if(id != undefined){
                let statistic = await db.mysqlQuery("SELECT * FROM statistics WHERE id = ?", [id]);
                if(statistic != false){
                    let user = await db.mysqlQuery("SELECT name FROM users WHERE id = ?", [statistic.user_id]);
                    console.log(user.name);
                    statistic.user_name = user == false ? statistic.user_id : user.name;
                    statistic.meters = statistic.meters * 0.001;
                    statistic.time = toHHMMSS(statistic.time);
                    statistic.created = moment(statistic.created).format('DD.MM.YYYY HH:mm');
                    return res.render('statistics/view', {
                        statistic: statistic,
                    });
                } 
            }
            return res.status(200).redirect('/web/statistics');
        }
    } catch (error) {
        console.log(error);
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