const searchTemplate = require("../shared/search/search.template");
const SearchRequest = require("../shared/search/SearchRequest");
const Shop = require("../models/shop.model");
const AppRoles = require("../config/app.role");
const ResponseFactory = require("../APIs/response/dynamic.response.factory");

const logger = require("../shared/logger/logger.module")("shop.controller.js");

exports.getShopList = async (req, res) => {
    let SELECT_SQL = `SELECT * FROM ${Shop.EntityName} `;
    let FILTER = ``;
    let COLUMN_MAP = [];

    searchTemplate.dynamicDataOnlySearch(SELECT_SQL, FILTER, COLUMN_MAP, new SearchRequest({}), res);
}

exports.getRoleList = async (req, res) => {

    let response = AppRoles.APP_ROLES.map((role)=>{
        return {id:role.ID,name:role.NAME};
    })

    res.send(ResponseFactory.getSearchResponse({
        data: response
    }));
}
