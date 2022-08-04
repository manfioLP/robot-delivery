const {promisify} = require('util');
const addRobotLambda = require('../handlers/robot/add');
const listAllLambda = require('../handlers/robot/listAll');
const moveAllLambda = require('../handlers/robot/moveAll');

// const addHandler = promisify(addRobotLambda.add);
const addHandler = addRobotLambda.add;
const listAllHandler = listAllLambda.listAll;
const moveAllHandler = moveAllLambda.moveAll;

jest.setTimeout(15000);

const context = {
    "awsRequestId": "ckb8j7s4q0002qjr9azyw2xmv",
    "callbackWaitsForEmptyEventLoop": true,
    "clientContext": null,
    "functionName": "robot-delivery-dev-addRobot",
    "functionVersion": "$LATEST",
    // "invokedFunctionArn": "offline_invokedFunctionArn_for_ceos-server-dev-create",
    // "logGroupName": "offline_logGroupName_for_ceos-server-dev-create",
    // "logStreamName": "offline_logStreamName_for_ceos-server-dev-create",
    // "memoryLimitInMB": "128"
}

const { closeConnection, dropCollection} = require('../db');

const robotDTO = {
    name: 'robot1',
    locationX: 1,
    locationY: 1,
    type: 'REGULAR'
};

const expectRobotProperties = (robot) => {
    expect(robot).toHaveProperty('_id');
    expect(robot).toHaveProperty('locationX', 1);
    expect(robot).toHaveProperty('locationY', 1);
    expect(robot).toHaveProperty('status', 'AVAILABLE');
}

describe('Robot Basics', () => {
    beforeAll(done => {
        process.env.DB_NAME = 'robotdeliverytest';
        done();
    })
    test('Create First Robot', async() => {
        const result = await addHandler({
            body: JSON.stringify(robotDTO)
        }, context);
        const robot = JSON.parse(result.body);

        expectRobotProperties(robot);
        expect(robot).toHaveProperty('name', 'robot1');
    });

    test('Create Second Robot', async() => {
        const result = await addHandler({
            body: JSON.stringify({
                ...robotDTO,
                name: 'robot2'
            })
        }, context);
        const robot = JSON.parse(result.body);

        expectRobotProperties(robot);
        expect(robot).toHaveProperty('name', 'robot2');
    });

    test('Shouldnt Create Robot with same name', async() => {
        const result = await addHandler({
            body: JSON.stringify(robotDTO)
        }, context);
        const res = JSON.parse(result.body);

        expect(res).toHaveProperty('err')
        expect(res).toHaveProperty('msg', 'Couldnt create robot robot1 because its Duplicated')
    });

    test('List all robots', async() => {
        const result = await listAllHandler({}, context);
        const { robots } = JSON.parse(result.body);

        expect(robots.length).toEqual(2);
        expect(robots[0]).toHaveProperty('_id');
        expect(robots[0]).toHaveProperty('name');
    })

    test('Move robots', async() => {
        const result = await moveAllHandler({}, context);

        const res = JSON.parse(result.body);
        expect(res).toHaveProperty('moved', true);

        const listResults = await listAllHandler({}, context);
        const { robots } = JSON.parse(listResults.body);

        expect(robots[0].locationX).not.toBe(1);
        expect(robots[0].locationY).not.toBe(1);
    })

    afterAll(async () => {
        await dropCollection('robots')
        closeConnection();
    })
})
