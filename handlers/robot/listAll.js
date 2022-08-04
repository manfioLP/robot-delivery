'use strict';

const { connectToDatabase } = require('../../db');
const { Robot } = require('../../db/models');

module.exports.listAll = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    console.log('performing operation [listRobots]')
    try {
        await connectToDatabase();

        const robots = await Robot.find()

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
