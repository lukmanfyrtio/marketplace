
const axios = require('axios')
const crypto = require('crypto')


let url = `https://partner.shopeemobile.com`;
let partnerKey = 'f9c608fba08254482f2ab16a1fbbf39b7b409dbccdad594f798c9707ca6aab0e';
let partner_id = 843372;
let timest;
let redirectUrl = "http://localhost:81";


async function hitApi(method = "empty", path = "empty", query = "empty", body = null) {
  timest = new Date().getTime() / 1000;
  let resultSign = sign(partnerKey, partner_id, path, timest);
  //set param common 
  query.sign = resultSign;
  query.timestamp = timest;
  query.partner_id = partner_id;
  if (query.shop_id) query.access_token = await getToken(query.shop_id) ? "" : "";


  let responseData = {};
  responseData.marketplace = "shopee"
  responseData.timestamp = new Date().getTime();
  return new Promise(function (resolve, reject) {
    axios({
      method: method,
      url: url + path,
      params: query,
      data: body

    }).then(function (response) {
      responseData.code = response.status;
      responseData.message = response.data.message;
      resolve(responseData);

    }).catch((e) => {
      console.log(e.response);
      responseData.code = e.response.status;
      if (e.response.status == 403) {
        responseData.message = e.response.data.message
      }
      resolve(responseData);
    });
  });
}


function sign(path, time) {
  let baseString = partner_id + path + time;
  var hmac = crypto.createHmac('sha256', partnerKey);
  //passing the data to be hashed
  let data = hmac.update(baseString);
  //Creating the hmac in the required format
  return data.digest('hex');
}

function getCode() {
  let param = {};
  timest = new Date().getTime() / 1000;
  let path = '/api/v2/shop/auth_partner'
  let result_sign = sign(path, timest);

  param.partner_id = partner_id;
  param.timestamp = timest;
  param.sign = result_sign;
  param.redirect = redirectUrl;


  return new Promise(function (resolve, reject) {
    axios({
      method: 'get',
      url: url + path,
      params: param,

    }).then(function (response) {
      resolve(response.data);

    }).catch((e) => {
      resolve(e.response.data);
    });
  });
}

async function getToken(shop_id, main_account_id) {
  let param = {};
  timest = new Date().getTime() / 1000;
  let path = '/api/v2/auth/token/get'
  let result_sign = sign(path, timest);

  param.partner_id = partner_id;
  param.timestamp = timest;
  param.sign = result_sign;
  let code = await getCode();
  let body = {
    code: code,
    partner_id: partner_id,
    shop_id: shop_id,
  }

  if (main_account_id) {
    body.main_account_id = main_account_id
  }

  return new Promise(function (resolve, reject) {
    axios({
      method: 'post',
      url: url + path,
      params: param,
      data: body

    }).then(function (response) {
      resolve(response.data);

    }).catch((e) => {
      resolve(e.response.data);
    });
  });
}



//https://open.shopee.com/documents?module=94&type=1&id=557&version=2
function getSingleOrder(shop_id, order_sn_list, response_optional_fields) {
  //path 
  let path = "/api/v2/order/get_order_detail";
  let param = {};
  //requset parameter
  if (order_sn_list) param.order_sn_list = order_sn_list;
  if (response_optional_fields) param.response_optional_fields = response_optional_fields;
  param.shop_id = shop_id;

  return hitApi(
    'get', //method
    path, //path 
    param,//query
  );
}

//https://open.shopee.com/documents?module=94&type=1&id=542&version=2
function getOrders(shop_id, start_date, end_date, page_size = 50, cursor
  , order_status, response_optional_fields) {
  //path 
  let path = "/api/v2/order/get_order_list"
  let param = {};
  param.shop_id = shop_id;

  //request pram
  param.time_range_field = 'create_time'
  if (start_date) param.time_from = start_date
  if (end_date) param.time_to = end_date
  param.page_size = page_size

  //optional
  if (cursor) param.cursor = cursor
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
function getAllProducts(shop_id, offset = 0, page_size = 50, update_time_from, update_time_to) {
  //path 
  let path = "/api/v2/product/get_item_list"
  let param = {};

  //required
  param.shop_id = shop_id;
  param.offset = offset
  if (page_size) param.page_size = page_size
  param.item_status = 'NORMAL'

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
function getSingleProduct(shop_id, item_id_list, need_tax_info, need_complaint_policy) {

  //path 
  let path = "/api/v2/product/get_item_base_info"
  let param = {};
  param.shop_id = shop_id;

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
function updatePrice(shop_id, item_id, new_price) {
  //path 
  let path = "/api/v2/product/update_price"
  let param = {};
  param.shop_id = shop_id;

  let body = {
    "item_id": item_id,
    "price_list": [{
      // "model_id": 0,
      "original_price": Number(new_price)
    }]
  }


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
function updateStock(shop_id, item_id, new_stock) {
  //path 
  let path = "/api/v2/product/update_stock"
  let param = {};
  param.shop_id = shop_id;
  //required
  let body = {
    "item_id": item_id,
    "stock_list": [{
      // "model_id": 0,
      "normal_stock": Number(new_stock)
    }]
  }
  return hitApi(
    'post', //method
    path, //path 
    param,//query
    body//body
  );
}

function shipOrder(shop_id, order_sn, package_number,address_id,pickup_time_id,tracking_number,branch_id,sender_real_name,tracking_number,slug,non_integrated_pkgn) {
  //path 
  let path = "/api/v2/product/update_stock"
  let param = {};
  param.shop_id = shop_id;

  let body = {};
  if (order_sn) body.order_sn = order_sn

  if (package_number) body.package_number = package_number

  let pickup={}
  if (address_id) pickup.address_id = address_id
  if (pickup_time_id) pickup.pickup_time_id = pickup_time_id
  if (tracking_number) pickup.tracking_number = tracking_number

  let dropoff={}
  if (branch_id) dropoff.branch_id = branch_id
  if (sender_real_name) dropoff.sender_real_name = sender_real_name
  if (tracking_number) dropoff.tracking_number = tracking_number
  if (slug) dropoff.slug = slug

  let non_integrated={}
  if (non_integrated_pkgn) non_integrated.non_integrated_pkgn = non_integrated_pkgn

  //required
  if(pickup!=={})body.pickup=pickup
  if(dropoff!=={})body.dropoff=dropoff
  if(non_integrated!=={})body.non_integrated=non_integrated

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
  //path 
  let path = "/api/v2/product/get_model_list"
  let param = {};
  //required
  if (item_id_list) param.item_id_list = item_id_list

  return hitApi(
    'get', //method
    path, //path 
    param,//query
  );
}

// get ship parameter
//https://open.shopee.com/documents/v2/v2.logistics.get_shipping_parameter?module=95&type=1
function getShipParameter(shop_id,order_sn) {
  //path 
  let path = "/api/v2/product/get_model_list"
  let param = {};
  //required
  if (shop_id) param.shop_id = shop_id
  if (order_sn) param.order_sn = order_sn

  return hitApi(
    'get', //method
    path, //path 
    param,//query
  );
}


//get comments product
//https://open.shopee.com/documents?module=89&type=1&id=562&version=2
function getProductDiscussion(shop_id, item_id, comment_id, page_size=50,size="") {

  //path 
  let path = "/api/v2/product/get_comment";
  let param = {};
  param.shop_id = shop_id;

  //required
  if (item_id) param.item_id = item_id
  if (comment_id) param.comment_id = comment_id
  param.cursor = size
  if (page_size) param.page_size = page_size

  return hitApi(
    'get', //method
    path, //path 
    param,//query
  );
}

//get category product
//https://open.shopee.com/documents?module=89&type=1&id=562&version=2
function getCategory(shop_id) {

  //path 
  let path = "/api/v2/product/get_category";
  let param = {};
  param.shop_id = shop_id;

  //required
  param.language = "en / id"

  return hitApi(
    'get', //method
    path, //path 
    param,//query
  );
}


function getAttribute(shop_id,language,category_id) {

  //path 
  let path = "/v2/product/get_attributes";
  let param = {};
  param.shop_id = shop_id;
  if(language)body.language=language
  //required
  if(category_id)body.language=category_id

  return hitApi(
    'get', //method
    path, //path 
    param,//query
  );
}


function getSingleSettlement(shop_id,order_sn) {

  //path 
  let path = "/v2/payment/get_escrow_detail";
  let param = {};
  let body = {};
  param.shop_id = shop_id;
  if(order_sn)body.order_sn=order_sn

  return hitApi(
    'get', //method
    path, //path 
    param,//qu
    body
  );
}

function getAllSettlement(shop_id,release_time_from,release_time_to,page_size=50,page_no=0) {

  //path 
  let path = "/v2/payment/get_escrow_detail";
  let param = {};
  let body = {};
  param.shop_id = shop_id;
  if(release_time_from)body.release_time_from=release_time_from
  if(release_time_to)body.release_time_to=release_time_to
  body.page_size=page_size
  if(page_no)body.order_sn=page_no

  return hitApi(
    'get', //method
    path, //path 
    param,//qu
    body
  );
}

function getLogistic(shop_id) {

  //path 
  let path = "/v2/logistics/get_channel_list";
  let param = {};
  param.shop_id = shop_id;
  return hitApi(
    'get', //method
    path, //path 
    param,//query
  );
}

function getReturns(shop_id,page_no,page_size,create_time_from,create_time_to) {

  //path 
  let path = "/api/v2/returns/get_return_list";
  let param = {};
  if(shop_id)param.shop_id = shop_id;
  param.page_no = page_no;
  if(page_size)param.page_size = page_size;
  if(create_time_from) param.create_time_from = create_time_from;
  if(create_time_from)param.create_time_to = create_time_from;
  return hitApi(
    'get', //method
    path, //path 
    param,//query
  );
}


function getReturnDetail(shop_id,return_sn) {

  //path 
  let path = "/api/v2/returns/get_return_detail";
  let param = {};
  param.shop_id = shop_id;
  if(return_sn)param.return_sn = return_sn;

  return hitApi(
    'get', //method
    path, //path 
    param,//query
  );
}

function confirmReturn(shop_id,return_sn) {
  //path 
  let path = "/api/v2/returns/confirm";
  let param = {};
  let body = {}
  param.shop_id = shop_id;
  if(return_sn)body.return_sn = return_sn;

  return hitApi(
    'post', //method
    path, //path 
    param,//query
    body//body
  );
}


function disputeReturn(shop_id,return_sn) {
  //path 
  let path = "/api/v2/returns/dispute";
  let param = {};
  let body = {}
  param.shop_id = shop_id;
  if(return_sn)body.return_sn = return_sn;
  if(email)body.email = email;
  if(dispute_reason)body.dispute_reason = dispute_reason;
  if(dispute_text_reason)body.dispute_text_reason = dispute_text_reason;
  if(image)body.image = image;

  return hitApi(
    'post', //method
    path, //path 
    param,//query
    body//body
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
function postProductDiscussion(shop_id,comment_id,message) {
  //path 
  let path = "/api/v2/product/reply_comment";
  let param = {};
  param.shop_id = shop_id;
  let body = {
    "comment_list": [
        {
            "comment_id": Number(comment_id),
            "comment": message
        }
    ]
}
  return hitApi(
    'post', //method
    path, //path 
    param,//query
    body//body
  );
}


function createProduct(shop_id, original_price , description,weight,item_name,item_status,dimension
  ,normal_stock ,logistic_info ,attribute_list,category_id ,image ,pre_order,item_sku,condition,wholesale,video_upload_id,brand,item_dangerous
  ,tax_info,complaint_policy) {
  //path 
  let path = "/api/v2/product/add_item"
  let param = {};
  param.shop_id = shop_id;
  //required
  let body = {}

  if(original_price)body.original_price=original_price
  if(description)body.description=description
  if(weight)body.weight=weight
  if(item_name)body.item_name=item_name
  if(item_status)body.item_status=item_status
  if(dimension)body.dimension=dimension
  if(normal_stock)body.normal_stock=normal_stock
  if(logistic_info)body.logistic_info=logistic_info
  if(attribute_list)body.attribute_list=attribute_list
  if(category_id)body.category_id=category_id

  if(image)body.image=image
  if(pre_order)body.pre_order=pre_order
  if(item_sku)body.item_sku=item_sku
  if(condition)body.condition=condition
  if(wholesale)body.wholesale=wholesale

  if(video_upload_id)body.video_upload_id=video_upload_id
  if(brand)body.brand=brand
  if(item_dangerous)body.item_dangerous=item_dangerous
  if(tax_info)body.tax_info=tax_info
  if(complaint_policy)body.complaint_policy=complaint_policy


  return hitApi(
    'post', //method
    path, //path 
    param,//query
    body//body
  );
}

function updateProduct(shop_id, item_id , description,weight,item_name,item_status,dimension
   ,logistic_info ,attribute_list,category_id ,image ,pre_order,item_sku,condition,wholesale,video_upload_id,brand,item_dangerous
  ,tax_info,complaint_policy) {
  //path 
  let path = "/api/v2/product/update_item"
  let param = {};
  param.shop_id = shop_id;
  //required
  let body = {}

  if(item_id)body.item_id=item_id
  if(description)body.description=description
  if(weight)body.weight=weight
  if(item_name)body.item_name=item_name
  if(item_status)body.item_status=item_status
  if(dimension)body.dimension=dimension
  if(logistic_info)body.logistic_info=logistic_info
  if(attribute_list)body.attribute_list=attribute_list
  if(category_id)body.category_id=category_id

  if(image)body.image=image
  if(pre_order)body.pre_order=pre_order
  if(item_sku)body.item_sku=item_sku
  if(condition)body.condition=condition
  if(wholesale)body.wholesale=wholesale

  if(video_upload_id)body.video_upload_id=video_upload_id
  if(brand)body.brand=brand
  if(item_dangerous)body.item_dangerous=item_dangerous
  if(tax_info)body.tax_info=tax_info
  if(complaint_policy)body.complaint_policy=complaint_policy


  return hitApi(
    'post', //method
    path, //path 
    param,//query
    body//body
  );
}


function cancelOrder(shop_id,order_sn,cancel_reason,item_id,model_id) {
  let item_list=[
    item_id=item_id,
    model_id=model_id
  ]
  //path 
  let path = "/api/v2/order/cancel_order";
  let param = {};
  param.shop_id = shop_id;
  let body = {}
  if(order_sn)body.order_sn=order_sn
  if(cancel_reason)body.cancel_reason=cancel_reason
  if(item_id&&model_id){
    body.item_list=item_list
  }

  return hitApi(
    'post', //method
    path, //path 
    param,//query
    body//body
  );
}


function buyerCancel(shop_id,order_sn,operation) {
  let responseData = {};
  responseData.marketplace = "shopee"
  responseData.timestamp = new Date().getTime();
  //path 
  let path = "/api/v2/order/cancel_order";
  let param = {};
  param.shop_id = shop_id;
  let body = {}
  if(order_sn)body.order_sn=order_sn

  if(operation){
    if(operation!=="ACCEPT"||operation!=="REJECT"){
      responseData.code=400;
      responseData.message="Field operation is only  ACCEPT or REJECT"
    }else{
      body.operation=operation
    }
  }
  return hitApi(
    'post', //method
    path, //path 
    param,//query
    body//body
  );
}




module.exports = {getReturns,getReturnDetail,disputeReturn,confirmReturn,getAttribute,getCategory, getOrders, getSingleOrder, getAllProducts, getSingleProduct, updatePrice, updateStock, getModuleList, getProductDiscussion, postProductDiscussion ,updateProduct,createProduct,cancelOrder,buyerCancel,getLogistic,getAllSettlement,getSingleSettlement,shipOrder,getShipParameter};