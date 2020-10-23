ShopApiRequest = {
    CREATE_API: {
        BODY: {
            name: "",
            email: "",
            description: "",
            image: "",
            telephone: "",
            address: "",
            city: "",
            longitude: 0.0,
            latitude: 0.0,
            admin: {
                userName: "",
                password: "",
                fullName: ""
            }
        },
        MandatoryColumns: ["name", "email", "telephone"]
    },
    UPDATE_API: {
        BODY: {
            id: 0,
            name: "",
            email: "",
            description: "",
            image: "",
            telephone: "",
            address: "",
            city: "",
            longitude: 0.0,
            latitude: 0.0
        },
        MandatoryColumns: ["id"]
    }
};

module.exports = ShopApiRequest;
