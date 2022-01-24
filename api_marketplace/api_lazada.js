const axios = require('axios');
const crypto = require('crypto');

let appKey = 123456;
let appSecret = "helloworld";
let uri = "https://api.lazada.co.id/rest";


function sign(apiName, param = {}) {
    param = Object.fromEntries(
        Object.entries(param).sort(([, a], [, b]) => a - b)
    );
    let stringToBeSigned = apiName;
    // let body = "";
    for (const [key, value] of Object.entries(param)) {
        stringToBeSigned = stringToBeSigned.concat(`${key}${value}`)
    }
    var hmac = crypto.createHmac('sha256', appSecret);
    //passing the data to be hashed
    let data = hmac.update(stringToBeSigned);
    //Creating the hmac in the required format
    return data.digest('hex');
}


function getCommonParam() {
    let param = {
        app_key: appKey,
        timestamp: new Date().getTime(),
        sign_method: 'sha256'
    }
    return param;
}


async function hitApi(method = "", path = "", query = {}, body = {}, headers = {}) {
    let responseData = {};
    responseData.marketplace = "lazada"
    responseData.timestamp = new Date().getTime();
    let token = await getToken('0_2DL4DV3jcU1UOT7WGI1A4rY91', path);
    console.log(token);
    query.access_token = token;
    query.sign = sign(path, query)
    return new Promise(function (resolve, reject) {
        axios({
            method: method,
            url: uri + path,
            params: query,

        }).then(function (response) {
            console.log(response);
            responseData.code = response.status;
            responseData.message = response.data.message;
            resolve(responseData);

        }).catch((e) => {
            responseData.code = e.response.status;
            responseData.message = response.data.message;
            resolve(responseData);
        });
    });
}


function getToken(code, path) {
    let path_get_token = '/auth/token/create'
    let param = getCommonParam();
    param.code = code;
    param.sign = sign(path, param)

    let header = {
        'Content-Type': 'application/x-www-form-urlencodedcharset=utf-8'
    }
    return new Promise(function (resolve, reject) {
        axios({
            method: 'post',
            url: uri + path_get_token,
            params: param,
            headers: header

        }).then(function (response) {
            if (response.data.access_token) {
                resolve(response.data.access_token);
            } else {
                resolve("token");
            }

        }).catch((e) => {
            resolve(e.response);
        });
    });
}


function getSingleOrder(order_id) {
    let path = '/order/get'
    let param = getCommonParam();
    if (order_id) param.order_id = order_id;
    return hitApi("get", path, param, {}, {})
}



function getOrders(offset = 0, limit = 50, created_before, created_after) {
    let path = '/orders/get'
    let param = getCommonParam();
    param.sort_direction = 'DESC';
    param.offset = offset;
    if (limit) param.limit = limit;
    param.sort_by = 'created_at';
    if (created_before) param.created_before = created_before + "T00:00:00+07:00";
    if (created_after) param.created_after = created_after + "T00:23:59+07:00";;

    return hitApi("get", path, param, {}, {})
}

function getProducts(offset = 0, limit = 50) {
    let path = '/orders/get'
    let param = getCommonParam();
    param.offset = offset;
    if (limit) param.limit = limit;

    param.filter = 'all';
    param.options = 1

    return hitApi("get", path, param, {}, {})
}

function getSingleProduct(product_id) {
    let path = '/product/item/get'
    let param = getCommonParam();
    if (product_id) param.item_id = product_id;

    return hitApi("get", path, param, {}, {})
}

function updateProductStock(product_id, stock) {
    let path = '/product/price_quantity/update'
    let param = getCommonParam();
    if (product_id) param.item_id = product_id;

    let payload = `
        <Request>
        <Product>
            <Skus>
            <Sku>
                <ItemId>${product_id}</ItemId>
                <SkuId></SkuId>
                <SellerSku></SellerSku>
                <Price></Price>
                <SalePrice></SalePrice>
                <SaleStartDate></SaleStartDate>
                <SaleEndDate></SaleEndDate>
                <Quantity>${stock}</Quantity>
            </Sku>
            </Skus>
        </Product>
        </Request>
        `
    param.payload = payload
    let header = {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
    }
    return hitApi("post", path, param, {}, header)
}

function updateProductPrice(product_id, price) {
    let path = '/product/price_quantity/update'
    let param = getCommonParam();
    if (product_id) param.item_id = product_id;

    let payload = `
            <Request>
            <Product>
                <Skus>
                <Sku>
                    <ItemId>${product_id}</ItemId>
                    <SkuId></SkuId>
                    <SellerSku></SellerSku>
                    <Price>${price}</Price>
                    <SalePrice></SalePrice>
                    <SaleStartDate></SaleStartDate>
                    <SaleEndDate></SaleEndDate>
                    <Quantity></Quantity>
                </Sku>
                </Skus>
            </Product>
            </Request>
            `
    param.payload = payload
    let header = {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
    }
    return hitApi("post", path, param, {}, header)
}


function getAllSettlements(offset = 0, limit = 50,start_time,end_time) {
    let path = '/finance/transaction/detail/get'
    let param = getCommonParam();
    param.offset = offset;
    if (limit) param.limit = limit;

    if (start_time)param.start_time = start_time;;
    if (end_time)param.end_time = end_time;

    return hitApi("get", path, param, {}, {})
}

function createProduct(payload) {
    let path = '/product/create'
    let param = getCommonParam();
    if (payload) param.payload = payload;

    return hitApi("post", path, param, {}, {})
}

function updateProduct(payload) {
    let path = '/product/update'
    let param = getCommonParam();
    if (payload) param.payload = payload;

    return hitApi("post", path, param, {}, {})
}

function acceptOrder(order_item_ids,shipping_provider,delivery_type) {
    let path = '/order/pack'
    let param = getCommonParam();
    if (order_item_ids) param.order_item_ids = order_item_ids;
    if (shipping_provider) param.shipping_provider = shipping_provider;
    if (delivery_type) param.delivery_type = delivery_type;

    return hitApi("post", path, param, {}, {})
}

function cancelOrder(reason_detail,reason_id,order_item_id) {
    let path = '/order/cancel'
    let param = getCommonParam();
    if (reason_detail) param.reason_detail = reason_detail;
    if (order_item_id) param.order_item_id = order_item_id;
    if (reason_id) param.reason_id = reason_id;

    return hitApi("post", path, param, {}, {})
}

module.exports = { getSingleOrder, getOrders, getProducts, getSingleProduct,updateProductPrice,updateProductStock,getAllSettlements ,updateProduct,createProduct,acceptOrder,cancelOrder};