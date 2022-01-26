const apiShoppe = require('../api_marketplace/api_shoppe.js')
const apiTokped = require('../api_marketplace/api_tokped.js')
const apiBlibli = require('../api_marketplace/api_blibli.js')
const apiLazada = require('../api_marketplace/api_lazada.js')

const express = require('express')
const router = express.Router();

let response = {
    code: 404,
    message: "Something Wrong"
}

function unixTms(date) {
    return Math.floor(new Date(date).getTime() / 1000.0)
}

//get chat
router.get('/chats', async function (req, res) {
    const search = req.query;
    const shop_id = search.shop_id;
    const start_time = search.start_time;
    const end_time = search.end_time;
    const page = search.page;
    const limit = search.limit;
    const marketplace = search.marketplace;

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
            let hitAPI = await apiTokped.getChat(shop_id, page, limit)
            res.send(hitAPI);
            return;
        } else if (marketplace == "shopee") {
            let hitAPI = await apiShoppe.getChats(shop_id, null, null, page_size = 50);
            res.send(hitAPI);
            return;
        } else if (marketplace == "blibli") {
            let hitAPI = await apiBlibli.getChat(shop_id, "username", unixTms(start_time), unixTms(end_time), page, limit);
            res.send(hitAPI);
            return;
        } else if (marketplace == "lazada") {
            response.code = 400
            response.message = "still not avalable for lazada"
            response.marketplace = "lazada"
            res.status(response.code).send(response);
            return;
        }
    }
    res.status(response.code).send(response)
});

//get reply
router.get('/reply', async function (req, res) {
    const search = req.query;
    const shop_id = search.shop_id;
    const start_time = search.start_time;
    const end_time = search.end_time;
    const page = search.page;
    const limit = search.limit;
    const marketplace = search.marketplace;
    const chatid = search.chatid;

    if (marketplace === null || marketplace === undefined) {
        response.code = 400
        response.message = "Parameter marketplace is required"
    } else if (marketplace !== "lazada" && marketplace !== "shopee" && marketplace !== "" && marketplace !== "tokopedia" && marketplace !== "blibli") {
        response.code = 400
        response.message = "Parameter marketplace only available for blibli ,lazada, shopee, or tokopedia"
    } else if (shop_id === null || shop_id === undefined) {
        response.code = 400
        response.message = "Parameter shop_id is required "
    } else if (chatid === null || chatid === undefined) {
        response.code = 400
        response.message = "Parameter chatid is required "
    } else {
        if (marketplace == "tokopedia") {
            let hitAPI = await apiTokped.getReply(shop_id, page, limit, chatid);
            res.send(hitAPI);
            return;
        } else if (marketplace == "shopee") {
            let hitAPI = await apiShoppe.getChats(shop_id, null, chatid, page_size = 50);
            res.send(hitAPI);
            return;
        } else if (marketplace == "blibli") {
            let hitAPI = await apiBlibli.getReply(chatid, shop_id, "username", page, limit);
            res.send(hitAPI);
            return;
        } else if (marketplace == "lazada") {
            response.code = 400
            response.message = "still not avalable for lazada"
            response.marketplace = "lazada"
            res.status(response.code).send(response);
            return;
        }
    }
    res.status(response.code).send(response)
});


//post chat
router.post('/reply', async function (req, res) {
    const search = req.query;
    const shop_id = search.shop_id;
    const start_time = search.start_time;
    const end_time = search.end_time;
    const page = search.page;
    const limit = search.limit;
    const marketplace = search.marketplace;
    const message = search.message;
    const chatid = search.chatid;

    if (marketplace === null || marketplace === undefined) {
        response.code = 400
        response.message = "Parameter marketplace is required"
    } else if (marketplace !== "lazada" && marketplace !== "shopee" && marketplace !== "" && marketplace !== "tokopedia" && marketplace !== "blibli") {
        response.code = 400
        response.message = "Parameter marketplace only available for blibli ,lazada, shopee, or tokopedia"
    } else if (shop_id === null || shop_id === undefined) {
        response.code = 400
        response.message = "Parameter shop_id is required "
    } else if (chatid === null || chatid === undefined) {
        response.code = 400
        response.message = "Parameter chatid is required "
    } else if (message === null || message === undefined) {
        response.code = 400
        response.message = "Parameter message is required "
    } else {
        if (marketplace == "tokopedia") {
            let hitAPI = await apiTokped.postReply(shop_id, message, chatid);
            res.send(hitAPI);
            return;
        } else if (marketplace == "shopee") {
            let hitAPI = await apiShoppe.postReply(shop_id, chatid, message);
            res.send(hitAPI);
            return;
        } else if (marketplace == "blibli") {
            let hitAPI = await apiBlibli.postReply(chatid, shop_id, "username", message);
            res.send(hitAPI);
            return;
        } else if (marketplace == "lazada") {
            response.code = 400
            response.message = "still not avalable for lazada"
            response.marketplace = "lazada"
            res.status(response.code).send(response);
            return;
        }
    }
    res.status(response.code).send(response)
});


module.exports = router;