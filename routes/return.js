const apiShoppe = require('../api_marketplace/api_shoppe.js')
const apiTokped = require('../api_marketplace/api_tokped.js')
const apiBlibli = require('../api_marketplace/api_blibli.js')
const apiLazada = require('../api_marketplace/api_lazada.js')

const express = require('express')
const router = express.Router();
const moment = require('moment')

let response = {
    code: 404,
    message: "Something Wrong"
}

function isValidDate(date) {
    return moment(date, 'YYYY-MM-DD', true).isValid();
}

function unixTms(date) {
    return Math.floor(new Date(date).getTime() / 1000.0)
}

router.get('/return/list', async function (req, res) {

    const body = req.body;
    const param = req.query;
    const shop_id = param.shop_id;
    const marketplace = param.marketplace;
    const page = param.page;//tokped no available
    const limit = param.limit;//tokped no available
    const start_time = param.start_time;
    const end_time = param.end_time;

    const status = param.end_time;//lazada or blibli only

    if (marketplace === null || marketplace === undefined) {
        response.code = 400
        response.message = "Parameter marketplace is required"
    } else if (marketplace !== "lazada" && marketplace !== "shopee" && marketplace !== "" && marketplace !== "tokopedia" && marketplace !== "blibli") {
        response.code = 400
        response.message = "Parameter marketplace only available for blibli ,lazada, shopee, or tokopedia"
    } else if (shop_id === null || shop_id === undefined) {
        response.code = 400
        response.message = "Parameter shop_id is required "
    } else {
        if (start_time !== null && start_time !== undefined && !isValidDate(start_time)) {
            response.code = 400
            response.message = "Parameter start_time format is YYYY-MM-DD"
        } else if (end_time !== null && end_time !== undefined && !isValidDate(end_time)) {
            response.code = 400
            response.message = "Parameter end_time format is YYYY-MM-DD"
        } else if (marketplace == "tokopedia") {
            let hitAPI = await apiTokped.getResolutionTicket(req.envStore,shop_id, start_time, end_time)
            res.send(hitAPI);
            return;
        } else if (marketplace == "shopee") {
            let hitAPI = await apiShoppe.getReturns(shop_id, page, limit, unixTms(start_time+" 00:00:00"), unixTms(end_time+" 23:59:59"), req.envStore)
            res.send(hitAPI);
            return;
        } else if (marketplace == "blibli") {
            let hitAPI = await apiBlibli.getAllReturns(req.envStore,shop_id, page, limit)
            res.send(hitAPI);
            return;
        } else if (marketplace == "lazada") {
            let hitAPI = await apiLazada.getAllReturns(req.envStore,page, limit)
            res.send(hitAPI);
            return;
        }
    }
    res.status(response.code).send(response);
});

router.get('/return', async function (req, res) {

    const body = req.body;
    const param = req.query;

    const marketplace = param.marketplace;
    const shop_id = param.shop_id;

    const return_id = param.return_id;//only blibli
    const order_no = param.shop_id;//only blibli
    const order_item_no = param.shop_id;//only blibli

    if (marketplace === null || marketplace === undefined) {
        response.code = 400
        response.message = "Parameter marketplace is required"
    } else if (marketplace !== "lazada" && marketplace !== "shopee" && marketplace !== "" && marketplace !== "tokopedia" && marketplace !== "blibli") {
        response.code = 400
        response.message = "Parameter marketplace only available for blibli ,lazada, shopee, or tokopedia"
    } else if (shop_id === null || shop_id === undefined) {
        response.code = 400
        response.message = "Parameter shop_id is required "
    } else if (return_id === null || return_id === undefined) {
        response.code = 400
        response.message = "Parameter return_id is required "
    } else {
        if (marketplace == "tokopedia") {
            response.code = 400
            response.message = "still not avalable for tokopedia"
            response.marketplace = "tokopedia"
            res.status(response.code).send(response);
            return;
        } else if (marketplace == "shopee") {
            let hitAPI = await apiShoppe.getReturnDetail(shop_id, return_id, req.envStore)
            res.send(hitAPI);
            return;
        } else if (marketplace == "blibli") {
            if (order_no === null || order_no === undefined) {
                response.code = 400
                response.message = "Parameter order_no is required on blibli"
            } else if (order_item_no === null || order_item_no === undefined) {
                response.code = 400
                response.message = "Parameter order_item_no is required on blibli"
            } else {
                let hitAPI = await apiBlibli.getSingleReturn(req.envStore,shop_id, return_id, order_no, order_item_no)
                res.send(hitAPI);
                return;
            }
        } else if (marketplace == "lazada") {
            let hitAPI = await apiLazada.getSingleReturn(req.envStore,return_id)
            res.send(hitAPI);
            return;
        }
    }
    res.status(response.code).send(response);
});

router.post('/return/accept', async function (req, res) {
    const body = req.body;
    const param = req.query;
    const shop_id = param.shop_id;
    const return_id = param.return_id;
    const marketplace = param.marketplace;
    const order_items = param.order_items;
    const reason = param.reason;
    const images = param.images;
    const action = param.action;

    if (marketplace === null || marketplace === undefined) {
        response.code = 400
        response.message = "Parameter marketplace is required"
    } else if (marketplace !== "lazada" && marketplace !== "shopee" && marketplace !== "" && marketplace !== "tokopedia" && marketplace !== "blibli") {
        response.code = 400
        response.message = "Parameter marketplace only available for blibli ,lazada, shopee, or tokopedia"
    } else if (shop_id === null || shop_id === undefined) {
        response.code = 400
        response.message = "Parameter shop_id is required "
    } else {
        if (marketplace == "tokopedia") {
            response.code = 400
            response.message = "still not avalable for tokopedia"
            response.marketplace = "tokopedia"
            res.status(response.code).send(response);
            return;
        } else if (marketplace == "shopee") {
            let hitAPI = await apiShoppe.confirmReturn(shop_id, return_id, req.envStore)
            res.send(hitAPI);
            return;
        } else if (marketplace == "blibli") {
            response.code = 400
            response.message = "still not avalable for blibli"
            response.marketplace = "blibli"
            res.status(response.code).send(response);
            return;
        } else if (marketplace == "lazada") {
            if (action === null || action === undefined) {
                response.code = 400
                response.message = "Parameter action is required on lazada"
            } else if (action !== "agreeRefund" && action !== "agreeReturn") {
                response.code = 400
                response.message = "Parameter action only available for agreeRefund or agreeReturn"
            } else {
                let hitAPI = await apiLazada.acceptRejectReturn(req.envStore,"agreeReturn", return_id, order_items?`${order_items}`:'[]', 0, reason, images)
                res.send(hitAPI);
                return;
            }
        }
    }
    res.status(response.code).send(response);
});


router.post('/return/reject', async function (req, res) {


    const body = req.body;
    const param = req.query;

    const marketplace = param.marketplace;
    const shop_id = param.shop_id;

    const action = body.action;
    const return_id = body.return_id;
    const reason_type = body.reason_type;
    const reason = body.reason;
    const images = body.images;
    const email = body.email;//shoppe only
    const order_items = body.order_items;//lazada only

    if (marketplace === null || marketplace === undefined) {
        response.code = 400
        response.message = "Parameter marketplace is required"
        res.status(response.code).send(response);
        return;
    } else if (marketplace !== "lazada" && marketplace !== "shopee" && marketplace !== "" && marketplace !== "tokopedia" && marketplace !== "blibli") {
        response.code = 400
        response.message = "Parameter marketplace only available for blibli ,lazada, shopee, or tokopedia"
        res.status(response.code).send(response);
        return;
    } else if (shop_id === null || shop_id === undefined) {
        response.code = 400
        response.message = "Parameter shop_id is required "
        res.status(response.code).send(response);
                return;
    } else {
        if (marketplace == "tokopedia") {
            response.code = 400
            response.message = "still not avalable for tokopedia"
            response.marketplace = "tokopedia"
            res.status(response.code).send(response);
            return;
        } else if (marketplace == "shopee") {
            if (return_id === null || return_id === undefined) {
                response.code = 400
                response.message = "Parameter return_id is required on shopee"
                res.status(response.code).send(response);
                return;
            } else if (email === null || email === undefined) {
                response.code = 400
                response.message = "Parameter email is required on shopee"
                res.status(response.code).send(response);
                return;
            } else if (reason_type === null || reason_type === undefined) {
                response.code = 400
                response.message = "Parameter reason_type is required on shopee"
                res.status(response.code).send(response);
                return;
            } else if (reason_type !== "NON_RECEIPT" && reason_type !== "OTHER" && reason_type !== "NOT_RECEIVED") {
                response.code = 400
                response.message = "Parameter reason_type on shopee only available NON_RECEIPT ,OTHER or NOT_RECEIVED";
                res.status(response.code).send(response);
                return;
            } else if (reason === null || reason === undefined) {
                response.code = 400
                response.message = "Parameter reason is required on shopee"
                res.status(response.code).send(response);
                return;
            } else if (images === null || images === undefined) {
                response.code = 400
                response.message = "Parameter images is required on shopee"
                res.status(response.code).send(response);
                return;
            } else if (!Array.isArray(images)) {
                response.code = 400;
                response.message = `Field images in request body shall be array string`;
                res.status(response.code).send(response);
                return;
            } else if (images === undefined || images.length == 0) {
                response.code = 400;
                response.message = `Field images in request body should not be empty`;
                res.status(response.code).send(response);
                return;
            } else {
                let hitAPI = await apiShoppe.disputeReturn(shop_id, `${return_id}`, `${email}`, `${reason_type}`, `${reason}`, images, req.envStore)
                res.send(hitAPI);
                return;
            }
        } else if (marketplace == "blibli") {
            response.code = 400
            response.message = "still not avalable for blibli"
            response.marketplace = "blibli"
            res.status(response.code).send(response);
            return;
        } else if (marketplace == "lazada") {
            if (action === null || action === undefined) {
                response.code = 400
                response.message = "Parameter action is required on lazada"
                res.status(response.code).send(response);
                return;
            } else if (action !== "refuseRefund" && action !== "refuseReturn") {
                response.code = 400
                response.message = "Parameter action only available for refuseRefund or refuseReturn"
                res.status(response.code).send(response);
                return;
            } else {
                let hitAPI = await apiLazada.acceptRejectReturn(req.envStore,action, return_id, order_items?`${order_items}`:'[]', 0, reason, images)
                res.send(hitAPI);
                return;
            }
        }
    }
    res.status(response.code).send(response);
});

module.exports = router;

