module.exports = {

    DB_RESPONSE_STATUS: {
        SQL_ERROR: 1,
        DATA_NOT_FOUND: 2,
        SUCCESS: 3,
        COMMIT_SUCCESS: 4,
        ROLLBACK: 5
    },
    RESPONSE_STATUS: {
        RESPONSE_SUCCESS: 1,
        RESPONSE_ERROR: -1
    },
    ADMIN_TYPES: {
        SYSTEM_ADMIN: 1,
        SHOP_ADMIN: 2
    },
    SYSTEM_STATUS: {
        CREATED: 0,
        PENDING: 1,
        APPROVED: 2,
        HOLD: 3,
        DELETED: 4
    }
};