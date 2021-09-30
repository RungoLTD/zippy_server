const db = require('./db');
var CryptoJS = require('crypto-js');
var EmailService = require('./EmailService');
const AchievmentService = require('./AchievmentService');

const defaultPhotoImage = 'https://storage.yandexcloud.net/zippy-uploads/screenProfile.png';


function genAccessToken() {
    return CryptoJS.AES.encrypt(getPW(30), getPW(15)).toString();
}
function getSHA256(key) {
    return CryptoJS.SHA256(key).toString();
}

function getPW(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

module.exports = async function (req, res) {
    let email = req.body.email;
    let os_code = req.body.os_code;
    let version_build = req.body.version_build;
    let version_app = req.body.version_app;
    os_code = os_code == undefined ? 1 : os_code;
    version_build = version_build == undefined ? 0 : version_build;
    version_app = version_app == undefined ? 0 : version_app;

    try {
        let user = await db.mysqlQuery('SELECT * FROM users WHERE auth_type = ? AND email = ?', ['email', email]);

        if (user) {
            return res.status(200).json({ success: false, code: 1, error: 'Пользователь с данным email уже существует. Попробуйте восстановить пароль' });
        } else {
            // генерим пароль
            let pw = getPW(8);

            // отправляем пароль по email
            EmailService.sendEmail(email, pw);

            let pwsha256 = getSHA256(pw);

            let newUserId = await db.mysqlInsert('INSERT INTO users SET ?', {
                social_user_id: pwsha256,
                name: '',
                access_token: genAccessToken(),
                auth_type: 'email',
                email: email,
                os_code: os_code,
                version_build: version_build,
                version_app: version_app,
                avatar: defaultPhotoImage,
            });
            await db.mysqlInsert('INSERT INTO user_skins SET ?', { user_id: newUserId, skin_id: 'default' });

            AchievmentService(newUserId, 22);
        }

        return res.status(200).json({ success: true, code: 1 });
    } catch (error) {
        console.log(error);
        return res.status(200).json({ success: false, code: 2, error: 'Внутренняя ошибка системы' });
    }
};
