const mainConfig = require("../../config/main.config")

class DBResponseFactory {
    DataNotFound() {
        this.status = mainConfig.DB_RESPONSE_STATUS.DATA_NOT_FOUND;
        return this;
    };

    SQL_ERROR(data) {
        this.status = mainConfig.DB_RESPONSE_STATUS.SQL_ERROR;
        this.data = data;
        return this;
    };

    Success(data) {
        this.status = mainConfig.DB_RESPONSE_STATUS.SUCCESS;
        this.data = data;
        return this;
    };

    CommitSuccess(data) {
        this.status = mainConfig.DB_RESPONSE_STATUS.COMMIT_SUCCESS;
        this.data = data;
        return this;
    };

    Rollback(data) {
        this.status = mainConfig.DB_RESPONSE_STATUS.ROLLBACK;
        this.data = data;
        return this;
    };

    isDataNotFoundResponse(status){
        return status === mainConfig.DB_RESPONSE_STATUS.DATA_NOT_FOUND;
    }

    isSqlErrorResponse(status){
        return status === mainConfig.DB_RESPONSE_STATUS.SQL_ERROR;
    }

    isSuccessResponse(status){
        return status === mainConfig.DB_RESPONSE_STATUS.SUCCESS;
    }

    isCommitSuccess(status){
        return status === mainConfig.DB_RESPONSE_STATUS.COMMIT_SUCCESS;
    }

    isRollback(status){
        return status === mainConfig.DB_RESPONSE_STATUS.ROLLBACK;
    }
}

module.exports = new DBResponseFactory();