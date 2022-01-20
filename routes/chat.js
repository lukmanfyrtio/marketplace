const apiTokped = require('../api_marketplace/api_tokped.js')

const express = require('express')
const router = express.Router();

let response = {
    code: 404,
    message: "Something Wrong"
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
            res.send("still not avalable for shoppe")
        } else if (marketplace == "blibli") {
            res.send("still not avalable for blibli")
        } else if (marketplace == "lazada") {
            res.send("still not avalable for lazada")
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
    }else if (chatid === null || chatid === undefined) {
        response.code = 400
        response.message = "Parameter chatid is required "
    } else {
        if (marketplace == "tokopedia") {
            let hitAPI = await apiTokped.getReply(shop_id, page, limit, chatid) ;
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


//get chat
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
    }else if (chatid === null || chatid === undefined) {
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