const https = require('https');
const db = require('./db');
var CryptoJS = require('crypto-js');
const AchievmentService = require('./AchievmentService');
const appleSignin = require('apple-signin-auth');

const defaultPhotoImage = 'https://storage.yandexcloud.net/zippy-uploads/screenProfile.png';

function genAccessToken(key) {
    return CryptoJS.AES.encrypt(key, 'sdfn31nr13r').toString();
}
function getSHA256(key) {
    return CryptoJS.SHA256(key).toString();
}

function reqGoogle(data) {
    return new Promise((resolve, reject) => {
        let req = https.request(
            {
                protocol: 'https:',
                host: 'www.googleapis.com',
                path: '/oauth2/v1/tokeninfo?access_token=' + data.accessToken,
                method: 'GET',
                timeout: 5000,
            },
            (res) => {
                let responseString = '';
                res.on('data', function (data) {
                    responseString += data;
                });
                res.on('end', function () {
                    let response = JSON.parse(responseString);
                    resolve(response);
                });
            },
        );

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

function reqFacebook(data) {
    return new Promise((resolve, reject) => {
        let req = https.request(
            {
                protocol: 'https:',
                host: 'graph.facebook.com',
                path: '/me?access_token=' + data.accessToken,
                method: 'GET',
                timeout: 5000,
            },
            (res) => {
                let responseString = '';
                res.on('data', function (data) {
                    responseString += data;
                });
                res.on('end', function () {
                    let response = JSON.parse(responseString);
                    resolve(response);
                });
            },
        );

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

module.exports = async function auth(req, res) {
    try {
        let fcm_token = req.body.fcmToken == undefined ? null : req.body.fcmToken;
        switch (req.body.authType) {
            case 'google':
                let googleResult = await reqGoogle({ accessToken: req.body.accessToken });
                if (googleResult.error) {
                    return res.status(200).json({ success: false, code: 2, error: 'Некорректный токен' }).end();
                } else {
                    let token = genAccessToken(req.body.accessToken);

                    let result = await db.mysqlQuery('SELECT * FROM users WHERE auth_type = ? AND social_user_id = ?', ['google', googleResult.user_id]);

                    if (!result) {
                        let newUserId = await db.mysqlInsert('INSERT INTO users SET ?', {
                            social_user_id: googleResult.user_id,
                            access_token: token,
                            fcm_token: fcm_token,
                            auth_type: 'google',
                            avatar: defaultPhotoImage,
                        });
                        // Set default skin
                        await db.mysqlInsert('INSERT INTO user_skins SET ?', { user_id: newUserId, skin_id: 'default' });
                        AchievmentService(newUserId, 22);
                    } else {
                        await db.mysqlUpdate('UPDATE users SET access_token = ?, fcm_token = ? WHERE auth_type = ? AND social_user_id = ?', 
                        [token, fcm_token, result.auth_type, result.social_user_id]);
                    }

                    return res
                        .status(200)
                        .json({ success: true, code: 1, data: { access_token: token, user_data: result ? result : null } })
                        .end();
                }
                break;
            case 'facebook':
                let facebookResult = await reqFacebook({ accessToken: req.body.accessToken });
                if (facebookResult.error) {
                    return res.status(200).json({ success: false, code: 2, error: 'Некорректный токен' }).end();
                } else {
                    let token = genAccessToken(req.body.accessToken);

                    let result = await db.mysqlQuery('SELECT * FROM users WHERE auth_type = ? AND social_user_id = ?', ['facebook', facebookResult.id]);

                    if (!result) {
                        let newUserId = await db.mysqlInsert('INSERT INTO users SET ?', {
                            social_user_id: facebookResult.id,
                            name: facebookResult.name,
                            avatar: defaultPhotoImage,
                            access_token: token,
                            fcm_token: fcm_token,
                            auth_type: 'facebook',
                        });
                        // Set default skin
                        await db.mysqlInsert('INSERT INTO user_skins SET ?', { user_id: newUserId, skin_id: 'default' });
                        AchievmentService(newUserId, 22);
                    } else {
                        await db.mysqlUpdate('UPDATE users SET access_token = ?, fcm_token = ? WHERE auth_type = ? AND social_user_id = ?', [
                            token,
                            fcm_token,
                            result.auth_type,
                            result.social_user_id,
                        ]);
                    }

                    return res
                        .status(200)
                        .json({ success: true, code: 1, data: { access_token: token, user_data: result ? result : null } })
                        .end();
                }
                break;
            case 'email':
                let pw = getSHA256(req.body.pw);
                let user = await db.mysqlQuery("SELECT * FROM users WHERE auth_type = 'email' AND email = ? AND social_user_id = ?", [req.body.email, pw]);

                if (user) {
                    await db.mysqlUpdate('UPDATE users SET fcm_token = ? WHERE id = ? ', [
                        fcm_token,
                        user.id,
                    ]);
                    return res
                        .status(200)
                        .json({ success: true, code: 1, data: { access_token: user.access_token, user_data: user } })
                        .end();
                } else {
                    return res.status(200).json({ success: false, code: 2, error: 'Неверный логин или пароль' }).end();
                }
                break;
            case 'appleId':
                let idToken = req.body.accessToken;

                let appleResult = await appleSignin.verifyIdToken(idToken, {
                    audience: 'com.myrungo.ios-app',
                    ignoreExpiration: true,
                });
                let token = genAccessToken(idToken);

                // проверка есть ли пользователь
                let appleUser = await db.mysqlQuery('SELECT * FROM users WHERE auth_type = ? AND social_user_id = ?', ['appleId', appleResult.sub]);
                
                if (!appleUser) {
                    let newUserId = await db.mysqlInsert('INSERT INTO users SET ?', {
                        social_user_id: appleResult.sub,
                        access_token: token,
                        fcm_token: fcm_token,
                        auth_type: 'appleId',
                        avatar: defaultPhotoImage,
                    });
                    // Set default skin
                    await db.mysqlInsert('INSERT INTO user_skins SET ?', { user_id: newUserId, skin_id: 'default' });
                    AchievmentService(newUserId, 22);
                } else {
                    await db.mysqlUpdate('UPDATE users SET access_token = ?, fcm_token = ? WHERE id = ?', 
                    [token, fcm_token, appleUser.id]);
                }
                return res
                    .status(200)
                    .json({ success: true, code: 1, data: { access_token: token, user_data: appleUser ? appleUser : null }})
                    .end();
            default:
                return res.status(200).json({ success: false, code: 2, error: 'Не задан метод авторизации' }).end();
        }
    } catch (error) {
        console.log(error);
        return res.status(200).json({ success: false, code: 2, error: error }).end();
    }
};
