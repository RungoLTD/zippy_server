const https = require('https');
const app = require('../app.js');
const db = require('../src/db.js');
const request = require('request');

function sendToOneSignal(userId, contents) {
    return new Promise((resolve, reject) => {
        var users = new Array();

        if (userId instanceof Array) {
            let orFilterObject = { operator: 'OR' };
            userId.forEach((element) => {
                let userFilterObject = { field: 'tag', key: 'user_id', relation: '=', value: element };
                users.push(userFilterObject);
                users.push(orFilterObject);
            });
            users.pop();
        } else {
            users = [{ field: 'tag', key: 'user_id', relation: '=', value: userId }];
        }

        const data = {
            app_id: process.env.ONE_SIGNAL_APP_ID,
            contents: contents,
            filters: users,
        };

        var headers = {
            'Content-Type': 'application/json; charset=utf-8',
            Authorization: 'Basic ' + process.env.ONE_SIGNAL_SECRET_KEY,
        };

        request.post({
            uri: 'https://onesignal.com/api/v1/notifications',
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data),
        });
    });
}

// module.exports.sendPush = (userId, message = []) => {
//     return new Promise(async (resolve, reject) => {
//         let oneSignalResult = await sendToOneSignal(userId, message);
//         if (oneSignalResult.error) {
//             reject(oneSignalResult.error);
//         } else {
//             resolve(oneSignalResult.length ? oneSignalResult : false);
//         }
//     });
// };

module.exports.sendPush = (fcmToken, message = []) => {
    return new Promise(async (resolve, reject) => {
        let fcmTokenResult = await sendNotification(fcmToken, message);
        if (fcmTokenResult.error) {
            reject(fcmTokenResult.error);
        } else {
            resolve(fcmTokenResult.length ? fcmTokenResult : false);
        }
    });
};

module.exports.notifyOldUsers = () => {
    const NOTIFICATION_INTERVAL_DAYS = 2;
    return new Promise(async (resolve, reject) => {
        var notifyDate = new Date();
        notifyDate.setDate(notifyDate.getDate() - NOTIFICATION_INTERVAL_DAYS);
        notifyDate = notifyDate.toISOString().slice(0, 19).replace('T', ' ');
        let nonActiveUsers = await db.mysqlQueryArray('SELECT * FROM users WHERE last_active_date < ? AND last_notified_date < ?', [notifyDate, notifyDate]);

        for (let index = 0; index < nonActiveUsers.length; index++) {
            const element = nonActiveUsers[index];
            // let textMessage = {
            //     ru: element.name + ', ???? ?? ?????? ?????????? ???? ????????????????. ???? ?????? ?????????? ???????????? ??????????????????.',
            //     en: element.name + ', You have not come to us for a long time. We have been waiting for you very much.',
            // };
            let textMessage = {
                "title": "Zippy",
                "body" : element.name + ', ???? ?? ?????? ?????????? ???? ????????????????. ???? ?????? ?????????? ???????????? ??????????????????.',
            };
            if (element.fcm_token != null && element.fcm_token != "") {
                this.sendPush(element.fcm_token, textMessage);
            }
            await db.mysqlUpdate('UPDATE users SET last_notified_date = ? WHERE id = ?', [new Date(), element.id]);
        }
    });
};

function sendNotification(fcmToken, data){
    return new Promise((resolve, reject) => {
        var headers = {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': 'key=' + process.env.FIREBASE_SECRET_KEY,
        };
        const body_data = {
            to: fcmToken,
            notification : data
        };
        request.post({
            uri: 'https://fcm.googleapis.com/fcm/send',
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body_data),
        },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(response.statusCode)
                // console.log(response.statusCode);
                // console.log(body)
            } else {
                reject(response.statusCode)
            }
        });
        // console.log(a);
    })
}