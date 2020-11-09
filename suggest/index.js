const constants = require('../utils/constants.json');

module.exports = async function (context, req) {
    try {
        // const data = JSON.parse(req.body);
        // TODO :: comment out after implementing db connection
        // await insert(data.intent, data.os, data.command, data.dangerLevel);
        context.res = {
            status: 200,
            body: JSON.stringify(req.body)
        };
    } catch (error) {
        context.log(JSON.stringify(error));
        context.res = {
            status: 400,
            body: constants.ERROR
        };
    }
}
