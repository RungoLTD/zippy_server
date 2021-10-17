const db = require("../../db");
const moment = require("moment");

module.exports = async function (req, res) {
    try {
        if(req.cookies.username == undefined){
            return res.redirect("/web/signin");
        } else {
            if(req.method == "POST"){
                let id = req.body.id;
                let username = req.body.name;
                let skin = req.body.skin;
                let email = req.body.email;
                let avatar = req.body.avatar;
                let mood = req.body.mood;
                let step_count_normal = req.body.step_count_normal;
                let trophy_name = req.body.trophy_name;
                let rebuke_name = req.body.rebuke_name;
                let weight = req.body.weight;
                let height = req.body.height;
                console.log(id);
                if(username != undefined && skin != undefined && email != undefined && avatar != undefined 
                    && mood != undefined && step_count_normal != undefined && trophy_name != undefined && rebuke_name != undefined
                    && weight != undefined && height != undefined){
                        try{
                            await db.mysqlUpdate("UPDATE users SET name = ?, skin = ?, email = ?, avatar = ?, mood = ?, step_count_normal = ?, trophy_name = ?, rebuke_name = ?, weight = ?, height = ? WHERE id = ?", 
                            [username, skin, email, avatar, mood, step_count_normal, trophy_name, rebuke_name, weight, height, id]);
                        } catch (error){
                            return res.status(200).json({ success : false, error : error || "Ошибка при сохранении" })
                        }
                        return res.status(200).redirect('/web/users/view?id='+id);
                    } else {
                        return res.status(200).json({ success : false, error: "Ошибка при отправке post запроса" })
                    }
            } else {
                var id = req.query.id;
                if(id != undefined){
                    let user_data = await db.mysqlQuery("SELECT * FROM users WHERE id = ?", [id]);
                    let skins = await db.mysqlQueryArray("SELECT id, title FROM skins");
                    // console.log(user_data);
                    if(user_data != false){
                        user_data.last_active_date = moment(user_data.last_active_date).format('DD.MM.YYYY HH:mm')
                        user_data.created = moment(user_data.created).format('DD.MM.YYYY HH:mm')
                        return res.render('users/update', {
                            user_data: user_data,
                            skins: skins
                        });
                    }
                }
                return res.status(200).redirect('/web/users');
            }
        }
    } catch (error) {
        console.log(error)
        return res.status(200).json({ success : false, error : error || "Внутренняя ошибка системы" })
    }
}