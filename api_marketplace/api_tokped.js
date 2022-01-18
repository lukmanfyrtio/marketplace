
const axios = require('axios')
let client_id = '7db04fe68ef243d492f45d9754dc4efd';
let client_secret = '4f4f08c861284c55acdeda6f33327d15';
let url = 'https://fs.tokopedia.net';



function encodeToBase64(client_id, client_secret) {
  var b = new Buffer(`${client_id}:${client_secret}`);
  var s = b.toString('base64');
  return s;
}

function getToken() {
  let urlGetToken = 'https://accounts.tokopedia.com/token';

  let encodedString = encodeToBase64(client_id, client_secret);
  return new Promise(function (resolve, reject) {
    axios({
      method: 'post',
      url: urlGetToken,
      params: {
        grant_type: 'client_credentials'
      },
      headers: {
        'Authorization': `Basic ${encodedString}`,
        'Content-Length': '0',
        'User-Agent': 'PostmanRuntime/7.17.1'
      }

    }).then(function (response) {
      console.log(response);
      resolve(response.access_token);

    }).catch((e) => {
      console.log(response);
      resolve(e.response);
    });
  });
}


async function hitApi(method = "empty", path = "empty", query = "empty", body = {}) {
  let response = {};
  let token = await getToken();
  headers = {
    Authorization: `Bearer ${token ? token : "token"}`
  }
  if (method.toUpperCase() == "post".toUpperCase()) { headers[Content-Type] = `application/json` }
  return new Promise(function (resolve, reject) {
    axios({
      method: method,
      url: url + path,
      params: query,
      headers: headers,
      body: JSON.stringify(body)

    }).then(function (response) {
      resolve(response);

    }).catch((e) => {
      response.code = e.response.status;
      if (e.response.status == 401) {
        response.message = "401 Authorization Required"
      }
      resolve(response);
    });
  });
}

//https://developer.tokopedia.com/openapi/guide/#/order/getsingleorder
function getSingleOrder(fs_id, order_id, invoice_num) {
  let params = {};
  //required
  if (fs_id) params.fs_id = fs_id
  if (order_id) params.order_id = order_id

  //optional
  if (invoice_num) params.invoice_num = invoice_num

  return hitApi("get", `/v2/fs/${fs_id}/order`, params);
}

function getAllOrders(fs_id, from_date, to_date, page, per_page, shop_id, warehouse_id, status) {
  let params = {};
  if (fs_id) params.fs_id = fs_id
  if (from_date) params.from_date = from_date
  if (to_date) params.to_date = to_date

  if (page) params.page = page
  if (per_page) params.per_page = per_page
  if (shop_id) params.shop_id = shop_id
  if (warehouse_id) params.warehouse_id = warehouse_id
  if (status) params.status = status

  return hitApi("get", `/v2/fs/${fs_id}/order`, params);
}
//https://developer.tokopedia.com/openapi/guide/#/order/getallorder
function getOrders(fs_id, from_date, to_date, page, per_page, shop_id, warehouse_id, status) {
  let params = {};
  //required
  if (fs_id) params.fs_id = fs_id
  if (from_date) params.from_date = from_date
  if (to_date) params.to_date = to_date
  if (page) params.page = page
  if (per_page) params.per_page = per_page

  //optional
  if (shop_id) params.shop_id = shop_id
  if (warehouse_id) params.warehouse_id = warehouse_id
  if (status) params.status = status


  return hitApi('get', '/v2/order/list', params);
}

// https://developer.tokopedia.com/openapi/guide/#/order/nack?id=order-reject-reason
function orderReject(order_id, fs_id, reason_code, reason, shop_close_end_date, shop_close_note, empty_products) {
  let params = {};
  let body = {};
  //required
  if (order_id) params.order_id = order_id
  if (fs_id) params.fs_id = fs_id
  if (reason_code) body.reason_code = reason_code
  if (reason) body.reason = reason


  //optional
  if (shop_close_end_date) body.shop_close_end_date = shop_close_end_date
  if (shop_close_note) body.shop_close_note = shop_close_note
  if (empty_products) body.empty_products = empty_products

  return hitApi('post', `/v1/order/${order_id}/fs/${fs_id}/nack`, params);
}


//https://developer.tokopedia.com/openapi/guide/#/order/ack
//order id required
//fs_id  required
function orderAccept(order_id, fs_id) {
  return hitApi('post', `/v1/order/${order_id}/fs/${fs_id}/ack`);
}

//https://developer.tokopedia.com/openapi/guide/#/order/requestpickup
//fs_id required
function requestPickup(order_id, fs_id, shop_id) {
  let body = {};
  //required
  if (order_id) body.order_id = order_id
  if (shop_id) body.shop_id = shop_id

  return hitApi('post', `/inventory/v1/fs/${fs_id}/pick-up`, {}, body);
}


//https://developer.tokopedia.com/openapi/guide/#/order/cobcod
//fs_id required
function requestPickup(fs_id, order_id,shop_id,warehouse_id,per_page,first_order_id,next_order_id) {
  let params = {};
  //optional
  if (order_id) params.order_id = order_id
  if (shop_id) params.shop_id = shop_id
  if (warehouse_id) params.warehouse_id = warehouse_id

  if (per_page) params.per_page = per_page
  if (first_order_id) params.first_order_id = first_order_id
  if (next_order_id) params.next_order_id = next_order_id

  return hitApi('post', `/v1/fs/${fs_id}/fulfillment_order`, params, {});
}

//https://developer.tokopedia.com/openapi/guide/#/order/updateorderstatus
// all param required
function updateOrderStatus(fs_id, order_id,order_status,shipping_ref_num){
  
  let body={}
  if (order_status) body.order_status = order_status
  if (shipping_ref_num) body.shipping_ref_num = shipping_ref_num

  return hitApi('post', `/v1/order/${order_id}/fs/${fs_id}/status`, {},body);

}
module.exports = { getSingleOrder,getAllOrders,getOrders,orderAccept,orderReject,requestPickup,updateOrderStatus,getToken };