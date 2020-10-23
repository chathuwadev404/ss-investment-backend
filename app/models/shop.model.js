// constructor
const Shop = function (shop) {
    this.id = shop.id || 0;
    this.status = shop.id || 0;
    this.name = shop.name || null;
    this.email = shop.email || null;
    this.description = shop.description || null;
    this.image = shop.image || null;
    this.telephone = shop.telephone || null;
    this.address = shop.address || null;
    this.city = shop.city || null;
    this.longitude = shop.longitude || 0.0;
    this.latitude = shop.latitude || 0.0;
};

Shop.EntityName = "shop";
Shop.PrimaryKey = "id";
Shop.updateRestrictedColumns = ["id", "email"];

module.exports = Shop;