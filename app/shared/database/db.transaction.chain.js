const DBTransactionConnectionSingleton = require("./db.transaction.connection.singleton");
const transactionConnection = DBTransactionConnectionSingleton.getTransactionConnection();
const dbQueryGen = require("./db.query.gen.function")

const dbResponses = require("../../APIs/response/db.response.factory");

class TransactionChain {
    constructor() {
        this.chain = transactionConnection.chain();
    }

    async execute(query) {
        return new Promise((resolve, reject) => {
            this.chain.query(query.query, query.value).on('result', (result) => {
                resolve(dbResponses.Success(result));
            }).on('error', (err) => {
                resolve(dbResponses.SQL_ERROR(err));
                this.chain.rollback(err);
            }).autoCommit(false);
        });
    }

    async persist(persistEntity, persistObject) {
        const InsertQueryObject = dbQueryGen.getInsertOneQuery(persistEntity, persistObject);
        return new Promise((resolve, reject) => {
            this.chain.query(InsertQueryObject.query, InsertQueryObject.value).on('result', (result) => {
                persistObject[persistEntity['PrimaryKey']] = result.insertId;
                resolve(dbResponses.Success(persistObject));
            }).on('error', (err) => {
                resolve(dbResponses.SQL_ERROR(err));
                this.chain.rollback(err);
            }).autoCommit(false);
        });
    }

    async merge(mergeEntity, mergeObject) {
        const UpdateQueryObject = dbQueryGen.getUpdateOneQuery(mergeEntity, mergeObject);
        return new Promise((resolve, reject) => {
            this.chain.query(UpdateQueryObject.query, UpdateQueryObject.value).on('result', (result) => {
                resolve(dbResponses.Success(mergeObject));
            }).on('error', (err) => {
                resolve(dbResponses.SQL_ERROR(err));
                this.chain.rollback(err);
            }).autoCommit(false);
        });
    }

    async commit() {
        return new Promise((resolve, reject) => {
            this.chain.on('commit', (data) => {
                resolve(dbResponses.CommitSuccess(data));
            }).on('rollback', (err) => {
                console.log('rollback')
                resolve(dbResponses.Rollback(err))
            });
            this.chain.commit();
        });
    }

    rollback() {
        this.chain.rollback();
    }
}

class DBTransactionChain {
    getTransaction() {
        return new TransactionChain();
    }

}

module.exports = new DBTransactionChain();

