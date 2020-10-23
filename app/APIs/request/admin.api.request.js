AdminApiRequest = {
    CREATE_API: {
        BODY: {
            roleId: 0,
            shopId: 0,
            userName: "",
            password: "",
            fullName: "",
            email: "",
            telephone: "",
            address: "",
            city: "",
        },
        MandatoryColumns: ["userName", "password", "email", "shopId"]
    },
    UPDATE_API: {
        BODY: {
            id: 0,
            shopId: 0,
            roleId: 0,
            fullName: "",
            telephone: "",
            address: "",
            city: ""
        },
        MandatoryColumns: ["id"]
    },
    LOGIN_REQUEST: {
        BODY: {
            userName: "",
            password: ""
        },
        MandatoryColumns: ["userName", "password"]
    }
};

module.exports = AdminApiRequest;
