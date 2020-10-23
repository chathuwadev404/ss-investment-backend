const DBResponseFactory = require("../../APIs/response/db.response.factory");
const ConnectionPool = require("./db.connection.pool.singleton");
const queryGenFunctions = require("./db.query.gen.function");
const poolConnection = ConnectionPool.getConnectionPool();

const DBTransactionConnectionSingleton = require("./db.transaction.connection.singleton");
const transactionConnection = DBTransactionConnectionSingleton.getTransactionConnection();

const logger = require("../logger/logger.module")("db.operations.js");

exports.create = function (entity, entityObject) {
    return new Promise((resolve, reject) => {
        const insertQueryObj = queryGenFunctions.getInsertOneQuery(entity, entityObject);
        poolConnection.query(insertQueryObj.query, insertQueryObj.value, (err, res) => {
            if (err) {
                logger.error(entity['EntityName'] + " creation failed with error: ", err);
                resolve(DBResponseFactory.SQL_ERROR());
                return;
            }
            entityObject.id = res.insertId;
            resolve(DBResponseFactory.Success(entityObject))
        });
    })
};

exports.updateOne = function (entity,updatingObject ) {

    const queryValue = queryGenFunctions.getUpdateOneQuery(entity,updatingObject);

    return new Promise((resolve, reject) => {
        poolConnection.query(
            queryValue.query, queryValue.value, (err, res) => {
                if (err) {
                    logger.error("updating " + entity['EntityName'] + " failed with error: ", err);
                    resolve(DBResponseFactory.SQL_ERROR());
                    return;
                }
                if (res.affectedRows == 0) {
                    resolve(DBResponseFactory.DataNotFound());
                    return;
                }
                resolve(DBResponseFactory.Success({id: updatingObject[entity['EntityName']]}));
            }
        );
    })
};

exports.updateEntityByCriteria = function (updatingObject, entityName, condition, primaryId, updateDisableColumns) {

    const queryValue = queryGenFunctions.getUpdateQueryByCriteria( updatingObject, entityName, condition, primaryId, updateDisableColumns);

    return new Promise((resolve, reject) => {
        poolConnection.query(
            queryValue.query, queryValue.value, (err, res) => {
                if (err) {
                    logger.error("updating " + entityName + " failed with error: ", err);
                    resolve(DBResponseFactory.SQL_ERROR())
                    return;
                }
                if (res.affectedRows == 0) {
                    resolve(DBResponseFactory.DataNotFound());
                    return;
                }
                resolve(DBResponseFactory.Success({id: primaryId}));
            }
        );
    })
};

exports.findOne = function (entity, primaryId) {
    return new Promise((resolve, reject) => {
        const sqlQuery = queryGenFunctions.getFindOneQuery(entity,primaryId);
        poolConnection.query(sqlQuery, (err, res) => {
            if (err) {
                logger.error("Error on find one in " + entity['EntityName'] + ". error: ", err);
                resolve(DBResponseFactory.SQL_ERROR());
                return;
            }
            if (res.length) {
                resolve(DBResponseFactory.Success(res[0]));
                return;
            }
            resolve(DBResponseFactory.DataNotFound());
        });
    })
};

exports.findOneNew = function (entity, primaryId) {
    return new Promise((resolve, reject) => {
        const sqlQuery = queryGenFunctions.getFindOneQuery(entity,primaryId);
        poolConnection.query(sqlQuery, (err, res) => {
            if (err) {
                logger.error("Error on find one in " + entity['EntityName'] + ". error: ", err);
                reject(err);
                return;
            }
            if (res.length) {
                resolve(res[0]);
                return;
            }
            resolve(null);
        });
    })
};

exports.getResultByQuery = function (SELECT_SQL) {
    return new Promise((resolve, reject) => {
        poolConnection.query(SELECT_SQL, (err, res) => {
            if (err) {
                logger.error("Error on get result by query. error: ", err.sqlMessage);
                resolve(DBResponseFactory.SQL_ERROR())
                return;
            }
            if (res.length > 0) {
                resolve(DBResponseFactory.Success(res));
                return;
            }
            resolve(DBResponseFactory.DataNotFound())
        });
    });
}

exports.getResultByQueryAsCallback = (SELECT_SQL, result) => {
    poolConnection.query(SELECT_SQL, (err, res) => {
        if (err) {
            result(err, null);
            return;
        }
        if (res.length) {
            result(null, {data: res});
            return;
        }
        result({kind: "not_found"}, null);
    });
};

exports.executeAsTransaction = (queryListArray, resultMapKey, result) => {
    const chain = transactionConnection.chain();
    chain.on('commit', function (data) {
        result(null, resultMap)
    }).on('rollback', function (err) {
        result(err.sqlMessage, null)
    });

    const resultMap = {};

    queryListArray.forEach((query) => {
        chain.query(query.query, query.value).on('result', function (res) {
            resultMap[resultMapKey + query.queryId] = res;
        });
    });
};

