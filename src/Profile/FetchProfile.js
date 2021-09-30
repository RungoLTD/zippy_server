const db = require('../db');
const ChatService = require('../Chat/ChatService');
const AchievmentService = require('../AchievmentService');

module.exports = async function (req, res) {
    // Handle mood. TODO : Make microservice for handling moods
    var user = await db.mysqlQuery('SELECT * FROM users WHERE access_token = ?', [req.body.accessToken]);
    var oneDay = 86400000;
    var mood_updated_date = user.mood_updated_date;
    var currentDate = new Date();

    var lastCheckedDays = Math.round(Math.abs((mood_updated_date.getTime() - currentDate.getTime()) / oneDay));

    if (lastCheckedDays > 0) {
        let minusMoodCount = lastCheckedDays * 5;
        var newMoodValue = user.mood - minusMoodCount;
        if (newMoodValue < 0) {
            newMoodValue = 0;
        }

        if (newMoodValue == 100) {
            AchievmentService(user.id, 19);
        }

        await db.mysqlQuery('UPDATE users SET mood = ?, mood_updated_date = ? WHERE id = ?', [newMoodValue, currentDate, user.id]);
        if (newMoodValue < 10) {
            ChatService(user.id, 'Мне плохо… Я уже не чувствую своих лап… Походу у меня ожирение :(', 'moodService_7_1', true);
        } else if (newMoodValue < 20) {
            ChatService(user.id, 'Мне кажеться я потолстел немного, пошли тренироваться. Мне сложно по лестнице подниматься.', 'moodService_5_1', true);
        }

        if (newMoodValue > 70 && user.mood < newMoodValue) {
            ChatService(user.id, 'Я чувствую себя великолепно!!! Вперед к новым вершинам!', 'moodService_6_1', true);
        }

        user.mood = newMoodValue;
    }

    let results = await db.mysqlQuery('SELECT SUM(meters) FROM statistics WHERE user_id = ?', [user.id]);
    let transactions = await db.mysqlQuery('SELECT SUM(amount) FROM transactions WHERE user_id = ?', [user.id]);
    let achievements =
        (await db.mysqlQueryArray(
            'SELECT achievements.* FROM user_achievements LEFT JOIN achievements ON user_achievements.achievement_id = achievements.id WHERE user_achievements.user_id = ?',
            [user.id],
        )) || [];
    user.statistics = new Object();
    user.statistics.totalDistance = results['SUM(meters)'];
    user.coins = transactions['SUM(amount)'];
    user.achievements = achievements;
    res.status(200).json({ success: user != null, data: user, availLangs: ['English', 'Русский', '日本人'] });
};
