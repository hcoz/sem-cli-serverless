const CosmosClient = require('@azure/cosmos').CosmosClient;
const constants = require('./constants.json');

/** search the database for a related command */
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
function insert({ intent, os, command, dangerLevel }) {
    return new Promise(async function (resolve, reject) {
        if (!intent || !command || !os || !dangerLevel) {
            reject(constants.MISSING_PARAM);
            return;
        }

        try {
            const client = new CosmosClient(process.env.CONN_STRING);
            const database = client.database('sem-cli');
            const container = database.container('suggestions');
            const newItem = {
                intent,
                os,
                command,
                dangerLevel
            }

            const { resource } = await container.items.create(newItem);

            resolve(resource);
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    search,
    insert
};
