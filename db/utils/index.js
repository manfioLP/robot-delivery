module.exports = {
    mongoRandNumber: (maxValue) => {
        return { $floor: { $multiply: [ {$rand: {}}, maxValue ] } }
    }
};