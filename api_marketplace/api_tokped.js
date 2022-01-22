
const axios = require('axios')
let client_id = '7db04fe68ef243d492f45d9754dc4efd';
let client_secret = '4f4f08c861284c55acdeda6f33327d15';
let url = 'https://fs.tokopedia.net';
let apiId = 15991



function encodeToBase64(client_id, client_secret) {
  var s = Buffer.from(`${client_id}:${client_secret}`).toString('base64')
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
      console.log("getToken()=> " + response.data.access_token);
      resolve(response.data.access_token);

    }).catch((e) => {
      resolve(e.response);
    });
  });
}


async function hitApi(method = "empty", path = "empty", query = "empty", body = null) {
  let responseData = {};
  responseData.marketplace = "tokopedia"
  responseData.timestamp = new Date().getTime();
  let token = await getToken();
  console.log(token);
  headers = {
    Authorization: `Bearer ${token ? token : "token"}`
  }
  if (method.toUpperCase() == "post".toUpperCase()||method.toUpperCase() == "patch".toUpperCase()) { headers[`Content-Type`] = `application/json` }

  let config = {
    method: method,
    url: url + path,
    params: query,
    headers: headers,
  }

  if(body&&Object.keys(body).length !== 0){
    config.data=JSON.stringify(body)
  }
  return new Promise(function (resolve, reject) {
    axios(
      config
    ).then(function (response) {
      console.log(response);
      responseData.code = response.status;
      responseData.message = response.data.header.messages;
      responseData.data = response.data.data
      resolve(responseData);
    }).catch((e) => {
      console.log(e.response);
      responseData.code = e.response.status;
      if (e.response.status == 401) {
        responseData.message = "401 Authorization Required"
      } else {
        if(e.response.data.header!==undefined&&e.response.data.header.reason!==undefined){
          responseData.message = e.response.data.header.reason ;
        }else{
          responseData.message=e.response.data
        }
      }
      resolve(responseData);
    });
  });
}

//https://developer.tokopedia.com/openapi/guide/#/order/getsingleorder
function getSingleOrder(order_id, invoice_num) {
  let params = {};
  //required
  if (order_id) params.order_id = order_id

  //optional
  if (invoice_num) params.invoice_num = invoice_num

  return hitApi("get", `/v2/fs/${apiId}/order`, params);
}

function getAllOrders(from_date, to_date, page=1, per_page, shop_id, warehouse_id, status) {
  let params = {};
  if (from_date) params.from_date = from_date
  if (to_date) params.to_date = to_date

  if (page) params.page = page
  if (per_page) params.per_page = per_page
  if (shop_id) params.shop_id = shop_id
  if (warehouse_id) params.warehouse_id = warehouse_id
  if (status) params.status = status

  return hitApi("get", `/v2/fs/${apiId}/order`, params);
}
//https://developer.tokopedia.com/openapi/guide/#/order/getallorder
function getOrders(from_date, to_date, page=1, per_page=50, shop_id, warehouse_id, status) {
  let params = {};
  //required
  params.fs_id = apiId
  if (from_date) params.from_date = from_date
  if (to_date) params.to_date = to_date
  params.page = page
  if (per_page) params.per_page = per_page

  //optional
  if (shop_id) params.shop_id = shop_id
  if (warehouse_id) params.warehouse_id = warehouse_id
  if (status) params.status = status


  return hitApi('get', '/v2/order/list', params);
}

// https://developer.tokopedia.com/openapi/guide/#/order/nack?id=order-reject-reason
function orderReject(order_id, reason_code, reason, shop_close_end_date, shop_close_note, empty_products) {
  let params = {};
  let body = {};
  //required
  if (order_id) params.order_id = order_id
  if (fs_id) params.fs_id = apiId
  if (reason_code) body.reason_code = reason_code
  if (reason) body.reason = reason


  //optional
  if (shop_close_end_date) body.shop_close_end_date = shop_close_end_date
  if (shop_close_note) body.shop_close_note = shop_close_note
  if (empty_products) body.empty_products = empty_products

  return hitApi('post', `/v1/order/${order_id}/fs/${apiId}/nack`, params);
}


//https://developer.tokopedia.com/openapi/guide/#/order/ack
//order id required
//fs_id  required
function orderAccept(order_id) {
  return hitApi('post', `/v1/order/${order_id}/fs/${apiId}/ack`);
}

//https://developer.tokopedia.com/openapi/guide/#/order/requestpickup
//fs_id required
function requestPickup(order_id, shop_id) {
  let body = {};
  //required
  if (order_id) body.order_id = order_id
  if (shop_id) body.shop_id = shop_id

  return hitApi('post', `/inventory/v1/fs/${apiId}/pick-up`, {}, body);
}


//https://developer.tokopedia.com/openapi/guide/#/order/cobcod
//fs_id required
function requestCOBCOD(order_id, shop_id, warehouse_id, per_page, first_order_id, next_order_id) {
  let params = {};
  //optional
  if (order_id) params.order_id = order_id
  if (shop_id) params.shop_id = shop_id
  if (warehouse_id) params.warehouse_id = warehouse_id

  if (per_page) params.per_page = per_page
  if (first_order_id) params.first_order_id = first_order_id
  if (next_order_id) params.next_order_id = next_order_id

  return hitApi('post', `/v1/fs/${apiId}/fulfillment_order`, params, {});
}

//https://developer.tokopedia.com/openapi/guide/#/order/updateorderstatus
// all param required
function updateOrderStatus(order_id, order_status, shipping_ref_num) {

  let body = {}
  if (order_status) body.order_status = order_status
  if (shipping_ref_num) body.shipping_ref_num = shipping_ref_num

  return hitApi('post', `/v1/order/${order_id}/fs/${apiId}/status`, {}, body);

}


//https://developer.tokopedia.com/openapi/guide/#/category/getallcategory
//fs_id required
//keyword si optional
function getCategories(keyword) {
  let params = {};
  //optional
  if (keyword) params.keyword = keyword

  let path = `/inventory/v1/fs/${apiId}/product/category`

  return hitApi('get', path, params, {});
}


function getProduct(getBy, product_id, product_url, shop_id, page = 1, per_page = 50, sort = 1, sku) {
  let params = {};
  //optional
  if (getBy == "pid") {
    if (product_id) params.product_id = product_id
    if (product_url) params.product_url = product_url
  } else if (getBy == "sku") {
    if (sku) params.sku = sku
  } else {
    if (shop_id) params.shop_id = shop_id
    if (page !== null) params.page = page
    if (per_page !== null) params.per_page = per_page
    if (sort) params.sort = sort
  }
  let path = `/inventory/v1/fs/${apiId}/product/info`

  return hitApi('get', path, params, {});
}



function getProductVariant(getBy, product_id, cat_id) {
  let params = {};
  //optional
  if (getBy == "product_id") {
    if (product_id) params.product_id = product_id
  } else if (getBy == "cat_id") {
    if (cat_id) params.cat_id = cat_id
  }
  let path = `/inventory/v1/fs/${apiId}/category/get_variant?cat_id=:cat_id`;

  return hitApi('get', path, params, {});
}

function getProductVariant(getBy, product_id, cat_id) {
  let path = `/inventory/v1/fs/${apiId}/category/get_variant`;
  let params = {};
  //optional
  if (getBy == "product_id") {
    if (product_id) {
      params.product_id = product_id
      path = `/inventory/v1/fs/${apiId}/product/variant/${product_id}`
    }
  } else if (getBy == "cat_id") {
    if (cat_id) params.cat_id = cat_id
  }


  return hitApi('get', path, params, {});
}


function updateProductPrice(shop_id, new_price, product_id) {
  let params = {};
  let bodyObj = {};
  //required
  console.log("sa");
  console.log(product_id);
  if (product_id) bodyObj.product_id = product_id
  if (new_price) bodyObj.new_price = new_price

  let body = [
    {
      "product_id": Number(product_id),
      "new_price": Number(new_price)
    }
  ];

  console.log(body);
  if (shop_id) params.shop_id = shop_id

  let path = `/inventory/v1/fs/${apiId}/price/update`;

  return hitApi('post', path, params, body);
}

function deleteProduct(shop_id, product_id) {
  let body = {};
  let params = {};
  //required
  if (product_id) {
    body.product_id = product_id
  }
  if (shop_id) params.new_price = shop_id

  let path = `/v3/products/fs/:f/delete`;

  return hitApi('post', path, params, JSON.parse(body));
}

function updateProductStock(shop_id, new_stock, product_id) {
  let body = [];
  let params = {};
  let bodyObj={};
  //required
  if (product_id) bodyObj.product_id = Number(product_id)
  if (new_stock) bodyObj.new_stock = Number(new_stock)
  if (Object.keys(bodyObj).length !== 0) {
    body.push(bodyObj)
  }
  console.log(body);
  console.log(body);
  if (shop_id) params.shop_id = shop_id

  let path = `/inventory/v1/fs/${apiId}/stock/update`;

  return hitApi('post', path, params, body);
}


function getShopInfo(shop_id, page = 0, per_page = 50) {
  let params = {};
  //optional
  if (shop_id) params.shop_id = shop_id
  if (page) params.page = page
  if (per_page) params.per_page = per_page

  let path = `/v1/shop/fs/${apiId}/shop-info`;

  return hitApi('get', path, params, {});
}




function getAllShowCase(shop_id, page = 0, per_page = 50, hide_zero, display) {
  let params = {};
  //required
  if (shop_id) params.shop_id = shop_id

  //optional
  if (page) params.page = page
  if (per_page) params.per_page = per_page
  if (hide_zero) params.hide_zero = hide_zero
  if (display) params.display = display

  let path = `/v1/showcase/fs/${apiId}/get`;

  return hitApi('get', path, params, {});
}


function getAllEtalase(shop_id) {
  let params = {};
  //required
  if (shop_id) params.shop_id = shop_id

  let path = `/inventory/v1/fs/${apiId}/product/etalase`;

  return hitApi('get', path, params, {});
}


function createProductV3(shop_id, name, category_id, price_currency, price, status, min_order, weight, weight_unit, condition
  , dimension, custom_product_logistics, annotations, etalase, description, is_must_insurance, is_free_return, sku, stock, wholesale, preorder
  , pictures, videos, variant) {
  let body = {};
  let params = {};
  let productsObj = {};
  //required
  if (name) productsObj.name = name
  if (category_id) productsObj.category_id = category_id
  if (price_currency) productsObj.price_currency = price_currency
  if (price) productsObj.price = price
  if (status) productsObj.status = status
  if (min_order) productsObj.min_order = min_order
  if (weight) productsObj.weight = weight
  if (weight_unit) productsObj.weight_unit = weight_unit
  if (condition) productsObj.condition = condition

  //optional
  if (dimension) productsObj.dimension = dimension
  if (custom_product_logistics) productsObj.custom_product_logistics = custom_product_logistics
  if (annotations) productsObj.annotations = annotations

  if (etalase) productsObj.etalase = etalase
  if (description) productsObj.description = description

  if (is_must_insurance) productsObj.is_must_insurance = is_must_insurance
  if (is_free_return) productsObj.is_free_return = is_free_return
  if (sku) productsObj.sku = sku.toString()
  if (stock) productsObj.stock = stock


  if (wholesale) productsObj.wholesale = wholesale
  if (preorder) productsObj.preorder = preorder
  if (pictures) productsObj.pictures = pictures
  if (videos) productsObj.videos = videos
  if (variant) productsObj.variant = variant


  let products = [productsObj];

  body.products = products

  if (shop_id) params.shop_id = shop_id
  let path = `/v3/products/fs/${apiId}/create`;

  return hitApi('post', path, params, body);
}


function updateProductV3(shop_id, name, id,category_id, price_currency, price, status, min_order, weight, weight_unit, condition
  , dimension, custom_product_logistics, annotations, etalase, description, is_must_insurance, is_free_return, sku, stock, wholesale, preorder
  , pictures, videos, variant) {
  let body = {};
  let params = {};
  let productsObj = {};
  //required
  if (name) productsObj.id = id
  if (name) productsObj.name = name
  if (sku) productsObj.sku = sku.toString()
  if (category_id) productsObj.category_id = category_id
  if (price_currency) productsObj.price_currency = price_currency
  if (price) productsObj.price = price
  if (status) productsObj.status = status
  if (min_order) productsObj.min_order = min_order
  if (weight) productsObj.weight = weight
  if (weight_unit) productsObj.weight_unit = weight_unit
  if (condition) productsObj.condition = condition

  //optional
  if (dimension) productsObj.dimension = dimension
  if (custom_product_logistics) productsObj.custom_product_logistics = custom_product_logistics
  if (annotations) productsObj.annotations = annotations

  if (etalase) productsObj.etalase = etalase
  if (description) productsObj.description = description

  if (is_must_insurance) productsObj.is_must_insurance = is_must_insurance
  if (is_free_return) productsObj.is_free_return = is_free_return
  if (stock) productsObj.stock = stock


  if (wholesale) productsObj.wholesale = wholesale
  if (preorder) productsObj.preorder = preorder
  if (pictures) productsObj.pictures = pictures
  if (videos) productsObj.videos = videos
  if (variant) productsObj.variant = variant


  let products = [productsObj];

  body.products = products

  if (shop_id) params.shop_id = shop_id
  let path = `/v3/products/fs/${apiId}/edit`;

  return hitApi('patch', path, params, body);
}


function updateProductState(state, shop_id, product_id) {
  let body = {};
  let params = {};
  let path = `/v1/products/fs/${apiId}/inactive`;
  //required
  if (product_id) body.product_id = [Number(product_id)]
  if (shop_id) params.shop_id = shop_id
  if (state) path = `/v1/products/fs/${apiId}/active`;


  return hitApi('post', path, params, body);
}


function deleteProduct(shop_id, product_id) {
  let body = {};
  let params = {};
  let path=`/v3/products/fs/${apiId}/delete`;
  //required
  if (product_id) body.product_id = [Number(product_id)]
  if (shop_id) params.shop_id = shop_id


  return hitApi('post', path, params, body);
}



function getAllSettlements(shop_id, page = 0, per_page = 50, from_date, to_date) {
  let params = {};
  //required
  params.page = page
  if (per_page) params.per_page = per_page
  if (from_date) params.from_date = from_date
  if (to_date) params.to_date = to_date

  let path = `/v1/fs/${apiId}/${shop_id}/saldo-history`;

  return hitApi('get', path, params, {});
}


function getChat(shop_id, page = 0, per_page = 50, filter = "all") {
  let params = {};
  //required
  if (shop_id) params.shop_id = shop_id
  params.page = page
  if (per_page) params.per_page = per_page
  if (filter) params.filter = filter


  let path = `/v1/chat/fs/${apiId}/messages`;

  return hitApi('get', path, params, {});
}

function getReply(shop_id, page = 0, per_page = 50, msg_id) {
  let params = {};
  //required
  if (shop_id) params.shop_id = shop_id
  if (page) params.page = page
  if (per_page) params.per_page = per_page


  let path = `/v1/chat/fs/${apiId}/messages/${msg_id}/replies`;

  return hitApi('get', path, params, {});
}

function postReply(shop_id, message, msg_id) {
  let body = {};
  //required
  if (shop_id) body.shop_id = Number(shop_id)
  if (message) body.message = message


  let path = `/v1/chat/fs/${apiId}/messages/${msg_id}/reply`;

  return hitApi('post', path, {}, body);
}


function getStatusProduct(shop_id, upload_id) {
  let params = {};
  //required
  if (shop_id) params.shop_id = Number(shop_id)
  let path = `/v2/products/fs/${apiId}/status/${upload_id}`;

  return hitApi('get', path, params, {});
}




module.exports = { getSingleOrder, getAllOrders, getOrders, orderAccept, orderReject, requestPickup, updateOrderStatus, getToken, getCategories, getProduct, updateProductPrice, updateProductStock, getProductVariant, getShopInfo, getAllEtalase, getAllShowCase, createProductV3, updateProductState,getStatusProduct ,getChat,getReply,postReply,updateProductV3,deleteProduct};