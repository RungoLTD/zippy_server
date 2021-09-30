const db = require('./db.js');
const ChatService = require('./Chat/ChatService');
var moment = require('moment');

function getPreviousMonday(isTuesday = false) {
    var startDate = moment().subtract(1, 'week').startOf('week').add(isTuesday ? 2 : 1, 'day');
    return startDate.format('YYYY-MM-DD');
}

function getLastWeekInterval() {
    var startDate = moment().subtract(1, 'week').startOf('week').add(1, 'day').format('YYYY-MM-DD');
    var endDate = moment().subtract(1, 'week').endOf('week').add(1, 'day').format('YYYY-MM-DD');

    return { begin: startDate, end: endDate };
}

module.exports.notify = () => {
    return new Promise(async (resolve, reject) => {
        let users = await db.mysqlQueryArray('SELECT * FROM users WHERE 1', []);

        for (let index = 0; index < users.length; index++) {
            const user = users[index];

            // Для настроения
            let statCount = await db.mysqlQuery('SELECT SUM(meters) as todayCount FROM statistics WHERE user_id = ? AND DATE(created) > CURDATE() - INTERVAL 1 DAY', [user.id]);

            if (statCount['todayCount'] && statCount['todayCount'] >= 2000) {
                let mood = await db.mysqlQuery('SELECT * FROM user_mood_log WHERE DATE(created) > CURDATE() - INTERVAL 1 DAY AND user_id = ? AND mood2 IS NOT NULL', [user.id]);

                if (mood) {
                    if (mood.mood2 > mood.mood1) {
                        ChatService(user.id, 'Отличная работа! Возможно именно тренировка смогла поднять тебе настроение! Продолжай в том же духе!', 'moodService_1_1', true);
                    } else if (mood.mood2 < mood.mood1) {
                        ChatService(
                            user.id,
                            'Какой прекрасный день! Отличное настроение и тренировка на ура! Запомни это самочувствие и старайся сохранить его как можно дольше',
                            'moodService_2_1',
                            true,
                        );
                    }
                }

                continue;
            }

            let userTrain = await db.mysqlQuery('SELECT * FROM user_trains WHERE user_id = ? AND end_day IS NULL ORDER BY start_day DESC', [user.id]);
            if (userTrain) {
                let train = await db.mysqlQuery('SELECT * FROM statistics WHERE user_id = ? AND DATE(created) > now() - INTERVAL 3 DAY', [user.id]);

                let maxMood = await db.mysqlQuery(
                    'SELECT SUM(statistics.meters) as meters, DATE(statistics.created) as createdDate FROM statistics INNER JOIN user_mood_log ON DATE(user_mood_log.created) = DATE(statistics.created) WHERE statistics.user_id = ? AND user_mood_log.mood2 > 5 GROUP BY createdDate LIMIT 1',
                    [user.id],
                );

                if (train == false && maxMood) {
                    let meters = maxMood['meters'];
                    let created = new Date(maxMood['createdDate']);

                    moment.locale('ru');
                    let formattedDate = moment(created).format('MMMM Do');
                    let kms = parseFloat(meters / 1000).toFixed(2);

                    ChatService(
                        user.id,
                        'Друг, ты давно не занимался. Помнишь ' +
                            formattedDate +
                            ' ты пробежал ' +
                            kms +
                            ' км и у тебя после тренировки было отличное настроение! Давай попробуем сегодня выйти на пробежку и постараемся улучшить твое самочувствие!',
                        'moodService_3_1',
                        true,
                    );
                }

                continue;
            }



            let lastMondayDate = getPreviousMonday();
            let lastTuesdayDate = getPreviousMonday(true);
            let mondayMood = await db.mysqlQuery('SELECT * FROM user_mood_log WHERE DATE(created) = ? AND user_id = ?', [lastMondayDate, user.id]);
            let tuesdayMood = await db.mysqlQuery('SELECT * FROM user_mood_log WHERE DATE(created) = ? AND user_id = ?', [lastTuesdayDate, user.id]);

            let moodInserted = mondayMood != false || tuesdayMood != false;

            let weekDateInterval = getLastWeekInterval();
            
            let trainInfo = await db.mysqlQuery("SELECT SUM(meters) as distance, COUNT(id) as trainCount FROM statistics WHERE user_id = ? AND DATE(created) > ? AND DATE(created) < ?", [user.id, weekDateInterval.begin, weekDateInterval.end]);

            let isTrained = trainInfo.distance >= 2000 && trainInfo.trainCount >= 2;


            let moods = await db.mysqlQuery("SELECT COUNT(id) as count FROM user_mood_log WHERE DATE(created) > CURDATE() - INTERVAL 3 WEEK AND user_id = ?", [user.id]);

            let isMoodPasted = moods.count > 4;

            let firstWeek = await db.mysqlQuery("SELECT AVG(mood1) as mood1, AVG(mood2) as mood2 FROM user_mood_log WHERE DATE(created) > CURDATE() - INTERVAL 2 WEEK AND DATE(created) < CURDATE() - INTERVAL 1 WEEK AND user_id = ?", [user.id]);
            let lastWeek = await db.mysqlQuery("SELECT AVG(mood1) as mood1, AVG(mood2) as mood2 FROM user_mood_log WHERE DATE(created) > CURDATE() - INTERVAL 1 WEEK AND DATE(created) < CURDATE() AND user_id = ?", [user.id]);


            let avg1 = (firstWeek.mood1 + firstWeek.mood2) / 2;
            let avg2 = (lastWeek.mood1 + lastWeek.mood2) / 2;

            let isMoodUppeared = avg1 < avg2;
            

            if (moodInserted && isTrained && isMoodPasted && isMoodUppeared) {
                ChatService(
                    user.id,
                    'У нас есть позитивные результаты! Общая оценка настроения выросла по сравнению с показателями прошлой недели. Ты молодец! Возможно именно пробежки влияют на твое настроение! Следи дальше за своим эмоциональным состоянием!»',
                    'moodService_8_1',
                    true,
                );
                continue;
            }

        }
    });
};

module.exports.isUsed7Days = async () => {
    let users = (await db.mysqlQueryArray('SELECT * FROM users WHERE DATE(created) < CURDATE() - INTERVAL 7 DAY AND is_reviewed_in_store = 0', [])) || [];
    await db.mysqlUpdate("UPDATE users SET is_reviewed_in_store = 1 WHERE DATE(created) < CURDATE() - INTERVAL 7 DAY AND is_reviewed_in_store = 0", []);
    for (let index = 0; index < users.length; index++) {
        const user = users[index];

        await ChatService(user.id, 'Ты пользуешься приложением уже неделю, оцени приложение в AppStore!', 'reviewInStore', true);
    }
};
