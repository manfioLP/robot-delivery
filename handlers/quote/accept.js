'use strict'

const { connectToDatabase } = require('../../db');
const { Quote, Robot } = require('../../db/models');

const {
    addOperator,
    ceilOperator,
    betweenValuesOperator,
    sumSquareRootOperator,
    differenceSquareOperator
} = require('../../db/utils');

module.exports.accept = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    if (!event.pathParameters && !event.pathParameters.id) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ msg: 'Quote ID is required on path params!'})
        }
    }

    try {
        await connectToDatabase();

        const quote = await Quote.findById(event.pathParameters.id);
        if (quote.status !== 'PENDING') {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ msg: 'The provided quote is either in progress or already finished' })
            }
        }

        const [robotInRange] = await Robot.aggregate()
            .match({
                status: 'AVAILABLE',
                locationX: betweenValuesOperator(quote.pickup.locX - 50, quote.pickup.locX + 50),
                locationY: betweenValuesOperator(quote.pickup.locY  - 50, quote.pickup.locY + 50),
            })
            .addFields({
                distanceToPickup: ceilOperator(
                    sumSquareRootOperator(
                        differenceSquareOperator(quote.pickup.locX, '$locationX'),
                        differenceSquareOperator(quote.pickup.locY, '$locationY')
                    )
                ),
                distanceToDeliver: ceilOperator(
                    sumSquareRootOperator(
                        differenceSquareOperator('$locationX', quote.delivery.locX),
                        differenceSquareOperator('$locationY', quote.delivery.locY)
                    )
                )
            })
            .addFields({
                totalDistance: addOperator('$distanceToPickup', '$distanceToDeliver')
            })
            .sort({ distanceTotal: 1 })
            .limit(1)
            .exec();

        if (!robotInRange) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ msg: 'There is no robots available in your range, sorry :(' })
            }
        }

        const updateRobot = await Robot.findByIdAndUpdate( robotInRange._id, { status: 'BUSY' }, { new: true } ).exec();

        quote.status = 'PICKUP'
        await quote.save();
        return {
            statusCode: 200,
            body: JSON.stringify(quote),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            }
        }
    } catch (err) {
        console.error('err:', err)
        let msg = 'Could not set robot for delivery to specified quote.'
        return {
            statusCode: err.statusCode || 500,
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ msg, err })
        }
    }
}