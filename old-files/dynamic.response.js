const Status = require("../config/main.config").RESPONSE_STATUS;

DynamicResponse = (response) => {
    this.status = response.status;
    this.message = response.message;
    this.id = response.id;
    this.data = response.data;
    this.offset = response.offset;
    this.limit = response.limit;
    this.recordCount = response.recordCount;
};

DynamicResponse.error = (response) => {
    DynamicResponse({});
    this.status = Status.RESPONSE_ERROR;
    this.message = response.message;
    return this;
};

DynamicResponse.success = (response) => {
    DynamicResponse({});
    this.status = Status.RESPONSE_SUCCESS;
    this.message = response.message;
    this.id = response.id;
    this.data = response.data;
    return this;
};

DynamicResponse.searchResponse = (response) => {
    DynamicResponse({});
    this.status = Status.RESPONSE_SUCCESS;
    this.offset = response.offset;
    this.limit = response.limit;
    this.recordCount = response.recordCount;
    this.data = response.data;
    return this;
};

DynamicResponse.uploadSuccess = (response) => {
    DynamicResponse({});
    this.status = Status.RESPONSE_SUCCESS;
    this.message = response.message;
    this.url = response.url;
    return this;
};

module.exports = DynamicResponse;