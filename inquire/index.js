const https = require('https');
const constants = require('../utils/constants.json');
// const { search } = require('../utils/db-query');

module.exports = async function (context, req) {
    // query wit.ai for requested message
    const options = {
        hostname: 'api.wit.ai',
        method: 'GET',
        path: `/message?v=20201109&q=${req.query.q}`,
        headers: {
            'Authorization': `Bearer ${process.env.WITAI_ACCESS_TOKEN}` 
        }
    };

    try {
        const intent = await inquireWit(options);
        context.res = {
            status: 200,
            body: JSON.stringify(intent)
        };
        // TODO :: comment out after implementing db connection
        // const command = await search(intent.value, req.query.os);
        // context.res = {
        //     status: 200,
        //     body: JSON.stringify(command)
        // };
    } catch (error) {
        context.log(JSON.stringify(error));
        context.res = {
            status: 400,
            body: constants.ERROR
        };
    }
}

/** send request to wit.ai to find message intent */
function inquireWit(options) {
    return new Promise(function (resolve, reject) {
        const intent = { confidence: 0 };

        const witReq = https.request(options, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                const data = JSON.parse(chunk);

                if (!data.entities || !data.entities.intent) {
                    witReq.end();
                    return reject(constants.NO_RELATED_COMMAND);;
                }
                // select the intent which has highest confidence value
                for (let item of data.entities.intent) {
                    if (!item || item.confidence > intent.confidence) {
                        intent = item;
                    }
                }
                //if the confidence value of this intent lower than threshold return reject
                if (intent.confidence < 0.9) {
                    return reject(constants.NO_RELATED_COMMAND);
                }
                
                return resolve(intent);
            });
        });

        witReq.on('error', function (e) {
            context.log(constants.WITAI_ERROR + e.message);
            reject(e.message);
        });

        witReq.end();
    });
}
