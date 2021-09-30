const Type = {
    Rest: 0,
    CalmRun: 1,
    NormalRun: 2,
    FastRun: 3,
    LongRun: 4,
    CheckRun: 5,
    RecoveryRun: 6,
    Marathon: 7,
    Marathon10: 8,
    HalfMarathon: 9,
    Walking: 10,
};

const Pace = {
    Low: 0,
    Normal: 1,
    High: 2,
};

function getTypeDescription(type) {
    switch (type) {
        case Type.Rest:
            return {
                ru: 'Отдых',
                en: 'Rest',
            };
        case Type.CalmRun:
            return {
                ru: 'Спокойный бег',
                en: 'Calm run',
            };
        case Type.NormalRun:
            return {
                ru: 'Нормальный бег',
                en: 'Normal run',
            };
        case Type.FastRun:
            return {
                ru: 'Быстрый бег',
                en: 'Fast run',
            };
        case Type.LongRun:
            return {
                ru: 'Длинный забег',
                en: 'Long run',
            };
        case Type.CheckRun:
            return {
                ru: 'Проверочный забег',
                en: 'Check run',
            };
        case Type.RecoveryRun:
            return {
                ru: 'Восстановительный забег',
                en: 'Recovery run',
            };
        case Type.Marathon:
            return {
                ru: 'Марафон',
                en: 'Marathon',
            };
        case Type.Marathon10:
            return {
                ru: 'Марафон 10',
                en: 'Marathon 10',
            };
        case Type.HalfMarathon:
            return {
                ru: 'Полумарафон',
                en: 'Half marathon',
            };
        case Type.Walking:
            return {
                ru: 'Ходьба',
                en: 'Walking',
            };
        default:
            return null;
    }
}

function getRunningModel(type, distance, pace, time) {
    return {
        distance: distance,
        time: time,
        pace: pace,
        type: type,
        typeLabel: getTypeDescription(type),
        completed: null,
    };
}

module.exports = { getRunningModel, Pace, Type, getTypeDescription };
