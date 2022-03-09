const axios = require('axios');
const crypto = require('crypto');
const db = require('mariadb')
const { conf, env } = require('../conf')
const LazadaAPI = require('lazada-open-platform-sdk')

function jsonS(d) { return JSON.stringify(d) }
function jsonP(d) { return d ? JSON.parse(d) : {} }
function jsonPs(d) { return jsonP(jsonS(d)) }

const pl = db.createPool(conf.db)
async function eq(q) {
    let cn, rw
    try {
        cn = await pl.getConnection()
        rw = await cn.query(q)
    } catch (err) {
        rw = err
    } finally {
        if (cn) cn.end()
        return rw
    }
}

async function getEnvStores() {
    const rs = await eq(
        `select nama_toko, marketplace, shop_id, api_url, clientid, clientkey, token, refresh, code_1, code_2, code_3, code_4, code_5, tipe from stores where status = "1"`
    )
    if (rs && rs.text) console.log(rs)
    else {
        // process.env.mpstores = jsonS(rs)
        const mpstores = rs ? rs : []
        for (const mpstore of mpstores) {
            // process.env['mpstore' + mpstore.shop_id] = jsonS(mpstore)
            process.env['mpstore' + mpstore.shop_id + mpstore.marketplace] = jsonS(mpstore)
        }
    }
    // console.log(process.env)
}

let appKey = 106390;
let appSecret = "35D7YglUofxHQRZ85xzLd7dopVjo4XBw";
let uri = "https://api.lazada.co.id/rest";
let code = '0_106390_SR4fQYxl76PgUUSDtrjb8FHm901'


function sign(envStore, apiName, param = {}) {
    param = Object.keys(param).sort().reduce(
        (obj, key) => {
            obj[key] = param[key];
            return obj;
        },
        {}
    );
    let stringToBeSigned = apiName;
    // let body = "";
    for (const [key, value] of Object.entries(param)) {
        stringToBeSigned = stringToBeSigned.concat(`${key}${value}`)
    }
    var hmac = crypto.createHmac('sha256', `${envStore && envStore.clientkey ? envStore.clientkey : appSecret}`);
    //passing the data to be hashed
    let data = hmac.update(stringToBeSigned);
    //Creating the hmac in the required format
    return data.digest('hex').toUpperCase();

}


function getCommonParam(envStore) {
    let param = {
        app_key: `${envStore && envStore.clientid ? envStore.clientid : appKey}`,
        timestamp: new Date().getTime(),
        sign_method: 'sha256'
    }
    return param;
}


async function hitApi(envStore, method = "", path = "", query = {}, body = {}, headers = {},encode=false) {
    let responseData = {};
    responseData.marketplace = "lazada"
    responseData.timestamp = new Date().getTime();
    let token = await envStore && envStore.refresh ? await getAccessTokenByRefreshToken(envStore, envStore.refresh) : envStore && envStore.token ? envStore.token : '';
    query.access_token = token;
    query.sign = sign(envStore, path, query)
    return new Promise(function (resolve, reject) {
        axios({
            method: method,
            url: `${envStore && envStore.api_url ? envStore.api_url : uri}` + path,
            params: query,

        }).then(function (response) {
            console.log("hit api lazada ->>")
            console.log(response.config);
            console.log(response.data);
            responseData.code = response.status;
            if (response.data.code == '0' && !response.data.detail) {
                responseData.message = 'Your request has been processed successfully';
            } else if (response.data.detail) {
                responseData.message = response.data.message ? response.data.message + ", " : '' + response.data.detail[0].message;
            } else {
                responseData.message = response.data.message;
            }
            responseData.codeStatus = response.data.code;
            responseData.data = response.data.data == null ? response.data.result!=null?response.data.result:response.data : response.data.data;
            let buff = new Buffer(responseData.data.document.file, 'base64');
            let text = buff.toString('UTF-8');  
            if(encode){
                resolve(text)
            }else{
            resolve(responseData);
            }

        }).catch((e) => {
            console.log("hit api lazada ->>")
            console.log(e.response.config);
            console.log(e.response.data);
            responseData.code = e.response.status;
            responseData.message = response.data.message;
            resolve(responseData);
        });
    });
}

function getAuthLink(envStore) {
    let urlLazada = `https://auth.lazada.com/oauth/authorize?response_type=code&force_auth=true&redirect_uri=${envStore && envStore.code_2 ? envStore.code_2 : 'https://wms.gosyenretail.co.id/'}&client_id=${envStore && envStore.clientid ? envStore.clientid : appKey}`;
    return urlLazada;
}

async function getAccessTokenByRefreshToken(envStore, refreshtoken) {
    const aLazadaAPI = new LazadaAPI(`${envStore && envStore.clientid ? envStore.clientid : appKey}`, `${envStore && envStore.clientkey ? envStore.clientkey : appSecret}`, 'INDONESIA')
    return new Promise(function (resolve, reject) {
        aLazadaAPI
            .refreshAccessToken({ refresh_token: refreshtoken })
            .then(async function (response) {
                const { access_token, refresh_token } = response // JSON data from Lazada's API
                if (access_token) {
                    console.log("generate access token ->>")
                    console.log(response)
                    const rs = await eq(
                        `update stores set updatedby='sys_mpapi_shopee_stores', updatedtime=CURRENT_TIMESTAMP, token='${access_token}' ,refresh='${refresh_token}' where shop_id='${envStore.shop_id}' and marketplace='${envStore.marketplace}'`
                    )
                    if (rs && rs.text) console.log(rs)
                    else {
                        getEnvStores()
                        resolve(access_token)
                    }
                } else {
                    resolve(`${envStore && envStore.token ? envStore.token : ''}`);
                }
            }).catch((e) => {
                resolve(`${envStore && envStore.token ? envStore.token : ''}`);
            });
    });
}

function getRefreshToken(envStore, refreshtoken) {
    const aLazadaAPI = new LazadaAPI(`${envStore && envStore.clientid ? envStore.clientid : appKey}`, `${envStore && envStore.clientkey ? envStore.clientkey : appSecret}`, 'INDONESIA')
    let responseData = {};
    responseData.marketplace = "lazada"
    responseData.timestamp = new Date().getTime();
    responseData.message = 'Your request has been processed successfully';
    return new Promise(function (resolve, reject) {
        aLazadaAPI
            .refreshAccessToken({ refresh_token: refreshtoken })
            .then(async function (response) {
                console.log("generate access token ->>")
                console.log(response)
                const { access_token, refresh_token } = response // JSON data from Lazada's API
                if (access_token) {
                    responseData.code = 200
                    responseData.data = response
                    const rs = await eq(
                        `update stores set updatedby='sys_mpapi_shopee_stores', updatedtime=CURRENT_TIMESTAMP, token='${access_token}' ,refresh='${refresh_token}' where shop_id='${envStore.shop_id}' and marketplace='${envStore.marketplace}'`
                    )
                    if (rs && rs.text) console.log(rs)
                    else {
                        responseData.data = response
                        getEnvStores()
                        resolve(responseData)
                    }
                } else {
                    responseData.code = 500
                    responseData.message = response.message
                    responseData.data = response
                    resolve(responseData)
                }
            }).catch((e) => {
                console.log(e);
                responseData.code = 500
                responseData.message = e.message
                responseData.data = e
                resolve(responseData)
            });
    });
}


function getToken(envStore, code) {
    const aLazadaAPI = new LazadaAPI(`${envStore && envStore.clientid ? envStore.clientid : appKey}`, `${envStore && envStore.clientkey ? envStore.clientkey : appSecret}`, 'INDONESIA')
    let responseData = {};
    responseData.marketplace = "lazada"
    responseData.timestamp = new Date().getTime();
    responseData.message = 'Your request has been processed successfully';
    return new Promise(function (resolve, reject) {
        aLazadaAPI
            .generateAccessToken({ code: code })
            .then(async function (response) {
                console.log("generate access token ->>")
                console.log(response)
                const { access_token, refresh_token } = response // JSON data from Lazada's API
                if (access_token) {
                    responseData.code = 200
                    responseData.data = response
                    const rs = await eq(
                        `update stores set updatedby='sys_mpapi_shopee_stores', updatedtime=CURRENT_TIMESTAMP, token='${access_token}' ,refresh='${refresh_token}' where shop_id='${envStore.shop_id}' and marketplace='${envStore.marketplace}'`
                    )
                    if (rs && rs.text) console.log(rs)
                    else {
                        responseData.data = response
                        getEnvStores()
                        resolve(responseData)
                    }
                } else {
                    responseData.code = 500
                    responseData.message = response.message
                    responseData.data = response
                    resolve(responseData)
                }
            }).catch((e) => {
                console.log(e);
                responseData.code = 500
                responseData.message = e.message
                responseData.data = e
                resolve(responseData)
            });
    });
}


async function getSingleOrder(envStore, order_id) {
    let path = '/order/get'
    let param = getCommonParam(envStore);
    if (order_id) param.order_id = order_id;
    let response=await hitApi(envStore, "get", path, param, {}, {});
    let order_items=await getOrderItems(envStore,order_id);
    if(order_items.data!==null||order_items.data!==undefined)response.data['order_items']=order_items.data;
    return response;
}

function getOrderItems(envStore, order_id) {
    let path = '/order/items/get'
    let param = getCommonParam(envStore);
    if (order_id) param.order_id = order_id;
    return hitApi(envStore, "get", path, param, {}, {})
}

function getDocumentAWB(envStore, order_item_ids) {
    let path = '/order/document/awb/html/get'
    let param = getCommonParam(envStore);
    if (order_item_ids) param.order_item_ids = order_item_ids;
    return hitApi(envStore, "get", path, param, {}, {},true)
}


function getOrders(envStore, offset = 0, limit = 50, created_before, created_after) {
    let path = '/orders/get'
    let param = getCommonParam(envStore);
    param.sort_direction = 'DESC';
    param.offset = offset;
    if (limit) param.limit = limit;
    param.sort_by = 'created_at';
    if (created_before) param.created_before = created_before + "T00:00:00+07:00";
    if (created_after) param.created_after = created_after + "T00:23:59+07:00";;

    return hitApi(envStore, "get", path, param, {}, {})
}




function getProducts(envStore, offset = 0, limit = 50) {
    let path = '/products/get'
    let param = getCommonParam(envStore);
    param.offset = offset;
    if (limit) param.limit = limit;

    param.filter = 'all';
    param.options = 1

    return hitApi(envStore, "get", path, param, {}, {})
}

function getSingleProduct(envStore, product_id) {
    let path = '/product/item/get'
    let param = getCommonParam(envStore);
    if (product_id) param.item_id = product_id;

    return hitApi(envStore, "get", path, param, {}, {})
}

function updateProductStock(envStore, product_id, stock, sku_id) {
    let path = '/product/price_quantity/update'
    let param = getCommonParam(envStore);
    if (product_id) param.item_id = product_id;

    let payload = `
        <Request>
        <Product>
            <Skus>
            <Sku>
                <ItemId>${product_id}</ItemId>
                <SkuId>${sku_id}</SkuId>
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
    return hitApi(envStore, "post", path, param, {}, header)
}

function updateState(envStore, product_id, sku) {
    let path = '/product/deactivate'
    let param = getCommonParam(envStore);
    if (product_id) param.item_id = product_id;
    if (sku) param.sku = sku;

    let payload = `
    <Request>     
    <Product>         
        <ItemId>${product_id}</ItemId>         
        ${sku ? `<Skus><SellerSku>${sku}</SellerSku></Skus>` : ""}
    </Product> 
    </Request>`
    param.apiRequestBody = payload
    let header = {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
    }
    return hitApi(envStore, "post", path, param, {}, header)
}


function removeProduct(envStore, product_id, skuId) {
    let path = '/product/remove'
    let param = getCommonParam(envStore);
    if (seller_sku_list) param.seller_sku_list = `SkuId_${product_id}_${skuId}`;

    return hitApi(envStore, "post", path, param, {}, header)
}

function updateProductPrice(envStore, product_id, price, sku_id) {
    let path = '/product/price_quantity/update'
    let param = getCommonParam(envStore);
    // if (product_id) param.item_id = product_id;
    // if (sku_id) param.sku_id = sku_id;

    let payload = `
    <Request>
    <Product>
      <Skus>
        <Sku>
          <ItemId>${product_id}</ItemId>
          <SkuId>${sku_id}</SkuId>
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
    return hitApi(envStore, "post", path, param, {}, header)
}


function getAllSettlements(envStore, offset = 0, limit = 50, start_time, end_time) {
    let path = '/finance/transaction/detail/get'
    let param = getCommonParam(envStore);
    param.offset = offset;
    if (limit) param.limit = limit;

    if (start_time) param.start_time = start_time;;
    if (end_time) param.end_time = end_time;

    return hitApi(envStore, "get", path, param, {}, {})
}

function createProduct(envStore, category_id, productImages, product_name, short_description, brand, variant) {
    let path = '/product/create'
    let param = getCommonParam(envStore);
    param.payload = `<Request>
    <Product>
    <PrimaryCategory>${category_id}</PrimaryCategory>
    <SPUId></SPUId>
    <AssociatedSku></AssociatedSku>
    <Images>${productImages}</Images> 
    <Attributes> 
    <name>${product_name}</name> 
    <short_description>${short_description}</short_description> 
    <brand>${brand}</brand>
    <warranty_type>No Warranty</warranty_type> 
    </Attributes> 
    <Skus> 
    ${variant}
    </Skus> 
    </Product> 
    </Request>`;
    return hitApi(envStore, "post", path, param, {}, {})
}

function updateProduct(envStore, ItemId, category_id, product_name, short_description, brand, variant) {
    let path = '/product/update'
    let param = getCommonParam(envStore);
    param.payload = `
        <Request>     
            <Product>
            ${category_id ? `<PrimaryCategory>${category_id}</PrimaryCategory>` : ''}
            ${ItemId ? `<ItemId>${ItemId}</ItemId>` : ''}
            ${product_name || short_description || brand ? `
            <Attributes>             
            ${product_name ? `<name>${product_name}</name>` : ''}
            ${short_description ? `<short_description>${short_description}</short_description>` : ''}
            ${brand ? `<brand>${brand}</brand>` : ''}      
            <delivery_option_sof>Yes</delivery_option_sof>
            </Attributes>  `: ''}       
            <Skus>             
            ${variant}
            </Skus>     
            </Product> 
        </Request>`

    return hitApi(envStore, "post", path, param, {}, {})
}

function acceptOrder(envStore, order_item_ids, shipping_provider, delivery_type) {
    let path = '/order/pack'
    let param = getCommonParam(envStore);
    if (order_item_ids) param.order_item_ids = order_item_ids;
    if (shipping_provider) param.shipping_provider = shipping_provider;
    if (delivery_type) param.delivery_type = delivery_type;
    return hitApi(envStore, "post", path, param, {}, {})
}

function orderRts(envStore, order_item_ids, shipping_provider, delivery_type, tracking_number) {
    let path = '/order/rts'
    let param = getCommonParam(envStore);
    if (order_item_ids) param.order_item_ids = order_item_ids;
    if (shipping_provider) param.shipping_provider = shipping_provider;
    if (delivery_type) param.delivery_type = delivery_type;
    if (tracking_number) param.tracking_number = tracking_number;
    return hitApi(envStore, "post", path, param, {}, {})
}

function cancelOrder(envStore, reason_detail, order_item_id) {
    let path = '/order/cancel'
    let param = getCommonParam(envStore);
    if (reason_detail) param.reason_detail = reason_detail;
    if (order_item_id) param.order_item_id = order_item_id;
    param.reason_id = 15;

    return hitApi(envStore, "post", path, param, {}, {})
}


function getCategory(envStore, keyword) {
    let path = (keyword) ? '/product/category/suggestion/get' : '/category/tree/get';
    let param = getCommonParam(envStore);

    if (keyword) {
        param.product_name = keyword;
    } else {
        param.language_code = 'id_ID'
    }

    return hitApi(envStore, "get", path, param, {}, {})
}

function getAttribute(envStore, category_id, language_code) {
    let path = '/category/attributes/get';
    let param = getCommonParam(envStore);

    if (category_id) param.primary_category_id = category_id;
    if (language_code) param.language_code = language_code;

    return hitApi(envStore, "get", path, param, {}, {})
}

function getBrands(envStore, page = 0, size = 50) {
    let path = '/category/brands/query';
    let param = getCommonParam(envStore);

    param.startRow = page;
    if (size) param.pageSize = size;
    param.languageCode = 'id_ID'

    return hitApi(envStore, "get", path, param, {}, {})
}


function getSingleReturn(envStore, reverse_order_id) {
    let path = '/order/reverse/return/detail/list';
    let param = getCommonParam(envStore);

    if (reverse_order_id) param.reverse_order_id = reverse_order_id;

    return hitApi(envStore, "get", path, param, {}, {})
}

function getAllReturns(envStore, page_size, page_no) {
    let path = '/reverse/getreverseordersforseller';
    let param = getCommonParam(envStore);

    if (page_size) param.page_size = page_size;
    if (page_no) param.page_no = page_no;

    return hitApi(envStore, "get", path, param, {}, {})
}


function acceptRejectReturn(envStore, action, reverse_order_id, reverse_order_item_ids, reason_id, comment, image_info) {
    let path = '/order/reverse/return/update';
    let param = getCommonParam(envStore);

    if (action) param.action = action;
    if (reverse_order_id) param.reverse_order_id = reverse_order_id;
    if (reverse_order_item_ids) param.reverse_order_item_ids = reverse_order_item_ids;
    if (reason_id!==null && reason_id!==undefined) param.reason_id = reason_id;
    if (comment) param.comment = comment;
    if (image_info) param.image_info = image_info;

    return hitApi(envStore, "get", path, param, {}, {})
}


function getReviewProduct(envStore, item_id, current, page_size, order_id, start_time, end_time, status_filter, content_filter) {
    let path = '/review/seller/list';
    let param = getCommonParam(envStore);

    if (item_id) param.item_id = item_id;
    if (current) param.current = reverse_order_id;
    if (page_size) param.page_size = page_size;
    if (order_id) param.order_id = order_id;
    if (start_time) param.start_time = start_time;
    if (end_time) param.end_time = end_time;
    if (status_filter) param.status_filter = status_filter;
    if (content_filter) param.content_filter = content_filter;

    return hitApi(envStore, "get", path, param, {}, {})
}


function sellerPostReview(envStore, id, content) {
    let path = '/review/seller/reply/add';
    let param = getCommonParam(envStore);

    if (id) param.id = id;
    if (content) param.content = content;

    return hitApi(envStore, "get", path, param, {}, {})
}
module.exports = { getDocumentAWB,getAuthLink, getToken, getRefreshToken, removeProduct, orderRts, getAttribute, updateState, getBrands, getCategory, getSingleOrder, getOrders, getProducts, getSingleProduct, updateProductPrice, updateProductStock, getAllSettlements, updateProduct, createProduct, acceptOrder, cancelOrder, getSingleReturn, getAllReturns, acceptRejectReturn, getReviewProduct, sellerPostReview };