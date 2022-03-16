const axios = require('axios')


let signKey = "2020Secretgardenn20."
let apiClientId = "mta-api-ptgosyenretailin-919f0"
let apiClientSecret = "mta-api-5uApGjMJCx0RkkD2MQRjzXKGn0pEmbfzZmnqmagl9f2DlyxDdl"
let apiKeySeller = "363CB953CE8C18D6BB188B46ED4CBF52A664F530905EEC1B1665589966D42DFB"
let uri = "https://api.blibli.com/v2";
let store_id = 10001
let channel_id = 'PT Gosyen Retail Indonesia'

var moment = require('moment-timezone')

var crypto = require('crypto');

function formatBase64(value){
    //Buffer() requires a number, array or string as the first parameter, and an optional encoding type as the second parameter. 
// Default is utf8, possible encoding types are ascii, utf8, ucs2, base64, binary, and hex
var b = new Buffer(value);
// If we don't use toString(), JavaScript assumes we want to convert the object to utf8.
// We can make it convert to other formats by passing the encoding type to toString().
var s = b.toString('base64');
return s;
}
function generateCommonHeaders(envStore,reqMethod, body = "", reqContentType = "", urlReq = "") {
    let date = moment();
    let timezone = date.tz('Asia/Jakarta');
    let milliseconds = timezone.toDate().getTime();
    let dateNow = timezone.format("ddd MMM DD HH:mm:ss z YYYY");

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


    let raw_signature = `${reqMethod.toUpperCase()}\n${reqBody}\n${reqContentType}\n${dateNow}\n${raw}`;
    let headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Api-Seller-Key': `${envStore && envStore.code_1 ? envStore.code_1 : apiKeySeller}`,
        "Signature": `${sign(`${envStore && envStore.code_2 ? envStore.code_2 : signKey}`, raw_signature)}`,
        "Signature-Time": milliseconds
    }
    return headers;

}


function sign(signKey, string) {
    var hmac = crypto.createHmac('sha256', signKey);
    //passing the data to be hashed
    let data = hmac.update(string);
    //Creating the hmac in the required format
    return data.digest('base64');
}

function hashmd5(string) {
    var hash = crypto.createHash('md5').update(string).digest('hex');
    return hash;
}


async function hitApi(method = "", path = "", query = {}, body = {}, headers = {},envStore) {
    let responseData = {};
    //common param
    if(!query.requestId){
        query.requestId = await getUUID()
    }
    query.channelId = `${envStore && envStore.code_3 ? envStore.code_3 : channel_id}`
    query.storeId = `${envStore && envStore.code_4 ? envStore.code_4 : store_id}`
    query.username =`${envStore && envStore.code_5 ? envStore.code_5 : 'lazuardiqayuma@gmail.com'}`

    responseData.marketplace = "blibli"
    responseData.timestamp = new Date().getTime();
    headers = generateCommonHeaders(envStore,method, body!==null?Object.keys(body).length !== 0 ? body :method.toUpperCase() == "get".toUpperCase() ?"":body :"", method.toUpperCase() == "get".toUpperCase() ? "" : 'application/json', path);
    return new Promise(function (resolve, reject) {
        axios({
            method: method,
            url: uri + path,
            params: query,
            headers: headers,
            data: body,
            auth: {
                username: `${envStore && envStore.clientid ? envStore.clientid : apiClientId}`,
                password: `${envStore && envStore.clientkey ? envStore.clientkey : apiClientSecret}`,
            }

        }).then(function (response) {
            console.log("hit api blibli ->>")
            console.log(response.config);
            console.log(response.data);
            if (response.data.success) {
                responseData.code = response.status;
                responseData.message = 'Your request has been processed successfully';
                if (response.data!==undefined&&response.data!==null) { 
                    responseData.data = response.data; 
                } else {
                    responseData.data = response.content;
                }

            } else {
                responseData.code = response.status;
                if(response.status==204){
                    responseData.message = 'Your request has been processed successfully';
                }else{
                    responseData.message = response.data.errorMessage;
                }
                if (response.data) { 
                    responseData.data = response.data; 
                } 
            }
            resolve(responseData);

        }).catch((e) => {
            console.log("hit api blibli ->>")
            console.log(e.response.config);
            console.log(e.response.data);
            responseData.code = e.response.status;
            responseData.message = e.response.data.errorMessage;
            if (e.response.data) { 
                responseData.data = e.response.data; 
            } 
            resolve(responseData);
        });
    });
}


function getSingleOrder(envStore,orderNo, orderItemNo) {
    let path = "/proxy/mta/api/businesspartner/v1/order/orderDetail";
    let param = {};
    if (orderNo) param.orderNo = orderNo
    if (orderItemNo) param.orderItemNo = orderItemNo

    return hitApi(method = "get", path, param, {},envStore)
}

function getOrders(envStore,shop_id,   startDate, endDate, page = 0, limit = 50,order_status) {
    let path = "/proxy/seller/v1/orders/packages/filter";
    let param = {};
    if (shop_id) param.storeCode = shop_id
     

    let body = {
        "filter": {
            "statusFPDateRange": {
                "end": endDate,
                "start": startDate
            }
        },
        "sorting": {
            "by": "statusFPUpdatedTimestamp",
            "direction": "DESC"
        },
        "paging": {
            "page": page,
            "size": limit
        }
    }
    if(order_status){
        body['filter'].orderItemStatuses=[`${order_status}`]
    }


    return hitApi(method = "post", path, param, body,envStore)
}

function getProducts(envStore,businessPartnerCode,   buyable, merchantSkus, isArchive, size = 50, page = 0, pickupPointCode, displayable, gdnSku, categoryCode, productName) {
    let path = "/proxy/mta/api/businesspartner/v2/product/getProductList";
    let param = {};
    if (businessPartnerCode) param.businessPartnerCode = businessPartnerCode
     

    let body = {}
    // let body={
    //     "buyable": true,
    //     "merchantSkus": [
    //       "ABC"
    //     ],
    //     "isArchive": false,
    //     "size": 10,
    //     "pickupPointCode": "PP-3000175",
    //     "displayable": true,
    //     "gdnSku": "TOQ-15126-00451-00001",
    //     "categoryCode": "PH-00001",
    //     "page": 0,
    //     "productName": "Pocophone"
    //   }
    if (buyable) body.buyable = buyable
    if (merchantSkus) body.merchantSkus = merchantSkus
    if (isArchive) body.isArchive = isArchive
    if (size) body.size = size
    if (pickupPointCode) body.pickupPointCode = pickupPointCode
    if (displayable) body.displayable = displayable
    if (gdnSku) body.gdnSku = gdnSku
    if (categoryCode) body.categoryCode = categoryCode
    if (productName) body.productName = productName
    body.page = page
    return hitApi(method = "post", path, param, body,envStore)
}

function getSingleProduct(envStore,businessPartnerCode, gdnSku) {

    let path = "/proxy/mta/api/businesspartner/v1/product/detailProduct";
    let param = {};
    if (businessPartnerCode) param.businessPartnerCode = businessPartnerCode
    if (gdnSku) param.gdnSku = gdnSku

    return hitApi(method = "get", path, param, {},envStore)
}

function getBrands(envStore,businessPartnerCode,   brandName, page = 0, size = 50) {
    let path = "/proxy/mta/api/businesspartner/v2/product/getBrands";
    let param = {};
    if (businessPartnerCode) param.businessPartnerCode = businessPartnerCode
     
    if (brandName) param.brandName = brandName
    param.page = page
    if (size) param.size = size

    return hitApi(method = "get", path, param, {},envStore)
}

function updateProductPrice(envStore,itemId,   storeCode, priceReg, priceSale = null) {
    let path = `/proxy/seller/v1/products/${itemId}`;
    let param = {};
     
    if (storeCode) param.storeCode = storeCode
    if (itemId) param['blibli-sku'] = itemId
    let body = {
        price: {
            regular: Number(priceReg)
        }
    }

    return hitApi(method = "put", path, param, body,envStore)
}

function updateProductStock(envStore,itemId,   storeCode, stock) {
    let path = `/proxy/seller/v1/products/${itemId}/stock`;
    let param = {};
     
    if (storeCode) param.storeCode = storeCode
    if (itemId) param[`blibli-sku`] = itemId
    let body = {
        "availableStock": stock
    }

    return hitApi(method = "put", path, param, body,envStore)
}

function getProductDiscussion(envStore,businessPartnerCode,   startDate, endDate, page = 0, size = 50) {
    let path = "/proxy/mta/api/businesspartner/v1/product/discussion/questions";
    let param = {};
    if (businessPartnerCode) param.businessPartnerCode = businessPartnerCode
     
    if (startDate) param.startDate = startDate
    if (endDate) param.endDate = endDate
    param.page = page
    param.sortedBy = 'createdDate'
    param.sortDirection = "DESC"
    if (size) param.size = size

    return hitApi(method = "get", path, param, {},envStore)
}

function getReply(envStore,questionCode, businessPartnerCode,   page = 0, size = 50) {
    let path = `/proxy/mta/api/businesspartner/v1/product/discussion/answers/${questionCode}`;
    let param = {};
    if (businessPartnerCode) param.businessPartnerCode = businessPartnerCode
     
    if (questionCode) param.questionCode = questionCode
    param.page = page
    param.sortedBy = 'createdDate'
    param.sortDirection = "DESC"
    if (size) param.size = size

    return hitApi(method = "get", path, param, {},envStore)
}

function postReply(envStore,questionCode, businessPartnerCode,   answer) {
    let path = `/proxy/mta/api/businesspartner/v1/product/discussion/answers/${questionCode}`;
    let param = {};
    if (businessPartnerCode) param.businessPartnerCode = businessPartnerCode
     
    if (questionCode) param.questionCode = questionCode
    let body = {
        "answer": answer
    }

    return hitApi(method = "post", path, param, body,envStore)
}

function updateState(envStore,productSkus, storeCode,   state) {
    let path = `/proxy/seller/v1/products/statuses/archive`;
    let param = {};
    if (!state) {
        path = `/proxy/seller/v1/products/statuses/unarchive`;
    }
    if (storeCode) param.storeCode = storeCode
     
    if (productSkus) param.productSkus = productSkus
    let body = {
        "productSkus": [
            productSkus
        ]
    }

    return hitApi(method = "post", path, param, body,envStore)
}


function getAllSettlements(envStore,storeCode,   startDate, endDate, page = 0, size = 50) {
    let path = "/proxy/seller/v1/settlements/filter";
    let param = {};
    if (storeCode) param.storeCode = storeCode
     
    param.page = page
    if (size) param.size = size

    let body = {
        "filter": {
            "periodEndDate": endDate,
            "periodStartDate": startDate,
        },
        "paging": {
            "page": page,
            "size": size
        }
    }

    return hitApi(method = "post", path, param, body,envStore)
}

function getSingleSettlement(envStore,settlementId, storeCode) {
    let path = `/proxy/seller/v1/settlements/${settlementId}`;
    let param = {};
    if (storeCode) param.storeCode = storeCode
     
    if (settlementId) param.settlementId = settlementId

    return hitApi(method = "get", path, param, {},envStore)
}

function getAttribute(envStore,categoryCode, storeCode) {
    let path = `/proxy/seller/v1/categories/${categoryCode}/attributes`;
    let param = {};
    if (storeCode) param.storeCode = storeCode
     
    if (categoryCode) param['category-code'] = categoryCode

    return hitApi(method = "get", path, param, {},envStore)
}

function getCategory(envStore,businessPartnerCode) {
    let path = `/proxy/mta/api/businesspartner/v1/product/getCategory`;
    let param = {};
    if (businessPartnerCode) param.businessPartnerCode = businessPartnerCode

    return hitApi(method = "get", path, param, {},envStore)
}

function getPickupPoint(envStore,businessPartnerCode) {
    let path = `/proxy/mta/api/businesspartner/v1/product/getPickupPoint`;
    let param = {};
    if (businessPartnerCode) param.businessPartnerCode = businessPartnerCode

    return hitApi(method = "get", path, param, {},envStore)
}

function createProductV3(envStore,storeCode,   attributes, brandCode, categoryCode, description, dimension, imageMap, logistics, name, newBrand, pickupPointCode
    , uniqueSellingPoint, preOrder, productItems, productType, videoUrl) {
    let path = `/proxy/seller/v1/products/async`;
    let param = {};
    if (storeCode) param.storeCode = storeCode;
     ;

    let bodyObj = {};

    if (attributes) bodyObj.attributes = attributes;
    if (brandCode) bodyObj.brandCode = brandCode;
    if (categoryCode) bodyObj.categoryCode = categoryCode;
    if (description) bodyObj.description = formatBase64(description);
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
    return hitApi(method = "post", path, param, body,envStore)
}

function updateProduct(envStore,merchantCode, attributes, description, items, productName, productSku, productStory, productType, url) {
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


    return hitApi(method = "post", path, param, body,envStore)
}


function getCreationStatus(envStore,productSKu, storeCode) {
    let path = `/proxy/seller/v1/product-submissions/${productSKu}`;
    let param = {};
    if (storeCode) param.storeCode = storeCode
     
    if (productSKu) param[`product-sku`] = productSKu

    return hitApi(method = "get", path, param,null,envStore)
}


function acceptOrder(envStore,orderId, businessPartnerCode) {
    let path = `/proxy/mta/api/businesspartner/v1/order/createPackage`;
    let param = {};
    if (businessPartnerCode) param.businessPartnerCode = businessPartnerCode
    let body = {
        "orderItemIds": orderId
    }

    return hitApi(method = "post", path, param, body,envStore)
}


function getAllReturns(envStore,businessPartnerCode, page, size, orderIdOrItemId, returDate, rmaResolution, status) {
    let path = `/proxy/mta/api/businesspartner/v1/order/getReturnedOrderSummary`;
    let param = {};
    if (businessPartnerCode) param.businessPartnerCode = businessPartnerCode
    if (orderIdOrItemId) param.orderIdOrItemId = orderIdOrItemId
    if (returDate) param.returDate = returDate
    if (rmaResolution) param.rmaResolution = rmaResolution
    if (status) param.status = status

    if (page) param.page = page
    if (size) param.size = size

    return hitApi(method = "get", path, param,null,envStore)
}

function getSingleReturn(envStore,businessPartnerCode, rmaId, orderNo, orderItemNo) {
    let path = `/proxy/mta/api/businesspartner/v1/order/getReturnedOrderDetail`;
    let param = {};
    if (businessPartnerCode) param.businessPartnerCode = businessPartnerCode
    if (rmaId) param.rmaId = rmaId
    if (orderNo) param.orderNo = orderNo
    if (orderItemNo) param.orderItemNo = orderItemNo

    return hitApi(method = "get", path, param,null,envStore)
}

function getLogistics(envStore,storeCode	) {
    let path = `/proxy/seller/v1/logistics`;
    let param = {};
    if (storeCode) param.storeCode = storeCode

    return hitApi(method = "get", path, param,null,envStore)
}


function regularPickup(envStore,packageid, storeCode,   awbNo) {
    let path = `/proxy/seller/v1/orders/regular/${packageid}/fulfill`;
    let param = {};
    let body = {};
     
    if (storeCode) param.storeCode = storeCode
    if (packageid) param['package-id'] = packageid

    if (awbNo) body.awbNo = awbNo

    return hitApi(method = "post", path, param, body,envStore)
}

function bopisPickup(envStore,orderItemId, itemSkuCode) {
    let path = `/proxy/mta/api/businesspartner/v1/order/fulfillBopis`;
    let param = {};
    let body = {};
    if (orderItemId) body.orderItemId = orderItemId
    if (itemSkuCode) body.itemSkuCode = itemSkuCode

    return hitApi(method = "post", path, param, body,envStore)
}

function partialPickup(envStore,reason, orderNo, completeQuantity, orderItemNo) {
    let path = `/proxy/mta/api/businesspartner/v1/order/partialFulfill`;
    let param = {};
    let body = {};
    if (orderItemNo) body.orderItemNo = orderItemNo
    if (completeQuantity) body.completeQuantity = completeQuantity
    if (reason) body.reason = reason
    if (orderNo) body.orderNo = orderNo

    return hitApi(method = "post", path, param, body,envStore)
}

function bigProductPickup(envStore,packageid, storeCode,   deliveryStartDate, deliveryEndDate, courierName, courierType, settlementCode) {
    let path = `/proxy/seller/v1/orders/shipping-by-seller/${packageid}/ready-to-ship`;
    let param = {};
    let body = {};

    let courier = {};


    if (courierName) courier.name = courierName
    if (courierType) courier.type = courierType

    let deliveryDate = {};
    if (deliveryStartDate) deliveryDate.end = deliveryStartDate
    if (deliveryEndDate) deliveryDate.start = deliveryStartDate


    if (settlementCode) body.settlementCode = settlementCode
    if (deliveryDate !== {}) body.deliveryDate = deliveryDate
    if (courier !== {}) body.courier = courier


     
    if (storeCode) param.storeCode = storeCode
    if (packageid) param.packageid = packageid

    return hitApi(method = "post", path, param, body,envStore)
}
function getUUID() {
    return new Promise(function (resolve, reject) {
        axios.get('https://www.uuidgenerator.net/api/version1', {
            headers: {
                Accept: 'application/json'
            }
        }).then(function (response) {
            resolve(response.data[0]);
        }).catch((e) => {
            resolve(e.response.data);
        });
    });
}

function getQueueDetail(envStore,businessPartnerCode,queueid) {
    let path = `/proxy/mta/api/businesspartner/v1/feed/detail`;
    let param = {};
    if (businessPartnerCode) param.businessPartnerCode = businessPartnerCode
    param.requestId=queueid;
    return hitApi(method = "get", path, param,null,envStore)
}


function getQueuelist(envStore,businessPartnerCode,page,size,queueAction,status) {
    let path = `/proxy/mta/api/businesspartner/v1/feed/list`;
    let param = {};
    if (businessPartnerCode) param.businessPartnerCode = businessPartnerCode
    if (queueDate) param.queueDate = queueDate

    if (page) param.page = page
    if (size) param.size = size
    if (queueAction) param.queueAction = queueAction
    if (status) param.status = status

    return hitApi(method = "get", path, param,null,envStore)
}


function getSubmissionlist(envStore,storeCode,page=0,size=50,sellerSku,state) {
    let path = `/proxy/seller/v1/product-submissions/filter`;
    let param = {};
    if (storeCode) param.storeCode = storeCode

    let body={};
    let paging={};
    if (page) paging.page = page
    if (size) paging.size = size

    let filter={};
    if (sellerSku) filter.sellerSku = sellerSku
    if (state) filter.state = state

    body[paging]=paging;
    if(sellerSku||state)body[filter]=filter;

    return hitApi(method = "post", path, param,body,null,envStore)
}

function getDownloadAirwayBill(envStore,businessPartnerCode,orderItemNo) {
    let path = `/proxy/mta/api/businesspartner/v1/order/downloadAirwayBill`;
    let param = {};
    if (businessPartnerCode) param.businessPartnerCode = businessPartnerCode
    if (orderItemNo) param.orderItemNo = orderItemNo
    return hitApi(method = "get", path, param,null,envStore)
}


module.exports = {getDownloadAirwayBill,getLogistics,getQueueDetail,getSubmissionlist,getQueuelist, partialPickup, bopisPickup, regularPickup, bigProductPickup, getAttribute, getCreationStatus, getPickupPoint, getSingleOrder, getOrders, getProducts, getSingleProduct, getBrands, updateProductPrice, updateProductStock, getProductDiscussion, getCategory, getReply, postReply, getAllSettlements, getSingleSettlement, updateProduct, createProductV3, acceptOrder, updateState, getAllReturns, getSingleReturn };


