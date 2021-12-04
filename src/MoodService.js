const db = require('../src/db.js');
const NotificationService = require('./NotificationService');
const ChatService = require("./Chat/ChatService");

module.exports.notifySetMood = async function() {
    let users = await db.mysqlQueryArray(
        "SELECT id, name, DATE(addtime(CONVERT_TZ(users.mood_notify_sended, '+0:00', users.timezone), users.mood_notify_time)) as notified_with_timezone, DATE(addtime(CONVERT_TZ(now(), '+0:00', users.timezone), users.mood_notify_time)) as server_timezone FROM users HAVING server_timezone > notified_with_timezone",
        [],
    );
    await db.mysqlUpdate(
        "UPDATE users SET mood_notify_sended = addtime(now(), users.mood_notify_time) WHERE DATE(addtime(CONVERT_TZ(users.mood_notify_sended, '+0:00', users.timezone), users.mood_notify_time)) < DATE(addtime(CONVERT_TZ(now(), '+0:00', users.timezone), users.mood_notify_time))",
        [],
    );

    if (users == false) {
        return;
    }

    for (let index = 0; index < users.length; index++) {
        const user = users[index];

        var message = '';
        var username = user.name || 'Приятель';
        var variant = Math.floor(Math.random() * Math.floor(3));

        if (variant == 0) {
            message = 'Как ты чувствуешь себя сегодня, ' + username;
        } else if (variant == 1) {
            message = username + ', какое настроение у тебя сейчас? Отметь скорей!';
        } else {
            message = 'Сегодня отличная погода ☀️. А у тебя какое настроение ' + username + '?';
        }

        let textMessage = {
            "title": "Zippy",
            "body" : message,
        };

        await db.mysqlInsert('INSERT INTO chat_log SET ?', {
            user_id: user.id,
            message: message,
            from_cat: true,
            type: 'mood',
            readed: false,
        });

        if (user.fcm_token != null && user.fcm_token != "") {
            NotificationService.sendPush(user.fcm_token, textMessage);
        }
    }
};

module.exports.notifyOldMoodForgetUsers = async function() {
    try {
        let users = await db.mysqlQueryArray(
            'SELECT MAX(created) as lastSavedMood, user_id FROM `user_mood_log` GROUP BY user_id HAVING DATE(lastSavedMood) < CURDATE() - INTERVAL 3 DAY',
        );

        for (let index = 0; index < users.length; index++) {
            const user = users[index];

            var username = user.name || 'Приятель';

            let textMessage = {
                "title": "Zippy",
                "body" : `Ты давно не следишь за своим настроением ${username}. Отметь сейчас`
            };

            await db.mysqlInsert('INSERT INTO chat_log SET ?', {
                user_id: user.user_id,
                message: textMessage['ru'],
                from_cat: true,
                type: 'message',
                readed: false,
            });

            if (user.fcm_token != null && user.fcm_token != "") {
                NotificationService.sendPush(user.fcm_token, textMessage);
            }
            ChatService(user.user_id, `Ты давно не следишь за своим настроением ${username}. Отметь сейчас`, "moodService_4_1", true);

        }
    } catch (error) {
        console.log(error);
    }
};
