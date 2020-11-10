const CosmosClient = require('@azure/cosmos').CosmosClient;
const constants = require('./constants.json');

/** query the database for a related command */
function search(intent, os) {
    return new Promise(async function (resolve, reject) {
        if (!intent || !os) {
            reject(constants.MISSING_PARAM);
            return;
        }

        try {
            const client = new CosmosClient(process.env.CONN_STRING);
            const database = client.database('sem-cli');
            const container = database.container('commands');

            const { resources } = await container.items
                .query({ query: `SELECT c.command, c.danger_level FROM c WHERE c.os='${os}' AND c.intent='${intent}'` })
                .fetchAll();

            resolve(resources[0]);
        } catch (error) {
            reject(error);
        }
    });
}

/** insert a suggestion to the database */
function insert(intent, command, os, dangerLevel) {
    return new Promise(async function (resolve, reject) {
        if (!intent || !command || !os || !dangerLevel) {
            reject(constants.MISSING_PARAM);
            return;
        }

        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: true
        });

        try {
            await client.connect();
            const res = await client.query(`INSERT INTO suggestions (intent, os, command, danger_level) VALUES ('${intent}','${os}','${command}','${dangerLevel}');`);
            resolve(res.rows[0]);
            await client.end();
        } catch (err) {
            console.error(err);
            reject(err);
            await client.end();
        }
    });
}

module.exports = {
    search,
    insert
};
