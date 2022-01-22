const express = require('express')
const router = express.Router();
const apiShoppe = require('../api_marketplace/api_shoppe.js')
const apiTokped = require('../api_marketplace/api_tokped.js')
const apiBlibli = require('../api_marketplace/api_blibli.js')
const apiLazada = require('../api_marketplace/api_lazada.js')
const moment =require('moment')
let response = {
  code: 404,
  message: "Something Wrong"
}

function isValidDate(date){
return moment(date, 'YYYY-MM-DD', true).isValid();
}

function unixTms(date){
 return Math.floor(new Date(date).getTime()/1000.0)
}

router.get('/orders', async function (req, res) {
  const search = req.query;
  const shop_id = search.shop_id;
  const marketplace = search.marketplace;

  const start_time = search.start_time;
  const end_time = search.end_time;


  console.log(isValidDate(start_time));
  console.log(isValidDate(end_time));
  const page = search.page;
  const limit = search.limit;

  if (marketplace === null || marketplace === undefined || marketplace === '') {
    response.code = 400
    response.message = "Parameter marketplace is required"
  } else if (marketplace !== "lazada" && marketplace !== "shopee" && marketplace !== "" && marketplace !== "tokopedia" && marketplace !== "blibli") {
    response.code = 400
    response.message = "Parameter marketplace only available for blibli ,lazada, shopee, or tokopedia"
  } else if (shop_id === null || shop_id === undefined) {
    console.log(shop_id);
    response.code = 400
    response.message = "Parameter shop_id is required"
  } else if (start_time === null || start_time === undefined) {
    response.code = 400
    response.message = "Parameter start_time is required"
  }else if (!isValidDate(start_time)) {
    response.code = 400
    response.message = "Parameter start_time format is YYYY-MM-DD"
  } else if (end_time === null || end_time === undefined) {
    response.code = 400
    response.message = "Parameter end_time is required"
  } else if (!isValidDate(end_time)) {
    response.code = 400
    response.message = "Parameter end_time format is YYYY-MM-DD"
  }else {
    if (marketplace == "tokopedia") {
      let hitAPI = await apiTokped.getOrders(unixTms(start_time),unixTms(end_time), page, limit, shop_id)
      res.status(hitAPI.code).send(hitAPI);
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

router.get('/order', async function (req, res) {
  const search = req.query;
  const shop_id = search.shop_id;
  const marketplace = search.marketplace;

  const orderid = search.orderid;
  const invoice_num = search.invoice_num;


  if (marketplace === null || marketplace === undefined || marketplace === '') {
    response.code = 400
    response.message = "Parameter marketplace is required"
  } else if (marketplace !== "lazada" && marketplace !== "shopee" && marketplace !== "" && marketplace !== "tokopedia" && marketplace !== "blibli") {
    response.code = 400
    response.message = "Parameter marketplace only available for blibli ,lazada, shopee, or tokopedia"
  } else if (shop_id === null || shop_id === undefined) {
    console.log(shop_id);
    response.code = 400
    response.message = "Parameter shop_id is required"
  } else if (orderid === null || orderid === undefined) {
    response.code = 400
    response.message = "Parameter orderid is required"
  }else {
    if (marketplace == "tokopedia") {
      let hitAPI = await apiTokped.getSingleOrder(orderid, invoice_num)
      res.status(hitAPI.code).send(hitAPI);
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
