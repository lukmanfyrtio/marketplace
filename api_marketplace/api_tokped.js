
const axios = require('axios')
let client_id = '7db04fe68ef243d492f45d9754dc4efd';
let client_secret = '4f4f08c861284c55acdeda6f33327d15';
let url = 'https://fs.tokopedia.net';
let fs_id = 15991



function encodeToBase64(client_id, client_secret) {
  var s = Buffer.from(`${client_id}:${client_secret}`).toString('base64')
  return s;
}

// function getToken() {
function getToken(envStore) { // env
  let urlGetToken = 'https://accounts.tokopedia.com/token';

  // let encodedString = encodeToBase64(client_id, client_secret);
  let encodedString = encodeToBase64((envStore && envStore.clientid ? envStore.clientid : client_id), (envStore && envStore.clientkey ? envStore.clientkey : client_secret)) // env
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


// async function hitApi(method = "empty", path = "empty", query = "empty", body = null) {
async function hitApi(method = "empty", path = "empty", query = "empty", body = null, envStore) { // env
  let responseData = {};
  responseData.marketplace = "tokopedia"
  responseData.timestamp = new Date().getTime();
  // let token = await getToken();
  let token = await getToken(envStore) // env
  console.log(token);
  headers = {
    Authorization: `Bearer ${token ? token : "token"}`
  }
  if (method.toUpperCase() == "post".toUpperCase()||method.toUpperCase() == "patch".toUpperCase()) { headers[`Content-Type`] = `application/json` }

  let config = {
    method: method,
    // url: url + path,
    url: (envStore && envStore.api_url ? envStore.api_url : url) + path, // env
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

  return hitApi("get", `/v2/fs/${fs_id}/order`, params);
}


//https://developer.tokopedia.com/openapi/guide/#/order/getallorder
function getOrders(from_date, to_date, page=1, per_page=50, shop_id, warehouse_id, status) {
  let params = {};
  //required
  params.fs_id = fs_id
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
  // if (order_id) params.order_id = order_id
  // params.fs_id = fs_id
  if (reason_code) body.reason_code = Number(reason_code)
  if (reason) body.reason = reason


  //optional
  if (shop_close_end_date) body.shop_close_end_date = shop_close_end_date
  if (shop_close_note) body.shop_close_note = shop_close_note
  if (empty_products) body.empty_products = empty_products

  return hitApi('post', `/v1/order/${order_id}/fs/${fs_id}/nack`, params,body);
}


//https://developer.tokopedia.com/openapi/guide/#/order/ack
//order id required
//fs_id  required
function orderAccept(order_id) {
  let params = {};
  if (order_id) params.order_id = order_id
  params.fs_id = fs_id
  return hitApi('post', `/v1/order/${order_id}/fs/${fs_id}/ack`);
}

//https://developer.tokopedia.com/openapi/guide/#/order/requestpickup
//fs_id required
function requestPickup(order_id, shop_id) {
  let body = {};
  //required
  if (order_id) body.order_id = Number(order_id)
  if (shop_id) body.shop_id = Number(shop_id)

  return hitApi('post', `/inventory/v1/fs/${fs_id}/pick-up`, null, body);
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

  return hitApi('post', `/v1/fs/${fs_id}/fulfillment_order`, params, {});
}

//https://developer.tokopedia.com/openapi/guide/#/order/updateorderstatus
// all param required
function updateOrderStatus(order_id, order_status, shipping_ref_num) {

  let body = {}
  if (order_status) body.order_status = order_status
  if (shipping_ref_num) body.shipping_ref_num = shipping_ref_num

  return hitApi('post', `/v1/order/${order_id}/fs/${fs_id}/status`, {}, body);

}


//https://developer.tokopedia.com/openapi/guide/#/category/getallcategory
//fs_id required
//keyword si optional
function getCategories(keyword) {
  let params = {};
  //optional
  if (keyword) params.keyword = keyword

  let path = `/inventory/v1/fs/${fs_id}/product/category`

  return hitApi('get', path, params, {});
}


// function getProduct(getBy, product_id, product_url, shop_id, page = 1, per_page = 50, sort = 1, sku) {
function getProduct(getBy, product_id, product_url, shop_id, page = 1, per_page = 50, sort = 1, sku, envStore) {
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
  // let path = `/inventory/v1/fs/${fs_id}/product/info`
  let path = `/inventory/v1/fs/${envStore && envStore.code_1 ? envStore.code_1 : fs_id}/product/info` // env

  // return hitApi('get', path, params, {});
  return hitApi('get', path, params, {}, envStore) // env
}




function getProductVariant(getBy, product_id, cat_id) {
  let path = `/inventory/v1/fs/${fs_id}/category/get_variant`;
  let params = {};
  //optional
  if (getBy == "product_id") {
    if (product_id) {
      params.product_id = product_id
      path = `/inventory/v1/fs/${fs_id}/product/variant/${product_id}`
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

  let path = `/inventory/v1/fs/${fs_id}/price/update`;

  return hitApi('post', path, params, body);
}

function updateState(shop_id, unlist, product_id) {
  let params = {};
  //required

  let body = {
    "item_list": [
        {
            "item_id": product_id,
            "unlist": unlist
        }
    ]
};

  if (shop_id) params.shop_id = shop_id

  let path = `/inventory/v1/fs/${fs_id}/price/update`;

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

  let path = `/inventory/v1/fs/${fs_id}/stock/update`;

  return hitApi('post', path, params, body);
}


function getShopInfo(shop_id, page = 0, per_page = 50) {
  let params = {};
  //optional
  if (shop_id) params.shop_id = shop_id
  if (page) params.page = page
  if (per_page) params.per_page = per_page

  let path = `/v1/shop/fs/${fs_id}/shop-info`;

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

  let path = `/v1/showcase/fs/${fs_id}/get`;

  return hitApi('get', path, params, {});
}


function getAllEtalase(shop_id) {
  let params = {};
  //required
  if (shop_id) params.shop_id = shop_id

  let path = `/inventory/v1/fs/${fs_id}/product/etalase`;

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
  let path = `/v3/products/fs/${fs_id}/create`;

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
  let path = `/v3/products/fs/${fs_id}/edit`;

  return hitApi('patch', path, params, body);
}


function updateProductState(state, shop_id, product_id) {
  let body = {};
  let params = {};
  let path = `/v1/products/fs/${fs_id}/inactive`;
  //required
  if (product_id) body.product_id = [Number(product_id)]
  if (shop_id) params.shop_id = shop_id
  if (state) path = `/v1/products/fs/${fs_id}/active`;


  return hitApi('post', path, params, body);
}


function deleteProduct(shop_id, product_id) {
  let body = {};
  let params = {};
  let path=`/v3/products/fs/${fs_id}/delete`;
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

  let path = `/v1/fs/${fs_id}/${shop_id}/saldo-history`;

  return hitApi('get', path, params, {});
}


function getChat(shop_id, page = 0, per_page = 50, filter = "all") {
  let params = {};
  //required
  if (shop_id) params.shop_id = shop_id
  params.page = page
  if (per_page) params.per_page = per_page
  if (filter) params.filter = filter


  let path = `/v1/chat/fs/${fs_id}/messages`;

  return hitApi('get', path, params, {});
}

function getReply(shop_id, page = 0, per_page = 50, msg_id) {
  let params = {};
  //required
  if (shop_id) params.shop_id = shop_id
  if (page) params.page = page
  if (per_page) params.per_page = per_page


  let path = `/v1/chat/fs/${fs_id}/messages/${msg_id}/replies`;

  return hitApi('get', path, params, {});
}

function postReply(shop_id, message, msg_id) {
  let body = {};
  //required
  if (shop_id) body.shop_id = Number(shop_id)
  if (message) body.message = message


  let path = `/v1/chat/fs/${fs_id}/messages/${msg_id}/reply`;

  return hitApi('post', path, {}, body);
}


function getStatusProduct(shop_id, upload_id) {
  let params = {};
  //required
  if (shop_id) params.shop_id = Number(shop_id)
  let path = `/v2/products/fs/${fs_id}/status/${upload_id}`;

  return hitApi('get', path, params, {});
}


function getResolutionTicket(shop_id,start_date ,end_date) {
  let params = {};
  //required
  if (shop_id) params.shop_id = Number(shop_id)
  if (start_date) params.start_date =start_date
  if (end_date) params.end_date =end_date
  let path = `/resolution/v1/fs/${fs_id}/ticket`;

  return hitApi('get', path, params, {});
}


function getProductDiscussion(shop_id,product_id ,page,per_page) {
  let params = {};
  //required
  if (shop_id) params.shop_id = Number(shop_id)
  if (product_id) params.product_id =product_id
  if (page) params.page =page
  if (per_page) params.per_page =per_page
  let path = `/v1/discussion/fs/${fs_id}/list`;

  return hitApi('get', path, params, {});
}

function updateShopInfo(shop_id,action ,start_date,end_date,close_note,close_now) {
  let params = {};
  
  //required
  if (shop_id) params.shop_id = Number(shop_id)
  if (action) params.action =action
  if (start_date) params.start_date =start_date;
  if (end_date) params.end_date =end_date
  if (close_note) params.close_note =close_note
  if (close_now) params.close_now =close_now
  let path = `/v2/shop/fs/${fs_id}/shop-status`;

  return hitApi('post', path, {}, params);
}




module.exports = {getProductDiscussion,getResolutionTicket,updateState,getAllSettlements, getSingleOrder, getOrders, orderAccept, orderReject, requestPickup, updateOrderStatus, getToken, getCategories, getProduct, updateProductPrice, updateProductStock, getProductVariant, getShopInfo, getAllEtalase, getAllShowCase, createProductV3, updateProductState,getStatusProduct ,getChat,getReply,postReply,updateProductV3,deleteProduct,updateShopInfo};
