const db = require("../db");
const ChatService = require("../Chat/ChatService");
const trains = require("../Trains/TrainModel");
const AchievmentService = require("../AchievmentService");

module.exports = async function addStatistics(req, res) {
    let meters = req.body.meters;
    let time = req.body.time;
    let maxSpeed = req.body.maxSpeed;
    let avgSpeed = req.body.avgSpeed;
    let avgPace = req.body.avgPace;
    let paces = req.body.paces;
    
    if (meters == 0 && maxSpeed == 0 && avgSpeed == 0 && avgPace == 0){
        return res.status(200).json({ success : false, code: 2, error : "Вы не пробежали" })
    }

    let routes = req.body.routes;

    let user = await db.mysqlQuery("SELECT * FROM users WHERE access_token = ?", [req.body.accessToken]);

    let challenge = req.body.challenge;

    var offerMultiplayer = false;
    var offerMultiplayerCoefficient = 2.0;

    if (challenge != null){
        // Set challenge
        console.log(challenge);
        var newMood = challenge.success ? user.mood + 15 : user.mood - 15;
        if (newMood < 0){
            newMood = 0;
        } else if (newMood > 100){
            newMood = 100;
        }
        await db.mysqlUpdate("UPDATE users SET mood = ? WHERE id = ?", [newMood, user.id]);
        user.mood = newMood;

        if (challenge.success){
            try {
                let _challenge = await db.mysqlQuery("SELECT * FROM challenges WHERE id = ?", [challenge.id]);
                await db.mysqlQuery("INSERT INTO transactions SET ?", {user_id : user.id, operation : "+", type : "challenge", detail_id : _challenge.id, amount : _challenge.reward})
            } catch (error) {
                console.log(error);
            }
        }
    } else {
        let kms = parseInt(meters / 1000);
        if (kms >= 2){
            let newMood = user.mood + 5;
            if (newMood > 100){
                newMood = 100;
            }
            await db.mysqlUpdate("UPDATE users SET mood = ? WHERE id = ?", [newMood, user.id]);
        }
    }

    try {
        
        var routeArray = new Array();
        for (let index = 0; index < routes.length; index++) {
            let route = {'lon': routes[index]["lon"], 'lat': routes[index]["lat"]}
            routeArray.push(route);
        }

        let insertId = await db.mysqlInsert("INSERT INTO statistics SET ?", { 
            user_id: user.id, meters: meters, time: time, maxSpeed : maxSpeed, 
            avgSpeed : avgSpeed, avgPace : avgPace, paces : JSON.stringify(paces), routes : JSON.stringify(routeArray) });

        // Тренировка пользоветеля
        let userTrainId = await db.mysqlQuery("SELECT *, UNIX_TIMESTAMP(start_day) as start_day FROM user_trains WHERE user_id = ? AND end_day IS NULL ORDER BY start_day DESC LIMIT 1", [user.id]);
        if (userTrainId != false){
            // Получаем детальную инфу о тренировке
            console.log(userTrainId);
            
            train = {...trains[userTrainId.train_section][userTrainId.train_index]};

            // Получаем результат пользователя на сегодня
            let userStatistics = await db.mysqlQuery("SELECT SUM(meters) as meters, SUM(time) as time FROM statistics WHERE user_id = ? AND created >= CURDATE()", [user.id]);

            let startDay = new Date(userTrainId.start_day * 1000);
            let today = new Date();
            const diffTime = Math.abs(today.getTime() - startDay.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 


            let trainProgram = {...train.trainProgram[diffDays]}

            // Сколько фактически пробежал
            var factTime = userStatistics.time;
            var factDistance = userStatistics.meters;

            // Сколько по условии надо пробежать
            var needTime = trainProgram.time;
            // умножаем на multiplayer
            needTime = needTime - ((needTime * user.train_multiplayer) - needTime);
            let needDistance = trainProgram.distance * user.train_multiplayer; // умножаем на multiplayer


            var timeConditionAccepted = false;
            var distanceConditionAccepted = false;



            if (trainProgram.distance == null && trainProgram.time != null){ // Только на время
                distanceConditionAccepted = true;
                timeConditionAccepted = factTime >= needTime;

                // Если он пробежал умноженный на кэф выше
                offerMultiplayer = (needTime * offerMultiplayerCoefficient) < factTime;
            } else if (trainProgram.distance != null && trainProgram.time == null){ // Только на дистанцию
                timeConditionAccepted = true;

                distanceConditionAccepted = factDistance > needDistance;

                // Если он пробежал умноженный на кэф выше
                offerMultiplayer = (needDistance * offerMultiplayerCoefficient) < factDistance;
            } else if (train.distance != null && train.durationTime != null){ // Время и дистанция
                distanceConditionAccepted = factDistance >= needDistance;
                timeConditionAccepted = factTime <= needTime;

                offerMultiplayer = ((factTime * offerMultiplayerCoefficient) < needTime) && ((needDistance * offerMultiplayerCoefficient) < factDistance);
            }

            // Проверка на применение multiplayer(-a) && Если он слишком читерски закончил
            if (offerMultiplayer){
                await ChatService(user.id, username + ", ты слишком быстро закончил. Давай немного усложним тренировку?", 'changeMultiplayer', true);
            }

            if (timeConditionAccepted && distanceConditionAccepted){
                // Проверка, есть ли запись на сегодня
                if(user.train_completed_updated.setHours(0,0,0,0) != today.setHours(0,0,0,0)) {
                    // Не обновлял седня
                    var newMood = user.mood + 10
                    if (newMood > 100){
                        newMood = 100;
                    }
                    await db.mysqlUpdate("UPDATE users SET mood = ?, train_completed_updated = ?  WHERE id = ?", [newMood, today, user.id]);
                }
            }

        }


        if (routes.length == 0){
            return res.status(200).json({ success : true, code: 1, data : { statisticId : insertId } });
        }
        
        //await db.mysqlInsert("INSERT INTO running_routes (statistics_id, lon, lat, user_id) VALUES ?", [routeArray])


        if (offerMultiplayer == false){
            //notifyUser(user);
        }

        ChatService(user.id, user.name + ", ты можешь отметить свое настроение после пробежки.", 'mood2', true);


        // Проверка ачивки 1
        if (meters >= 3000) {
            AchievmentService(user.id, 1);
        }

        if (meters >= 5000) {
            AchievmentService(user.id, 2);
        }

        if (meters >= 10000) {
            AchievmentService(user.id, 3);
        }

        if (meters >= 15000) {
            AchievmentService(user.id, 4);
        }

        if (meters >= 21100) {
            AchievmentService(user.id, 5);
        }

        if (meters >= 42200) {
            AchievmentService(user.id, 6);
        }

        return res.status(200).json({ success : true, code: 1, data : { statisticId : insertId } })
    } catch (error) {
        console.log(error);
        return res.status(200).json({ success : false, code: 2, error : "Внутренняя ошибка системы" })
    }

}