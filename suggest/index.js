const constants = require('../utils/constants.json');
const { insert } = require('../utils/db');

module.exports = async function (context, req) {
    try {
        const newItem = await insert(req.body);
        context.res = {
            status: 200,
            body: newItem.id
        };
    } catch (error) {
        context.log(JSON.stringify(error));
        context.res = {
            status: 400,
            body: constants.ERROR
        };
    }
}
