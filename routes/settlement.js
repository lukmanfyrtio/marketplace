const apiShoppe = require('../api_marketplace/api_shoppe.js')
const apiTokped = require('../api_marketplace/api_tokped.js')
const apiBlibli = require('../api_marketplace/api_blibli.js')
const apiLazada = require('../api_marketplace/api_lazada.js')

const express = require('express')
const router = express.Router();

let response = {
    timestamp: new Date().getTime(),
    code: 404,
    message: "Something Wrong"
}

function unixTms(date) {
    return Math.floor(new Date(date).getTime() / 1000.0)
}

//Get All Settlement
router.get('/settlements', async function (req, res) {
    const search = req.query;
    const shop_id = search.shop_id;
    const marketplace = search.marketplace;

    const start_time = search.start_time;
    const end_time = search.end_time;

    const page = search.page;
    const limit = search.limit;
    var regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/
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
    } else {
        if (marketplace == "tokopedia") {
            let hitAPI = await apiTokped.getAllSettlements(req.envStore,shop_id, page, limit, start_time, end_time);
            res.send(hitAPI);
            return;
        } else if (marketplace == "shopee") {
            let hitAPI = await apiShoppe.getAllSettlement(shop_id, unixTms(start_time+" 00:00:00"), unixTms(end_time+" 23:59:59"),limit,page,req.envStore)
            res.send(hitAPI);
            return;
        } else if (marketplace == "blibli") {
            let hitAPI = await apiBlibli.getAllSettlements(req.envStore,shop_id, unixTms(start_time+" 00:00:00"), unixTms(end_time+" 23:59:59"), page===0?0:page-1, limit)
            res.send(hitAPI);
            return;
        } else if (marketplace == "lazada") {
            let hitAPI = await apiLazada.getAllSettlements(req.envStore,Number(limit?limit*(page-1):0), limit, start_time, end_time);
            res.send(hitAPI);
            return;
        }
    }
    res.status(response.code).send(response)
});

//Get Single Settlement
router.get('/settlement', async function (req, res) {
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
    } else {
        if (marketplace == "tokopedia") {
            response.code = 400
            response.message = "This service is not yet available for tokopedia marketplace"
            res.status(response.code).send(response);
            return;
        } else if (marketplace == "shopee") {
            let hitAPI = await apiShoppe.getSingleSettlement(shop_id,orderid,req.envStore);
            res.send(hitAPI);
            return;
        } else if (marketplace == "blibli") {
            let hitAPI = await apiBlibli.getSingleSettlement(req.envStore,orderid, shop_id)
            res.send(hitAPI);
            return;
        } else if (marketplace == "lazada") {
            response.code = 400
            response.message = "This service is not yet available for lazada marketplace"
            response.marketplace = "lazada"
            res.status(response.code).send(response);
            return;
        }
    }
    res.status(response.code).send(response)
});

module.exports = router;