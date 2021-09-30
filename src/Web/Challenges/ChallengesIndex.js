const db = require("../../db");

module.exports = async function (req, res) {
    try {
        if(req.cookies.username == undefined){
            return res.redirect("/web/signin");
        } else {
            let challenges = await db.mysqlQueryArray("SELECT * FROM challenges ORDER BY `id` DESC LIMIT 25");
            if(challenges != false){
                for (const challenge of challenges){
                    challenge.distance = challenge.distance * 0.001;
                    challenge.durationTime = toHHMMSS(challenge.durationTime); 
                }
            }
            console.log(challenges);
            return res.render('challenges/index', {
                challenges: challenges,
            });
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