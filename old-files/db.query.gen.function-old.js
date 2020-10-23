class BaseFunctionOld{
    queryAndValueGeneratorFunc(loopingObject, updateDisableColumns) {
        let query = " ";
        let value = [];
        Object.keys(loopingObject).forEach(function (key) {
            if (loopingObject[key] !== undefined && !updateDisableColumns.includes(key)) {
                query = query + key + " = ? , ";
                value.push(loopingObject[key])
            }
        });
        query = query.slice(0, query.lastIndexOf(","));

        return {
            query: query,
            values: value
        };
    }
}

class QueryValueOld {
    constructor(queryId, query, value) {
        this.query = query;
        this.value = value;
    }
}

class QueryValueWithQueryIdOld extends QueryValueOld{
    constructor(queryId, query, value) {
        super(query, value);
        this.queryId = queryId;
    }
}

class QueryGenFunctionsOld {

    getUpdateQueryWithQueryId(queryId, updatingObject, entityName, condition, primaryId, updateDisableColumns) {
        const queryAndValueGenerator =  new BaseFunctionOld().queryAndValueGeneratorFunc(updatingObject, updateDisableColumns);
        const sqlQuery = "UPDATE " + entityName + " SET " + queryAndValueGenerator.query + " WHERE " + condition;
        const values = queryAndValueGenerator.values;
        return new QueryValueWithQueryIdOld(queryId, sqlQuery, values);
    }

    getInsertQueryWithQueryId(queryId, entityName, entityObject) {
        let queryValueWithQueryId = new QueryValueWithQueryIdOld();
        queryValueWithQueryId.queryId = queryId;
        queryValueWithQueryId.query = `INSERT INTO ${entityName} SET ?`;
        queryValueWithQueryId.value = entityObject;
        return queryValueWithQueryId;
    }
}

module.exports = new QueryGenFunctionsOld();


// usage

// exports.transTest = (req, res) => {
//
//     let transactionalQueryList = [];
//
//     const admin = new Admin({
//         userName: "Test",
//         password: "Test",
//         email: "Test Trans",
//         telephone: "Test",
//         address: "Test",
//         city: "Test"
//     });
//
//     // passing queryId is must for getting result object
//     const AdminUpdateQuery = dbQueryGenFunctions.getUpdateQueryWithQueryId(1, new Admin(req.body), Admin.EntityName, ` id = ${req.body.id} `, req.body.id, Admin.updateRestrictedColumns);
//     const AdminInsertQuery = dbQueryGenFunctions.getInsertQueryWithQueryId(2, Admin.EntityName, admin);
//
//     transactionalQueryList.push(AdminInsertQuery, AdminUpdateQuery);
//
//     dbOperations.executeAsTransaction(transactionalQueryList, 'resMap_', (err, result) => {
//         if (err) {
//             res.status(500).send(err);
//         } else {
//             if (result['resMap_' + 2]) {
//                 let newAdmin = {...admin};
//                 newAdmin.id = result['resMap_' + 2].insertId;
//                 res.send(newAdmin);
//                 return;
//             }
//             res.send("Success");
//         }
//     })
// };