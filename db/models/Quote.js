const mongoose = require('mongoose');
const { quote } = require('../errors')

const QuoteSchema = new mongoose.Schema({
    fee: {
        type: Number,
        required: [true, quote.FEE_REQUIRED]
    },
    robot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Robot',
    },
    pickup: {
        type: {
            locX: {
                type: Number,
                required: [true, quote.PICKUP_LOCATION_REQUIRED]
            },
            locY: {
                type: Number,
                required: [true, quote.PICKUP_LOCATION_REQUIRED]
            }
        },
        required: [true, quote.PICKUP_LOCATION_REQUIRED],
    },
    delivery: {
        type: {
            locX: {
                type: Number,
                required: [true, quote.DELIVERY_LOCATION_REQUIRED]
            },
            locY: {
                type: Number,
                required: [true, quote.DELIVERY_LOCATION_REQUIRED]
            }
        },
        required: [true, quote.DELIVERY_LOCATION_REQUIRED],
    },
    status: {
        type: String,
        enum: ['PENDING', 'CONFIRMED', 'PICKUP', 'DELIVERY', 'DONE', 'REVOKED'],
        default: 'PENDING',
    }
}, { timestamps: true });

module.exports = mongoose.model('Quote', QuoteSchema)