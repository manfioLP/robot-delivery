'use strict';

const { connectToDatabase } = require('../../db');
const { Robot } = require('../../db/models');

module.exports.get = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    try {
        await connectToDatabase();

        const robot = await Robot.findById(event.pathParameters.id).exec();

        return {
            statusCode: 200,
            body: JSON.stringify(robot),
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
