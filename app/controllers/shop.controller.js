const Shop = require("../models/shop.model");
const Admin = require("../models/admin.model");
const commonFunctions = require("../shared/common.functions");
const dbOperations = require("../shared/database/db.operations");
const dbTransaction = require("../shared/database/db.transaction.chain");
const searchTemplate = require("../shared/search/search.template");
const SearchRequest = require("../shared/search/SearchRequest");
const mainConfig = require("../../app/config/main.config");

const ShopApiRequest = require("../APIs/request/shop.api.request");
const ApiRequest = require("../APIs/request/common.api.request");
const ResponseFactory = require("../APIs/response/dynamic.response.factory");
const ShopApiResponse = require("../APIs/response/shop.api.response");
const DbResponses = require("../APIs/response/db.response.factory");

const APP_ROLES = require("../config/app.role").APP_ROLES;

const logger = require("../shared/logger/logger.module")("shop.controller.js");

exports.create = async (req, res) => {
    if (!commonFunctions.validateRequestBody(req.body, ShopApiRequest.CREATE_API, false, res))
        return;

    if (!(req.body.admin && req.body.admin.userName)) {
        res.status(400).send(ResponseFactory.getErrorResponse({message: 'user name required'}))
        return;
    }

    const AdminSearchResponse = await dbOperations.getResultByQuery(Admin.NamedQuery.getAdminByUserName(req.body.admin.userName));

    if (DbResponses.isSqlErrorResponse(AdminSearchResponse.status)) {
        res.status(500).send(ResponseFactory.getErrorResponse({message: 'Internal Server Error'}));
        return;
    }
    if (DbResponses.isSuccessResponse(AdminSearchResponse.status) && AdminSearchResponse.data.length > 0) {
        logger.info("User Name already exist. username: " + req.body.admin.userName);
        res.status(400).send(ResponseFactory.getErrorResponse({message: 'User Name already exist'}));
        return;
    }

    let shop = new Shop(req.body);
    shop.status = mainConfig.SYSTEM_STATUS.PENDING;

    let admin = new Admin(req.body);
    admin.userName = req.body.admin.userName;
    admin.password = req.body.admin.password;
    admin.fullName = req.body.admin.fullName;
    admin.roleId = APP_ROLES[1].ID;

    const txn = dbTransaction.getTransaction();

    const shopResponse = await txn.persist(Shop, shop);

    if (DbResponses.isSqlErrorResponse(shopResponse.status)) {
        logger.error(shopResponse.data.sqlMessage || "Internal Server Error!")
        res.status(500).send(ResponseFactory.getErrorResponse({message: shopResponse.data.sqlMessage || "Internal Server Error!"}));
        return;
    }

    shop = shopResponse.data;

    if (!(shop.id && shop.id > 0)) {
        logger.error("Shop Id is not valid");
        res.status(500).send(ResponseFactory.getErrorResponse({message: shopResponse.data.sqlMessage || "Internal Server Error!"}));
        txn.rollback();
        return;
    } else {
        admin.shopId = shop.id;
    }

    const adminResponse = await txn.persist(Admin, admin);

    if (DbResponses.isSqlErrorResponse(adminResponse.status)) {
        logger.error(adminResponse.data.sqlMessage || "Internal Server Error!")
        res.status(500).send(ResponseFactory.getErrorResponse({message: adminResponse.data.sqlMessage || "Internal Server Error!"}));
        return;
    }

    admin = adminResponse.data;

    if (admin.shopId !== shop.id) {
        logger.error("Admin Shop Id not matched with shop id.")
        res.status(500).send(ResponseFactory.getErrorResponse({message: "Internal Server Error!"}));
        txn.rollback();
    }

    const queryResponse = await txn.commit();

    if (DbResponses.isRollback(queryResponse.status)) {
        logger.error(queryResponse.data.sqlMessage || "Internal Server Error!")
        res.status(500).send(ResponseFactory.getErrorResponse({message: queryResponse.data.sqlMessage || "Internal Server Error!"}));
        return;
    }

    logger.info("Shop Created. Id: " + shop.id);
    res.send(ResponseFactory.getSuccessResponse({
        data: ShopApiResponse.ShopCreationResponse(shop),
        message: "Shop Created"
    }));
};

exports.update = async (req, res) => {

    // Validate the Request
    if (!commonFunctions.validateRequestBody(req.body, ShopApiRequest.UPDATE_API, true, res))
        return;

    const shopSearchResponse = await dbOperations.findOne(Shop, req.body.id);

    if (DbResponses.isSqlErrorResponse(shopSearchResponse.status)) {
        res.status(500).send(ResponseFactory.getErrorResponse({message: shopSearchResponse.message || "Internal Server Error!"}));
        return;
    }
    if (DbResponses.isDataNotFoundResponse(shopSearchResponse.status)) {
        res.status(400).send(ResponseFactory.getErrorResponse({message: "Shop not exist with id: " + req.body.id}));
        return;
    }
    const shop = shopSearchResponse.data;

    if (!commonFunctions.isValidToProcess(req, res, shop.id))
        return;

    const updateResponse = await dbOperations.updateOne(Shop, req.body);

    if (DbResponses.isSqlErrorResponse(updateResponse.status)) {
        res.status(500).send(ResponseFactory.getErrorResponse({message: updateResponse.message || "Shop Updating failed with Id:" + req.body.id}));
        return;
    }
    if (DbResponses.isDataNotFoundResponse(updateResponse.status)) {
        res.status(204).send();
        return;
    }

    logger.info('Shop Updated: Id: ' + req.body.id);
    res.send(ResponseFactory.getSuccessResponse({id: req.body.id, message: "Successfully Updated!"}));
};

exports.updateStatus = async (req, res) => {

    // Validate the Request
    if (!commonFunctions.validateRequestBody(req.body, ApiRequest.STATUS_UPDATE_API, false, res))
        return;

    const shopSearchResponse = await dbOperations.findOne(Shop, req.body.primaryId);

    if (DbResponses.isSqlErrorResponse(shopSearchResponse.status)) {
        res.status(500).send(ResponseFactory.getErrorResponse({message: shopSearchResponse.message || "Internal Server Error!"}));
        return;
    }
    if (DbResponses.isDataNotFoundResponse(shopSearchResponse.status)) {
        res.status(400).send(ResponseFactory.getErrorResponse({message: "Shop not exist with id: " + req.body.id}));
        return;
    }
    const shop = shopSearchResponse.data;

    if (!commonFunctions.isValidToProcess(req, res, shop.id))
        return;

    shop.status = req.body.status;

    const updateResponse = await dbOperations.updateOne(Shop, shop);

    if (DbResponses.isSqlErrorResponse(updateResponse.status)) {
        res.status(500).send(ResponseFactory.getErrorResponse({message: updateResponse.message || "Shop Status Updating failed with Id:" + req.body.id}));
        return;
    }
    if (DbResponses.isDataNotFoundResponse(updateResponse.status)) {
        res.status(204).send();
        return;
    }

    logger.info('Shop Status Updated: Id: ' + req.body.primaryId);
    res.send(ResponseFactory.getSuccessResponse({id: req.body.primaryId, message: "Successfully Updated the shop status!"}));
};

exports.findOne = async (req, res) => {

    if (!commonFunctions.isValidToProcess(req, res, req.params.shopId))
        return;

    const findResponse = await dbOperations.findOne(Shop, req.params.shopId);

    if (DbResponses.isSqlErrorResponse(findResponse.status)) {
        res.status(500).send(ResponseFactory.getErrorResponse({message: findResponse.message || "Some error occurred while retrieving Shop with Id:" + req.params.shopId}));
        return;
    }
    if (DbResponses.isDataNotFoundResponse(findResponse.status)) {
        res.status(204).send();
        return;
    }

    res.send(ResponseFactory.getSuccessResponse({data: findResponse.data}));
};

exports.findAll = (req, res) => {

    let SELECT_SQL = `SELECT * FROM ${Shop.EntityName} `;
    let FILTER = ``;
    let COLUMN_MAP = [];

    searchTemplate.dynamicDataOnlySearch(SELECT_SQL, FILTER, COLUMN_MAP, new SearchRequest({}), res);
};

exports.findByCriteria = (req, res) => {

    // Validate the Request
    // if (!commonFunctions.requestValidator(req.body, SearchRequest.API, [], false, res))
    //     return;

    let SELECT_SQL = `SELECT * FROM ${Shop.EntityName} `;
    let COUNT_SQL = `SELECT COUNT(id) AS ct FROM ${Shop.EntityName} `;
    let FILTER = '';
    let COLUMN_MAP = {
        name: "name",
        email: "email",
        telephone: "telephone",
        city: "city"
    };

    let searchReq = new SearchRequest(req.body);

    searchTemplate.dynamicSearchWithCount(SELECT_SQL, COUNT_SQL, FILTER, COLUMN_MAP, searchReq, res);
    // searchTemplate.dynamicDataOnlySearch(SELECT_SQL, FILTER,COLUMN_MAP, searchReq, res);
};

// exports.createSh = (req, res) => {
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
//     const AdminUpdateQuery = dbQueryGenFunctions.getUpdateQuery(1, new Admin(req.body), Admin.EntityName, ` id = ${req.body.id} `, req.body.id, Admin.updateRestrictedColumns);
//     const AdminInsertQuery = dbQueryGenFunctions.getInsertQuery(2, Admin.EntityName, admin);
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
