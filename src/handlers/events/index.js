const chalk = require("chalk");
const fs = require("fs");

/**
 * LOAD ALL CLIENT EVENTS
 */
const loadEvents = async function (client) {
  const eventFolders = fs.readdirSync("./src/client/events");

  for (const folder of eventFolders) {
    const eventFiles = fs
      .readdirSync(`./src/client/events/${folder}`)
      .filter((file) => file.endsWith(".js"));

    for (const file of eventFiles) {
      const event = require(`../../client/events/${folder}/${file}`);

      if (event.name) {
        client.logger(`Loaded event: [${event.name}] Successfully`, {
          header: "CLIENT EVENTS",
          type: "ready",
        });
      } else {
        client.logger(
          `[EVENTS] Event: [${file}] is missing a name or name is not a string`,
          {
            header: "CLIENT EVENTS",
            type: "error",
          }
        );

        continue;
      }

      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }
    }
  }
};

/**
 * LOAD ALL CLIENT SLASH COMMANDS
 */
const loadSlash = async function (client) {
  let slash = [];

  const commandFolders = fs.readdirSync("./src/client/commands");

  for (const folder of commandFolders) {
    const commandFiles = fs
      .readdirSync(`./src/client/commands/${folder}`)
      .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
      const command = require(`../../client/commands/${folder}/${file}`);

      if (command.name) {
        client.slash.set(command.name, command);

        slash.push(command);

        client.logger(`Loaded Command: [${command.name}] successfully`, {
          header: "SLASH COMMANDS",
          type: "slash",
        });
      } else {
        return client.logger(
          `Error Loading Command: [${file}] is missing a name or name is not a valid string`,
          {
            header: "SLASH COMMANDS",
            type: "error",
          }
        );
      }
    }
  }

  /**
   * REGISTER THE SLASH COMMANDS GLOBALLY
   */
  client.on("ready", async () => {
    client.application.commands
      .set(slash)
      .then(() => {
        client.logger(
          "Slash command have been registered with the Discord API",
          {
            header: "DISCORD APPLICATION REGISTRY",
            type: "ready",
          }
        );
      })
      .catch((e) => {
        client.logger(`Failed to register slash commands: ${e.stack}`, {
          header: "DISCORD APPLICATION REGISTRY",
          type: "warning",
        });
      });
  });
};

module.exports = {
  loadEvents,
  loadSlash,
};
