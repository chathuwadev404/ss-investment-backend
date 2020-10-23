const express = require('express');
const AdminRequest = require("../APIs/request/admin.api.request");
const ShopRequest = require("../APIs/request/shop.api.request");
const router = express.Router();

router.get('/admin', (req,res)=>{
    res.send(AdminRequest)
});

router.get('/shop', (req,res)=>{
    res.send({ShopRequest})
});

module.exports = router;
