const requestQuoteHandler = require('../handlers/quote/request');
const acceptQuoteHandler = require('../handlers/quote/accept');

const helperHandlerAddRobot = require('../handlers/robot/add')
const helperHandlerGetRobot = require('../handlers/robot/get')

jest.setTimeout(20000);

const context = {
    "awsRequestId": "ckb8j7s4q0002qjr9azyw2xmv",
    "callbackWaitsForEmptyEventLoop": true,
    "clientContext": null,
    "functionName": "robot-delivery-dev-funcName",
    "functionVersion": "$LATEST",
}

const { closeConnection, dropCollection} = require('../db');

const quoteDTO = {
    pickup: {
        locX: 1,
        locY: 1
    },
    delivery: {
        locX: 1,
        locY: 1
    },
};

const expectQuoteProperties = (q) => {
    expect(q).toHaveProperty('_id');
    expect(q).toHaveProperty('pickup');
    expect(q.pickup).toHaveProperty('locX');
    expect(q.pickup).toHaveProperty('locY');
    expect(q).toHaveProperty('delivery');
    expect(q.delivery).toHaveProperty('locX');
    expect(q.delivery).toHaveProperty('locY');
    expect(q).toHaveProperty('fee');
    expect(q).toHaveProperty('status');
}

const createRobot = async ({ locationX, locationY, name, type = 'REGULAR' }) => {
    const result = await helperHandlerAddRobot.add({body: JSON.stringify({ locationX, locationY, name, type })}, context);
    return JSON.parse(result.body);
}

const createQuote = async({dy, dx, py, px}) => {
    const result = await requestQuoteHandler.request({
        body: JSON.stringify({
            delivery: { locX: dx, locY: dy }, pickup:{ locX: px, locY: py }
        })
    }, context);
    return JSON.parse(result.body);
}

describe('Quote Basics', () => {
    let auxRobots;
    let auxQuotes;
    beforeAll(async () => {
        process.env.DB_NAME = 'robotdelivery-quotetest';
        const helpers = await Promise.all([
            createQuote({ dy: 4, dx: 5, px: 10, py: 7 }),
            createQuote({ dy: 84, dx: 85, px: 100, py: 70 }),
            createRobot({ locationX: 5, locationY: 6, name: 'QTR1' }),
            createRobot({ locationX: 15, locationY: 16, name: 'QTR2' })
        ]);
        auxQuotes = [helpers[0], helpers[1]]
        auxRobots = [helpers[2], helpers[3]]
    })

    test('Request a Quote', async() => {
        const result = await requestQuoteHandler.request({
            body: JSON.stringify(quoteDTO)
        }, context);
        const quote = JSON.parse(result.body);

        expectQuoteProperties(quote);
    });

    test('Accept Quote', async() => {
        const result = await acceptQuoteHandler.accept({
            pathParameters: { id: auxQuotes[0]._id }
        }, context);
        const quote = JSON.parse(result.body);

        expect(quote).toHaveProperty('_id');
        expect(quote).toHaveProperty('fee');
        expect(quote).toHaveProperty('status', 'PICKUP');

        const robotResult = await helperHandlerGetRobot.get({
            pathParameters: { id: auxRobots[1]._id }
        }, context);
        const robot = JSON.parse(robotResult.body);

        expect(robot).toHaveProperty('_id', auxRobots[1]._id);
        expect(robot).toHaveProperty('status', 'BUSY');
    });

    test('Shouldnt Accept quote that already has been accepted', async () => {
        const result = await acceptQuoteHandler.accept({
            pathParameters: { id: auxQuotes[0]._id }
        }, context);
        const invalidQuote = JSON.parse(result.body);

        expect(invalidQuote).toHaveProperty('msg', 'The provided quote is either in progress or already finished');
    })

    test('No Available robots for points far away', async () => {
        const result = await acceptQuoteHandler.accept({
            pathParameters: { id: auxQuotes[1]._id }
        }, context);
        const noQuote = JSON.parse(result.body);

        expect(noQuote).toHaveProperty('msg', 'There is no robots available in your range, sorry :(')
    })

    afterAll(async () => {
        await dropCollection('quotes')
        await dropCollection('robots')
        closeConnection();
    })
})
