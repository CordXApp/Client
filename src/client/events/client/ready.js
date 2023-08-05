const { configCheck } = require("@functions/configCheck");

module.exports = {
    name: "ready",
    once: true,

    async execute(client) {
        try {
            await configCheck({ client });

            const startMessage = "Connecting to the Discord API...";
            const connectedMessage = "Connected to the Discord API!";
            const errorMessage = "An error occurred during connection.";

            await client.logger(startMessage, {
                header: "CLIENT_START",
                type: "start",
            });

            await client.utils.setClientPresence(client);

            await client.logger(connectedMessage, {
                header: "CLIENT_START",
                type: "ready",
            });
        } catch (error) {
            const errorStack = error.stack || error.message || "Unknown error";

            await client.logger(errorStack, {
                header: "CONNECTION_FAILURE",
                type: "error",
            });
        }
    },
};