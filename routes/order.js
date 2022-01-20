const express = require('express')
const router = express.Router();
const apiShoppe = require('../api_marketplace/api_shoppe.js')
const apiTokped = require('../api_marketplace/api_tokped.js')
const apiBlibli = require('../api_marketplace/api_blibli.js')
const apiLazada = require('../api_marketplace/api_lazada.js')
let response = {
  status: 404,
  data: {
    code: 404,
    message: "Something Wrong"
  }
}

router.get('/order/:orderId', async function (req, res) {
  const search = req.query;
  if (search.marketplace == "shoppe") { response = await apiShoppe.getSingleOrder(req.params.orderId); }
  if (search.marketplace == "tokopedia") { response = await apiTokped.getSingleOrder(req.params.orderId); }
  if (search.marketplace == "blibli") { response = await apiBlibli.getSingleOrder(10001, 25000092160, 25000109944, "YourCompany") }
  if (search.marketplace == "lazada") { response = await apiLazada.getSingleOrder(req.params.orderId) }
  // res.status(response.code).send(JSON.stringify(response));
});

router.get('/list', async function (req, res) {
  const search = req.query;
  if (search.marketplace = "shoppe") response = await getSingleOrder("21");

  res.status(response.code).send(JSON.stringify(response));
});

module.exports = router;
