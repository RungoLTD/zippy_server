require('custom-env').env(true);
// require('custom-env').env('production');

process.env.NODE_ENV = 'production'; //process.env.APP_ENV;

const express = require('express');
const bearerToken = require('express-bearer-token');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const db = require('./src/db');
const fs = require('fs');
const cron = require('node-cron');
var apiai = require('apiai');
const path = require("path");
const cookieParser = require('cookie-parser')

const UserNotifyService = require('./src/UserNotifyService');

var AWS = require('aws-sdk');
var ep = new AWS.Endpoint('storage.yandexcloud.net');
var s3 = new AWS.S3({
    region: 'us-east-1',
    sslEnabled: true,
    endpoint: ep,
    accessKeyId: process.env.YANDEX_STORAGE_KEY_ID,
    secretAccessKey: process.env.YANDEX_STORAGE_KEY_SECRET,
});

const io = require('socket.io')({
    path: '/socket.io',
});

const ChatService = require('./src/Chat/ChatService');

const NotificationService = require('./src/NotificationService');
const MoodService = require('./src/MoodService');

const Auth = require('./src/Auth');
const CreateAccount = require('./src/CreateAccount');
const RestoreAccount = require('./src/RestoreAccount');
const SendFcmToken = require('./src/SendFcmToken');
const FetchProfile = require('./src/Profile/FetchProfile');
const DeleteProfile = require('./src/Profile/DeleteProfile');
const UpdateTimezone = require('./src/Profile/UpdateTimezone');
const UpdateProfile = require('./src/Profile/UpdateProfile');
const GetAnimation = require('./src/Profile/GetAnimationSource');
const TotalStastics = require('./src/Profile/TotalStatistics');
const AddStatistics = require('./src/Statistics/AddStatistic');
const GetStatistics = require('./src/Statistics/GetStatistics');
const GetMoodStatistics = require('./src/Statistics/GetMoodStatistics');
const AddCountStatistics = require('./src/Statistics/AddCountStatistics');
const UpdateStatistics = require('./src/Statistics/UpdateStatistics');
const FetchChallenges = require('./src/Challenge/FetchChallenges');
const SetWeekChallenge = require('./src/Challenge/SetWeekChallenge');
const GetTrainList = require('./src/Trains/GetTrainList');
const SetTrain = require('./src/Trains/SetTrain');
const TrainStatus = require('./src/Trains/TrainStatus');
const RemoveTrain = require('./src/Trains/RemoveTrain');
const GetSkins = require('./src/Store/GetSkins');
const Payment = require('./src/Store/Payment');
const BuySkin = require('./src/Store/BuySkin');
const ApplySkin = require('./src/Store/ApplySkin');
const Chat = require('./src/Chat/Chat');
const ChatUnreadCount = require('./src/Chat/ChatUnreadCount');
const ChatHistory = require('./src/Chat/ChatHistory');
const GetFriends = require('./src/Friends/GetFriends');
const AddFriend = require('./src/Friends/AddFriend');
const RemoveFriend = require('./src/Friends/RemoveFriend');
const ApproveFriend = require('./src/Friends/ApproveFriend');

const GetTrainListV2 = require('./src/Trains/GetTrainListV2');
const SetTrainV2 = require('./src/Trains/SetTrainV2');
const TrainStatusV2 = require('./src/Trains/TrainStatusV2');
const GetInitalConfig = require('./src/GetInitalConfig');
const { sendEmail } = require('./src/EmailService');


const WebIndex = require('./src/Web/Index/AdminIndex');
const WebSignin = require('./src/Web/Signin/SigninIndex');
const WebSigninPost = require('./src/Web/Signin/SigninPost');
const WebSignup = require('./src/Web/Signup/SignupIndex');
const WebSignupPost = require('./src/Web/Signup/SignupPost');
const WebUsers = require('./src/Web/Users/UsersIndex');
const WebUsersView = require('./src/Web/Users/UsersView');
const WebUsersUpdate = require('./src/Web/Users/UsersUpdate');
const WebUsersAddFishcoin = require('./src/Web/Users/UsersAddFishcoin');
const WebStatistics = require('./src/Web/Statistics/StatisticsIndex');
const WebStatisticsView = require('./src/Web/Statistics/StatisticsView');
const WebSkins = require('./src/Web/Skins/SkinsIndex');
const WebTrains = require('./src/Web/Trains/TrainsIndex');
const WebAchievements = require('./src/Web/Achievements/AchievementsIndex');
const WebAchievementsCreate = require('./src/Web/Achievements/AchievementsCreate');
const WebAchievementsUpdate = require('./src/Web/Achievements/AchievementsUpdate');
const WebChallenges = require('./src/Web/Challenges/ChallengesIndex');
const WebFishcoins = require('./src/Web/Fishcoins/FishcoinsIndex');
const WebFishcoinsCreate = require('./src/Web/Fishcoins/FishcoinsCreate');
const WebFishcoinsUpdate = require('./src/Web/Fishcoins/FishcoinsUpdate');
const WebBanners = require('./src/Web/Banners/BannersIndex');
const WebBannersCreate = require('./src/Web/Banners/BannersCreate');
const WebBannersUpdate = require('./src/Web/Banners/BannersUpdate');
const WebTransactions = require('./src/Web/Transactions/TransactionsIndex');




var app = express();
// var sess = {
//     secret: 'qwerty',
//     genid: function(req) {
//         return uuid()
//       },
//     saveUninitialized: true,
//     cookie: { secure: true, maxAge: 60000 }
//   }
// app.use(session(sess))
app.use(cookieParser('qwerty'))
var server = require('http').createServer(app);
 
var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    charset: 'utf8mb4',
});

connection.connect((error) => {
    if (error) {
        console.error(error.message);
    } else {
        console.log('Соединение с mysql установлено');
    }
});

connection.on('error', (error) => {
    console.log(error.message);
});

cron.schedule('00 59 * * * *', async () => {
    // send
    db.mysqlQuery('show full processlist', []);
    NotificationService.notifyOldUsers();
});

// Уведомление в 7 утра
cron.schedule('*/5 * * * * *', async () => {
    // send
    MoodService.notifySetMood();
});

cron.schedule('1 0 * * * *', async () => {
    UserNotifyService.notify();
    UserNotifyService.isUsed7Days();
    MoodService.notifyOldMoodForgetUsers();
});

app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
app.use(bodyParser.json({ limit: '50mb' }));

app.use(bearerToken());

app.use(async (req, res, next) => {
    if (req.method == 'GET' || req.url == '/auth' || req.url == '/restore' || req.url == '/store/getSkins' || req.url == '/register' || req.url == '/web/signup-post' || req.url == '/web/achievements/create' || req.url == '/web/fishcoins/create' || req.url == '/web/fishcoins/update' || req.url == '/web/banners/create' || req.url == '/web/banners/update' || req.url == '/web/achievements/update' || req.url == '/web/users/update' || req.url == '/web/signin' || req.url.startsWith('/upload')) {
        if (req.url == '/notifyOldUsers') {
            NotificationService.notifyOldUsers();
        } else {
            next();
        }
    } else {
        let token = req.body.accessToken;
        let result = await db.mysqlQuery('SELECT * FROM users WHERE access_token = ?', [token]);

        if (!result) {
            return res.status(200).json({ success: false, error: 'Неккоректный токен', code: 1 }).end();
        } else {
            await db.mysqlUpdate('UPDATE users SET last_active_date = ? WHERE access_token = ?', [new Date(), token]);
            next();
        }
    }
}); 
app.set('view engine', 'ejs');
app.use('/assets', express.static(__dirname + '/zippy-site/assets'));

app.get('/', function (req, res) {
    return res.sendFile(path.join(__dirname + '/zippy-site/index.html'));
});
 
app.get('/web/index', WebIndex);

app.get('/web/signup', WebSignup);

app.post('/web/signup-post', WebSignupPost);

app.get('/web/signin', WebSignin);

app.post('/web/signin', WebSigninPost);

app.get('/web/users', WebUsers);

app.get('/web/users/view', WebUsersView);

app.get('/web/users/update', WebUsersUpdate);

app.post('/web/users/update', WebUsersUpdate);

app.get('/web/users/add-fishcoin', WebUsersAddFishcoin);

app.get('/web/statistics', WebStatistics);

app.get('/web/statistics/view', WebStatisticsView);

app.get('/web/skins', WebSkins);

app.get('/web/trains', WebTrains);

app.get('/web/achievements', WebAchievements);

app.post('/web/achievements/create', WebAchievementsCreate);

app.post('/web/achievements/update', WebAchievementsUpdate);

app.get('/web/challenges', WebChallenges);

app.get('/web/fishcoins', WebFishcoins);

app.post('/web/fishcoins/create', WebFishcoinsCreate);

app.post('/web/fishcoins/update', WebFishcoinsUpdate);

app.get('/web/banners', WebBanners);

app.post('/web/banners/create', WebBannersCreate);

app.post('/web/banners/update', WebBannersUpdate);

app.get('/web/transactions', WebTransactions)


app.get('/web/exit', function (req, res) {
    res.clearCookie("username");
    return res.redirect("/web/signin");
});
 




app.post('/upload', function (req, res) {
    const fileName = new Date().getTime();

    let key = '/avatars/avatar-' + String(fileName) + '.png';
    buf = new Buffer(req.body.data.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    var data = {
        Bucket: 'zippy-images',
        Key: key,
        Body: buf,
        ContentEncoding: 'base64',
        ContentType: 'image/png',
    };

    s3.putObject(data, function (err, data) {
        if (err) {
            return res.status(200).json({ success: false, code: 6 }).end();
        } else {
            return res
                .status(200)
                .json({ success: false, data: { address: 'https://storage.yandexcloud.net/zippy-images/avatars/' + key } })
                .end();
        }
    });
});

// All public files
app.get('/public/:file', function (req, res) {
    try {
        file = req.params.file;

        if (file.includes('..')) {
            throw 'Access denied';
        }

        var img = fs.readFileSync(__dirname + '/public/' + file);

        if (file.includes('.html')) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
        } else {
            res.writeHead(200, { 'Content-Type': 'image/jpg' });
        }
        res.end(img, 'binary');
    } catch (error) {
        res.end('Access dendied');
        console.log(error);
    }
});

// Fetch user uploaded files
app.get('/public/upload/:file', function (req, res) {
    try {
        file = req.params.file;

        if (file.includes('..')) {
            throw 'Access denied';
        }

        var img = fs.readFileSync(__dirname + '/public/upload/' + file);
        res.writeHead(200, { 'Content-Type': 'image/jpg' });
        res.end(img, 'binary');
    } catch (error) {
        res.end('Access dendied');
        console.log(error);
    }
});

// Skin fetching
app.get('/public/skins/:file', function (req, res) {
    try {
        file = req.params.file;

        if (file.includes('..')) {
            throw 'Access denied';
        }

        var img = fs.readFileSync(__dirname + '/public/skins/' + file);
        res.writeHead(200, { 'Content-Type': 'image/jpg' });
        res.end(img, 'binary');
    } catch (error) {
        res.end('Access dendied');
        console.log(error);
    }
});

// Авторизация
app.post('/auth', Auth);
app.post('/register', CreateAccount);
app.post('/restore', RestoreAccount);
app.post('/sendFcmToken', SendFcmToken);

// Профиль
app.post('/profile/fetch', FetchProfile);
app.post('/profile/update', UpdateProfile);
app.post('/profile/setTimezone', UpdateTimezone);
app.post('/profile/totalStatistics', TotalStastics);
app.post('/profile/getAnimation', GetAnimation);
app.post('/profile/delete', DeleteProfile);

// Статистика
app.post('/statistics/add', AddStatistics);
app.post('/statistics/get', GetStatistics);
app.post('/statistics/update', UpdateStatistics);
app.post('/statistics/setStepStats', AddCountStatistics);
app.post('/statistics/getMoodStatistics', GetMoodStatistics);

// Челленджи
app.post('/challenges/fetch', FetchChallenges);
app.post('/challenges/setWeek', SetWeekChallenge);

// Тренировки
app.post('/trains/getList', GetTrainList);
app.post('/v2/trains/getList', GetTrainListV2);
app.post('/trains/setTrain', SetTrain);
app.post('/v2/trains/setTrain', SetTrainV2);
app.post('/trains/status', TrainStatus);
app.post('/v2/trains/status', TrainStatusV2);
app.post('/trains/removeTrains', RemoveTrain);

// Магазин
app.post('/store/getSkins', GetSkins);
app.post('/store/payment', Payment);
app.post('/store/buySkin', BuySkin);
app.post('/store/applySkin', ApplySkin);

// Чат
app.post('/chat/history', ChatHistory);
app.post('/chat/unreadCount', ChatUnreadCount);

// Друзья
app.post('/friends/list', GetFriends);
app.post('/friends/add', AddFriend);
app.post('/friends/approve', ApproveFriend);
app.post('/friends/remove', RemoveFriend);

// Конфиг
app.post('/v2/getInitalConfig', GetInitalConfig);

io.attach(server, {
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false,
});

io.on('connection', Chat);

server.listen(process.env.HTTP_PORT, '127.0.0.1', () => {
    console.log('Server started on '+process.env.HTTP_PORT+' port');
});

module.exports.io = io;
module.exports.connection = connection;