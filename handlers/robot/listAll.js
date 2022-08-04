'use strict';

const { connectToDatabase } = require('../../db');
const { Robot } = require('../../db/models');

module.exports.listAll = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    try {
        const { page=0, limit=10, skip=page*limit, lm=+limit } = { ...event.queryStringParameters }

        await connectToDatabase();

        const robots = await Robot
            .find({})
            .limit(lm)
            .skip(skip);

        console.log('robots', robots)
        return {
            statusCode: 200,
            body: JSON.stringify({
                robots
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
