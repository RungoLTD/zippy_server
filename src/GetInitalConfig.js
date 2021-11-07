const db = require('./db');
const ChatService = require('./Chat/ChatService');
const AchievmentService = require('./AchievmentService');
const moment = require("moment");

module.exports = async function (req, res) {
    try{
        let user = await db.mysqlQuery('SELECT * FROM users WHERE access_token = ?', [req.body.accessToken]);
        
        let os_code = req.body.os_code;
        let version_build = req.body.version_build;
        let version_app = req.body.version_app;
        if(os_code != undefined)
            if(user.os_code != os_code)
                await db.mysqlUpdate("UPDATE users SET os_code = ? WHERE id = ?", [os_code, user.id]);
        
        if(version_build != undefined)
            if(user.version_build != version_build)
                await db.mysqlUpdate("UPDATE users SET version_build = ? WHERE id = ?", [version_build, user.id]);

        if(version_app != undefined)
            if(user.version_app != version_app)
                await db.mysqlUpdate("UPDATE users SET version_app = ? WHERE id = ?", [version_app, user.id]);
        // СКИНЫ
        
        // Получение всех скинов
        let skins = await db.mysqlQueryArray('SELECT * FROM skins');

        // Получение скинов юзера
        let purchasedSkins = await db.mysqlQueryArray('SELECT * FROM user_skins WHERE user_id = ?', [user.id]);

        skins = skins.map((element) => {
            var skin = element;
            skin.purchased = false;
            if (purchasedSkins != false) {
                purchasedSkins.forEach((purchasedSkin) => {
                    if (skin.id == purchasedSkin.skin_id) {
                        skin.purchased = true;
                    }
                });
            }
            return skin;
        });

        //ФИШКОИНЫ
        let fishcoins = await db.mysqlQueryArray('SELECT * FROM fishcoins');

        //БАННЕРЫ В ГЛАВНОЙ СТРАНИЦЕ
        var banner_html_code = ""
        var currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
        let banner = await db.mysqlQuery("SELECT html_code FROM banners WHERE show_date_start <= ? AND show_date_end >= ?",[currentDate, currentDate]);
        if(banner){
            banner_html_code = banner.html_code
        }

        // ПРОФИЛЬ
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

        // ОБЛАКА ТЕКСТОВ
        let cloudCatTexts = (await db.mysqlQueryArray('SELECT * FROM cat_cloud_texts WHERE 1', [])) || [];

        return res.status(200).json({
            success: skins != null,
            code: 1,
            data: {
                skins: skins,
                user: user,
                cloudCatTexts: cloudCatTexts,
                fishcoins: fishcoins,
                banner: banner_html_code
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(200).json({ success: false, code: 2, error: 'Внутренняя ошибка системы' });
    }
};
