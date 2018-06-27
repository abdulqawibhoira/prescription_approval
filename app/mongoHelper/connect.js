const MongoClient = require('mongodb').MongoClient;
const config = require('../configs');

const state = { db: null };

const connectMongo = () => {
    if (state.db) {
        return;
    }
    // Connection URL
    const url = `mongodb://${config.get('mongodb.host')}:${config.get('mongodb.port')}`;
    // Use connect method to connect to the server
    const mongoConnectionOptions = {
        poolSize: config.get('mongodb.poolsize')
    };
    MongoClient.connect(url, mongoConnectionOptions, (err, client) => {
        if (err) {
            console.log("Mongo Connection Failed");
            process.exit(1);
        }
        state.db = client.db(config.get('mongodb.databaseName'));
        console.log("Connected successfully to Mongodb server");
    });
};

const getConnection = () => {
    return state.db;
}
module.exports = { connectMongo, getConnection };






