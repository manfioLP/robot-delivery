'use strict';

const { connectToDatabase } = require('../../db');
const { Quote, Robot } = require('../../db/models');
const { robotInRangeQuery } = require('../../db/utils');

module.exports.request = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    try {
        await connectToDatabase();

        const quoteDTO = JSON.parse(event.body);

        // TODO: change hardcoded fee
        const quote = await Quote.create({
            ...quoteDTO,
            fee: 2
        });

        return {
            statusCode: 200,
            body: JSON.stringify(quote),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            }
        };
    } catch (err) {
        console.log('err', err)
        let msg = 'Could not request a delivery quote.'
        return {
            statusCode: err.statusCode || 500,
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ msg, err })
        }
    }
};
