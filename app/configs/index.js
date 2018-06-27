const convict = require('convict');

// Define a schema
let config = convict({
    env: {
        doc: "The application environment.",
        format: ["production", "development", "staging"],
        default: "development",
        env: "NODE_API_ENV"
    },
    port: {
        doc: "The port to bind. Node server will run on this port.",
        format: "port",
        default: 3000,
        env: "NODE_API_PORT"
    },
    mongodb: {
        host: {
            doc: "Mongo Db server Hostname",
            format: "*",
            default: "localhost",
        },
        port: {
            doc: "Mongo Db server Port to connect",
            format: "port",
            default: 27017,
        },
        databaseName: {
            doc: "Database name",
            format: "*",
            default: "prescription_approval",
        },
        poolsize: {
            doc: "connection poolong size",
            format: "*",
            default: 10,
        }
    },
    jwt: {
        secretKey: {
            doc: "Secret Key to generate acces tokens",
            format: "*",
            default: "##prescription_approval##",
        },
        expiresIn: {
            doc: "Access token expiry time",
            format: "*",
            default: "180 days",
        },
    }
});

// Load environment dependent configuration
config.loadFile(`./app/configs/${config.get('env')}.json`);

// Perform validation
config.validate({ allowed: 'strict' });

module.exports = config;