const db = require('../db');

module.exports = async function(req, res) {
    try {
        var user = await db.mysqlQuery('SELECT * FROM users WHERE access_token = ?', [req.body.accessToken]);

        let challenges = (await db.mysqlQueryArray('SELECT * FROM challenges', null)) || [];

        challenges = challenges.map(c => {
            return { isActive: false, userData: null, ...c };
        });

        let userChallenges = await db.mysqlQueryArray('SELECT * FROM week_challenges WHERE user_id = ? AND state = 0', [user.id]);

        for (let index = 0; index < userChallenges.length; index++) {
            const userChallenge = userChallenges[index];
            for (let index2 = 0; index2 < challenges.length; index2++) {
                const challenge = challenges[index2];
                if (!challenge.is_week) {
                    continue;
                }

                if (challenge.id == userChallenge.challenge_id) {
                    challenges[index2].isActive = true;
                    challenges[index2].userData = userChallenge;

                    let minDate = userChallenge.start_date
                        .toISOString()
                        .slice(0, 19)
                        .replace('T', ' ');

                    console.log(minDate);
                    statistics = await db.mysqlQuery(
                        'SELECT SUM(meters) as distance, COUNT(id) as trainCount, AVG(avgSpeed) as avgSpeed, AVG(avgPace) as avgPace FROM statistics WHERE user_id = ? AND created > ?',
                        [user.id, minDate],
                    );
                    challenges[index2].statistics = statistics;

                    // Проверка юзера на то что закончил недельный челлендж
                    let startDate = userChallenge.start_date;
                    let endDate = startDate.getTime() + (challenge.durationTime * 1000);
                    if (endDate <= new Date().getTime()) {
                        // Челлендж закончился и финишируем его
                        await db.mysqlUpdate('UPDATE week_challenges SET state = 1 WHERE id = ?', [userChallenge.id]);
                        if (statistics.distance >= challenge.distance) {
                            // Append reward for user
                            await db.mysqlQuery('INSERT INTO transactions SET ?', {
                                user_id: user.id,
                                operation: '+',
                                type: 'week_challenge',
                                detail_id: userChallenge.id,
                                amount: challenge.reward,
                            });
                        }
                        challenges[index2].isActive = false;
                    }

                    continue;
                }
            }
        }

        return res.status(200).json({ success: true, code: 1, data: challenges });
    } catch (error) {
        return res.status(200).json({ success: false, code: 2, error: error });
    }
};
