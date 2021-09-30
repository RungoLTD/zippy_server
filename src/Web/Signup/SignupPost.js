const db = require("../../db");
const bcrypt = require("bcrypt");

module.exports = async function (req, res) {
    try {
        if(req.cookies.username == undefined){
            return res.redirect("/web/signin");
        } else {
            console.log(req.body.username);
            const username = req.body.username;
            const password = req.body.password;
            const repeat_password = req.body.repeat_password;
            if(username != "" && password != "" && repeat_password != ""){
                if(password == repeat_password){
                    let result = await db.mysqlQuery('SELECT * FROM sites_users WHERE username = ?', [username]);
                    if (!result) {
                        const salt = await bcrypt.genSalt(10);
                        const password_hash = await bcrypt.hash(password, salt);
                        let newUserId = await db.mysqlInsert('INSERT INTO sites_users SET ?', {
                            username: username,
                            hash: password_hash
                        });
                        return res.redirect('/web/signin');
                    }
                }
            }
            return res.render('signup/index');
        }
    } catch (error) { 
        console.log(error);
        return res.status(200).json({ success : false, error : error || "Внутренняя ошибка системы" })
    }
}