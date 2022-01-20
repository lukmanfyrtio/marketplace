const apiTokped = require('../api_marketplace/api_tokped.js')

const express = require('express')
const router = express.Router();

let response = {
    code: 404,
    message: "Something Wrong"
}
//Get All Settlement
router.post('/list', async function (req, res) {
    const search = req.query;
    const shop_id = search.shop_id;
    const marketplace = search.marketplace;

    const start_time = search.start_time;
    const end_time = search.end_time;

    const page = search.page;
    const limit = search.limit;

    var regex = /^[0-9]{4}[\-][0-9]{2}[\-][0-9]{2}$/g;
    if (marketplace === null || marketplace === undefined) {
        response.code = 400
        response.message = "Parameter marketplace is required"
    } else if (marketplace !== "lazada" && marketplace !== "shopee" && marketplace !== "" && marketplace !== "tokopedia" && marketplace !== "blibli") {
        response.code = 400
        response.message = "Parameter marketplace only available for blibli ,lazada, shopee, or tokopedia"
    } else if (shop_id === null || shop_id === undefined) {
        response.code = 400
        response.message = "Parameter shop_id is required "
    } else if (start_time === null || start_time === undefined) {
        response.code = 400
        response.message = "Parameter start_time is required "
    } else if (!regex.test(start_time)) {
        response.code = 400
        response.message = "Parameter start_time format date is YYYY-MM-DD "
    } else if (end_time === null || end_time === undefined) {
        response.code = 400
        response.message = "Parameter end_time is required"
    } else if (!regex.test(end_time)) {
        response.code = 400
        response.message = "Parameter end_time format date is YYYY-MM-DD "
    }else {
        if (marketplace == "tokopedia") {
            let hitAPI = await apiTokped.getAllSettlements(shop_id, page, limit, start_time, end_time);
            res.send(hitAPI);
            return;
        } else if (marketplace == "shopee") {
            res.send("still not avalable for shoppe")
        } else if (marketplace == "blibli") {
            res.send("still not avalable for blibli")
        } else if (marketplace == "lazada") {
            res.send("still not avalable for lazada")
        }
    }
    res.status(response.code).send(response)
});

//Get Single Settlement
router.post('/get', async function (req, res) {
    const search = req.query;
    const shop_id = search.shop_id;
    const marketplace = search.marketplace;

    const orderid = search.orderid;

    if (marketplace === null || marketplace === undefined) {
        response.code = 400
        response.message = "Parameter marketplace is required"
    } else if (marketplace !== "lazada" && marketplace !== "shopee" && marketplace !== "" && marketplace !== "tokopedia" && marketplace !== "blibli") {
        response.code = 400
        response.message = "Parameter marketplace only available for blibli ,lazada, shopee, or tokopedia"
    } else if (shop_id === null || shop_id === undefined) {
        response.code = 400
        response.message = "Parameter shop_id is required "
    } else if (orderid === null || orderid === undefined) {
        response.code = 400
        response.message = "Parameter orderid is required "
    }else {
        if (marketplace == "tokopedia") {
            response.code = 400
            response.message = "This service is not yet available for tokopedia marketplace"
            return;
        } else if (marketplace == "shopee") {
            res.send("still not avalable for shoppe")
        } else if (marketplace == "blibli") {
            res.send("still not avalable for blibli")
        } else if (marketplace == "lazada") {
            res.send("still not avalable for lazada")
        }
    }
    res.status(response.code).send(response)
});

module.exports = router;