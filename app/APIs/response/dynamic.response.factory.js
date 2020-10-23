const Status = require("../../config/main.config").RESPONSE_STATUS;

class ErrorResponse {
    constructor(data) {
        this.status = Status.RESPONSE_ERROR;
        this.message = data.message;
    }
}

class SuccessResponse {
    constructor(data) {
        this.status = Status.RESPONSE_SUCCESS;
        this.message = data.message;
        this.id = data.id;
        this.data = data.data;
    }
}

class SearchResponse {
    constructor(data) {
        this.status = Status.RESPONSE_SUCCESS;
        this.offset = data.offset;
        this.limit = data.limit;
        this.recordCount = data.recordCount;
        this.data = data.data;
    }
}

class UploadSuccessResponse {
    constructor(data) {
        this.status = Status.RESPONSE_SUCCESS;
        this.message = data.message;
        this.url = data.url;
    }
}

class ResponseFactory {

    getErrorResponse(data) {
        return new ErrorResponse(data);
    }

    getSuccessResponse(data) {
        return new SuccessResponse(data);
    }

    getSearchResponse(data) {
        return new SearchResponse(data);
    }

    getUploadSuccessResponse(data) {
        return new UploadSuccessResponse(data);
    }
}

module.exports = new ResponseFactory();