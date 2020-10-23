exports.mainRouter = function(app){
    app.use("/shop",require("./shop.routes"));
};