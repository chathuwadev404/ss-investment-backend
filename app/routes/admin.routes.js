const admin = require("../controllers/admin.controller");
const express = require('express');
const commonFunctions = require("../shared/common.functions");
const appFunctions = require("../../app/config/app.functions").APP_FUNCTIONS;
const router = express.Router();

router.get('/', commonFunctions.authValidator(appFunctions.FIND_ADMIN_BY_CRITERIA.ID), admin.findAll);

router.get('/:adminId', commonFunctions.authValidator(appFunctions.VIEW_ADMIN_DETAILS.ID), admin.findOne);

router.post('/', commonFunctions.authValidator(appFunctions.CREATE_ADMIN.ID), admin.create);

router.put('/', commonFunctions.authValidator(appFunctions.UPDATE_ADMIN.ID), admin.update);

router.post('/findByCriteria', commonFunctions.authValidator(appFunctions.FIND_ADMIN_BY_CRITERIA.ID), admin.findByCriteria);

// router.post('/transTest', admin.transTest);

router.put('/login', admin.login);

module.exports = router;
