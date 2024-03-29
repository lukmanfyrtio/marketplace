
const axios = require('axios')
const FormData = require('form-data');
var fs = require('fs')
const crypto =require('crypto')

function jsonS(d) { return JSON.stringify(d) }
function jsonP(d) { return d ? JSON.parse(d) : {} }
function jsonPs(d) { return jsonP(jsonS(d)) }

let client_id = '7db04fe68ef243d492f45d9754dc4efd';
let client_secret = '4f4f08c861284c55acdeda6f33327d15';
let url = 'https://fs.tokopedia.net';
let fs_id = 15991
let pkey =`-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAw+n7hH+3XMjI9PhGF8wCWN9OEVRrX7B6ITV+HYrvX7pyb/l0
iTyetOHM4pNgdXv8jNSlQJDrq8jNynYZN0Cs6FsRuCHBNuiI7IoMxKFQdqZm6TmF
YEiMszJ2h/2/Hf2bcK9e21Qrvdyrl6YX1ldvcTntU9OiiivmAYp7QtnLULQicpxO
VXc5Y2AeIPwvtpJJRSHo/CJf3bCP5mNz/Ih1aIjlFpJVbfeUyAc6iJHtP0Rxw2/N
9fZY/Fgh6F584q4rbNuQ2u18yOulWrZpTc3+La1ASFW3+uuBGDIXHKaDAVBvm1VD
ST9Hrrdi+rTvEC4rO6E2A40Nf9Pe4OReWFxUBQIDAQABAoIBAF/xk7J01XiEAB4w
BCudRjz9xv6nqBnplDX1O3j+VHI+HdMGiHK5FEQjHLKNWDzQ5oKVlQREtJWhNl8D
bR/o9YSpLMlPBo98W6nzhYM6OOySW222NMJNZVJQ0UmSE+l9DIWn7L1ewDkv+3y9
44idsz7xDm/yAfTGwNJaXjkD7hTr9lyrAnAJv2pSwY1+HNifOGjjoJ8faEcHxRGV
tVnNhxKfyleThpvAYUK1eXjPo5E9v7SPd9Ei8HsdL1Lvk+JGe4pntOBY6LAOmNgI
jyJuZSt5zdUC5PPJrRIxM1HK3ZPDrtPvvbXJD7Sb7wMfpCXolblC0fQtPtPyPjWw
mqTXbSECgYEA9sD46QDvoywhz44zD6p50zb2j7uNC9Je+zfFjSIkD6DzLe5Z4o/g
wNiSWrKsf2kvdWs3Ya1RvdiBaNpUPLp3pk/h7OzExXfdo4rVFZYqnav22y0UJTWD
L3zrT/coqwrWy7rWBwlMtzyKT7WRdizI65E4ecdbmJgQ2Osytg8eG50CgYEAy0FS
G7ltuVO1ojgU47l12QAvwWatkK0801txBwqcKTjhrqS5VB/k1xXXOI/U0b+kXlTM
E96RXsRNEm/AMSGAgHbBMI91OYOtmybZy8jzV7/tkJAchgsfnaFBrU2gf224FQAJ
8Ds0E+wc6xOyNNBfxZryWVpLUuaWtqz3pZxIsYkCgYEA0+8gmvf72zlPfPaUsrLo
WdpOYVtkJLA2di0L11Foiafi1iNvPmH3V4tsAMyPzgspAP/qnFGB8L4hQE6tpU8+
7zCTSqx9wWFXk1zt8dF9ntkReGS6dc8FcucnMRKG8omnvWom4/o/0u4DmbzISCjl
FTcwu5/X8zNA3R79+lL3uB0CgYEAmKZiSDgnU/yueTqtVao/+83MD/BRgkrZV9Nh
O+yYA82YkVVdavTZJUBd9zjumOjZRY9iBboua4H6cFJFgaCrpc+KoDHd1Gg0xkWT
ZR1yxQB8JwpUocdQ403syX93frykeAEjdazBHAVEYrjUKh4lD3+ja8AIuiY8Is4c
3+BUKCECgYAmSH9UTKtPFcqgOJCxWE5y8AoeAY2CIo7jt3dRxZoLjCDvfH1H8iWh
iHqzBrx6WZSemRljuGkdet8R30BbL/OwsNO3AeDwMUqs8QNLN0yVJODkK8rwsoDL
rqoi+Fc07ELVYDpoehML8TxmAF/LX0P3sr73pL9SmuaY5jfrkp/pew==
-----END RSA PRIVATE KEY-----`



function decryptContent(ciphertext, passphrase) {
  var input = new Buffer(ciphertext, 'base64')
  var nonce = input.slice(input.length - 12, input.length)
  ciphertext = input.slice(0, input.length - 12)
  var taglength = 16
  var tag = ciphertext.slice(ciphertext.length - taglength, ciphertext.length)
  var acipher = ciphertext.slice(0, ciphertext.length - taglength)
  var key = passphrase

  var cipher = crypto.createDecipheriv('aes-256-gcm', key, nonce)
  cipher.setAuthTag(tag)
  var plaintext = Buffer.concat([cipher.update(acipher), cipher.final()])

  return plaintext ? jsonP(plaintext.toString('utf-8')) : {}
}

function encodeToBase64(envStore) {
  var s = Buffer.from(`${envStore && envStore.clientid ? envStore.clientid : client_id}:${envStore && envStore.clientkey ? envStore.clientkey : client_secret}`).toString('base64')
  return s;
}

// function getToken() {
function getToken(envStore) { // env
  let urlGetToken = 'https://accounts.tokopedia.com/token';

  // let encodedString = encodeToBase64(client_id, client_secret);
  let encodedString = encodeToBase64(envStore)// env
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
async function hitApi(method = "empty", path = "empty", query = "empty", body = null, envStore,returnHtml=false,formData) { // env
  let responseData = {};
  responseData.marketplace = "tokopedia"
  responseData.timestamp = new Date().getTime();
  // let token = await getToken();
  let token = await getToken(envStore) // env
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

  if(formData){
    headers['Content-Type']=`multipart/form-data;`
    headers={...formData.getHeaders()}
    config.data=formData;
  }

  if(body&&Object.keys(body).length !== 0){
    config.data=JSON.stringify(body)
  }
  return new Promise(function (resolve, reject) {
    axios(
      config
    ).then(function (response) {
      console.log("hit api tokopedia ->>")
      console.log(response.config);
      console.log(response.data);
      if(!returnHtml){
      responseData.code = response.status;
      responseData.message = response.data.header.messages;
      responseData.data = response.data.data
      if(Array.isArray(responseData.data)){
        responseData.data.forEach(function (item, i) {
          if (item.encryption) {
            try {
            const dSecret = crypto.privateDecrypt({
            key: pkey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256'
            }, Buffer.from(item.encryption.secret, 'base64')).toString()
            
            const dContent = decryptContent(item.encryption.content, dSecret)
            responseData.data[i].decryption=dContent
            }catch(err) {
              console.log(err);
            }
          }
        });
      }else{
        if(responseData && responseData.data &&responseData.data.encryption){
          let item=responseData.data
          try {
            const dSecret = crypto.privateDecrypt({
            key: pkey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256'
            }, Buffer.from(item.encryption.secret, 'base64')).toString()
            
            const dContent = decryptContent(item.encryption.content, dSecret)
            responseData.data.decryption=dContent
            }catch(err) {
              console.log(err);
            }
        }
      }
        resolve(responseData);
      }else{
        let base64=Buffer.from(response.data).toString('base64');
        responseData.message='Your request has been processed successfully'
        responseData.data = {
          encodedBase64: base64
        };
        resolve(responseData);
      }
    }).catch((e) => {
      console.log(e);
      console.log("hit api tokopedia catch ->>")
      console.log(e.response.config);
      console.log(e.response.data);
      responseData.code = e.response.status;
      if (e.response.status == 401) {
        responseData.message = "401 Authorization Required"
      } else {
        if(e.response.data.header!==undefined&&e.response.data.header.reason!==undefined){
          responseData.message = e.response.data.header.reason ;
          if(e.response.data){
            responseData.data=e.response.data
          }
        }else{
          responseData.message=e.response.data
        }
      }
      resolve(responseData);
    });
  });
}

//https://developer.tokopedia.com/openapi/guide/#/order/getsingleorder
function getSingleOrder(envStore,order_id, invoice_num) {
  let params = {};
  //required
  if (order_id) params.order_id = order_id

  //optional
  if (invoice_num) params.invoice_num = invoice_num

  return hitApi("get", `/v2/fs/${envStore && envStore.code_1 ? envStore.code_1 : fs_id}/order`, params,null,envStore);
}


//https://developer.tokopedia.com/openapi/guide/#/order/getallorder
function getOrders(envStore,from_date, to_date, page=1, per_page=50, shop_id, warehouse_id, status) {
  let params = {};
  //required
  params.fs_id = `${envStore && envStore.code_1 ? envStore.code_1 : fs_id}`
  if (from_date) params.from_date = from_date
  if (to_date) params.to_date = to_date
  params.page = page
  if (per_page) params.per_page = per_page

  //optional
  if (shop_id) params.shop_id = shop_id
  if (warehouse_id) params.warehouse_id = warehouse_id
  if (status) params.status = status


  return hitApi('get', '/v2/order/list', params,null,envStore);
}

// https://developer.tokopedia.com/openapi/guide/#/order/nack?id=order-reject-reason
function orderReject(envStore,order_id, reason_code, reason, shop_close_end_date, shop_close_note, empty_products) {
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

  return hitApi('post', `/v1/order/${order_id}/fs/${envStore && envStore.code_1 ? envStore.code_1 : fs_id}/nack`, params,body,envStore);
}


//https://developer.tokopedia.com/openapi/guide/#/order/ack
//order id required
//fs_id  required
function orderAccept(envStore,order_id) {
  let params = {};
  if (order_id) params.order_id = order_id
  params.fs_id = `${envStore && envStore.code_1 ? envStore.code_1 : fs_id}`
  return hitApi('post', `/v1/order/${order_id}/fs/${envStore && envStore.code_1 ? envStore.code_1 : fs_id}/ack`,null,params,envStore);
}

//https://developer.tokopedia.com/openapi/guide/#/order/requestpickup
//fs_id required
function requestPickup(envStore,order_id, shop_id) {
  let body = {};
  //required
  if (order_id) body.order_id = Number(order_id)
  if (shop_id) body.shop_id = Number(shop_id)

  return hitApi('post', `/inventory/v1/fs/${envStore && envStore.code_1 ? envStore.code_1 : fs_id}/pick-up`, null, body,envStore);
}


//https://developer.tokopedia.com/openapi/guide/#/order/cobcod
//fs_id required
function requestCOBCOD(envStore,order_id, shop_id, warehouse_id, per_page, first_order_id, next_order_id) {
  let params = {};
  //optional
  if (order_id) params.order_id = order_id
  if (shop_id) params.shop_id = shop_id
  if (warehouse_id) params.warehouse_id = warehouse_id

  if (per_page) params.per_page = per_page
  if (first_order_id) params.first_order_id = first_order_id
  if (next_order_id) params.next_order_id = next_order_id

  return hitApi('post', `/v1/fs/${envStore && envStore.code_1 ? envStore.code_1 : fs_id}/fulfillment_order`, params, {},envStore);
}

//https://developer.tokopedia.com/openapi/guide/#/order/updateorderstatus
// all param required
function updateOrderStatus(envStore,order_id, order_status, shipping_ref_num) {

  let body = {}
  if (order_status) body.order_status = order_status
  if (shipping_ref_num) body.shipping_ref_num = shipping_ref_num

  return hitApi('post', `/v1/order/${order_id}/fs/${envStore && envStore.code_1 ? envStore.code_1 : fs_id}/status`, {}, body,envStore);

}


//https://developer.tokopedia.com/openapi/guide/#/category/getallcategory
//fs_id required
//keyword si optional
function getCategories(envStore,keyword) {
  let params = {};
  //optional
  if (keyword) params.keyword = keyword

  let path = `/inventory/v1/fs/${envStore && envStore.code_1 ? envStore.code_1 : fs_id}/product/category`

  return hitApi('get', path, params, {},envStore);
}


// function getProduct(getBy, product_id, product_url, shop_id, page = 1, per_page = 50, sort = 1, sku) {
function getProduct(envStore,getBy, product_id, product_url, shop_id, page = 1, per_page = 50, sort = 1, sku) {
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
  // let path = `/inventory/v1/fs/${envStore && envStore.code_1 ? envStore.code_1 : fs_id}/product/info`
  let path = `/inventory/v1/fs/${envStore && envStore.code_1 ? envStore.code_1 : fs_id}/product/info` // env

  // return hitApi('get', path, params, {});
  return hitApi('get', path, params, {}, envStore) // env
}




function getProductVariant(envStore,getBy, product_id, cat_id) {
  let path = `/inventory/v1/fs/${envStore && envStore.code_1 ? envStore.code_1 : fs_id}/category/get_variant`;
  let params = {};
  //optional
  if (getBy == "product_id") {
    if (product_id) {
      params.product_id = product_id
      path = `/inventory/v1/fs/${envStore && envStore.code_1 ? envStore.code_1 : fs_id}/product/variant/${product_id}`
    }
  } else if (getBy == "cat_id") {
    if (cat_id) params.cat_id = cat_id
  }


  return hitApi('get', path, params, {},envStore);
}


function updateProductPrice(envStore,shop_id, new_price, product_id,sku) {
  let params = {};
  let bodyObj = {};
  //required
  if (product_id) bodyObj.product_id = Number(product_id)
  if (new_price) bodyObj.new_price = Number(new_price)
  if (sku) bodyObj.sku = sku

  let body = [
    bodyObj
  ];

  if (shop_id) params.shop_id = shop_id

  let path = `/inventory/v1/fs/${envStore && envStore.code_1 ? envStore.code_1 : fs_id}/price/update`;

  return hitApi('post', path, params, body,envStore);
}

function updateState(envStore,shop_id, unlist, product_id) {
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

  let path = `/inventory/v1/fs/${envStore && envStore.code_1 ? envStore.code_1 : fs_id}/price/update`;

  return hitApi('post', path, params, body,envStore);
}

function deleteProduct(envStore,shop_id, product_id) {
  let body = {};
  let params = {};
  //required
  if (product_id) {
    body.product_id = product_id
  }
  if (shop_id) params.new_price = shop_id

  let path = `/v3/products/fs/${envStore && envStore.code_1 ? envStore.code_1 : fs_id}/delete`;

  return hitApi('post', path, params, JSON.parse(body),envStore);
}

function updateProductStock(envStore,shop_id, new_stock, product_id,warehouse_id,sku) {
  let body = [];
  let params = {};
  let bodyObj={};
  //required
  if (product_id) bodyObj.product_id = Number(product_id)
  if (new_stock) bodyObj.new_stock = Number(new_stock)
  if (warehouse_id) bodyObj.warehouse_id = Number(warehouse_id)
  if (sku) bodyObj.sku = sku
  if (Object.keys(bodyObj).length !== 0) {
    body.push(bodyObj)
  }
  if (shop_id) params.shop_id = shop_id

  let path = `/inventory/v1/fs/${envStore && envStore.code_1 ? envStore.code_1 : fs_id}/stock/update`;

  return hitApi('post', path, params, body,envStore);
}


function getShopInfo(envStore,shop_id, page = 0, per_page = 50) {
  let params = {};
  //optional
  if (shop_id) params.shop_id = shop_id
  if (page) params.page = page
  if (per_page) params.per_page = per_page

  let path = `/v1/shop/fs/${envStore && envStore.code_1 ? envStore.code_1 : fs_id}/shop-info`;

  return hitApi('get', path, params, {},envStore);
}




function getAllShowCase(envStore,shop_id, page = 0, per_page = 50, hide_zero, display) {
  let params = {};
  //required
  if (shop_id) params.shop_id = shop_id

  //optional
  if (page) params.page = page
  if (per_page) params.per_page = per_page
  if (hide_zero) params.hide_zero = hide_zero
  if (display) params.display = display

  let path = `/v1/showcase/fs/${envStore && envStore.code_1 ? envStore.code_1 : fs_id}/get`;

  return hitApi('get', path, params, {},envStore);
}


function getAllEtalase(envStore,shop_id) {
  let params = {};
  //required
  if (shop_id) params.shop_id = shop_id

  let path = `/inventory/v1/fs/${envStore && envStore.code_1 ? envStore.code_1 : fs_id}/product/etalase`;

  return hitApi('get', path, params, {},envStore);
}


function createProductV3(envStore,shop_id, name, category_id, price_currency, price, status, min_order, weight, weight_unit, condition
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
  let path = `/v3/products/fs/${envStore && envStore.code_1 ? envStore.code_1 : fs_id}/create`;

  return hitApi('post', path, params, body,envStore);
}


function updateProductV3(envStore,shop_id, name, id,category_id, price_currency, price, status, min_order, weight, weight_unit, condition
  , dimension, custom_product_logistics, annotations, etalase, description, is_must_insurance, is_free_return, sku, stock, wholesale, preorder
  , pictures, videos, variant) {
  let body = {};
  let params = {};
  let productsObj = {};
  //required
  if (id) productsObj.id = id
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
  let path = `/v3/products/fs/${envStore && envStore.code_1 ? envStore.code_1 : fs_id}/edit`;

  return hitApi('patch', path, params, body,envStore);
}


function updateProductState(envStore,state, shop_id, product_id) {
  let body = {};
  let params = {};
  let path = `/v1/products/fs/${envStore && envStore.code_1 ? envStore.code_1 : fs_id}/inactive`;
  //required
  if (product_id) body.product_id = [Number(product_id)]
  if (shop_id) params.shop_id = shop_id
  if (state) path = `/v1/products/fs/${envStore && envStore.code_1 ? envStore.code_1 : fs_id}/active`;


  return hitApi('post', path, params, body,envStore);
}


function deleteProduct(envStore,shop_id, product_id) {
  let body = {};
  let params = {};
  let path=`/v3/products/fs/${envStore && envStore.code_1 ? envStore.code_1 : fs_id}/delete`;
  //required
  if (product_id) body.product_id = [Number(product_id)]
  if (shop_id) params.shop_id = shop_id


  return hitApi('post', path, params, body,envStore);
}



function getAllSettlements(envStore,shop_id, page = 0, per_page = 50, from_date, to_date) {
  let params = {};
  //required
  params.page = page
  if (per_page) params.per_page = per_page
  if (from_date) params.from_date = from_date
  if (to_date) params.to_date = to_date

  let path = `/v1/fs/${envStore && envStore.code_1 ? envStore.code_1 : fs_id}/shop/${shop_id}/saldo-history`;

  return hitApi('get', path, params, null,envStore);
}


function getChat(envStore,shop_id, page = 0, per_page = 50, filter = "all") {
  let params = {};
  //required
  if (shop_id) params.shop_id = shop_id
  params.page = page
  if (per_page) params.per_page = per_page
  if (filter) params.filter = filter


  let path = `/v1/chat/fs/${envStore && envStore.code_1 ? envStore.code_1 : fs_id}/messages`;

  return hitApi('get', path, params, {},envStore);
}

function getReply(envStore,shop_id, page = 0, per_page = 50, msg_id) {
  let params = {};
  //required
  if (shop_id) params.shop_id = shop_id
  if (page) params.page = page
  if (per_page) params.per_page = per_page


  let path = `/v1/chat/fs/${envStore && envStore.code_1 ? envStore.code_1 : fs_id}/messages/${msg_id}/replies`;

  return hitApi('get', path, params, {},envStore);
}

function postReply(envStore,shop_id, message, msg_id) {
  let body = {};
  //required
  if (shop_id) body.shop_id = Number(shop_id)
  if (message) body.message = message


  let path = `/v1/chat/fs/${envStore && envStore.code_1 ? envStore.code_1 : fs_id}/messages/${msg_id}/reply`;

  return hitApi('post', path, {}, body,envStore);
}


function getStatusProduct(envStore,shop_id, upload_id) {
  let params = {};
  //required
  if (shop_id) params.shop_id = Number(shop_id)
  let path = `/v2/products/fs/${envStore && envStore.code_1 ? envStore.code_1 : fs_id}/status/${upload_id}`;

  return hitApi('get', path, params, {},envStore);
}


function getResolutionTicket(envStore,shop_id,start_date ,end_date) {
  let params = {};
  //required
  if (shop_id) params.shop_id = Number(shop_id)
  if (start_date) params.start_date =start_date
  if (end_date) params.end_date =end_date
  let path = `/resolution/v1/fs/${envStore && envStore.code_1 ? envStore.code_1 : fs_id}/ticket`;

  return hitApi('get', path, params, {},envStore);
}


function getProductDiscussion(envStore,shop_id,product_id ,page,per_page) {
  let params = {};
  //required
  if (shop_id) params.shop_id = Number(shop_id)
  if (product_id) params.product_id =product_id
  if (page) params.page =page
  if (per_page) params.per_page =per_page
  let path = `/v1/discussion/fs/${envStore && envStore.code_1 ? envStore.code_1 : fs_id}/list`;

  return hitApi('get', path, params, {},envStore);
}

function updateShopInfo(envStore,shop_id,action ,start_date,end_date,close_note,close_now) {
  let params = {};
  
  //required
  if (shop_id) params.shop_id = Number(shop_id)
  if (action) params.action =action
  if (start_date) params.start_date =start_date;
  if (end_date) params.end_date =end_date
  if (close_note) params.close_note =close_note
  if (close_now) params.close_now =close_now
  let path = `/v2/shop/fs/${envStore && envStore.code_1 ? envStore.code_1 : fs_id}/shop-status`;

  return hitApi('post', path, {}, params,envStore);
}

function uploadPublicKey(envStore,shop_id,public_key ) {

  const data = new FormData();
  data.append('public_key',fs.createReadStream("/Users/lukmanfyrtio/Downloads/public_key.txt"))
  let path = `/v1/fs/${envStore && envStore.code_1 ? envStore.code_1 : fs_id}/register?upload=1`;

  return hitApi('post', path, null, null,envStore,false,data);
}

function getShippingLabel(envStore,shop_id,order_id) {
  let params = {};
  //required
  if (shop_id) params.shop_id = Number(shop_id)
  params.printed =1
  let path = `/v1/order/${order_id}/fs/${envStore && envStore.code_1 ? envStore.code_1 : fs_id}/shipping-label
  `;

  return hitApi('get', path, params, {},envStore,true);
}




module.exports = {uploadPublicKey,getShippingLabel,getProductDiscussion,getResolutionTicket,updateState,getAllSettlements, getSingleOrder, getOrders, orderAccept, orderReject, requestPickup, updateOrderStatus, getToken, getCategories, getProduct, updateProductPrice, updateProductStock, getProductVariant, getShopInfo, getAllEtalase, getAllShowCase, createProductV3, updateProductState,getStatusProduct ,getChat,getReply,postReply,updateProductV3,deleteProduct,updateShopInfo};
