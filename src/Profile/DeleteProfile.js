const db = require('../db');

module.exports = async function (req, res) {
    let accessToken = req.body.accessToken;

    try {
        var user = await db.mysqlQuery('SELECT id FROM users WHERE access_token = ?', [accessToken]);
        if(user != null){
            await db.mysqlQuery('DELETE FROM chat_log WHERE user_id = ?', [user.id]);
            await db.mysqlQuery('DELETE FROM friends WHERE user_id = ? OR friend_id = ?', [user.id, user.id]);
            await db.mysqlQuery('DELETE FROM running_routes WHERE user_id = ?', [user.id]);
            await db.mysqlQuery('DELETE FROM statistics WHERE user_id = ?', [user.id]);
            await db.mysqlQuery('DELETE FROM user_achievements WHERE user_id = ?', [user.id]);
            await db.mysqlQuery('DELETE FROM user_mood_log WHERE user_id = ?', [user.id]);
            await db.mysqlQuery('DELETE FROM user_skins WHERE user_id = ?', [user.id]);
            await db.mysqlQuery('DELETE FROM user_step_statistics WHERE user_id = ?', [user.id]);
            await db.mysqlQuery('DELETE FROM user_train_journal WHERE user_id = ?', [user.id]);
            await db.mysqlQuery('DELETE FROM user_trains WHERE user_id = ?', [user.id]);
            await db.mysqlQuery('DELETE FROM week_challenges WHERE user_id = ?', [user.id]);
            await db.mysqlQuery('DELETE FROM users WHERE id = ?', [user.id]);
            
            return res.status(200).json({ success: true, code: 1 });
        }
        
        return res.status(200).json({ success: false, code: 2, error: 'Пользователь не найден' });
    } catch (error) {
        console.log(error);
        return res.status(200).json({ success: false, code: 2, error: 'Внутренняя ошибка системы' });
    }
};
