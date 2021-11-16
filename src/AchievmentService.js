const db = require('./db');

module.exports = async (user_id, achievement_id) => {

    if (achievement_id >= 7 && achievement_id <= 14) {
        // Проверка, ставили мы его седня
        let achievementAvail = await db.mysqlQuery("SELECT * FROM transactions WHERE DATE(created) = CURDATE() AND user_id = ? AND detail_id = ?", [user_id, achievement_id]);
        if (achievementAvail){
            console.log("user getted is achievement in today");
            return;
        }
    }

    let achievement = await db.mysqlQuery("SELECT * FROM achievements WHERE id = ?", [achievement_id]);
    let user_achievement = await db.mysqlQuery("SELECT * FROM user_achievements WHERE user_id = ? AND achievement_id = ?", [user_id, achievement_id]);

    if (!user_achievement) {
        await db.mysqlInsert("INSERT INTO user_achievements SET ?", {
            user_id : user_id,
            achievement_id : achievement_id
        });
    }

    let user = await db.mysqlQuery('SELECT mood FROM users WHERE id = ?', [user_id]);

    var newMood = user.mood + achievement.cat_mood_append;
    if (newMood > 100){
        newMood = 100;
    }

    await db.mysqlUpdate("UPDATE users SET mood = ? WHERE id = ?", [newMood, user_id]);

    await db.mysqlInsert("INSERT INTO transactions SET ?", {
        user_id : user_id,
        operation : '+',
        type : 'achievement',
        detail_id : achievement_id,
        amount : achievement.coins_count
    });
}