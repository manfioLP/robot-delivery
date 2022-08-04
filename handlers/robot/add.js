'use strict';

const { connectToDatabase } = require('../../db');
const { Robot } = require('../../db/models');

module.exports.add = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    try {
        await connectToDatabase();

        const robot = await Robot.create({
            ...JSON.parse(event.body),
        });

        return {
            statusCode: 200,
            body: JSON.stringify(robot),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            }
        };
    } catch (err) {
        let msg = 'Could not add the robot.'
        if (err.code) {
            switch(err.code) {
                case 11000:
                    msg = `Couldnt create robot ${err.keyValue.name} because its Duplicated`
            }
        }
        return {
            statusCode: err.statusCode || 500,
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ msg, err })
        }
    }
};
