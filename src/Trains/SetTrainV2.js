const db = require('../db');
const trains = require('./TrainModel');
const AchievmentService = require('../AchievmentService');

module.exports = async function (req, res) {
    try {
        let user = await db.mysqlQuery('SELECT * FROM users WHERE access_token = ?', [req.body.accessToken]);

        let selectedOptions = req.body.selectedOptions;

        let train = { ...trains.fullFormatted[req.body.trainSection].trains[req.body.trainIndex] };

        if (!train) {
            throw `Не найдена тренировка ${req.body.trainSection}-${req.body.trainIndex}`;
        }

        let options = [];

        for (let index = 0; index < train.options.length; index++) {
            options.push(train.options[index].options[selectedOptions[index]]);
        }

        if (user.train_buyed_date == null) {
            await db.mysqlUpdate('UPDATE users SET train_buyed_date = now() WHERE id = ?', [user.id]);
            AchievmentService(user.id, 21);
        }

        let startDate = new Date();
        let program = [...(train.trainProgram || [])];

        for (let index = 0; index < options.length; index++) {
            const option = options[index];
            if (option.type == 'startDate') {
                startDate = option.startDate;
            } else if (option.type == 'importFile') {
                program = [...option.importFile];
            } else if (option.type == 'multiplayer') {
                program = program.map((p) => {
                    let time = p.time;
                    let distance = p.distance;

                    if (time) {
                        time = time * option.time.multiplayer;
                        time = time + option.time.append;
                    }
                    if (distance) {
                        distance = distance * option.distance.multiplayer;
                        distance = distance + option.distance.append;
                    }

                    return {
                        distance: distance,
                        time: time,
                        pace: p.pace,
                        type: p.type,
                        completed: p.completed,
                        day: p.day,
                    };
                });
            } else if (option.type == 'duration') {
                program.splice(option.limit);
            }
        }

        // Обнуляем тренировки
        await db.mysqlUpdate('UPDATE user_trains SET end_day = ? WHERE end_day IS NULL AND user_id = ?', [new Date(), user.id]);
        // Задаем новую тренировку
        let trainId = await db.mysqlInsert('INSERT INTO user_trains SET ?', {
            user_id: user.id,
            train_section: req.body.trainSection,
            train_index: req.body.trainIndex,
            start_day: new Date(),
        });

        // Задаем индивидуальные тренировки
        for (let index = 0; index < program.length; index++) {
            await db.mysqlInsert('INSERT INTO user_train_journal SET ?', {
                train_id: trainId,
                user_id: user.id,
                distance: program[index].distance,
                time: program[index].time,
                pace: program[index].pace,
                type: program[index].type,
                completed: program[index].completed,
                day : program[index].day
            });
        }

        return res.status(200).json({ success: true, code: 1, startDate: startDate, train: program });
    } catch (error) {
        console.log(error);
        return res.status(200).json({ success: false, code: 2, error: 'Внутренняя ошибка системы' });
    }
};
