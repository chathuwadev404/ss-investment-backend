const Admin = require("../models/admin.model");
const Shop = require("../models/shop.model");
const commonFunctions = require("../shared/common.functions");
const dbOperations = require("../shared/database/db.operations");
const searchTemplate = require("../shared/search/search.template");
const SearchRequest = require("../shared/search/SearchRequest");
const mainConfig = require("../../app/config/main.config");
const appRoles = require("../../app/config/app.role").APP_ROLES;

const AdminApiRequest = require("../APIs/request/admin.api.request");
const ResponseFactory = require("../APIs/response/dynamic.response.factory");
const AdminApiResponse = require("../APIs/response/admin.api.response");
const DbResponses = require("../APIs/response/db.response.factory");
const sessionStore = require("../shared/session.store");
const logger = require("../shared/logger/logger.module")("admin.controller.js");

exports.create = async (req, res) => {
    // Validate the Request and reformat to api format
    if (!commonFunctions.validateRequestBody(req.body, AdminApiRequest.CREATE_API, false, res))
        return;

    const ResultResponse = await dbOperations.getResultByQuery(Admin.NamedQuery.getAdminByUserName(req.body.userName));

    if (DbResponses.isSqlErrorResponse(ResultResponse.status)) {
        res.status(500).send(ResponseFactory.getErrorResponse({message: 'Internal Server Error'}));
        return;
    }
    if (DbResponses.isSuccessResponse(ResultResponse.status) && ResultResponse.data.length > 0) {
        logger.info("User Name already exist. username: " + req.body.userName);
        res.status(400).send(ResponseFactory.getErrorResponse({message: 'User Name already exist'}));
        return;
    }

    const admin = new Admin({
        userName: req.body.userName,
        password: req.body.password,
        fullName: req.body.fullName,
        email: req.body.email,
        telephone: req.body.telephone,
        address: req.body.address,
        city: req.body.city
    });
    admin.shopId = req.body.shopId;
    if (req.body.shopId > 1) {
        admin.systemAdmin = false;
        admin.roleId = appRoles[1].ID;
    } else {
        admin.systemAdmin = true;
        admin.roleId = appRoles[0].ID;
    }
    admin.status = mainConfig.SYSTEM_STATUS.CREATED;

    const creationResponse = await dbOperations.create(Admin, admin);

    if (DbResponses.isSqlErrorResponse(creationResponse.status)) {
        res.status(500).send(ResponseFactory.getErrorResponse({message: creationResponse.message || "Some error occurred while creating the Admin."}));
        return;
    }
    logger.info("Admin Created. Id: " + creationResponse.data.id);
    res.send(ResponseFactory.getSuccessResponse({
        data: AdminApiResponse.AdminCreationResponse(creationResponse.data),
        message: "Admin Created"
    }));
};

exports.update = async (req, res) => {

    // Validate the Request and reformat to api format
    if (!commonFunctions.validateRequestBody(req.body, AdminApiRequest.UPDATE_API, false, res))
        return;

    if (!req.admin.systemAdmin && req.admin.id !== req.body.id) {
        res.status(401).send(ResponseFactory.getErrorResponse({message: 'Invalidate User to current action.'}));
    }

    const adminSearchResponse = await dbOperations.findOne(Admin, req.body.id);

    if (DbResponses.isSqlErrorResponse(adminSearchResponse.status)) {
        res.status(500).send(ResponseFactory.getErrorResponse({message: adminSearchResponse.message || "Internal Server Error!"}));
        return;
    }
    if (DbResponses.isDataNotFoundResponse(adminSearchResponse.status)) {
        res.status(400).send(ResponseFactory.getErrorResponse({message: "Admin not exist with id: " + req.body.id}));
        return;
    }
    const oldAdmin = adminSearchResponse.data;

    if (!commonFunctions.isValidToProcess(req, res, oldAdmin.shopId))
        return;

    const updateResponse = await dbOperations.updateOne(Admin, req.body);

    if (DbResponses.isSqlErrorResponse(updateResponse.status)) {
        res.status(500).send(ResponseFactory.getErrorResponse({message: updateResponse.message || "Admin Updating failed with Id:" + req.body.id}));
        return;
    }

    if (DbResponses.isDataNotFoundResponse(updateResponse.status)) {
        res.status(204).send(ResponseFactory.getErrorResponse({id: req.body.id, message: "Admin Not found!"}));
        return;
    }

    logger.info('Admin Updated: Id: ' + req.body.id);
    res.send(ResponseFactory.getSuccessResponse({id: req.body.id, message: "Successfully Updated!"}));
};

exports.login = async (req, res) => {
    try {
        // Validate the Request and reformat to api format
        if (!commonFunctions.validateRequestBody(req.body, AdminApiRequest.LOGIN_REQUEST, false, res))
            return;

        const ResultResponse = await dbOperations.getResultByQuery(Admin.NamedQuery.getAdminByUserNameAndPassword(req.body.userName, req.body.password));

        if (DbResponses.isSqlErrorResponse(ResultResponse.status)) {
            res.status(500).send(ResponseFactory.getErrorResponse({message: 'Internal Server Error'}));
            return;
        }
        if (DbResponses.isDataNotFoundResponse(ResultResponse.status)) {
            res.status(401).send(ResponseFactory.getErrorResponse({message: 'Invalid username/password'}));
            return;
        }

        let admin = new Admin(ResultResponse.data[0]);
        admin.sessionId = commonFunctions.getSessionId();

        const shopResponse = await dbOperations.findOne(Shop, admin.shopId);
        if (DbResponses.isSqlErrorResponse(shopResponse.status)) {
            res.status(500).send(ResponseFactory.getErrorResponse({message: shopResponse.message || "Internal Server Error"}));
            return;
        } else if (DbResponses.isDataNotFoundResponse(shopResponse.status)) {
            res.status(400).send(ResponseFactory.getErrorResponse({message: "Shop Not Found"}));
            return;
        } else if (shopResponse.data && shopResponse.data.status !== mainConfig.SYSTEM_STATUS.APPROVED) {
            res.status(400).send(ResponseFactory.getErrorResponse({message: "Shop not approved"}));
            return;
        }

        const updateResponse = await dbOperations.updateOne(Admin, admin);

        if (DbResponses.isSqlErrorResponse(updateResponse.status)) {
            res.status(500).send(ResponseFactory.getErrorResponse({message: updateResponse.message || "Internal Server Error"}));
            return;
        }
        if (DbResponses.isDataNotFoundResponse(updateResponse.status)) {
            logger.error("Session Id Updating failed. AdminId :" + admin.id);
            res.status(204).send();
            return;
        }

        sessionStore.addAdminSession(admin.sessionId, AdminApiResponse.AdminLoginResponse(admin));

        let roles = appRoles.filter((r) => {
            return r.ID === admin.roleId
        });

        admin.functions = roles[0].FUNCTIONS;

        logger.info('Admin Login Success: Id: ' + admin.id + " with sessionId: " + admin.sessionId);
        res.status(200).send(ResponseFactory.getSuccessResponse({
            data: AdminApiResponse.AdminLoginResponse(admin),
            message: 'Login Success'
        }))
    } catch (e) {
        logger.error(e);
        res.status(500).send(ResponseFactory.getErrorResponse({message: 'Internal Server Error'}));
    }
};

exports.findOne = async (req, res) => {
    const findResponse = dbOperations.findOne(Admin, req.params.adminId);

    if (DbResponses.isSqlErrorResponse(findResponse.status)) {
        res.status(500).send(ResponseFactory.getErrorResponse({message: findResponse.message || "Some error occurred while retrieving Admin with Id:" + req.params.adminId}));
        return;
    }
    if (DbResponses.isDataNotFoundResponse(findResponse.status)) {
        res.status(204).send();
        return;
    }

    res.send(ResponseFactory.getSuccessResponse({data: findResponse.data}));
};

exports.findAll = (req, res) => {

    let SELECT_SQL = `SELECT * FROM ${Admin.EntityName} `;
    let FILTER = ``;
    let COLUMN_MAP = [];

    searchTemplate.dynamicDataOnlySearch(SELECT_SQL, FILTER, COLUMN_MAP, new SearchRequest({}), res);
};

exports.findByCriteria = (req, res) => {

    let SELECT_SQL = `SELECT * FROM ${Admin.EntityName} `;
    let COUNT_SQL = `SELECT COUNT(id) AS ct FROM ${Admin.EntityName} `;
    let FILTER = '';
    let COLUMN_MAP = {
        userName: "userName",
        email: "email",
        telephone: "telephone",
        city: "city"
    };

    let searchReq = new SearchRequest(req.body);

    searchTemplate.dynamicSearchWithCount(SELECT_SQL, COUNT_SQL, FILTER, COLUMN_MAP, searchReq, res);
    // searchTemplate.dynamicDataOnlySearch(SELECT_SQL, FILTER,COLUMN_MAP, searchReq, res);
};
