const config = require('../configs/main.config');

module.exports.configCheck = async function({ client }) {
    
    if (!config.Discord.Tokens.main && !config.Discord.Tokens.dev) { 
        
        await client.logger('Please provide either a valid production or development token.', { 
            header: 'INVALID_CONFIG', 
            type: 'error' 
        });

        return process.exit(1);
    } 

    if (config.Discord.Tokens.main == '') { 
        
        await client.logger('Please provide a valid production token.', { 
            header: 'INVALID_CONFIG', 
            type: 'error' 
        });

        return process.exit(1);
    }
    
    if (config.Discord.Tokens.dev == '') { 
        
        await client.logger('Please provide a valid development token.', { 
            header: 'INVALID_CONFIG', 
            type: 'error' 
        });

        return process.exit(1);
    } 

    else if (!config.Database.host || config.Database.host == '') {

        await client.logger('Please provide a valid MySQL host name', { 
            header: 'INVALID_CONFIG', 
            type: 'error' 
        });

        return process.exit(1);
    }

    else if (!config.Database.user || config.Database.user  == '') {
        
        await client.logger('Please provide a valid MySQL user name', { 
            header: 'INVALID_CONFIG', 
            type: 'error' 
        });

        return process.exit(1);
    }

    else if (!config.Database.name || config.Database.name == '') {

        await client.logger('Please provide a valid MySQL database name', { 
            header: 'INVALID_CONFIG', 
            type: 'error' 
        });

        return process.exit(1);
    }

    else if (!config.Database.pass || config.Database.pass == '') {

        await client.logger('Please provide a valid MySQL password', { 
            header: 'INVALID_CONFIG', 
            type: 'error' 
        });

        return process.exit(1);
    }

    else return client.logger('Config validated successfully', { header: 'CONFIG_CHECK', type: 'ready' })
}