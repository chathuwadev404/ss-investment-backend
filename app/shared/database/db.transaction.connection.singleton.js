const mysql = require("mysql");
const appConfig = require("../../config/app.config");
const transaction = require('node-mysql-transaction');

dbConfig = appConfig.DATABASE;

const trCon = transaction({
    // mysql driver set
    connection: [mysql.createConnection, {
        host: dbConfig.HOST,
        user: dbConfig.USER,
        password: dbConfig.PASSWORD,
        database: dbConfig.DB
    }],
    dynamicConnection: 32,
    idleConnectionCutoffTime: 1000,
    timeout: 600
});

let transactionConnection = null

class DBTransactionConnectionSingleton {

    constructor() {
        this.trCon = trCon;
    }

    static getTransactionConnection() {
        if (!transactionConnection) {
            transactionConnection = new DBTransactionConnectionSingleton()
        }
        return transactionConnection.trCon;
    }
}

module.exports = DBTransactionConnectionSingleton;