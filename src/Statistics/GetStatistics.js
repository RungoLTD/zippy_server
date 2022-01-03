const db = require("../db");


module.exports = async function (req, res) {

    let page = req.body.page;

    const limit = 10;
    const offset = limit * page;

    let statisticId = req.body.statisticId;

    let user = await db.mysqlQuery("SELECT * FROM users WHERE access_token = ?", [req.body.accessToken]);
    
    if (statisticId == null) {
        try {
            let statistics = await db.mysqlQueryArray("SELECT * FROM statistics WHERE user_id = ? ORDER BY created DESC LIMIT ? OFFSET ?", [user.id, limit, offset]);
            if (statistics == false) {
                return res.status(200).json({ success: true, data: null, code: 1 })
            }
            for (let index = 0; index < statistics.length; index++) {
                statistics[index]["routes"] = JSON.parse(statistics[index]["routes"]);
            }
            return res.status(200).json({ success: statistics != null, data: statistics, code: 1 })
            // var queryArray = new Array();
            // statistics.forEach(element => {
            //     queryArray.push(element.id);
            // });

            // let routes = await db.mysqlQueryArray("SELECT lon, lat, statistics_id FROM running_routes WHERE statistics_id IN (?) ORDER BY created ASC", [queryArray]);

            // for (let index = 0; index < statistics.length; index++) {
            //     const stat = statistics[index];
            //     statistics[index]["routes"] = new Array();

            //     if (routes == false) {
            //         continue;
            //     } else {
            //         for (let rIndex = 0; rIndex < routes.length; rIndex++) {
            //             const route = routes[rIndex];
            //             if (stat.id == route.statistics_id) {
            //                 delete route["statistics_id"];
            //                 statistics[index]["routes"].push(route);

            //                 // Обрезаем поинты
            //                 if (statistics[index]["routes"].length >= 100) {
            //                     break;
            //                 }
            //             }
            //         }
            //     }
            // }
        } catch (ex) {
            console.log(ex);
            return res.status(200).json({ success: false, data: [], code: 2, error: "Ошибка в БД" })
        }
        
    } else {
        try {
            var result = await db.mysqlQuery("SELECT * FROM statistics WHERE user_id = ? AND id = ?", [user.id, statisticId]);
            // let routes = await db.mysqlQueryArray("SELECT lon, lat FROM running_routes WHERE statistics_id = ?", statisticId);
            result["routes"] = JSON.parse(result["routes"]);
        } catch (ex) {
            console.log(ex);
            return res.status(200).json({ success: false, data: [], code: 2, error: "Ошибка в БД" })
        }
        return res.status(200).json({ success: result != null, data: result, code: 1 })
    }


}