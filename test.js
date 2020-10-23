const DBTransactionChain = require("./app/shared/database/db.transaction.chain");
const queryGen = require("./app/shared/database/db.query.gen.function");
const Shop = require("./app/models/shop.model");
const Admin = require("./app/models/admin.model");

const dbResponses = require("./app/APIs/response/db.response.factory");

asd = async ()=>{
    const transactionChain = DBTransactionChain.getTransaction();
    const shop = new Shop({
        name: "test1",
        email: "test1",
        description: "test1",
        image: "test1",
        telephone: "test1",
        address: "test1",
        city: "test1",
        longitude: 0.0,
        latitude: 0.0
    });

    const admin = new Admin({
        userName: "d1",
        password: "123456",
        fullName: "Tharindu Jayasinghe",
        email: "tharin@gmail.com",
        telephone: "+94713451233",
        address: "Kalu",
        city: "Badulla",
        roleId: 1,
        shopId:1
    });
    const createShop = queryGen.getInsertQuery(1,Shop.EntityName,shop);
    const shopResponse = await transactionChain.execute(createShop);

    if(dbResponses.isSqlErrorResponse(shopResponse.status)){
        console.log(shopResponse.data.sqlMessage);
        return;
    }

    admin.shopId = shopResponse.data.insertId;
    const createAdmin = queryGen.getInsertQuery(2,Admin.EntityName,admin);
    const adminResponse = await transactionChain.execute(createAdmin);

    if(dbResponses.isSqlErrorResponse(adminResponse.status)){
        console.log(adminResponse.data.sqlMessage)
        return;
    }

    const queryResponse = await transactionChain.commit();
    if(dbResponses.isRollback(queryResponse.status)){
        console.log(queryResponse.data.sqlMessage);
        return;
    }
    console.log(queryResponse.data);
};

asd().then(r => {
    // console.log(r);
});