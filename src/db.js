const app = require("../app.js");

module.exports.mysqlQuery = (query, cond = []) => {
    return new Promise((resolve, reject) => {
        app.connection.query(query, cond, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.length ? result[0] : false);
            }
        })
    })
}

module.exports.mysqlQueryArray = (query, cond = []) => {
    return new Promise((resolve, reject) => {
        app.connection.query(query, cond, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.length ? result : false);
            }
        })
    })
}

/**
 * @query INSERT INTO orders SET ?
 * @data { a: 123, b: 123 }
 */
module.exports.mysqlInsert = (query, data) => {
    return new Promise((resolve, reject) => {
        app.connection.query(query, data, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results ? results.insertId : false);
            }
        });
    });
}


/**
 * @query UPDATE orders SET
 * @data { a: 123, b: 123 }
 */
module.exports.mysqlUpdate = (query, data) => {
    return new Promise((resolve, reject) => {
        app.connection.query(query, data, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results.affectedRows ? true : false);
            }
        });
    });
}