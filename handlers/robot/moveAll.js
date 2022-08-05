'use strict';

const { connectToDatabase } = require('../../db');
const { Robot } = require('../../db/models');

const { mongoRandNumber } = require('../../db/utils');

module.exports.moveAll = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    try {
        await connectToDatabase();

        const robots = await Robot.updateMany({}, [{
            $set: {
                locationX: mongoRandNumber(100),
                locationY: mongoRandNumber(100),
            }
        }])

        return {
            statusCode: 200,
            body: JSON.stringify({
                moved: true
            }),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            }
        };
    } catch (err) {
        // todo: improve errors
        console.error('err', err)
        return {
            statusCode: err.statusCode || 500,
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ msg:'Could not move the robots.', err })
        }
    }
};
