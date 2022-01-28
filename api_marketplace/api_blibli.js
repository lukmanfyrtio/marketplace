const axios = require('axios')

let signKey = "signKey"
let apiClientId = "apiClientId"
let apiClientSecret = "apiClientId"
let apiKeySeller = "apiKeySeller"
let uri = "https://api.blibli.com/v2";
let store_id = 10001
let channel_id = 'mycompany'

var moment = require('moment-timezone')

var crypto = require('crypto');

function generateCommonHeaders(reqMethod, body = "", reqContentType = "", urlReq = "") {
    let date = moment();
    let dateNow = date.tz('Asia/Jakarta').format("ddd MMM DD HH:mm:ss z YYYY");
    let milliseconds = new Date(date.toDate()).getTime();


    let reqBody = body !== "" ? hashmd5(JSON.stringify(body)) : "";
    urlReq = uri + urlReq;
    let meta = urlReq.split("/proxy");
    let metas = meta[1]
    let raw;


    if (metas.includes("mta")) {
        raw = metas.replace("mta", "mtaapi")
    } else {
        raw = metas
    }


    let raw_signature = `${reqMethod}\n${reqBody}\n${reqContentType}\n${dateNow}\n${raw}`;
    let headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Api-Seller-Key': apiKeySeller,
        "Signature": `${sign(signKey, raw_signature)}`,
        "Signature-Time": milliseconds
    }
    return headers;

}


function sign(signKey, string) {
    var hmac = crypto.createHmac('sha256', signKey);
    //passing the data to be hashed
    let data = hmac.update(string);
    //Creating the hmac in the required format
    return data.digest('hex');
}

function hashmd5(string) {
    var hash = crypto.createHash('md5').update(string).digest('hex');
    return hash;
}


async function hitApi(method = "", path = "", query = {}, body = {}, headers = {}) {
    let responseData = {};
    //common param
    query.requestId = await getUUID()
    query.storeId = store_id
    query.channelId = channel_id

    responseData.marketplace = "blibli"
    responseData.timestamp = new Date().getTime();
    headers = generateCommonHeaders(method, Object.keys(body).length !== 0 ? body : "", method.toUpperCase() == "get" ? "" : 'application/json', path);
    return new Promise(function (resolve, reject) {
        axios({
            method: method,
            url: uri + path,
            params: query,
            headers: headers,
            data: body,
            auth: {
                username: apiClientId,
                password: apiClientSecret
            }

        }).then(function (response) {
            console.log(response);
            if (response.data.success) {
                responseData.code = response.status;
                responseData.message = 'Your request has been processed successfully';
            } else {
                responseData.code = response.status;
                responseData.message = response.data.errorMessage;
            }
            resolve(response);

        }).catch((e) => {
            console.log(e.response);
            responseData.code = e.response.status;
            responseData.message = e.response.data.errorMessage;
            resolve(responseData);
        });
    });
}


function getSingleOrder(orderNo, orderItemNo) {
    let path = "/proxy/mta/api/businesspartner/v1/order/orderDetail";
    let param = {};
    if (orderNo) param.orderNo = orderNo
    if (orderItemNo) param.orderItemNo = orderItemNo

    return hitApi(method = "get", path, param, {})
}

function getOrders(shop_id, username, startDate, endDate, page = 0, limit = 50) {
    let path = "/proxy/seller/v1/orders/packages/filter";
    let param = {};
    if (shop_id) param.storeCode = shop_id
    if (username) param.username = username

    let body = {
        "filter": {
            "statusFPDateRange": {
                "end": endDate,
                "start": startDate
            }
        },
        "sorting": {
            "by": "CREATED_DATE",
            "direction": "DESC"
        },
        "paging": {
            "page": page,
            "size": limit
        }
    }
    return hitApi(method = "post", path, param, body)
}

function getProducts(businessPartnerCode, username) {
    let path = "/proxy/mta/api/businesspartner/v2/product/getProductList";
    let param = {};
    if (businessPartnerCode) param.businessPartnerCode = businessPartnerCode
    if (username) param.username = username

    return hitApi(method = "get", path, param, {})
}

function getSingleProduct(businessPartnerCode, gdnSku) {

    let path = "/proxy/mta/api/businesspartner/v1/product/detailProduct";
    let param = {};
    if (businessPartnerCode) param.businessPartnerCode = businessPartnerCode
    if (gdnSku) param.gdnSku = gdnSku

    return hitApi(method = "get", path, param, {})
}

function getBrands(businessPartnerCode, username, brandName, page = 0, size = 50) {
    let path = "/proxy/mta/api/businesspartner/v2/product/getBrands";
    let param = {};
    if (businessPartnerCode) param.businessPartnerCode = businessPartnerCode
    if (username) param.username = username
    if (brandName) param.brandName = brandName
    param.page = page
    if (size) param.size = size

    return hitApi(method = "get", path, param, {})
}

function updateProductPrice(itemId, username, storeCode, priceReg, priceSale = null) {
    let path = `/proxy/seller/v1/products/${itemId}`;
    let param = {};
    if (username) param.username = username
    if (storeCode) param.storeCode = storeCode
    if (itemId) param[blibli - sku] = itemId
    let body = {
        price: {
            regular: Number(priceReg),
            sale: priceSale
        }
    }

    return hitApi(method = "put", path, param, body)
}

function updateProductStock(itemId, username, storeCode, stock) {
    let path = `/proxy/seller/v1/products/${itemId}/stock`;
    let param = {};
    if (username) param.username = username
    if (storeCode) param.storeCode = storeCode
    if (itemId) param[`blibli-sku`] = itemId
    let body = {
        "availableStock": stock
    }

    return hitApi(method = "put", path, param, body)
}

function getChat(businessPartnerCode, username, startDate, endDate, page = 0, size = 50) {
    let path = "/proxy/mta/api/businesspartner/v1/product/discussion/questions";
    let param = {};
    if (businessPartnerCode) param.businessPartnerCode = businessPartnerCode
    if (username) param.username = username
    if (startDate) param.startDate = startDate
    if (endDate) param.endDate = endDate
    param.page = page
    param.sortedBy = 'createdDate'
    param.sortDirection = "DESC"
    if (size) param.size = size

    return hitApi(method = "get", path, param, {})
}

function getReply(questionCode, businessPartnerCode, username, page = 0, size = 50) {
    let path = `/proxy/mta/api/businesspartner/v1/product/discussion/answers/${questionCode}`;
    let param = {};
    if (businessPartnerCode) param.businessPartnerCode = businessPartnerCode
    if (username) param.username = username
    if (questionCode) param.questionCode = questionCode
    param.page = page
    param.sortedBy = 'createdDate'
    param.sortDirection = "DESC"
    if (size) param.size = size

    return hitApi(method = "get", path, param, {})
}

function postReply(questionCode, businessPartnerCode, username, answer) {
    let path = `/proxy/mta/api/businesspartner/v1/product/discussion/answers/${questionCode}`;
    let param = {};
    if (businessPartnerCode) param.businessPartnerCode = businessPartnerCode
    if (username) param.username = username
    if (questionCode) param.questionCode = questionCode
    let body = {
        "answer": answer
    }

    return hitApi(method = "post", path, param, body)
}

function updateState(productSkus, storeCode, username,state) {
    let path = `/proxy/seller/v1/products/statuses/archive`;
    let param = {};
    if(!state){
        path = `/proxy/seller/v1/products/statuses/unarchive`;
    }
    if (storeCode) param.storeCode = storeCode
    if (username) param.username = username
    if (productSkus) param.productSkus = productSkus
    let body = {
        "productSkus": [
          productSkus
        ]
      }

    return hitApi(method = "post", path, param, body)
}


function getAllSettlements(storeCode, username, startDate, endDate, page = 0, size = 50) {
    let path = "/proxy/seller/v1/settlements/filter";
    let param = {};
    if (storeCode) param.storeCode = storeCode
    if (username) param.username = username
    param.page = page
    if (size) param.size = size

    let body = {
        "filter": {
            "periodEndDate": startDate,
            "periodStartDate": endDate,
        },
        "paging": {
            "page": page,
            "size": size
        }
    }

    return hitApi(method = "post", path, param, body)
}

function getSingleSettlement(settlementId, storeCode, username) {
    let path = `/proxy/seller/v1/settlements/${settlementId}`;
    let param = {};
    if (storeCode) param.storeCode = storeCode
    if (username) param.username = username
    if (settlementId) param.settlementId = settlementId

    return hitApi(method = "get", path, param, {})
}

function getAttribute(categoryCode, storeCode, username) {
    let path = `/proxy/seller/v1/categories/${categoryCode}/attributes`;
    let param = {};
    if (storeCode) param.storeCode = storeCode
    if (username) param.username = username
    if (categoryCode) param['category-code'] = categoryCode

    return hitApi(method = "get", path, param, {})
}

function getCategory(businessPartnerCode) {
    let path = `/proxy/mta/api/businesspartner/v1/product/getCategory`;
    let param = {};
    if (businessPartnerCode) param.businessPartnerCode = businessPartnerCode

    return hitApi(method = "get", path, param, {})
}

function getPickupPoint(businessPartnerCode) {
    let path = `/proxy/mta/api/businesspartner/v1/product/getPickupPoint`;
    let param = {};
    if (businessPartnerCode) param.businessPartnerCode = businessPartnerCode

    return hitApi(method = "get", path, param, {})
}

function createProductV3(storeCode, username, attributes, brandCode, categoryCode, description, dimension, imageMap, logistics, name, newBrand, pickupPointCode
    , uniqueSellingPoint,preOrder, productItems, productType, videoUrl) {
    let path = `/proxy/seller/v1/products/async`;
    let param = {};
    if (storeCode) param.storeCode = storeCode;
    if (username) param.username = username;

    let bodyObj = {};

    if (attributes) bodyObj.attributes = attributes;
    if (brandCode) bodyObj.brandCode = brandCode;
    if (categoryCode) bodyObj.categoryCode = categoryCode;
    if (description) bodyObj.description = description;
    if (dimension) bodyObj.dimension = dimension;
    if (imageMap) bodyObj.imageMap = imageMap;
    if (logistics) bodyObj.logistics = logistics;
    if (name) bodyObj.name = name;
    if (newBrand) bodyObj.newBrand = newBrand;
    if (pickupPointCode) bodyObj.pickupPointCode = pickupPointCode;
    if (preOrder) bodyObj.preOrder = preOrder;

    if (productItems) bodyObj.productItems = productItems;
    if (productType) bodyObj.productType = productType;
    if (uniqueSellingPoint) bodyObj.uniqueSellingPoint = uniqueSellingPoint;
    if (videoUrl) bodyObj.videoUrl = videoUrl;

    let body = {
        "product": [
            bodyObj
        ]
    }
    return hitApi(method = "post", path, param, body)
}

function updateProduct(merchantCode, attributes, description, items, productName, productSku, productStory, productType, url) {
    let path = `/proxy/mta/api/businesspartner/v1/product/updateDetailProduct`;
    let param = {};
    let bodyObj = {};

    if (attributes) bodyObj.attributes = attributes;
    if (description) bodyObj.description = description;
    if (items) bodyObj.items = items;

    
    if (productName) bodyObj.productName = productName;
    if (productSku) bodyObj.productSku = productSku;
    if (productStory) bodyObj.productStory = productStory;
    if (productType) bodyObj.productType = productType;
    if (url) bodyObj.url = url;


    let body = {
        "merchantCode": merchantCode,
        "productDetailRequests": [bodyObj
        ]
    }


    return hitApi(method = "post", path, param, body)
}


function getCreationStatus(productSKu, storeCode,username) {
    let path = `/proxy/seller/v1/product-submissions/${productSKu}`;
    let param = {};
    if (storeCode) param.storeCode = storeCode
    if (username) param.username = username
    if (productSKu) param[`product-sku`] = productSKu

    return hitApi(method = "get", path, param)
}

function acceptOrder(orderId, businessPartnerCode) {
    let path = `/proxy/mta/api/businesspartner/v1/order/createPackage`;
    let param = {};
    if (businessPartnerCode) param.businessPartnerCode = businessPartnerCode
    let body = {
        "orderItemIds": `${orderId}`
    }

    return hitApi(method = "post", path, param, body)
}

function getUUID() {
    return new Promise(function (resolve, reject) {
        axios.get('https://www.uuidgenerator.net/api/version1', {
            headers: {
                Accept: 'application/json'
            }
        }).then(function (response) {
            console.log(`UUID=${response.data[0]}`);
            resolve(response.data[0]);
        }).catch((e) => {
            resolve(e.response.data);
        });
    });
}


module.exports = {getAttribute,getCreationStatus,getPickupPoint, getSingleOrder, getOrders, getProducts, getSingleProduct, getBrands, updateProductPrice, updateProductStock, getChat,getCategory, getReply, postReply, getAllSettlements, getSingleSettlement,updateProduct,createProductV3,acceptOrder ,updateState};


