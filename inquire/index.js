const https = require('https');
const querystring = require('querystring');
const constants = require('../utils/constants.json');
const { search } = require('../utils/db');

module.exports = async function (context, req) {
    try {
        const intent = await inquireWit(req.query.q);
        const command = await search(intent.name, req.query.os);
        context.res = {
            status: 200,
            body: JSON.stringify(command)
        };
    } catch (error) {
        context.log(JSON.stringify(error));
        context.res = {
            status: 400,
            body: error
        };
    }
}

/** send request to wit.ai to find message's intent */
function inquireWit(message) {
    return new Promise(function (resolve, reject) {
        const options = {
            hostname: 'api.wit.ai',
            method: 'GET',
            path: `/message?v=20201109&q=${querystring.escape(message)}`,
            headers: {
                'Authorization': `Bearer ${process.env.WITAI_ACCESS_TOKEN}` 
            }
        };
        let intent = { confidence: 0 };

        const witReq = https.request(options, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                const data = JSON.parse(chunk);

                if (data.intents.length > 0) {
                    // get the first intent which has highest confidence
                    intent = data.intents[0];
                }

                // if the confidence value of this intent lower than threshold then return reject
                if (intent.confidence < 0.9) {
                    witReq.end();
                    return reject(constants.NO_RELATED_COMMAND);
                }
                
                return resolve(intent);
            });
        });

        witReq.on('error', function (e) {
            context.log(`Wit.ai error: ${e.message}`);
            reject(constants.ERROR);
        });

        witReq.end();
    });
}
