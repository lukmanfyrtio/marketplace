
const axios = require('axios')
const crypto = require('crypto')


let url = `https://partner.shopeemobile.com`;
let partnerKey = 'f9c608fba08254482f2ab16a1fbbf39b7b409dbccdad594f798c9707ca6aab0e';
let partner_id = 843372;
let timest;
let redirectUrl = "http://localhost:81";


function hitApi(method = "empty", path = "empty", query = "empty", body = "empty") {
  let response = {};
  return new Promise(function (resolve, reject) {
    axios({
      method: method,
      url: url + path,
      params: query,

    }).then(function (response) {
      resolve(response);

    }).catch((e) => {
      response.code = e.response.status;
      if (e.response.status == 403) {
        response.message = e.response.data.message
      }
      resolve(response);
    });
  });
}

async function getToken(partnerKey, partner_id, timest, shopId, accountId) {
  let path = '/api/v2/auth/token/get'
  let code = getCode('/api/v2/shop/auth_partner', timest, partner_id, redirectUrl);

  let param = commonParam(path, partner_id, timest, false, true, false, false);

  let body = {
    code: code.code,
    partner_id: partner_id
  }

  if (shopId) {
    body.shop_id = shopId
  } else {
    body.main_account_id = accountId
  }
  let res = hitApi(
    'post', //method
    path, //path 
    param,//query
    body
  )

  return res.access_token ? res.access_token : "empty";
}

async function getCode(path, times, partner_id, redirect) {
  let params = commonParam(path, partner_id, times, redirect, true, false, false)

  return await hitApi(
    'get', //method
    path, //path 
    params,//query
  );
}

function sign(pKey, pid, path, time) {
  let baseString = pid + path + time;
  var hmac = crypto.createHmac('sha256', pKey);
  //passing the data to be hashed
  let data = hmac.update(baseString);
  //Creating the hmac in the required format
  return data.digest('hex');
}


//https://open.shopee.com/documents?module=94&type=1&id=557&version=2
function getSingleOrder(shop_id, order_sn_list, response_optional_fields) {
  timest = new Date().getTime() / 1000;
  //path 
  let path = "/api/v2/order/get_order_detail"
  //get token 
  let token = getToken(partnerKey, partner_id, timest);
  //common param
  let param = commonParam(path, true, timest, false, true, shop_id, token);

  if (order_sn_list) param.order_sn_list = order_sn_list
  if (response_optional_fields) param.response_optional_fields = response_optional_fields

  return hitApi(
    'get', //method
    path, //path 
    param,//query
  );
}

//https://open.shopee.com/documents?module=94&type=1&id=542&version=2
function getOrders(shop_id, time_range_field, time_from, time_to, page_size, cursor
  , order_status, response_optional_fields) {
  timest = new Date().getTime() / 1000;
  //path 
  let path = "/api/v2/order/get_order_list"
  //get token 
  let token = getToken(partnerKey, partner_id, timest);
  //common param
  let param = commonParam(path, true, timest, false, true, shop_id, token);
  //request pram
  if (time_range_field) param.time_range_field = time_range_field
  if (time_from) param.time_from = time_from
  if (time_to) param.time_to = time_to
  if (page_size) param.page_size = page_size

  //optional
  if (order_status) param.order_status = order_status
  if (response_optional_fields) param.response_optional_fields = response_optional_fields

  return hitApi(
    'get', //method
    path, //path 
    param,//query
  );
}
//product list
//https://open.shopee.com/documents?module=89&type=1&id=614&version=2
function getItemList(offset, page_size, item_status, update_time_from, update_time_to) {
  timest = new Date().getTime() / 1000;
  //path 
  let path = "/api/v2/product/get_item_list"
  //get token 
  let token = getToken(partnerKey, partner_id, timest);
  //common param
  let param = commonParam(path, true, timest, false, true, shop_id, token);

  //required
  if (offset) param.offset = offset
  if (page_size) param.page_size = page_size
  if (item_status) param.item_status = item_status

  //optional
  if (update_time_from) param.update_time_from = update_time_from
  if (update_time_to) param.update_time_to = update_time_to

  return hitApi(
    'get', //method
    path, //path 
    param,//query
  );
}

//product base info
//https://open.shopee.com/documents?module=89&type=1&id=612&version=2
function getSingleProduct(item_id_list, need_tax_info, need_complaint_policy) {
  timest = new Date().getTime() / 1000;
  //path 
  let path = "/api/v2/product/get_item_base_info"
  //get token 
  let token = getToken(partnerKey, partner_id, timest);
  //common param
  let param = commonParam(path, true, timest, false, true, shop_id, token);

  //required
  if (item_id_list) param.item_id_list = item_id_list

  //optional
  if (need_tax_info) param.need_tax_info = need_tax_info
  if (need_complaint_policy) param.need_complaint_policy = need_complaint_policy

  return hitApi(
    'get', //method
    path, //path 
    param,//query
  );
}


//update product price
//https://open.shopee.com/documents?module=89&type=1&id=651&version=2
//price_list is array object example =>
// "price_list": [{
// "model_id": 3456,
// "original_price": 11.11
// }]
function updatePrice(item_id, price_list) {
  timest = new Date().getTime() / 1000;
  //path 
  let path = "/api/v2/product/update_price"
  //get token 
  let token = getToken(partnerKey, partner_id, timest);
  //common param
  let param = commonParam(path, true, timest, false, true, shop_id, token);

  let body = {}
  //required
  if (item_id) body.item_id = item_id
  if (price_list) body.price_list = price_list


  return hitApi(
    'post', //method
    path, //path 
    param,//query
    body//body
  );
}


//update product stock
//https://open.shopee.com/documents?module=89&type=1&id=652&version=2
//price_list is array object example =>
// "stock_list": [{
//   "model_id": 3456,
//   "normal_stock": 100
//   }]
function updateStock(item_id, stock_list) {
  timest = new Date().getTime() / 1000;
  //path 
  let path = "/api/v2/product/update_stock"
  //get token 
  let token = getToken(partnerKey, partner_id, timest);
  //common param
  let param = commonParam(path, true, timest, false, true, shop_id, token);

  let body = {}
  //required
  if (item_id) body.item_id = item_id
  if (stock_list) body.stock_list = stock_list


  return hitApi(
    'post', //method
    path, //path 
    param,//query
    body//body
  );
}



//product get module list
//https://open.shopee.com/documents?module=89&type=1&id=618&version=2
function getModuleList(item_id_list) {
  timest = new Date().getTime() / 1000;
  //path 
  let path = "/api/v2/product/get_model_list"
  //get token 
  let token = getToken(partnerKey, partner_id, timest);
  //common param
  let param = commonParam(path, true, timest, false, true, shop_id, token);

  //required
  if (item_id_list) param.item_id_list = item_id_list

  return hitApi(
    'get', //method
    path, //path 
    param,//query
  );
}


//get comments product
//https://open.shopee.com/documents?module=89&type=1&id=562&version=2
function getChats(item_id, comment_id, cursor, page_size) {

  timest = new Date().getTime() / 1000;
  //path 
  let path = "/api/v2/product/get_comment"
  //get token 
  let token = getToken(partnerKey, partner_id, timest);
  //common param
  let param = commonParam(path, true, timest, false, true, shop_id, token);

  //required
  if (item_id) param.item_id = item_id
  if (comment_id) param.comment_id = comment_id
  if (cursor) param.cursor = cursor
  if (page_size) param.page_size = page_size

  return hitApi(
    'get', //method
    path, //path 
    param,//query
  );
}



//post comment product
//https://open.shopee.com/documents?module=89&type=1&id=563&version=2
// comment_list= [
//         {
//             "comment_id": 1540927,
//             "comment": "Your smile is the direction of our efforts, welcome to your next visit！"
//         }
//     ]
function postReply(comment_list) {
  timest = new Date().getTime() / 1000;
  //path 
  let path = "/api/v2/product/update_stock"
  //get token 
  let token = getToken(partnerKey, partner_id, timest);
  //common param
  let param = commonParam(path, true, timest, false, true, shop_id, token);

  let body = {}
  //required
  if (comment_list) body.comment_list = comment_list


  return hitApi(
    'post', //method
    path, //path 
    param,//query
    body//body
  );
}


function commonParam(path, pid, timestamp, redirect, signKey, shop_id, access_token) {
  let resultSign = sign(partnerKey, partner_id, path, timestamp);
  const params = {}

  //static
  if (pid) params.partner_id = partner_id
  if (timestamp) params.timestamp = timestamp
  if (redirect) params.redirect = redirectUrl

  //from parameter
  if (signKey) params.sign = resultSign
  if (shop_id) params.shop_id = shop_id
  if (access_token) params.access_token = access_token;
  return params;
}


module.exports = { getOrders, getSingleOrder ,getItemList,getSingleProduct,updatePrice,updateStock,getModuleList,getChats,postReply};
