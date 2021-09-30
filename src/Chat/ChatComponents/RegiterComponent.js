const db = require('../../db');
const ChatDictionary = require('../ChatDictionary');
const moodLogger = require('../MoodLogger');
const declarations = require('../../Trains/Imports/declarations');

const moodTypes = ['😓', '😣', '😔', '😒', '😐', '😌', '😊', '😃', '😇', '🤩'];

module.exports = async function (socket, accessToken, userId) {
    function messageBuilder(msg, from, type) {
        db.mysqlInsert('INSERT INTO chat_log SET ?', {
            user_id: user.id,
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
    function setMood(mood) {
        moodLogger(user.id, user.timezone, mood, false);
    }

    // start listening on question

    let channelId = accessToken;
    const maxSteps = 4;
    let user = await db.mysqlQuery('SELECT * FROM users WHERE id = ?', [userId]);

    let currentLang = null;

    socket.emit(channelId, messageBuilder('Choose languagae', 'zippy'));
    langs = ['English', 'Русский', '日本人'];
    socket.emit(channelId, { type: 'openEnum', enums: langs });

    let langIndex = await new Promise(function (resolve, reject) {
        let listener = function (msg) {
            let json = JSON.parse(msg);
            resolve(Math.round(parseInt(json.data)));
            socket.off(`register#${channelId}`, listener);
        };
        socket.on(`register#${channelId}`, listener);
    });

    currentLang = 'en';
    if (langIndex == 1) {
        currentLang = 'ru';
    } else if (langIndex == 2) {
        currentLang = 'ja';
    }

    socket.emit(channelId, messageBuilder(langs[langIndex], 'user'));

    // Save user lang
    await db.mysqlUpdate('UPDATE users SET lang = ? WHERE id = ?', [currentLang, userId]);

    async function setUserCompleteStep(stepId) {
        if (stepId == maxSteps) {
            // Set completed user
            await db.mysqlUpdate('UPDATE users SET first_chat_completed = ? WHERE access_token = ?', [true, accessToken]);
            await db.mysqlUpdate('UPDATE users SET first_chat_step = ? WHERE access_token = ?', [maxSteps, accessToken]);
            socket.emit(channelId, { type: 'registerCompleted' });
        } else {
            await db.mysqlUpdate('UPDATE users SET first_chat_step = ? WHERE access_token = ?', [stepId + 1, accessToken]);
        }
    }

    async function anwser(Id) {
        switch (Id) {
            case 0:
                // Спрашивает имя
                socket.emit(channelId, { type: 'closeKeyboard' });
                socket.emit(channelId, { type: 'typingOn' });
                await new Promise((done) => setTimeout(done, 3000));
                socket.emit(channelId, { type: 'typingOff' });
                socket.emit(channelId, messageBuilder(ChatDictionary[currentLang]['hi_i_am_zippy'], 'zippy'));
                lastEnums = [ChatDictionary[currentLang]['hi_zippy']];
                socket.emit(channelId, { type: 'openEnum', enums: lastEnums });

                lastAnswerIndex = await new Promise(function (resolve, reject) {
                    let listener = function (msg) {
                        let json = JSON.parse(msg);
                        resolve(Math.round(parseInt(json.data)));
                        socket.off(`register#${channelId}`, listener);
                    };
                    socket.on(`register#${channelId}`, listener);
                });
                socket.emit(channelId, messageBuilder(lastEnums[lastAnswerIndex], 'user'));

                socket.emit(channelId, { type: 'typingOn' });
                await new Promise((done) => setTimeout(done, 1000));
                socket.emit(channelId, { type: 'typingOff' });
                socket.emit(channelId, messageBuilder(ChatDictionary[currentLang]['whats_your_name'], 'zippy'));
                socket.emit(channelId, { type: 'openKeyboard' });

                let name = await new Promise(function (resolve, reject) {
                    let listener = function (msg) {
                        let json = JSON.parse(msg);
                        resolve(json.data);
                        socket.off(`register#${channelId}`, listener);
                    };
                    socket.on(`register#${channelId}`, listener);
                });

                db.mysqlUpdate('UPDATE users SET name = ? WHERE id = ?', [name, user.id]);

                socket.emit(channelId, { type: 'closeKeyboard' });
                socket.emit(channelId, messageBuilder(name, 'user'));
                setUserCompleteStep(Id);
                break;
            case 1:
                // Юзер выбирает себе похвальное имя
                socket.emit(channelId, { type: 'typingOn' });
                await new Promise((done) => setTimeout(done, 4000));
                socket.emit(channelId, { type: 'typingOff' });
                socket.emit(channelId, messageBuilder(ChatDictionary[currentLang]['question_trophy'], 'zippy'));

                lastEnums = [ChatDictionary[currentLang]['question_trophy_2'], ChatDictionary[currentLang]['question_trophy_3']];
                socket.emit(channelId, { type: 'openEnum', enums: lastEnums });
                lastAnswerIndex = await new Promise(function (resolve, reject) {
                    let listener = function (msg) {
                        let json = JSON.parse(msg);
                        resolve(Math.round(parseInt(json.data)));
                        socket.off(`register#${channelId}`, listener);
                    };
                    socket.on(`register#${channelId}`, listener);
                });
                socket.emit(channelId, messageBuilder(lastEnums[lastAnswerIndex], 'user'));

                if (lastAnswerIndex == 0) {
                    socket.emit(channelId, messageBuilder(ChatDictionary[currentLang]['question_trophy_4'], 'zippy'));

                    lastEnums = [ChatDictionary[currentLang]['good_variant'], ChatDictionary[currentLang]['my_variant']];
                    socket.emit(channelId, { type: 'openEnum', enums: lastEnums });

                    lastAnswerIndex = await new Promise(function (resolve, reject) {
                        let listener = function (msg) {
                            let json = JSON.parse(msg);
                            resolve(Math.round(parseInt(json.data)));
                            socket.off(`register#${channelId}`, listener);
                        };
                        socket.on(`register#${channelId}`, listener);
                    });

                    socket.emit(channelId, messageBuilder(lastEnums[lastAnswerIndex], 'user'));

                    if (lastAnswerIndex == 1) {
                        socket.emit(channelId, { type: 'openKeyboard' });

                        let trophyName = await new Promise(function (resolve, reject) {
                            let listener = function (msg) {
                                let json = JSON.parse(msg);
                                resolve(json.data);
                                socket.off(`register#${channelId}`, listener);
                            };
                            socket.on(`register#${channelId}`, listener);
                        });
                        db.mysqlUpdate('UPDATE users SET trophy_name = ? WHERE id = ?', [trophyName, user.id]);
                        socket.emit(channelId, { type: 'closeKeyboard' });
                        socket.emit(channelId, messageBuilder(trophyName, 'user'));
                        socket.emit(channelId, messageBuilder(ChatDictionary[currentLang]['good_variant'], 'zippy'));
                    }
                } else {
                    socket.emit(channelId, { type: 'openKeyboard' });
                    let trophyName = await new Promise(function (resolve, reject) {
                        let listener = function (msg) {
                            let json = JSON.parse(msg);
                            resolve(json.data);
                            socket.off(`register#${channelId}`, listener);
                        };
                        socket.on(`register#${channelId}`, listener);
                    });

                    db.mysqlUpdate('UPDATE users SET trophy_name = ? WHERE id = ?', [trophyName, user.id]);

                    socket.emit(channelId, { type: 'closeKeyboard' });
                    socket.emit(channelId, messageBuilder(trophyName, 'user'));
                    socket.emit(channelId, messageBuilder(ChatDictionary[currentLang]['good_variant'], 'zippy'));
                }
                setUserCompleteStep(Id);
                break;
            case 2:
                // Провести onboarding
                socket.emit(channelId, { type: 'typingOn' });
                await new Promise((done) => setTimeout(done, 4000));
                socket.emit(channelId, { type: 'typingOff' });
                socket.emit(channelId, messageBuilder(ChatDictionary[currentLang]['start_instruction'], 'zippy'));
                lastEnums = [ChatDictionary[currentLang]['yes_of_course'], ChatDictionary[currentLang]['no_not_now']];
                socket.emit(channelId, { type: 'openEnum', enums: lastEnums });

                lastAnswerIndex = await new Promise(function (resolve, reject) {
                    let listener = function (msg) {
                        let json = JSON.parse(msg);
                        resolve(Math.round(parseInt(json.data)));
                        socket.off(`register#${channelId}`, listener);
                    };
                    socket.on(`register#${channelId}`, listener);
                });

                socket.emit(channelId, messageBuilder(lastEnums[lastAnswerIndex], 'user'));

                if (lastAnswerIndex == 0) {
                    // Run onboarding
                    socket.emit(channelId, { type: 'startOnboarding' });

                    // wait when onboarding completing
                    await new Promise(function (resolve, reject) {
                        let listener = function (msg) {
                            resolve();
                            socket.off(`register#${channelId}`, listener);
                        };
                        socket.on(`register#${channelId}`, listener);
                    });
                    setUserCompleteStep(Id);
                } else {
                    socket.emit(channelId, messageBuilder(ChatDictionary[currentLang]['okay'], 'zippy'));
                    setUserCompleteStep(Id);
                }
                break;
            case 3:
                // Говорит про настроение
                socket.emit(channelId, { type: 'typingOn' });
                await new Promise((done) => setTimeout(done, 4000));
                socket.emit(channelId, { type: 'typingOff' });
                socket.emit(channelId, messageBuilder(ChatDictionary[currentLang]['we_can_display_mood'], 'zippy'));
                lastEnums = [ChatDictionary[currentLang]['yes_of_course'], ChatDictionary[currentLang]['no_not_now_2']];
                socket.emit(channelId, { type: 'openEnum', enums: lastEnums });

                lastAnswerIndex = await new Promise(function (resolve, reject) {
                    let listener = function (msg) {
                        let json = JSON.parse(msg);
                        resolve(Math.round(parseInt(json.data)));
                        socket.off(`register#${channelId}`, listener);
                    };
                    socket.on(`register#${channelId}`, listener);
                });

                socket.emit(channelId, messageBuilder(lastEnums[lastAnswerIndex], 'user'));

                if (lastAnswerIndex == 1) {
                    socket.emit(channelId, messageBuilder(ChatDictionary[currentLang]['go_to_train'], 'zippy'));
                    await new Promise((done) => setTimeout(done, 5000));
                    socket.emit(channelId, { type: 'startRunning' });
                }
                setUserCompleteStep(Id);
                break;
            case 4:
                // Выбирает настроение
                socket.emit(channelId, { type: 'typingOn' });
                await new Promise((done) => setTimeout(done, 4000));
                socket.emit(channelId, { type: 'typingOff' });
                socket.emit(channelId, messageBuilder(ChatDictionary[currentLang]['choose_smile_for_mood'], 'zippy', 'mood'));
                socket.emit(channelId, { type: 'selectMood' });

                lastAnswerIndex = await new Promise(function (resolve, reject) {
                    let listener = function (msg) {
                        let json = JSON.parse(msg);
                        resolve(Math.round(parseInt(json.data)));
                        socket.off(`register#${channelId}`, listener);
                    };
                    socket.on(`register#${channelId}`, listener);
                });

                console.log(lastAnswerIndex);

                setMood(lastAnswerIndex);
                socket.emit(channelId, messageBuilder(moodTypes[lastAnswerIndex], 'user'));
                socket.emit(channelId, messageBuilder(ChatDictionary[currentLang]['first_mood'], 'zippy', 'message'));

                lastEnums = [ChatDictionary[currentLang]['good'], ChatDictionary[currentLang]['if_i_forgot']];
                socket.emit(channelId, { type: 'openEnum', enums: lastEnums });

                lastAnswerIndex = await new Promise(function (resolve, reject) {
                    let listener = function (msg) {
                        let json = JSON.parse(msg);
                        resolve(Math.round(parseInt(json.data)));
                        socket.off(`register#${channelId}`, listener);
                    };
                    socket.on(`register#${channelId}`, listener);
                });

                if (lastAnswerIndex == 1) {
                    socket.emit(channelId, messageBuilder(ChatDictionary[currentLang]['you_can_set_alarm'], 'zippy', 'message'));
                    lastEnums = [ChatDictionary[currentLang]['set_alarm']];

                    socket.emit(channelId, { type: 'openEnum', enums: lastEnums });
                    await new Promise(function (resolve, reject) {
                        let listener = function (msg) {
                            resolve();
                            socket.off(`register#${channelId}`, listener);
                        };
                        socket.on(`register#${channelId}`, listener);
                    });

                    socket.emit(channelId, { type: 'openSettings' });

                    await new Promise(function (resolve, reject) {
                        let listener = function (msg) {
                            resolve();
                            socket.off(`register#${channelId}`, listener);
                        };
                        socket.on(`register#${channelId}`, listener);
                    });

                    setUserCompleteStep(Id);
                } else {
                    setUserCompleteStep(Id);
                }

                break;
            default:
                break;
        }
    }

    while (user.first_chat_completed == false) {
        user = await db.mysqlQuery('SELECT * FROM users WHERE access_token = ?', [accessToken]);
        console.log('Answer: ' + user.first_chat_step);
        await anwser(user.first_chat_step);
        user = await db.mysqlQuery('SELECT * FROM users WHERE access_token = ?', [accessToken]);
    }
};
