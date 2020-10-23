const mysql = require("mysql");
const appConfig = require("../../config/app.config");

dbConfig = appConfig.DATABASE;

const createdPool = mysql.createPool({
    connectionLimit: dbConfig.CONNECTION_LIMIT,
    host: dbConfig.HOST,
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DB
});

let connectionPool = null

class DBConnectionPoolClass {

    constructor() {
        this.createdPool = createdPool;
    }

    static getConnectionPool() {
        if (!connectionPool) {
            connectionPool = new DBConnectionPoolClass()
        }
        return connectionPool.createdPool;
    }
}

module.exports = DBConnectionPoolClass;