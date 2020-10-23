const ConnectionPoolClass = require("../database/db.connection.pool.singleton");
const ResponseFactory = require("../../APIs/response/dynamic.response.factory");

const connectionPool = ConnectionPoolClass.getConnectionPool();

function dataOnlySearch(SELECT_SQL, FILTER, COLUMN_MAP, searchRequest, result) {
    SELECT_SQL = SELECT_SQL + generateWhere(searchRequest, COLUMN_MAP) + FILTER + generateLimit(searchRequest);
    connectionPool.query(SELECT_SQL, (err, res) => {
        if (err) {
            result(err, null);
            // result(null, err);
            return;
        }
        if (res.length) {
            result(null, {data: res});
            return;
        }
        result({kind: "not_found"}, null);
    });
}

function searchWithCount(SELECT_SQL, COUNT_SQL, FILTER, COLUMN_MAP, searchRequest, result) {
    SELECT_SQL = SELECT_SQL + generateWhere(searchRequest, COLUMN_MAP) + FILTER + generateLimit(searchRequest);
    COUNT_SQL = COUNT_SQL + generateWhere(searchRequest, COLUMN_MAP) + FILTER;

    connectionPool.query(SELECT_SQL, (err, res) => {
        if (err) {
            result(err, null);
        } else {
            connectionPool.query(COUNT_SQL, (err2, res2) => {
                if (err2) {
                    result(err2, null);
                    return;
                }
                if (res2.length) {
                    result(null, {data: res, ct: res2[0].ct});
                    return;
                }
                result({kind: "not_found"}, null);
            });
        }
    });
}

function generateWhere(searchRequest, COLUMN_MAP) {
    let initQuery = ' WHERE 1=1 ';
    let conditions = " ";
    if (searchRequest.searchKeys != null && searchRequest.searchKeys.length > 0) {
        for (let i = 0; i < searchRequest.searchKeys.length; i++) {
            if (COLUMN_MAP[searchRequest.searchKeys[i]]) {
                conditions = appendCondition(COLUMN_MAP[searchRequest.searchKeys[i]], searchRequest.operators[i], searchRequest.values[i], conditions);
            }
        }
    }
    return initQuery + conditions;
}

function generateLimit(searchRequest) {
    let condition = '';
    condition = ` LIMIT ${searchRequest.offset},${searchRequest.limit}`;
    return condition;
}

function appendCondition(key, operator, value, where) {
    switch (operator) {
        case "=":
        case "eq": {
            if (value.constructor === Number) {s
                where = where + ` AND ${key} = ${value}`;
            } else if (value.constructor === String) {
                if (value === "true" || value === "false")
                    where = where + ` AND ${key} IS ${value}`;
                else
                    where = where + ` AND ${key} = '${value}'`;
            } else {
                where = where + ` AND ${key} = '${value}'`;
            }
            break;
        }
        case "like": {
            where = where + ` AND ${key} LIKE '%${value}%' `;
            break;
        }
        case "%like": {
            where = where + ` AND ${key} LIKE '%${value}' `;
            break;
        }
        case "like%": {
            where = where + ` AND ${key} LIKE '${value}%' `;
            break;
        }
        case ">":
        case "gt": {
            if (value.constructor === Number)
                where = where + ` AND ${key} > ${value} `;
            else
                where = where + ` AND ${key} > '${value}' `;
            break;
        }
        case "<":
        case "lt": {
            if (value.constructor === Number)
                where = where + ` AND ${key} < ${value} `;
            else
                where = where + ` AND ${key} < '${value}' `;
            break;
        }
        case ">=":
        case "gte": {
            if (value.constructor === Number)
                where = where + ` AND ${key} >= ${value} `;
            else
                where = where + ` AND ${key} >= '${value}' `;
            break;
        }
        case "<=":
        case "lte": {
            if (value.constructor === Number)
                where = where + ` AND ${key} <= ${value} `;
            else
                where = where + ` AND ${key} <= '${value}' `;
            break;
        }
        case "in": {
            where = where + ` AND ${key} IN ( ${value} ) `;
            break;
        }
        default:
            break;
    }
    return where;
}

exports.dynamicSearchWithCount = (SELECT_SQL, COUNT_SQL, FILTER, COLUMN_MAP, searchReq, res) => {
    searchWithCount(SELECT_SQL, COUNT_SQL, FILTER, COLUMN_MAP, searchReq, (err, searchResult) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(204).send();
                return;
            }
            res.status(500).send(ResponseFactory.getErrorResponse({
                message: err.message || "Some error occurred while retrieving shops."
            }));
        } else {
            res.send(ResponseFactory.getSearchResponse({
                offset: searchReq.offset,
                limit: searchReq.limit,
                recordCount: searchResult.ct,
                data: searchResult.data
            }));
        }
    })
};

exports.dynamicDataOnlySearch = (SELECT_SQL, FILTER, COLUMN_MAP, searchReq, res) => {
    dataOnlySearch(SELECT_SQL, FILTER, COLUMN_MAP, searchReq, (err, searchResult) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(204).send();
                return;
            }
            res.status(500).send(ResponseFactory.getErrorResponse({
                message: err.message || "Some error occurred while retrieving shops."
            }));
        } else {
            res.send(ResponseFactory.getSearchResponse({
                data: searchResult.data
            }));
        }
    })
};

