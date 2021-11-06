const db = require("../../db");
const moment = require("moment");
 
module.exports = async function (req, res) {
    try {
        if(req.cookies.username == undefined){
            return res.redirect("/web/signin");
        } else {
            var type = req.query.type;
            var page = req.query.page;
            let transaction_count = 0;
            let transactions = null;
            const limit = 25;

            if(type != undefined && type != ""){
                var query = "";
                if(page != undefined){
                    var offset = (page - 1) * limit;
                    query = "SELECT * FROM transactions WHERE `type` = ? ORDER BY `id` DESC LIMIT "+offset+","+limit;
                } else {
                    query = "SELECT * FROM transactions WHERE `type` = ? ORDER BY `id` DESC LIMIT "+limit;
                    page = 1;
                }
                transactions = await db.mysqlQueryArray(query,[type]);
                let transaction_count_query = await db.mysqlQuery("SELECT COUNT(*) count FROM transactions WHERE `type` = ?",[type]);
                transaction_count = transaction_count_query.count
            } else {
                var query = "";
                if(page != undefined){
                    var offset = (page - 1) * limit;
                    query = "SELECT * FROM transactions ORDER BY `id` DESC LIMIT "+offset+","+limit;
                } else {
                    query = "SELECT * FROM transactions ORDER BY `id` DESC LIMIT "+limit;
                    page = 1;
                }
                transactions = await db.mysqlQueryArray(query);
                let transaction_count_query = await db.mysqlQuery("SELECT COUNT(*) count FROM transactions");
                transaction_count = transaction_count_query.count;
            }
            // let transactions = await db.mysqlQueryArray("SELECT * FROM transactions ORDER BY `id` DESC LIMIT 25");
            
            if(transactions != false){
                for (const transaction of transactions){ 
                    let user = await db.mysqlQuery("SELECT name FROM users WHERE id = ?", [transaction.user_id]); 
                    transaction.created = moment(transaction.created).format('DD.MM.YYYY HH:mm');
                    transaction.user_name = user == false ? transaction.user_id : user.name;
                }
            } 
            let pagination_len = Math.floor(transaction_count/limit) + 1;
            return res.render('transactions/index', {
                transactions: transactions,
                pagination_len: pagination_len,
                page: page,
            });
        }
    } catch (error) {
        return res.status(200).json({ success : false, error : error || "Внутренняя ошибка системы" })
    }
}