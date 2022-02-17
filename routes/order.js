const express = require('express')
const router = express.Router();
const apiShoppe = require('../api_marketplace/api_shoppe.js')
const apiTokped = require('../api_marketplace/api_tokped.js')
const apiBlibli = require('../api_marketplace/api_blibli.js')
const apiLazada = require('../api_marketplace/api_lazada.js')
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
  } else if (!isValidDate(start_time)) {
    response.code = 400
    response.message = "Parameter start_time format is YYYY-MM-DD"
  } else if (end_time === null || end_time === undefined) {
    response.code = 400
    response.message = "Parameter end_time is required"
  } else if (!isValidDate(end_time)) {
    response.code = 400
    response.message = "Parameter end_time format is YYYY-MM-DD"
  } else {
    if (marketplace == "tokopedia") {
      let hitAPI = await apiTokped.getOrders(req.envStore,unixTms(start_time), unixTms(end_time), page, limit, shop_id)
      res.status(hitAPI.code).send(hitAPI);
      return;
    } else if (marketplace == "shopee") {
      let hitAPI = await apiShoppe.getOrders(shop_id, unixTms(start_time), unixTms(end_time), page,limit,null,null,req.envStore)
      res.status(hitAPI.code).send(hitAPI);
      return;
    } else if (marketplace == "blibli") {
      let hitAPI = await apiBlibli.getOrders(req.envStore,shop_id, unixTms(start_time), unixTms(end_time), page, limit);
      res.status(hitAPI.code).send(hitAPI);
      return;
    } else if (marketplace == "lazada") {
      let hitAPI = await apiLazada.getOrders(req.envStore,page, limit, start_time, end_time)
      res.status(hitAPI.code).send(hitAPI);
      return;
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
  } else {
    if (marketplace == "tokopedia") {
      let hitAPI = await apiTokped.getSingleOrder(req.envStore,orderid, invoice_num)
      res.status(hitAPI.code).send(hitAPI);
      return;
    } else if (marketplace == "shopee") {
      let hitAPI = await apiShoppe.getSingleOrder(shop_id, [orderid],null,req.envStore)
      res.status(hitAPI.code).send(hitAPI);
      return;
    } else if (marketplace == "blibli") {
      let pid = orderid.split("-");
      let oin = pid[1] ? pid[1] : 0;
      let hitAPI = await apiBlibli.getSingleOrder(req.envStore,pid[0], oin);
      res.send(hitAPI);
      return;
    } else if (marketplace == "lazada") {
      let hitAPI = await apiLazada.getSingleOrder(req.envStore,orderid)
      res.status(hitAPI.code).send(hitAPI);
      return;
    }
  }
  res.status(response.code).send(response)
});


router.post('/process/order', async function (req, res) {
  const search = req.query;
  const shop_id = search.shop_id;
  const marketplace = search.marketplace;
  const action = search.action;
  const body = req.body;
  const orders = body.orders;


  console.log(orders);

  if (marketplace === null || marketplace === undefined || marketplace === '') {
    response.code = 400
    response.message = "Parameter marketplace is required"
  } else if (marketplace !== "lazada" && marketplace !== "shopee" && marketplace !== "" && marketplace !== "tokopedia" && marketplace !== "blibli") {
    response.code = 400
    response.message = "Parameter marketplace only available for blibli ,lazada, shopee, or tokopedia"
  } else if (action !== "accept" && action !== "reject" && action !== "acceptCancellation" && action !== "rejectCancellation" && action !== "blibli") {
    response.code = 400
    response.message = "Parameter action only available for accept ,reject, acceptCancellation, or rejectCancellation"
  } else if (shop_id === null || shop_id === undefined) {
    console.log(shop_id);
    response.code = 400
    response.message = "Parameter shop_id is required"
  } else if (orders === null || orders === undefined) {
    response.code = 400
    response.message = "Field order is required"
  } else if (!Array.isArray(orders)) {
    response.code = 400
    response.message = "Field orders is must be array object"
  } else {

    response.message = "Your request has been processed successfully"
    
    if (marketplace == "tokopedia") {
      let hitAPI = { code: 400 };
      if (action == "accept") {
        var orderIds = []
        for await (const element of orders) {
          if (element.order_id == null || element.order_id == undefined) {
            response.code = 400
            response.message = "Field order_id is required "
            res.status(response.code).send(response);
            return;
          } else {
            orderIds.push(element.order_id);
            hitAPI = await apiTokped.orderAccept(req.envStore,element.order_id)
            if (hitAPI.code != 200) {
              res.status(hitAPI.code).send(hitAPI);
              return;
            } else {
              hitAPI.code = 200
            }
          }
        };
        console.log("wait until");
        if (hitAPI.code == 200) {
          console.log(hitAPI.code == 200);
          res.status(response.code).send(response)
          return;
        }
      } else if (action != "accept" && action != "reject") {
        response.code = 400
        response.message = "Field action is only accept or reject for lazada marketplace"
      } else {
        for await (const element of orders) {
          if (element.order_id == null || element.order_id == undefined) {
            response.code = 400
            response.message = "Field order_id is required "
            res.status(response.code).send(response)
            return;
          } else if (element.cancel_reason == null || element.cancel_reason == undefined) {
            response.code = 400
            response.message = "Field cancel_reason is required ";
            res.status(response.code).send(response)
            return;
          } else {
            hitAPI = await apiTokped.orderReject(req.envStore,element.order_id, "5", element.cancel_reason)
            if (hitAPI.code != 200) {
              res.status(hitAPI.code).send(hitAPI);
              return;
            } else {
              hitAPI.code = 200
            }
          }
        };
        if (hitAPI.code === 200) {
          res.status(response.code).send(response)
        }
        return;
      }
    } else if (marketplace == "shopee") {
      let hitAPI = { code: 400 };
      if (action != "" && action != "rejectCancellation" && action != "reject") {
        response.code = 400
        response.message = "Field action is only acceptCancellation,rejectCancellation or reject for lazada marketplace"
      } else if (action == 'acceptCancellation' || action == 'rejectCancellation') {
        for await (const element of orders) {
          if (element.order_id == undefined || element.order_id == null){
            response.code = 400
            response.message = "Field order_id is required "
            res.status(response.code).send(response)
            return;
          } else {
            hitAPI = await apiShoppe.buyerCancel(shop_id, element.order_id, action == 'acceptCancellation' ? 'ACCEPT' : 'REJECT')
            if (hitAPI.code !== 200) {
              res.status(hitAPI.code).send(hitAPI);
              return;
            } else {
              hitAPI.code === 200
            }
          }
        };
        if (hitAPI.code === 200) {
          res.status(response.code).send(response)
        }
        return;
      } else if (action == "reject") {
        for await (const element of orders) {
          if (element.order_id == undefined || element.order_id == null) {
            response.code = 400
            response.message = "Field order_id is required "
            res.status(response.code).send(response)
            return;
          } else if (element.cancel_reason == undefined || element.cancel_reason == null) {
            response.code = 400
            response.message = "Field cancel_reason is required ";
            res.status(response.code).send(response)
            return;
          } else {
            hitAPI = await apiShoppe.cancelOrder(shop_id, element.order_id, cancel_reason)
            if (hitAPI.code !== 200) {
              res.status(hitAPI.code).send(hitAPI);
              return;
            } else {
              hitAPI.code === 200
            }
          }
        };
        if (hitAPI.code === 200) {
          res.status(response.code).send(response)
        }
      }
    } else if (marketplace == "blibli") {
      var orderIds = []
      if (action == "accept") {
        for await (const element of orders) {
          if (element.order_id == undefined || element.order_id == null) {
            response.code = 400
            response.message = "Field order_id is required "
          } else if (action != "accept") {
            response.code = 400
            response.message = "Field action is only accept for blibli marketplace"
          } else {
            orderIds.push(element.order_id);
          }
        };
        let hitAPI = await apiBlibli.acceptOrder(req.envStore,orderIds, shop_id)
        res.status(hitAPI.code).send(hitAPI);
        return;
      }
    } else if (marketplace == "lazada") {
      let hitAPI = { code: 400 };
      if (action == "accept") {
        var orderIds = []
        let delivery_type;
        let shipping_provider;
        for await (const element of orders) {
          if (element.order_id == undefined || element.order_id == null) {
            response.code = 400
            response.message = "Field order_id is required "
          } else if (element.delivery_type == undefined || element.delivery_type == null) {
            response.code = 400
            response.message = "Field delivery_type is required ";
          } else if (element.shipping_provider == undefined || element.shipping_provider == null) {
            response.code = 400
            response.message = "Field shipping_provider is required "
          } else {
            hitAPI = await apiLazada.acceptOrder(req.envStore,`${element.order_id}`, element.shipping_provider, element.delivery_type);
            if (hitAPI.codeStatus != '0') {
              res.status(hitAPI.code).send(hitAPI);
              return;
            } else {
              hitAPI.code === 200
            }
          }
        };
        if (hitAPI.code === 200) {
          res.status(response.code).send(response)
        }
        return;
      } else if (action != "accept" && action != "reject") {
        response.code = 400
        response.message = "Field action is only accept or reject for lazada marketplace"
      } else {
        for await (const element of orders) {
          if (element.order_id == undefined || element.order_id == null) {
            response.code = 400
            response.message = "Field order_id is required "
            res.status(response.code).send(response)
            return;
          } else if (element.cancel_reason == undefined || element.cancel_reason == null) {
            response.code = 400
            response.message = "Field cancel_reason is required ";
            res.status(response.code).send(response)
            return;
          } else {
            hitAPI = await apiLazada.cancelOrder(req.envStore,element.cancel_reason, element.order_id)
            if (hitAPI.codeStatus != '0') {
              res.status(hitAPI.code).send(hitAPI);
              return;
            } else {
              hitAPI.code === 200
            }
          }
        };

        if (hitAPI.code === 200) {
          res.status(response.code).send(response)
        }
        return;
      }
      return;
    }
  }
  // res.status(response.code).send(response)
});
module.exports = router;
