const db = require("../db");
const declarations = require("./Imports/declarations");
const trains = require("../Trains/TrainModel");
const ChatService = require("../Chat/ChatService");


module.exports = async function (req, res) {

    // Получаем пользователя 
    let user = await db.mysqlQuery("SELECT * FROM users WHERE access_token = ?", [req.body.accessToken]);

    // Получаем текущую тренировку
    let result = await db.mysqlQuery("SELECT *, UNIX_TIMESTAMP(start_day) as start_day FROM user_trains WHERE user_id = ? AND end_day IS NULL ORDER BY start_day DESC LIMIT 1", [user.id]);
    var train = null;
    var userResults = new Array();

    var skippedTrainDays = 0;

    if (result != false){
        // Получаем детальную инфу о тренировке
        train = {...trains[result.train_section][result.train_index]};

        // Получаем результат пользователя
        let userStatistics = await db.mysqlQueryArray("SELECT *, UNIX_TIMESTAMP(created) as created FROM statistics WHERE user_id = ? AND created >= ?", [user.id, result.start_day])


        // Заполняем статистику
        let trainProgramm = await db.mysqlQueryArray("SELECT * FROM user_train_journal WHERE train_id = ?", [result.id]) || [];

        // Проверка на то что закончил ли юзер тренировку
        let daysCompleted = Math.floor((new Date().getTime() - (result.start_day * 1000)) / (1000 * 3600 * 24)) + 1;

        if (trainProgramm.length <= daysCompleted){
            // Тренировка окончена
            await db.mysqlUpdate("UPDATE user_trains SET end_day = now() WHERE id = ?", [result.id]);
            await ChatService(user.id, 'Мы смогли это!!! Дааа… Мы теперь выглядим лучше, чем раньше. Думаю теперь мы можем выбрать тренировки еще сложнее!', 'endTrain', true);
            return res.status(200).json({ 
                success : true, 
                data : { 
                    hasActiveTrain : false, 
                    startDate : null, 
                    train : null, 
                    result : []
                } 
            })
        }

        let startDay = new Date(result.start_day * 1000);
        startDay.setDate(startDay.getDate() - 1);

        let currentDate = new Date();
        trainProgramm.forEach(train => {
            startDay.setDate(startDay.getDate() + 1);

            var dayStatistics = new Array();
            
            if (userStatistics != false){
                dayStatistics = userStatistics.filter(function(statistic) {
                    let createdDate = new Date(statistic.created * 1000)
                    return createdDate.getDate() == startDay.getDate();
                });
            }
            
            // Сколько фактически пробежал
            var factTime = 0;
            var factDistance = 0;

            dayStatistics.forEach(dayStat => {
                factTime += dayStat.time;
                factDistance += dayStat.meters;
            });

            let trainStatistics = new Object();
            if (train.type != declarations.Type.Rest) {

                if (factDistance == 0){
                    skippedTrainDays += 1;
                }

                // Рабочий день

                var timeConditionAccepted = false;
                var distanceConditionAccepted = false;

                // Сколько по условии надо пробежать
                var needTime = train.time;
                // умножаем на multiplayer
                needTime = needTime - ((needTime * user.train_multiplayer) - needTime);
                let needDistance = train.distance * user.train_multiplayer; // умножаем на multiplayer

                if (train.distance == null && train.time != null){
                    distanceConditionAccepted = true;
                    timeConditionAccepted = factTime >= needTime;
                } else if (train.distance != null && train.time == null){
                    distanceConditionAccepted = factDistance > needDistance;
                    timeConditionAccepted = true;
                } else if (train.distance == null && train.time == null){
                    // all accepted
                    distanceConditionAccepted = true;
                    timeConditionAccepted = true;
                } else if (train.distance != null && train.time != null){
                    distanceConditionAccepted = factDistance >= needDistance;
                    timeConditionAccepted = factTime <= needTime;
                }

                trainStatistics = {
                    completed: timeConditionAccepted && distanceConditionAccepted, 
                    train : train,
                    factDistance : factDistance,
                    factTime : factTime,
                    needDistance : needDistance,
                    needTime : needTime
                };

            }else{
                // День отдыха
                trainStatistics = {
                    completed : startDay < currentDate, 
                    train : train,
                    factDistance : factDistance,
                    factTime : factTime,
                    needDistance : null,
                    needTime : null
                };
            }


            userResults.push(trainStatistics);
        });

    }

    

    res.status(200).json({ 
        success : result != null, 
        data : { 
            hasActiveTrain : train != null, 
            startDate : new Date(result.start_day * 1000), 
            train : train, 
            result : userResults 
        } 
    });


    // Чат по тренькам


    if (result){
        // 1 правило
        let rules = await db.mysqlQuery("SELECT rule_1_sended_date, rule_2_sended_date, rule_3_sended_date, rule_4_sended_date FROM user_trains WHERE id = ?", [result.id]);


        if (rules.rule_1_sended_date == null){
            let isTrain3week = Math.floor((new Date().getTime() - (result.start_day * 1000)) / (1000 * 3600 * 24)) >= 21;
            let isSkippedLessThan2Days = skippedTrainDays <= 2;

            let allMoods = await db.mysqlQuery("SELECT COUNT(mood2) as count FROM user_mood_log WHERE user_id = ? AND created > ?", [user.id, result.start_day]);
            let positiveMoods = await db.mysqlQuery("SELECT COUNT(mood2) as count FROM user_mood_log WHERE user_id = ? AND mood2 > 8 AND created > ?", [user.id, result.start_day]);
            
            let positivePercent = 100 / allMoods.count * positiveMoods.count;

            let isPositiveMoreThan80Percent = positivePercent > 80;
            let mood2Count = await db.mysqlQuery("SELECT COUNT(mood2) as count FROM user_mood_log WHERE user_id = ? AND created > ?", [user.id, result.start_day]);

            let isMood2CountMoreThan3 = mood2Count.count > 3;

            if (isTrain3week && isSkippedLessThan2Days && isPositiveMoreThan80Percent && isMood2CountMoreThan3) {
                await db.mysqlUpdate("UPDATE user_trains SET rule_1_sended_date = ? WHERE id = ?", [new Date(), result.id]);
                ChatService(user.id, 'Вау! Я проанализировал твою программу тренировок, у тебя отличные результаты! Как думаешь, возможно ты готов к небольшому усложнению программы? ….', 'train_1_1')
                return;
            }
        } else if (rules.rule_2_sended_date == null){
            let isTrain1week = Math.floor((new Date().getTime() - (result.start_day * 1000)) / (1000 * 3600 * 24)) >= 7;
            let isSkippedLessThan2Days = skippedTrainDays <= 2;

            if (isTrain1week && isSkippedLessThan2Days) {
                await db.mysqlUpdate("UPDATE user_trains SET rule_2_sended_date = ? WHERE id = ?", [new Date(), result.id]);
                ChatService(user.id, 'Я проанализировал твою программу тренировок. Скажи, что тебя волнует, давай попробуем исправить? Я предлагаю тебе выбрать другую программу или облегчить текущую тренировку. Что скажешь?', 'train_2_1')
                return;
            }
        } else if (rules.rule_3_sended_date == null){
            let isTrain2week = Math.floor((new Date().getTime() - (result.start_day * 1000)) / (1000 * 3600 * 24)) >= 14;
            let isSkippedLessThan2Days = skippedTrainDays <= 2;
            let allMoods = await db.mysqlQuery("SELECT COUNT(mood2) as count FROM user_mood_log WHERE user_id = ? AND created > ?", [user.id, result.start_day]);
            let negativeMoods = await db.mysqlQuery("SELECT COUNT(mood2) as count FROM user_mood_log WHERE user_id = ? AND mood2 < 4 AND created > ?", [user.id, result.start_day]);
            
            let negativePercent = 100 / allMoods.count * negativeMoods.count;

            let isNegativeMoreThan50Percent = negativePercent > 50;

            let mood2Count = await db.mysqlQuery("SELECT COUNT(mood2) as count FROM user_mood_log WHERE user_id = ? AND created > ?", [user.id, result.start_day]);
            let isMood2CountMoreThan4 = mood2Count.count > 4;


            if (isTrain2week && isSkippedLessThan2Days && isNegativeMoreThan50Percent && isMood2CountMoreThan4) {
                await db.mysqlUpdate("UPDATE user_trains SET rule_3_sended_date = ? WHERE id = ?", [new Date(), result.id]);
                ChatService(user.id, 'Я проанализировал твою программу тренировок. Твои показатели настроения после тренировок говорят о том, что возможно тебе немного сложно тренироваться с такой нагрузкой? Помни, что это абсолютно нормально. Я предла-гаю тебе облегчить текущую программу тренировок. Что скажешь?', 'train_2_1')
                return;
            }
        } else if (rules.rule_4_sended_date == null){
            let isTrain4week = Math.floor((new Date().getTime() - (result.start_day * 1000)) / (1000 * 3600 * 24)) >= 28;
            let isSkippedLessThan2Days = skippedTrainDays <= 2;
            let allMoods = await db.mysqlQuery("SELECT COUNT(mood2) as count FROM user_mood_log WHERE user_id = ? AND created > ?", [user.id, result.start_day]);
            let negativeMoods = await db.mysqlQuery("SELECT COUNT(mood2) as count FROM user_mood_log WHERE user_id = ? AND mood2 < 6 AND created > ?", [user.id, result.start_day]);
            
            let negativePercent = 100 / allMoods.count * negativeMoods.count;

            let isNegativeMoreThan60Percent = negativePercent > 60;

            let moodCount = await db.mysqlQuery("SELECT COUNT(mood1) as mood1count, COUNT(mood2) as mood2count FROM user_mood_log WHERE user_id = ? AND created > ?", [user.id, result.start_day]);
            let isMood2CountMoreThan4 = moodCount.mood2count > 3 && moodCount.mood1count > 2;


            if (isTrain4week && isSkippedLessThan2Days && isNegativeMoreThan60Percent && isMood2CountMoreThan4) {
                await db.mysqlUpdate("UPDATE user_trains SET rule_4_sended_date = ? WHERE id = ?", [new Date(), result.id]);
                ChatService(user.id, 'Оооо! Я проанализировал твою программу тренировок, у тебя плохие результаты! Возможно тебе следует отдохнуть, 1 неделю….И возобновить тренировки! ', 'train_2_1')
                return;
            }
        }
    }

    
    

}