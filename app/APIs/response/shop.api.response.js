class ShopApiResponse {

    ShopCreationResponse(shop) {
        this.id = shop.id || 0;
        this.status = shop.status || 0;
        this.name = shop.name || null;
        this.email = shop.email || null;
        this.description = shop.description || null;
        this.image = shop.image || null;
        this.telephone = shop.telephone || null;
        this.address = shop.address || null;
        this.city = shop.city || null;
        this.longitude = shop.longitude || 0;
        this.latitude = shop.latitude || 0;
        return this;
    };
}

module.exports = new ShopApiResponse();