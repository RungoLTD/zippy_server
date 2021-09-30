const db = require("../../db");
const bcrypt = require("bcrypt");

module.exports = async function (req, res) {
    try {
        const username = req.body.username;
        const password = req.body.password;
        let user_data = await db.mysqlQuery("SELECT * FROM sites_users WHERE username = ?", [username]);
        console.log(user_data)
        if(user_data){ 
            const validPassword = await bcrypt.compare(password, user_data.hash);
            if(validPassword){
                res.cookie('username', username);
                // {
                    // maxAge: 3600 * 24,
                    // secure: true,
                //   } 
                return res.redirect("/web/index");
            } else
                return res.status(400).json({ error: "Invalid Password" });
        } else
            return res.status(400).json({ error: "User not found" });
    } catch (error) {
        return res.status(200).json({ success : false, error : error || "Внутренняя ошибка системы" })
    }
}