function getMultiplayerModel(title, distance, time) {
    return {
        title: title,
        distance: distance,
        time: time,
        type: 'multiplayer',
    };
}

function getTrainDurationLimitModel(title, durationLimit) {
    return {
        title: title,
        limit: durationLimit,
        type: 'duration',
    };
}

function getStartDateModel(title, startDate) {
    return {
        title: title,
        startDate: startDate,
        type: 'startDate',
    };
}

function getImportModel(title, importFile) {
    return {
        title: title,
        importFile: require(importFile),
        type: 'importFile',
    };
}

function addDaysToDate(days) {
    var date = new Date();
    date.setDate(date.getDate() + days);
    return date;
}

function getNextMonday() {
    var d = new Date();
    d.setDate(d.getDate() + ((7 - d.getDay()) % 7) + 1);
    return d;
}

const rehabilitation = {
    isFree: true,
    сalories: 1,
    trainProgram: require('./Imports/Rehabilitation'),
    image: 'https://storage.yandexcloud.net/zippy-images/trains/rehabilitation.jpg',
    title: {
        ru: 'Реабилитация после пневмнонии',
        en: 'Recovery from pneumonia',
    },
    description: {
        ru: 'Восстановись после болезни.',
        en: 'Recover from your illness.',
    },
    full: {
        ru:
            'Реабилитация предусматривает прежде всего внимание к укреплению межреберных мышц и диафрагмального дыхания. Для этого необходимо делать дыхательные упражнения.Обязательно прогулки на свежем воздухе. Дозированная ходьба. Начинаем с 15 минут в день и постепенно увеличиваем длительность и дальность прогулок. Рекомендуем измерить пульс и давление до и после прогулки.  И, конечно, обратите внимание на свое самочувствие, перед тем как начать заниматься по программе "Реабилитация", настаиваем на посещении врача. «Стоп-сигналами» для проведения мероприятий по реабилитации являются: усиление одышки; повышение ЧСС более 50% от исходной величины или снижение ЧСС при нагрузке; SaО2 < 90% или снижение на 4 пункта во время выполнения упражнений, чувство стеснения в груди, головокружение, головная боль. Всем, завершившим программу реабилитации после пневмонии , рекомендуется продолжить тренировки с сопротивлением и отягощением для восстановления мышечной силы, выносливости мышц конечностей и устойчивости к мышечной усталости. Рекомендовано сочетать прогрессирующее мышечное сопротивление и аэробную нагрузку во время занятий лечебной физкультурой.',
        en:
            'Rehabilitation primarily focuses on strengthening the intercostal muscles and diaphragmatic breathing. To do this, you need to do breathing exercises.Be sure to walk in the fresh air. Dosed walking. We start with 15 minutes a day and gradually increase the duration and distance of walks. We recommend taking your heart rate and blood pressure before and after your walk. And, of course, pay attention to your health, before you start working on the program "Rehabilitation", we insist on visiting a doctor. "Stop signals" for rehabilitation activities are: increased shortness of breath; an increase in heart rate of more than 50% of the initial value or a decrease in heart rate during exercise; SaO2 < 90% or a decrease of 4 points during exercise, chest tightness, dizziness, headache. Anyone who has completed a post-pneumonia rehabilitation program is encouraged to continue resistance and weight training to restore muscle strength, limb muscle endurance, and resistance to muscle fatigue. It is recommended to combine progressive muscle resistance and aerobic exercise during physical therapy.',
    },
    options: [
        {
            title: {
                ru: 'День начала программы',
                en: 'Program Start Day',
            },
            options: [
                getStartDateModel(
                    {
                        ru: 'Сегодня',
                        en: 'Today',
                    },
                    new Date(),
                ),
                getStartDateModel(
                    {
                        ru: 'Завтра',
                        en: 'Tomorrow',
                    },
                    addDaysToDate(1),
                ),
                getStartDateModel(
                    {
                        ru: 'В следующий понедельник',
                        en: 'Next Monday',
                    },
                    getNextMonday(),
                ),
            ],
        },
    ],
};

const losingWeight = {
    isFree: false,
    сalories: 1,
    trainProgram: require('./Imports/losingWeight'),
    image: 'https://storage.yandexcloud.net/zippy-images/trains/losingWeight.jpg',
    title: {
        ru: 'Похудение',
        en: 'Slimming',
    },
    description: {
        ru: 'Сжигай жир с помощью бега (6-12 недель)',
        en: 'Burn fat with jogging (6-12 weeks)',
    },
    full: {
        ru:
            'Бег для похудения эффективен только при правильном подходе. Это значит, что нужно соблюдать питание, меры безопасности, регулярно и с удовольствием тренироваться.Жиры активнее сжигаются во время утренних пробежек на голодный желудок (не забывать пить воду во время тренировки). Бег – надежный способ не только похудеть, но и удержать достигнутый вес: при регулярных тренировках он будет оставаться на нужном вам уровне. Следует быть осторожным людям с болезнями сердца, лишний вес свыше 100 кг и гипертнонией. Если вы никогда не бегали, советуем начать с программы начинающих.',
        en:
            'Running for weight loss is only effective with the right approach. This means that you need to observe nutrition, safety measures, exercise regularly and with pleasure. Fats are more actively burned during morning runs on an empty stomach (do not forget to drink water during training). Running is a reliable way to not only lose weight, but also to maintain the weight achieved: with regular training, it will remain at the level you need. You should be careful for people with heart disease, overweight over 100 kg and hypertension. If you have never run, we recommend starting with a beginner program.',
    },
    options: [
        {
            title: {
                ru: 'Насколько часто ты бегаешь?',
                en: 'How often do you run?',
            },
            options: [
                getMultiplayerModel(
                    {
                        ru: 'Никогда не бегал',
                        en: 'Never run',
                    },
                    {
                        multiplayer: 1,
                        append: 0,
                    },
                    {
                        multiplayer: 0.7,
                        append: 0,
                    },
                ),
                getMultiplayerModel(
                    {
                        ru: 'Раньше занимался бегом',
                        en: 'I used to run',
                    },
                    {
                        multiplayer: 1,
                        append: 0,
                    },
                    {
                        multiplayer: 1,
                        append: 0,
                    },
                ),
                getMultiplayerModel(
                    {
                        ru: 'Переодически бегаю',
                        en: 'I run periodically',
                    },
                    {
                        multiplayer: 1,
                        append: 0,
                    },
                    {
                        multiplayer: 1.3,
                        append: 0,
                    },
                ),
            ],
        },
        {
            title: {
                ru: 'Продолжительность программы',
                en: 'Program duration',
            },
            options: [
                getTrainDurationLimitModel(
                    {
                        ru: '6 недель',
                        en: '6 weeks',
                    },
                    6 * 7,
                ),
                getTrainDurationLimitModel(
                    {
                        ru: '8 недель',
                        en: '8 weeks',
                    },
                    8 * 7,
                ),
                getTrainDurationLimitModel(
                    {
                        ru: '10 недель',
                        en: '10 weeks',
                    },
                    10 * 7,
                ),
                getTrainDurationLimitModel(
                    {
                        ru: '12 недель',
                        en: '12 weeks',
                    },
                    12 * 7,
                ),
            ],
        },
        {
            title: {
                ru: 'День начала программы',
                en: 'Program Start Day',
            },
            options: [
                getStartDateModel(
                    {
                        ru: 'Сегодня',
                        en: 'Today',
                    },
                    new Date(),
                ),
                getStartDateModel(
                    {
                        ru: 'Завтра',
                        en: 'Tomorrow',
                    },
                    addDaysToDate(1),
                ),
                getStartDateModel(
                    {
                        ru: 'В следующий понедельник',
                        en: 'Next Monday',
                    },
                    getNextMonday(),
                ),
            ],
        },
    ],
};

const begginers = {
    isFree: false,
    сalories: 1,
    trainProgram: require('./Imports/beginners'),
    image: 'https://storage.yandexcloud.net/zippy-images/trains/begginers.jpg',
    title: {
        ru: 'Начинающий',
        en: 'Beginning',
    },
    description: {
        ru: 'Научись бегать и прогрессируй (4-6 недель)',
        en: 'Learn to run and progress (4-6 weeks)',
    },
    full: {
        ru:
            'В первую очередь советуем посетить врача Необходимо убедиться в отсутствии противопоказаний. Экипировка - Правильно подобранная экипировка обеспечит комфорт, поможет хначительно улучшить свои результаты и установить новые личные рекорды. Чтобы не было травм и лучше подготовиться к бегу, Не забывайте разминаться перед бегом, для этого у нас в приложении есть функция "Разминка". Как только дистанция преодолена, не следует резко останавливаться, нужно перейти на медленный шаг, успокоить дыхание, сделать несколько упражнений на растяжку. В случае недомогания лучше пропустить тренировку, чем бежать через силу.',
        en:
            'First of all, we recommend visiting a doctor. You need to make sure that there are no contraindications. Equipment - Properly selected equipment will provide comfort, help to significantly improve your results and set new personal records. So that there are no injuries and it is better to prepare for a run, Do not forget to warm up before running, for this we have the "Warm up" function in the application. As soon as the distance is overcome, you should not stop abruptly, you need to go to a slow step, calm your breathing, do some stretching exercises. If you feel unwell, it’s better to skip a workout than to run through strength.',
    },
    color: '#EE0131',
    options: [
        {
            title: {
                ru: 'Какая твоя цель',
                en: 'What is your purpose',
            },
            options: [
                getTrainDurationLimitModel(
                    {
                        ru: '20 минут через 4 недели',
                        en: '20 minutes after 4 weeks',
                    },
                    4 * 7,
                ),
                getTrainDurationLimitModel(
                    {
                        ru: '30 минут через 6 недели',
                        en: '30 minutes after 6 weeks',
                    },
                    6 * 7,
                ),
            ],
        },
        {
            title: {
                ru: 'День начала программы',
                en: 'Program Start Day',
            },
            options: [
                getStartDateModel(
                    {
                        ru: 'Сегодня',
                        en: 'Today',
                    },
                    new Date(),
                ),
                getStartDateModel(
                    {
                        ru: 'Завтра',
                        en: 'Tomorrow',
                    },
                    addDaysToDate(1),
                ),
                getStartDateModel(
                    {
                        ru: 'В следующий понедельник',
                        en: 'Next Monday',
                    },
                    getNextMonday(),
                ),
            ],
        },
    ],
};

const children = {
    isFree: false,
    сalories: 1,
    trainProgram: null,
    image: 'https://storage.yandexcloud.net/zippy-images/trains/children.jpg',
    title: {
        ru: 'Детская',
        en: 'Children',
    },
    description: {
        ru: 'Здоровье и энергичность с детства. (10-11 недель)',
        en: 'Health and energy since childhood. (10-11 weeks)',
    },
    full: {
        ru:
            'Бег – естественное и привычное для детей движение, которое является неотъемлемой частью подвижных игр в повседневной жизни. Быть здоровым и энергичным, волевым и выносливым детям и взрослым помогают беговые тренировки. Чтобы бег стал привычкой и умением, нужно начинать пробежки с детства.Помните, что у ребёнка ещё несформировавшийся организм. Идеальное место для пробежек с детьми – на природе, где лесные ровные и длинные дорожки. Ни в коем случае детям нельзя бегать по асфальту и тем более бетону, велик риск возникновения проблем с опорно-двигательным аппаратом. Совет – бегите рядом с ребёнком. Во-первых, вы интуитивно почувствуете, приносит ли бег пользу для здоровья вашему чаду, а, во-вторых, сами всегда будете в отличной форме и правильным примером для него.',
        en:
            'Running is a natural and familiar movement for children, which is an integral part of outdoor games in everyday life. Running healthy exercises help to be healthy and energetic, strong-willed and hardy children and adults. In order for jogging to become a habit and skill, you need to start jogging from childhood. Remember that the child has an unformed body. An ideal place for jogging with children is in nature, where there are forest even and long paths. In no case should children run on asphalt and especially concrete; there is a high risk of problems with the musculoskeletal system. Tip - run next to the child. Firstly, you will intuitively feel whether running brings health benefits to your child, and secondly, you yourself will always be in great shape and the right example for him.',
    },
    options: [
        {
            title: {
                ru: 'Сколько лет?',
                en: 'How many years?',
            },
            options: [
                getImportModel(
                    {
                        ru: 'от 7 до 9',
                        en: 'from 7 to 9',
                    },
                    './Imports/Children1',
                ),
                getImportModel(
                    {
                        ru: 'от 10 до 14 лет',
                        en: 'from 10 to 14 years',
                    },
                    './Imports/Children2',
                ),
            ],
        },
        {
            title: {
                ru: 'День начала программы',
                en: 'Program Start Day',
            },
            options: [
                getStartDateModel(
                    {
                        ru: 'Сегодня',
                        en: 'Today',
                    },
                    new Date(),
                ),
                getStartDateModel(
                    {
                        ru: 'Завтра',
                        en: 'Tomorrow',
                    },
                    addDaysToDate(1),
                ),
                getStartDateModel(
                    {
                        ru: 'В следующий понедельник',
                        en: 'Next Monday',
                    },
                    getNextMonday(),
                ),
            ],
        },
    ],
};

const marathon10 = {
    isFree: false,
    сalories: 1,
    trainProgram: require('./Imports/marathon10'),
    image: 'https://storage.yandexcloud.net/zippy-images/trains/marathon.jpg',
    title: {
        ru: 'Марафон 10',
        en: 'Marathon 10',
    },
    description: {
        ru: 'Вперед к вершинам! Пробеги 10 км!',
        en: 'Go to the top! 10 km run!',
    },
    full: {
        ru: `Слушайте свое тело
        Вы должны научиться грамотно распознавать сигналы собственного тела: когда нужно отдохнуть, а когда, наоборот, следует поднажать. Можно и нужно не обращать внимания на небольшие болевые ощущения, которые проходят через несколько секунд во время забега или в течение одного-двух дней отдыха.
        Боль, которая заставляет остановится посреди пробежки или сохраняется после нескольких дней отдыха, нельзя игнорировать. В этом случае следует обратиться к специалисту. Наибольший опыт в данном вопросе имеют спортивные врачи. Чаще всего немного отдыха и реабилитации на ранней стадии дает хороший шанс для быстрого восстановления, а игнорирование ведет к усугублению, а затем к затяжному лечению.`,
        en: `Listen to your body
        You must learn to correctly recognize the signals of your own body: when you need to relax, and when, on the contrary, you need to push. You can and should not pay attention to small pains that pass after a few seconds during the race or during one to two days of rest.
        The pain that makes you stop in the middle of a run or persists after several days of rest cannot be ignored. In this case, consult a specialist. The greatest experience in this matter have sports doctors. Most often, a little rest and rehabilitation at an early stage gives a good chance for a quick recovery, and ignoring leads to aggravation, and then to a protracted treatment.`,
    },
    options: [
        {
            title: {
                ru: 'Моя цель в гонке',
                en: 'My goal in the race',
            },
            options: [
                getMultiplayerModel(
                    {
                        ru: '40 минут',
                        en: '40 minutes',
                    },
                    {
                        multiplayer: 1,
                        append: 1000,
                    },
                    {
                        multiplayer: 0.85,
                        append: 0,
                    },
                ),
                getMultiplayerModel(
                    {
                        ru: '50 минут',
                        en: '50 minutes',
                    },
                    {
                        multiplayer: 1,
                        append: 0,
                    },
                    {
                        multiplayer: 1,
                        append: 0,
                    },
                ),
                getMultiplayerModel(
                    {
                        ru: '60 минут',
                        en: '60 minutes',
                    },
                    {
                        multiplayer: 1,
                        append: 0,
                    },
                    {
                        multiplayer: 1.15,
                        append: 0,
                    },
                ),
                getMultiplayerModel(
                    {
                        ru: 'Лишь бы пробежать',
                        en: 'Just to run',
                    },
                    {
                        multiplayer: 1,
                        append: 0,
                    },
                    {
                        multiplayer: 1.3,
                        append: 0,
                    },
                ),
            ],
        },
        {
            title: {
                ru: 'День начала программы',
                en: 'Program Start Day',
            },
            options: [
                getStartDateModel(
                    {
                        ru: 'Сегодня',
                        en: 'Today',
                    },
                    new Date(),
                ),
                getStartDateModel(
                    {
                        ru: 'Завтра',
                        en: 'Tomorrow',
                    },
                    addDaysToDate(1),
                ),
                getStartDateModel(
                    {
                        ru: 'В следующий понедельник',
                        en: 'Next Monday',
                    },
                    getNextMonday(),
                ),
            ],
        },
    ],
};

const halfMarathon = {
    isFree: false,
    сalories: 1,
    trainProgram: require('./Imports/halfMarathon'),
    image: 'https://storage.yandexcloud.net/zippy-images/trains/marathon.jpg',
    title: {
        ru: 'Полумарафон',
        en: 'Half marathon',
    },
    description: {
        ru: 'Вперед к вершинам! Пробеги полумарафон 21,1 км!',
        en: 'Go to the top! Half-marathon 21.1 km run!',
    },
    full: {
        ru: `Слушайте свое тело
        Вы должны научиться грамотно распознавать сигналы собственного тела: когда нужно отдохнуть, а когда, наоборот, следует поднажать. Можно и нужно не обращать внимания на небольшие болевые ощущения, которые проходят через несколько секунд во время забега или в течение одного-двух дней отдыха.
        Боль, которая заставляет остановится посреди пробежки или сохраняется после нескольких дней отдыха, нельзя игнорировать. В этом случае следует обратиться к специалисту. Наибольший опыт в данном вопросе имеют спортивные врачи. Чаще всего немного отдыха и реабилитации на ранней стадии дает хороший шанс для быстрого восстановления, а игнорирование ведет к усугублению, а затем к затяжному лечению.`,
        en: `Listen to your body
        You must learn to correctly recognize the signals of your own body: when you need to relax, and when, on the contrary, you need to push. You can and should not pay attention to small pains that pass after a few seconds during the race or during one to two days of rest.
        The pain that makes you stop in the middle of a run or persists after several days of rest cannot be ignored. In this case, consult a specialist. The greatest experience in this matter have sports doctors. Most often, a little rest and rehabilitation at an early stage gives a good chance for a quick recovery, and ignoring leads to aggravation, and then to a protracted treatment.`,
    },
    options: [
        {
            title: {
                ru: 'Моя цель в гонке',
                en: 'My goal in the race',
            },
            options: [
                getMultiplayerModel(
                    {
                        ru: '1:40',
                        en: '1:40',
                    },
                    {
                        multiplayer: 1,
                        append: 1000,
                    },
                    {
                        multiplayer: 0.9,
                        append: 0,
                    },
                ),
                getMultiplayerModel(
                    {
                        ru: '1:50',
                        en: '1:50',
                    },
                    {
                        multiplayer: 1,
                        append: 0,
                    },
                    {
                        multiplayer: 1,
                        append: 0,
                    },
                ),
                getMultiplayerModel(
                    {
                        ru: '2:15',
                        en: '2:15',
                    },
                    {
                        multiplayer: 1,
                        append: 0,
                    },
                    {
                        multiplayer: 1,
                        append: 1.23,
                    },
                ),
                getMultiplayerModel(
                    {
                        ru: 'Лишь бы пробежать',
                        en: 'Just to run',
                    },
                    {
                        multiplayer: 1,
                        append: 0,
                    },
                    {
                        multiplayer: 1,
                        append: 1.4,
                    },
                ),
            ],
        },
        {
            title: {
                ru: 'День начала программы',
                en: 'Program Start Day',
            },
            options: [
                getStartDateModel(
                    {
                        ru: 'Сегодня',
                        en: 'Today',
                    },
                    new Date(),
                ),
                getStartDateModel(
                    {
                        ru: 'Завтра',
                        en: 'Tomorrow',
                    },
                    addDaysToDate(1),
                ),
                getStartDateModel(
                    {
                        ru: 'В следующий понедельник',
                        en: 'Next Monday',
                    },
                    getNextMonday(),
                ),
            ],
        },
    ],
};

const marathon = {
    isFree: false,
    сalories: 1,
    trainProgram: require('./Imports/marathon'),
    image: 'https://storage.yandexcloud.net/zippy-images/trains/marathon.jpg',
    title: {
        ru: 'Марафон',
        en: 'Marathon',
    },
    description: {
        ru: 'Вперед к вершинам! Пробеги марафон 42,2 км!',
        en: 'Go to the top! Marathon 42.2 km run!',
    },
    full: {
        ru: `Слушайте свое тело
        Вы должны научиться грамотно распознавать сигналы собственного тела: когда нужно отдохнуть, а когда, наоборот, следует поднажать. Можно и нужно не обращать внимания на небольшие болевые ощущения, которые проходят через несколько секунд во время забега или в течение одного-двух дней отдыха.
        Боль, которая заставляет остановится посреди пробежки или сохраняется после нескольких дней отдыха, нельзя игнорировать. В этом случае следует обратиться к специалисту. Наибольший опыт в данном вопросе имеют спортивные врачи. Чаще всего немного отдыха и реабилитации на ранней стадии дает хороший шанс для быстрого восстановления, а игнорирование ведет к усугублению, а затем к затяжному лечению.`,
        en: `Listen to your body
        You must learn to correctly recognize the signals of your own body: when you need to relax, and when, on the contrary, you need to push. You can and should not pay attention to small pains that pass after a few seconds during the race or during one to two days of rest.
        The pain that makes you stop in the middle of a run or persists after several days of rest cannot be ignored. In this case, consult a specialist. The greatest experience in this matter have sports doctors. Most often, a little rest and rehabilitation at an early stage gives a good chance for a quick recovery, and ignoring leads to aggravation, and then to a protracted treatment.`,
    },
    options: [
        {
            title: {
                ru: 'День начала программы',
                en: 'Program Start Day',
            },
            options: [
                getStartDateModel(
                    {
                        ru: 'Сегодня',
                        en: 'Today',
                    },
                    new Date(),
                ),
                getStartDateModel(
                    {
                        ru: 'Завтра',
                        en: 'Tomorrow',
                    },
                    addDaysToDate(1),
                ),
                getStartDateModel(
                    {
                        ru: 'В следующий понедельник',
                        en: 'Next Monday',
                    },
                    getNextMonday(),
                ),
            ],
        },
    ],
};

module.exports = {
    begginers,
    losingWeight,
    children,
    marathon10,
    halfMarathon,
    marathon,
    fullFormatted: [
        {
            type: 'single',
            title: {
                ru: 'Рекомендуем',
                en: 'Recomended',
            },
            trains: [begginers],
        },
        {
            type: 'stack',
            title: {
                ru: 'Популярное',
                en: 'Popular',
            },
            trains: [losingWeight, children, rehabilitation],
        },
        {
            type: 'scroll',
            title: {
                ru: 'Марафон',
                en: 'Marathon',
            },
            trains: [marathon10, halfMarathon, marathon],
        },
    ],
};
