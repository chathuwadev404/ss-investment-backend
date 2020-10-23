const AppFunctions = require("./app.functions").APP_FUNCTIONS;
const MainConfig = require("./main.config");

exports.APP_ROLES = [
    {
        ID: 1,
        NAME: "Super Admin",
        TYPE: MainConfig.ADMIN_TYPES.SYSTEM_ADMIN,
        FUNCTIONS: [
            // Admin Functions
            AppFunctions.FIND_ADMIN_BY_CRITERIA.ID,
            AppFunctions.VIEW_ADMIN_DETAILS.ID,
            AppFunctions.CREATE_ADMIN.ID,
            // AppFunctions.UPDATE_ADMIN.ID,
            AppFunctions.UPDATE_ADMIN_STATUS.ID,
            // Shop Functions
            AppFunctions.FIND_SHOP_BY_CRITERIA.ID,
            AppFunctions.VIEW_SHOP_DETAILS.ID,
            AppFunctions.CREATE_SHOP.ID,
            AppFunctions.UPDATE_SHOP.ID,
            AppFunctions.UPDATE_SHOP_STATUS.ID
        ]
    },
    {
        ID: 2,
        NAME: "Shop Admin",
        TYPE: MainConfig.ADMIN_TYPES.SHOP_ADMIN,
        FUNCTIONS: [
            AppFunctions.VIEW_SHOP_DETAILS.ID,
            AppFunctions.UPDATE_SHOP.ID,
        ]
    }
];
