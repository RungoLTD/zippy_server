const db = require('../db');
const moodLogger = require('./MoodLogger');
const trains = require('../Trains/TrainModel');
const declarations = require('../Trains/Imports/declarations');
const apiai = require('apiai');
const LanguageDetect = require('languagedetect');
const ChatDictionary = require('./ChatDictionary');
const RegiterComponent = require('./ChatComponents/RegiterComponent');
const lngDetector = new LanguageDetect();

/*
WARNING: the code that follows will make you cry; a safety pig is provided below for your benefit.

                         _
 _._ _..._ .-',     _.._(`))
'-. `     '  /-._.-'    ',/
   )         \            '.
  / _    _    |             \
 |  a    a    /              |
 \   .-.                     ;  
  '-('' ).-'       ,'       ;
     '-;           |      .'
        \           \    /
        | 7  .__  _.-\   \
        | |  |  ``/  /`  /
       /,_|  |   /,_/   /
          /,_/      '`-'

*/

const moodTypes = ['😓', '😣', '😔', '😒', '😐', '😌', '😊', '😃', '😇', '🤩'];
const multiplayerTypes = ['return_to_normal', 'up_to_5', 'up_to_10', 'up_to_15', 'up_to_20', 'do_nothing'];
const langs = ['English', 'Русский', '日本人'];
const langShortCodes = ['en', 'ru', 'ja'];

module.exports = async function (socket) {
    function messageBuilder(userId, msg, from, type) {
        if (msg == null) {
            return {
                type: 'error',
                error: 'Message cannot be null',
            };
        }
        db.mysqlInsert('INSERT INTO chat_log SET ?', {
            user_id: userId,
            message: msg,
            from_cat: from == 'zippy',
            type: type || 'register',
        });

        return {
            type: 'message',
            msg: msg,
            from: from,
        };
    }

    try {
        socket.on('register', async function (accessToken) {
            let user = await db.mysqlQuery('SELECT * FROM users WHERE access_token = ?', [accessToken]);

            if (user) {
                // Открываем listening для юзера
                socket.on(accessToken, async function (msg) {
                    try {
                        let json = JSON.parse(msg);

                        // Запуск первого чата
                        if (json['type'] == 'startRegister' && user.first_chat_completed == false) {
                            RegiterComponent(socket, accessToken, user.id);
                        } else if (json['type'] == 'start') {
                            /* Пользователь присоединился к чату */
                            // Получение последнего письма от кота
                            let lastMsg = await db.mysqlQuery('SELECT * FROM chat_log WHERE user_id = ? AND from_cat = ? ORDER BY id DESC', [user.id, true]);
                            // Определяем последнее сообшение
                            if (lastMsg['type'] == 'mood' || lastMsg['type'] == 'mood2') {
                                socket.emit(accessToken, { type: 'selectMood' });
                            } else if (lastMsg['type'] == 'changeMultiplayer') {
                                socket.emit(accessToken, { type: 'openEnum', enums: multiplayerTypes.map((code) => ChatDictionary[langCode][code]) });
                            } else if (lastMsg['type'] == 'userStepCompleted') {
                                socket.emit(accessToken, { type: 'openEnum', enums: ['😃'] });
                            } else if (lastMsg['type'] == 'firstSkin') {
                                socket.emit(accessToken, { type: 'openEnum', enums: [ChatDictionary[user.lang]['you_are_welcome']] });
                            } else if (lastMsg['type'] == 'newSkin') {
                                socket.emit(accessToken, { type: 'openEnum', enums: [ChatDictionary[user.lang]['haha_you_are_welcome']] });
                            } else if (lastMsg['type'] == 'moodService_1_1') {
                                socket.emit(accessToken, {
                                    type: 'openEnum',
                                    enums: [ChatDictionary[user.lang]['okey_trains_really_help_me'], ChatDictionary[user.lang]['my_mood_not_linked_with_train']],
                                });
                            } else if (lastMsg['type'] == 'moodService_2_1') {
                                socket.emit(accessToken, { type: 'openEnum', enums: [ChatDictionary[user.lang]['good']] });
                            } else if (lastMsg['type'] == 'moodService_3_1') {
                                socket.emit(accessToken, {
                                    type: 'openEnum',
                                    enums: [ChatDictionary[user.lang]['i_will_try'], ChatDictionary[user.lang]['my_mood_not_linked_with_train']],
                                });
                            } else if (lastMsg['type'] == 'moodService_4_1') {
                                socket.emit(accessToken, { type: 'openEnum', enums: [ChatDictionary[user.lang]['good'], ChatDictionary[user.lang]['no_i_not_wish']] });
                            } else if (lastMsg['type'] == 'moodService_5_1') {
                                socket.emit(accessToken, {
                                    type: 'openEnum',
                                    enums: [ChatDictionary[user.lang]['go_train'], ChatDictionary[user.lang]['do_nothing'], ChatDictionary[user.lang]['after_time_go']],
                                });
                            } else if (lastMsg['type'] == 'moodService_5_2') {
                                socket.emit(accessToken, { type: 'openTrains' });
                            } else if (lastMsg['type'] == 'moodService_6_1') {
                                socket.emit(accessToken, { type: 'openEnum', enums: [ChatDictionary[user.lang]['thank']] });
                            } else if (lastMsg['type'] == 'moodService_7_1') {
                                socket.emit(accessToken, {
                                    type: 'openEnum',
                                    enums: [ChatDictionary[user.lang]['sorry_go_train'], ChatDictionary[user.lang]['stay_this_state_see_cat'], 'Скоро пойдем!'],
                                });
                            } else if (lastMsg['type'] == 'reviewInStore') {
                                socket.emit(accessToken, {
                                    type: 'openEnum',
                                    enums: [ChatDictionary[user.lang]['rate_and_get_money'], ChatDictionary[user.lang]['after_time']],
                                });
                            } else if (lastMsg['type'] == 'endTrain') {
                                socket.emit(accessToken, {
                                    type: 'openEnum',
                                    enums: [ChatDictionary[user.lang]['yes_agree'], ChatDictionary[user.lang]['i_rest']],
                                });
                            } else if (lastMsg['type'] == 'moodService_8_1') {
                                socket.emit(accessToken, {
                                    type: 'openEnum',
                                    enums: [ChatDictionary[user.lang]['i_good_will_monit_mood'], ChatDictionary[user.lang]['my_good_mood_have_another']],
                                });
                            } else if (lastMsg['type'] == 'train_1_1') {
                                socket.emit(accessToken, {
                                    type: 'openEnum',
                                    enums: [
                                        ChatDictionary[user.lang]['choose_another_program'],
                                        ChatDictionary[user.lang]['set_hard_train'],
                                        ChatDictionary[user.lang]['do_nothing'],
                                    ],
                                });
                            } else if (lastMsg['type'] == 'train_2_1') {
                                socket.emit(accessToken, {
                                    type: 'openEnum',
                                    enums: [
                                        ChatDictionary[user.lang]['choose_another_program'],
                                        ChatDictionary[user.lang]['set_easy_train'],
                                        ChatDictionary[user.lang]['do_nothing'],
                                    ],
                                });
                            } else {
                                socket.emit(accessToken, { type: 'openKeyboard' });
                            }
                        } else if (json['type'] == 'ping') {
                            /* Системное сигнальное сообшение */
                            socket.emit(accessToken, { type: 'pong' });
                        } else if (json['type'] == 'answer') {
                            /* Пользователь ответил на сообщение */
                            // Получить тип последнего сообщения
                            let lastMsg = await db.mysqlQuery('SELECT * FROM chat_log WHERE user_id = ? AND from_cat = ? ORDER BY id DESC', [user.id, true]);

                            let userMessage = json['data'];
                            // Определяем язык
                            console.log('user message is ' + userMessage);
                            let languages = lngDetector.detect(userMessage);

                            let langCode = user.lang;

                            if (languages.length > 0) {
                                for (let index = 0; index < languages.length; index++) {
                                    if (langsCodes[languages[index][0]]) {
                                        if (langShortCodes.includes(langsCodes[languages[index][0]])) {
                                            langCode = langsCodes[languages[index][0]];
                                            break;
                                        }
                                    }
                                }
                            }

                            console.log('user lang detected as ' + langCode);
                            if (langCode) {
                                user.lang = langCode;
                                await db.mysqlUpdate('UPDATE users SET lang = ? WHERE id = ?', [langCode, user.id]);
                            }

                            // Определяем последнее сообшение
                            if (lastMsg['type'] == 'mood2') {
                                let lastMood = await db.mysqlQuery('SELECT * FROM user_mood_log WHERE user_id = ? ORDER BY id DESC LIMIT 1', [user.id]);
                                let index = Math.round(parseInt(json['data']));
                                moodLogger(user.id, user.timezone, index, true);
                                socket.emit(accessToken, messageBuilder(user.id, moodTypes[index], 'user', 'message'));

                                if (lastMood) {
                                    let lastIndex = lastMood['mood1'];

                                    if (lastIndex == index) {
                                        socket.emit(
                                            accessToken,
                                            messageBuilder(user.id, ChatDictionary[user.lang]['stability_is_good_stay_train'] + user.name, 'zippy', 'message'),
                                        );
                                    } else if (lastIndex < index) {
                                        socket.emit(accessToken, messageBuilder(user.id, user.name + ChatDictionary[user.lang]['i_see_train_is_up_your_mood'], 'zippy', 'message'));
                                    } else {
                                        socket.emit(
                                            accessToken,
                                            messageBuilder(
                                                user.id,
                                                ChatDictionary[user.lang]['maybe_train_is_hard_dont_worry_1'] +
                                                    user.trophy_name +
                                                    ChatDictionary[user.lang]['maybe_train_is_hard_dont_worry_2'],
                                                'zippy',
                                                'message',
                                            ),
                                        );
                                    }

                                    // проверка, если юзер отметил 7 дней подряд
                                    let sevenDaysCompleted = await db.mysqlQuery(
                                        'SELECT (COUNT(*) = 7) as sevenDaysFilled FROM `user_mood_log` LEFT JOIN users ON user_mood_log.user_id = users.id WHERE DATE(user_mood_log.created) > CURDATE() - INTERVAL 7 DAY AND user_id = ? AND DATE(users.seven_days_mood_notified) < CURDATE() - INTERVAL 7 DAY',
                                        [user.id],
                                    );

                                    if (sevenDaysCompleted['sevenDaysFilled'] == 1) {
                                        socket.emit(
                                            accessToken,
                                            messageBuilder(
                                                user.id,
                                                ChatDictionary[user.lang]['seven_days_filled_1'] + user.trophy_name + ChatDictionary[user.lang]['seven_days_filled_2'],
                                                'zippy',
                                                'message',
                                            ),
                                        );
                                        await db.mysqlUpdate('UPDATE users SET seven_days_mood_notified = now() WHERE id = ?', [user.id]);
                                    }
                                } else {
                                    socket.emit(accessToken, messageBuilder(user.id, ChatDictionary[user.lang]['i_happy_because_you_setted_mood'], 'zippy', 'message'));
                                }
                            } else if (lastMsg['type'] == 'mood') {
                                let index = Math.round(parseInt(json['data']));
                                moodLogger(user.id, user.timezone, index, false);
                                socket.emit(accessToken, messageBuilder(user.id, moodTypes[index], 'user', 'message'));

                                let moodLevel = index + 1;
                                if (moodLevel <= 4) {
                                    socket.emit(accessToken, messageBuilder(user.id, ChatDictionary[user.lang]['i_not_happy_because_your_mood_is_bad'], 'zippy', 'message'));
                                } else if (index <= 6) {
                                    socket.emit(accessToken, messageBuilder(user.id, user.name + ChatDictionary[user.lang]['i_hope_agter_time_you_will_good'], 'zippy', 'message'));
                                } else {
                                    socket.emit(accessToken, messageBuilder(user.id, user.name + ChatDictionary[user.lang]['i_happy_because_you_good_mood'], 'zippy', 'message'));
                                }
                            } else if (lastMsg['type'] == 'changeMultiplayer') {
                                let index = Math.round(parseInt(json['data']));

                                socket.emit(accessToken, messageBuilder(user.id, multiplayerTypes[index], 'user', 'message'));

                                if (index == 0) {
                                    // Change multiplayer
                                    socket.emit(accessToken, messageBuilder(user.id, ChatDictionary[user.lang]['returned_to_normal'], 'zippy', 'message'));
                                    await db.mysqlUpdate('UPDATE users SET train_multiplayer = ? WHERE access_token = ?', [1.0, accessToken]);
                                } else if (index == 5) {
                                    // Nothing to do
                                    socket.emit(accessToken, messageBuilder(user.id, ChatDictionary[user.lang]['okey_stay_current'], 'zippy', 'message'));
                                } else {
                                    let newMultiplayer = 1.0;

                                    if (index == 1) {
                                        newMultiplayer = 1.05;
                                    } else if (index == 2) {
                                        newMultiplayer = 1.1;
                                    } else if (index == 3) {
                                        newMultiplayer = 1.15;
                                    } else if (index == 4) {
                                        newMultiplayer = 1.2;
                                    }

                                    await db.mysqlUpdate('UPDATE users SET train_multiplayer = ? WHERE access_token = ?', [newMultiplayer, accessToken]);
                                    socket.emit(
                                        accessToken,
                                        messageBuilder(
                                            user.id,
                                            ChatDictionary[user.lang]['uppered_train_level_to_percent'] + Math.round((newMultiplayer - 1) * 100) + '%',
                                            'zippy',
                                            'message',
                                        ),
                                    );

                                    await new Promise((done) => setTimeout(done, 1000));
                                    // Setup mood
                                    var username = user.name || ChatDictionary[user.lang]['friend'];
                                    var variant = Math.floor(Math.random() * Math.floor(2));

                                    if (variant == 0) {
                                        message = username + ChatDictionary[user.lang]['you_can_set_mood_after_train'];
                                    } else {
                                        message = ChatDictionary[user.lang]['whats_your_mood_after_train'];
                                    }
                                    socket.emit(accessToken, messageBuilder(user.id, message, 'zippy', 'mood'));
                                    await new Promise((done) => setTimeout(done, 1000));
                                    socket.emit(accessToken, { type: 'selectMood' });
                                }
                            } else if (lastMsg['type'] == 'userStepCompleted' || lastMsg['type'] == 'firstSkin' || lastMsg['type'] == 'newSkin') {
                                let msg = '';

                                if (lastMsg['type'] == 'firstSkin') {
                                    msg = ChatDictionary[user.lang]['you_are_welcome_2'];
                                } else if (lastMsg['type'] == 'newSkin') {
                                    msg = ChatDictionary[user.lang]['you_are_welcome_3'];
                                } else {
                                    msg = '😃';
                                }

                                socket.emit(accessToken, messageBuilder(user.id, msg, 'user', 'message'));
                                socket.emit(accessToken, messageBuilder(user.id, '👍🏻', 'zippy', 'message'));
                            } else if (lastMsg['type'] == 'moodService_1_1') {
                                let index = Math.round(parseInt(json['data']));

                                if (index == 0) {
                                    socket.emit(accessToken, messageBuilder(user.id, '👍🏻', 'zippy', 'message'));
                                } else {
                                    socket.emit(accessToken, messageBuilder(user.id, ChatDictionary[user.lang]['i_happy_because_good_mood'], 'user', 'message'));
                                }
                            } else if (lastMsg['type'] == 'moodService_2_1') {
                                socket.emit(accessToken, messageBuilder(user.id, ChatDictionary[user.lang]['good'], 'user', 'message'));

                                socket.emit(accessToken, messageBuilder(user.id, '😃', 'zippy', 'message'));
                            } else if (lastMsg['type'] == 'moodService_3_1') {
                                let index = Math.round(parseInt(json['data']));

                                if (index == 0) {
                                    socket.emit(accessToken, messageBuilder(user.id, ChatDictionary[user.lang]['i_will_try'], 'user', 'message'));
                                    socket.emit(accessToken, messageBuilder(user.id, ChatDictionary[user.lang]['good_i_wait_in_train'], 'zippy', 'message'));
                                } else {
                                    socket.emit(accessToken, messageBuilder(user.id, ChatDictionary[user.lang]['my_mood_not_linked_with_train'], 'user', 'message'));
                                    socket.emit(accessToken, messageBuilder(user.id, ChatDictionary[user.lang]['motivate_from_zippy'], 'zippy', 'message'));
                                }
                            } else if (lastMsg['type'] == 'moodService_4_1') {
                                let index = Math.round(parseInt(json['data']));

                                if (index == 0) {
                                    socket.emit(accessToken, messageBuilder(user.id, ChatDictionary[user.lang]['good'], 'user', 'message'));
                                    socket.emit(accessToken, messageBuilder(user.id, ChatDictionary[user.lang]['good_set_your_mood'], 'zippy', 'mood'));
                                    socket.emit(accessToken, { type: 'selectMood' });
                                } else {
                                    socket.emit(accessToken, messageBuilder(user.id, ChatDictionary[user.lang]['no_i_not_wish'], 'user', 'message'));
                                }
                            } else if (lastMsg['type'] == 'moodService_5_1') {
                                let index = Math.round(parseInt(json['data']));

                                if (index == 0) {
                                    socket.emit(accessToken, messageBuilder(user.id, ChatDictionary[user.lang]['go_train'], 'user', 'message'));
                                    socket.emit(accessToken, messageBuilder(user.id, ChatDictionary[user.lang]['choose_cool_train'], 'zippy', 'message'));

                                    await new Promise((done) => setTimeout(done, 3000));
                                    socket.emit(accessToken, { type: 'openTrains' });
                                } else if (index == 1) {
                                    socket.emit(accessToken, messageBuilder(user.id, ChatDictionary[user.lang]['do_nothing'], 'user', 'message'));
                                    socket.emit(accessToken, messageBuilder(user.id, ChatDictionary[user.lang]['i_hard_move_up'], 'zippy', 'message'));
                                } else {
                                    socket.emit(accessToken, messageBuilder(user.id, ChatDictionary[user.lang]['after_time_go'], 'user', 'message'));
                                    socket.emit(accessToken, messageBuilder(user.id, ChatDictionary[user.lang]['good_wait_you'], 'zippy', 'message'));
                                }
                            } else if (lastMsg['type'] == 'moodService_6_1') {
                                socket.emit(accessToken, messageBuilder(user.id, ChatDictionary[user.lang]['thanks'], 'user', 'message'));
                                socket.emit(accessToken, messageBuilder(user.id, ChatDictionary[user.lang]['usein_bolt_joke'], 'zippy', 'message'));
                            } else if (lastMsg['type'] == 'moodService_7_1') {
                                let index = Math.round(parseInt(json['data']));

                                let userAnswer = [
                                    ChatDictionary[user.lang]['sorry_go_train'],
                                    ChatDictionary[user.lang]['stay_this_state_see_cat'],
                                    ChatDictionary[user.lang]['after_time_go'],
                                ][index];
                                socket.emit(accessToken, messageBuilder(user.id, userAnswer, 'user', 'message'));

                                if (index == 0) {
                                    socket.emit(accessToken, messageBuilder(user.id, ChatDictionary[user.lang]['i_wait_lets_select_best_train'], 'zippy', 'message'));
                                    socket.emit(accessToken, { type: 'openTrains' });
                                } else if (index == 1) {
                                    socket.emit(accessToken, messageBuilder(user.id, ChatDictionary[user.lang]['sorry_for_down_mood'], 'zippy', 'message'));
                                } else {
                                    socket.emit(accessToken, messageBuilder(user.id, ChatDictionary[user.lang]['i_wait'], 'zippy', 'message'));
                                }
                            } else if (lastMsg['type'] == 'reviewInStore') {
                                let index = Math.round(parseInt(json['data']));

                                if (index == 0) {
                                    socket.emit(accessToken, messageBuilder(user.id, ChatDictionary[user.lang]['rate_and_get_money'], 'user', 'message'));

                                    // Append money count
                                    await db.mysqlInsert('INSERT INTO transactions SET ?', {
                                        user_id: user.id,
                                        operation: '+',
                                        type: 'Review in Store',
                                        detail_id: -1,
                                        amount: 20,
                                    });
                                    await db.mysqlUpdate('UPDATE users SET is_reviewed_in_store = 1 WHERE id = ?', [user.id]);

                                    socket.emit(accessToken, { type: 'openStore' });
                                } else {
                                    socket.emit(accessToken, messageBuilder(user.id, ChatDictionary[user.lang]['later'], 'user', 'message'));
                                }
                            } else if (lastMsg['type'] == 'endTrain') {
                                let index = Math.round(parseInt(json['data']));

                                if (index == 0) {
                                    socket.emit(accessToken, messageBuilder(user.id, ChatDictionary[user.lang]['yes_agree'], 'user', 'message'));
                                    socket.emit(accessToken, messageBuilder(user.id, ChatDictionary[user.lang]['yes_go'], 'zippy', 'message'));
                                    socket.emit(accessToken, { type: 'openTrains' });
                                } else {
                                    socket.emit(accessToken, messageBuilder(user.id, ChatDictionary[user.lang]['go_after_week'], 'user', 'message'));
                                    socket.emit(accessToken, messageBuilder(user.id, ChatDictionary[user.lang]['lets'], 'zippy', 'message'));
                                }
                            } else if (lastMsg['type'] == 'moodService_8_1') {
                                let index = Math.round(parseInt(json['data']));

                                let answer = [ChatDictionary[user.lang]['i_good_will_monit_mood'], ChatDictionary[user.lang]['my_good_mood_have_another']][index];
                                socket.emit(accessToken, messageBuilder(user.id, answer, 'user', 'message'));

                                if (index == 0) {
                                    socket.emit(accessToken, messageBuilder(user.id, '👍🏻', 'zippy', 'message'));
                                } else {
                                    socket.emit(accessToken, messageBuilder(user.id, ChatDictionary[user.lang]['anything_reason_i_happy'], 'zippy', 'message'));
                                }
                            } else if (lastMsg['type'] == 'train_1_1') {
                                let index = Math.round(parseInt(json['data']));
                                let answer = [
                                    ChatDictionary[user.lang]['choose_another_program'],
                                    ChatDictionary[user.lang]['set_hard_train'],
                                    ChatDictionary[user.lang]['do_nothing'],
                                ][index];
                                socket.emit(accessToken, messageBuilder(user.id, answer, 'user', 'message'));
                                if (index == 0) {
                                    socket.emit(accessToken, messageBuilder(user.id, '👍🏻', 'zippy', 'message'));
                                    await db.mysqlUpdate('UPDATE user_trains SET end_day = ? WHERE end_day IS NULL AND user_id = ?', [new Date(), user.id]);
                                    socket.emit(accessToken, { type: 'openTrains' });
                                } else if (index == 1) {
                                    socket.emit(accessToken, messageBuilder(user.id, '👍🏻', 'zippy', 'changeMultiplayer'));
                                    socket.emit(accessToken, { type: 'changeMultiplayer' });
                                } else {
                                    socket.emit(accessToken, messageBuilder(user.id, ChatDictionary[user.lang]['good_continue_train'], 'zippy', 'message'));
                                }
                            } else if (lastMsg['type'] == 'train_2_1') {
                                let index = Math.round(parseInt(json['data']));
                                let answer = [
                                    ChatDictionary[user.lang]['choose_another_program'],
                                    ChatDictionary[user.lang]['set_hard_train'],
                                    ChatDictionary[user.lang]['do_nothing'],
                                ][index];
                                socket.emit(accessToken, messageBuilder(user.id, answer, 'user', 'message'));
                                if (index == 0) {
                                    socket.emit(accessToken, messageBuilder(user.id, '👍🏻', 'zippy', 'message'));
                                    await db.mysqlUpdate('UPDATE user_trains SET end_day = ? WHERE end_day IS NULL AND user_id = ?', [new Date(), user.id]);
                                    socket.emit(accessToken, { type: 'openTrains' });
                                } else if (index == 1) {
                                    socket.emit(accessToken, messageBuilder(user.id, '👍🏻', 'zippy', 'changeMultiplayer'));
                                    socket.emit(accessToken, { type: 'changeMultiplayer' });
                                } else {
                                    socket.emit(accessToken, messageBuilder(user.id, ChatDictionary[user.lang]['good_continue_train'], 'zippy', 'message'));
                                }
                            } else {
                                // Если сообщение не распознано отправляем запрос в DialogFlow
                                socket.emit(accessToken, messageBuilder(user.id, userMessage, 'user', 'message'));

                                // Запрос DialogFlow

                                console.log('Requet apiai with lang ' + user.lang);
                                let ai = apiai('8d210c2d53d140efa98528b58d89cb61', {
                                    language: user.lang,
                                });
                                let request = ai.textRequest(json['data'], {
                                    sessionId: user.access_token,
                                });

                                request.on('response', async function (response) {
                                    let speech = response.result.fulfillment.speech;
                                    // Распознование интента
                                    if (response.result.metadata.intentName == 'zippy.mood') {
                                        // Setup mood
                                        let currentMood = await db.mysqlQuery(
                                            "SELECT *, DATE(CONVERT_TZ(user_mood_log.created, '+0:00', ?)) as created_zime_zone FROM user_mood_log HAVING created_zime_zone = DATE(CONVERT_TZ(now(), '+0:00', ?)) AND user_id = ?",
                                            [user.timezone, user.timezone, user.id],
                                        );

                                        if (currentMood) {
                                            socket.emit(
                                                accessToken,
                                                messageBuilder(
                                                    user.id,
                                                    user.name + ChatDictionary[user.lang]['mood_already_setted'] + moodTypes[currentMood.mood1],
                                                    'zippy',
                                                    'message',
                                                ),
                                            );
                                        } else {
                                            socket.emit(accessToken, messageBuilder(user.id, ChatDictionary[user.lang]['whats_your_mood'], 'zippy', 'mood'));
                                            await new Promise((done) => setTimeout(done, 1000));
                                            socket.emit(accessToken, { type: 'selectMood' });
                                        }

                                        return;
                                    } else if (response.result.metadata.intentName == 'zippy.progress') {
                                        var minDate = new Date();
                                        minDate.setDate(minDate.getDate() - 30);
                                        minDate = minDate.toISOString().slice(0, 19).replace('T', ' ');

                                        statistics = await db.mysqlQuery(
                                            'SELECT SUM(meters) as distance, COUNT(id) as trainCount, AVG(avgSpeed) as avgSpeed, AVG(avgPace) as avgPace FROM statistics WHERE user_id = ? AND created > ?',
                                            [user.id, minDate],
                                        );

                                        let text =
                                            ChatDictionary[user.lang]['progress_in_month'] +
                                            `${Math.round(statistics.distance / 1000)} ${ChatDictionary[user.lang]['km_and_train_count']} ${statistics.trainCount}`;
                                        socket.emit(accessToken, messageBuilder(user.id, text, 'zippy', 'message'));

                                        return;
                                    } else if (response.result.metadata.intentName == 'zippy.show_progress') {
                                        let result = await db.mysqlQuery(
                                            'SELECT *, UNIX_TIMESTAMP(start_day) as start_day FROM user_trains WHERE user_id = ? AND end_day IS NULL ORDER BY start_day DESC LIMIT 1',
                                            [user.id],
                                        );

                                        if (result) {
                                            let daysCompleted = Math.floor((new Date().getTime() - result.start_day * 1000) / (1000 * 3600 * 24)) + 1;
                                            let trainInfo = await db.mysqlQuery('SELECT * FROM user_train_journal WHERE user_id = ? AND train_id = ? AND day = ?', [
                                                user.id,
                                                result.id,
                                                daysCompleted,
                                            ]);

                                            let text = ChatDictionary[user.lang]['today'] + ` ${daysCompleted + 1} ${ChatDictionary[user.lang]['day_of_trains']}\n`;

                                            if (trainInfo.type == declarations.Type.Rest) {
                                                text += ChatDictionary[user.lang]['today_planned_rest'];
                                            } else if (trainInfo.distance && trainInfo.time) {
                                                text += `${ChatDictionary[user.lang]['you_must_go']} ${Math.floor(trainInfo.distance / 1000)} ${
                                                    ChatDictionary[user.lang]['km_for']
                                                } ${Math.floor(trainInfo.time / 60)} ${ChatDictionary[user.lang]['minutes']}`;
                                            } else if (trainInfo.distance) {
                                                text += `${ChatDictionary[user.lang]['you_must_go']} ${Math.floor(trainInfo.distance / 1000)} ${
                                                    ChatDictionary[user.lang]['km_without_time']
                                                }`;
                                            } else if (trainInfo.time) {
                                                text += `${ChatDictionary[user.lang]['you_must_go']} ${Math.floor(trainInfo.time / 60)} ${
                                                    ChatDictionary[user.lang]['min_without_km']
                                                }`;
                                            } else {
                                                text += ChatDictionary[user.lang]['cant_recognize_train'];
                                            }

                                            socket.emit(accessToken, messageBuilder(user.id, text, 'zippy', 'message'));
                                        } else {
                                            socket.emit(accessToken, messageBuilder(user.id, ChatDictionary[user.lang]['you_dont_have_trains'], 'zippy', 'message'));
                                            await new Promise((done) => setTimeout(done, 4000));
                                            socket.emit(accessToken, { type: 'openTrains' });
                                        }

                                        return;
                                    }

                                    if (speech) {
                                        // Пришел ответ из DialogFlow
                                        socket.emit(accessToken, messageBuilder(user.id, response.result.fulfillment.speech, 'zippy', 'message'));
                                    } else {
                                        // Не распознано сообщение
                                        socket.emit(accessToken, messageBuilder(user.id, ChatDictionary[user.lang]['i_dont_know_about_you'], 'zippy', 'message'));
                                    }
                                });

                                request.on('error', function (error) {
                                    socket.emit(accessToken, messageBuilder(user.id, ChatDictionary[user.lang]['i_dont_know_about_you'], 'zippy', 'message'));
                                });

                                request.end();
                            }
                        } else if (json['type'] == 'getLastMsg') {
                            let lastMsg = await db.mysqlQuery('SELECT * FROM chat_log WHERE user_id = ? AND from_cat = ? ORDER BY id DESC', [user.id, true]);
                            socket.emit(accessToken, {
                                type: 'message',
                                msg: lastMsg.message,
                                from: lastMsg.from_cat ? 'zippy' : 'user',
                            });
                        }
                    } catch (error) {
                        console.log(error);
                    }
                });
            }
        });
    } catch (error) {
        console.log(error);
    }
};

const langsCodes = {
    arabic: 'ar',
    azeri: 'az',
    bulgarian: 'bg',
    bengali: 'bn',
    czech: 'cs',
    welsh: 'cy',
    danish: 'da',
    german: 'de',
    english: 'en',
    spanish: 'es',
    estonian: 'et',
    farsi: 'fa',
    finnish: 'fi',
    french: 'fr',
    hausa: 'ha',
    hindi: 'hi',
    croatian: 'hr',
    hungarian: 'hu',
    indonesian: 'id',
    icelandic: 'is',
    italian: 'it',
    kazakh: 'kk',
    kyrgyz: 'ky',
    latin: 'la',
    lithuanian: 'lt',
    latvian: 'lv',
    macedonian: 'mk',
    mongolian: 'mn',
    nepali: 'ne',
    dutch: 'nl',
    norwegian: 'no',
    polish: 'pl',
    pashto: 'ps',
    portuguese: 'pt',
    romanian: 'ro',
    russian: 'ru',
    slovak: 'sk',
    slovene: 'sl',
    somali: 'so',
    albanian: 'sq',
    serbian: 'sr',
    swedish: 'sv',
    swahili: 'sw',
    tagalog: 'tl',
    turkish: 'tr',
    ukrainian: 'uk',
    urdu: 'ur',
    uzbek: 'uz',
    vietnamese: 'vi',
};
