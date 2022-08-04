const mongoose = require('mongoose');
const { robot } = require('../errors')

const RobotSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, robot.NAME_REQUIRED],
        unique: [true, robot.DUPLICATED_NAME],
        trim: true
    },
    type: {
        type: String,
        required: [true, robot.TYPE_REQUIRED],
        enum: ['REGULAR', 'GROCERY', 'FAST']
    },
    locationX: {
        type: Number,
        required: [true, robot.LOCATION_REQUIRED],
    },
    locationY: {
        type: Number,
        required: [true, robot.LOCATION_REQUIRED],
    },
    status: {
        type: String,
        enum: ['AVAILABLE', 'BUSY', 'OUT_OF_SERVICE'],
        default: 'AVAILABLE'
    }
}, { timestamps: true });

module.exports = mongoose.model('Robot', RobotSchema)