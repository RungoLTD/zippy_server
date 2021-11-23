const TrainModel = require('./TrainModel');

module.exports = async function (req, res) {
    try {
        return res.status(200).json({
            success: true, 
            code: 1,
            data: [[TrainModel.begginers], [TrainModel.losingWeight], [TrainModel.children, TrainModel.marathon10], [TrainModel.halfMarathon, TrainModel.marathon]],
        });
    } catch (error) {
        return res.status(200).json({ success: false, code: 2, error: error });
    }
};
