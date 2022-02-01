const axios = require('axios');
const crypto = require('crypto');

let appKey = 106390;
let appSecret = "35D7YglUofxHQRZ85xzLd7dopVjo4XBw";
let uri = "https://api.lazada.co.id/rest";
let code = '0_106390_SR4fQYxl76PgUUSDtrjb8FHm901'


function sign(apiName, param = {}) {
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
        console.log(value);
        stringToBeSigned = stringToBeSigned.concat(`${key}${value}`)
    }
    console.log(param);
    console.log(stringToBeSigned);
    var hmac = crypto.createHmac('sha256', appSecret);
    //passing the data to be hashed
    let data = hmac.update(stringToBeSigned);
    //Creating the hmac in the required format
    return data.digest('hex').toUpperCase();

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
    let token = '50000301e03rhbe1e09497dbremzyGoDRHajVuIl0HtxgwTyQQQvvgsfvXrkHi9'
    query.access_token = token;
    query.sign = sign(path, query)
    console.log(query.sign);
    return new Promise(function (resolve, reject) {
        axios({
            method: method,
            url: uri + path,
            params: query,

        }).then(function (response) {
            console.log(response.config.params);
            console.log(response.data);
            responseData.code = response.status;
            if (response.data.code == '0') {
                responseData.message = 'Your request has been processed successfully';
            } else {
                responseData.message = response.data.message;
            }
            responseData.codeStatus=response.data.code;
            responseData.data = response.data.data==null?response.data.result:response.data.data;
            resolve(responseData);

        }).catch((e) => {
            responseData.code = e.response.status;
            responseData.message = response.data.message;
            resolve(responseData);
        });
    });
}


function getToken(code) {
    let path_get_token = '/auth/token/create'
    let param = getCommonParam();
    param.code = code;
    param.sign = sign(path_get_token, param)

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
            console.log(response.config.url);
            console.log(response.config.params);
            console.log(response.config.data);
            console.log(response.data);
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
    let path = '/products/get'
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

function updateProductStock(product_id, stock, sku_id) {
    let path = '/product/price_quantity/update'
    let param = getCommonParam();
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
    return hitApi("post", path, param, {}, header)
}

function updateState(product_id, sku) {
    let path = '/product/deactivate'
    let param = getCommonParam();
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
    return hitApi("post", path, param, {}, header)
}

function updateProductPrice(product_id, price, sku_id) {
    let path = '/product/price_quantity/update'
    let param = getCommonParam();
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
    return hitApi("post", path, param, {}, header)
}


function getAllSettlements(offset = 0, limit = 50, start_time, end_time) {
    let path = '/finance/transaction/detail/get'
    let param = getCommonParam();
    param.offset = offset;
    if (limit) param.limit = limit;

    if (start_time) param.start_time = start_time;;
    if (end_time) param.end_time = end_time;

    return hitApi("get", path, param, {}, {})
}

function createProduct(category_id, productImages, product_name, short_description, brand, model, kid_years, videoId, delivery_option_sof, sellerSku, color_family, size, stock
    , price, length, height, weight, width, content, skuImages) {
    let path = '/product/create'
    let param = getCommonParam();
    param.payload = `<Request><Product><PrimaryCategory>${category_id}</PrimaryCategory><SPUId/><AssociatedSku/><Images> ${productImages} </Images> <Attributes> <name>${product_name}</name> <short_description>${short_description}</short_description> <brand>${brand}</brand> ${model ? `<model>${model}</model>` : ""} ${kid_years ? `<kid_years>${kid_years}</kid_years>` : ""} ${videoId ? `<video>${videoId}</video>` : ""} ${delivery_option_sof ? `<delivery_option_sof>${delivery_option_sof}</delivery_option_sof>` : ""} <warranty_type>No Warranty</warranty_type> </Attributes> <Skus> <Sku> <SellerSku>${sellerSku}</SellerSku> ${color_family ? `<color_family>${color_family}</color_family>` : ""} ${size ? `<size>${size}</size>` : ""} <quantity>${stock}</quantity> <price>${price}</price> <package_length>${length}</package_length> <package_height>${height}</package_height> <package_weight>${weight}</package_weight> <package_width>${width}</package_width> <package_content>${content}</package_content> <Images> ${skuImages} </Images> </Sku> </Skus> </Product> </Request>`;

    return hitApi("post", path, param, {}, {})
}

function updateProduct(ItemId, product_name, short_description, skuId, SellerSku, quantity, price, length, height, weight, width, skuImage, content) {
    let path = '/product/update'
    let param = getCommonParam();
    param.payload = `
        <Request>     
            <Product>     
            ${ItemId ? `<ItemId>${ItemId}</ItemId>` : ''}
                    <Attributes>             
                        ${product_name ? `<name>${product_name}</name>` : ''}
                        ${short_description ? `<short_description>${short_description}</short_description>` : ''}             
                        <delivery_option_sof>Yes</delivery_option_sof>
                    </Attributes>         
                    <Skus>             
                        <Sku>     
                        ${skuId ? `<SkuId>${skuId}</SkuId>` : ''}   
                        ${SellerSku ? `<SellerSku>${SellerSku}</SellerSku>` : ''}                                  
                        ${quantity ? `<quantity>${quantity}</quantity>` : ''}                
                        ${price ? `<price>${price}</price>` : ''}
                        ${length ? `<package_length>${length}</package_length>` : ''}
                        ${height ? `<package_height>${height}</package_height>` : ''}
                        ${weight ? `<package_weight>${weight}</package_weight>` : ''}
                        ${width ? `<package_width>${width}</package_width>` : ''}
                        <Images>${skuImage}</Images>
                    </Sku>
                </Skus>     
            </Product> 
        </Request>`

    return hitApi("post", path, param, {}, {})
}

function acceptOrder(order_item_ids, shipping_provider, delivery_type) {
    let path = '/order/pack'
    let param = getCommonParam();
    if (order_item_ids) param.order_item_ids = order_item_ids;
    if (shipping_provider) param.shipping_provider = shipping_provider;
    if (delivery_type) param.delivery_type = delivery_type;
    console.log(order_item_ids);
    return hitApi("post", path, param, {}, {})
}

function orderRts(order_item_ids, shipping_provider, delivery_type,tracking_number) {
    let path = '/order/rts'
    let param = getCommonParam();
    if (order_item_ids) param.order_item_ids = order_item_ids;
    if (shipping_provider) param.shipping_provider = shipping_provider;
    if (delivery_type) param.delivery_type = delivery_type;
    if (tracking_number) param.tracking_number = tracking_number;
    return hitApi("post", path, param, {}, {})
}

function cancelOrder(reason_detail, order_item_id) {
    let path = '/order/cancel'
    let param = getCommonParam();
    if (reason_detail) param.reason_detail = reason_detail;
    if (order_item_id) param.order_item_id = order_item_id;
    param.reason_id = 15;

    return hitApi("post", path, param, {}, {})
}


function getCategory(keyword) {
    let path = (keyword) ? '/product/category/suggestion/get' : '/category/tree/get';
    let param = getCommonParam();

    if (keyword) {
        param.product_name = keyword;
    } else {
        param.language_code = 'id_ID'
    }

    return hitApi("get", path, param, {}, {})
}

function getAttribute(category_id, language_code) {
    let path = '/category/attributes/get';
    let param = getCommonParam();

    if (category_id) param.primary_category_id = category_id;
    if (language_code) param.language_code = language_code;

    return hitApi("get", path, param, {}, {})
}

function getBrands(page = 0, size = 50) {
    let path = '/category/brands/query';
    let param = getCommonParam();

    param.startRow = page;
    if (size) param.pageSize = size;
    param.languageCode = 'id_ID'

    return hitApi("get", path, param, {}, {})
}


function getSingleReturn(reverse_order_id) {
    let path = '/order/reverse/return/detail/list';
    let param = getCommonParam();

    if (reverse_order_id) param.reverse_order_id = reverse_order_id;

    return hitApi("get", path, param, {}, {})
}

function getAllReturns(page_size,page_no) {
    let path = '/reverse/getreverseordersforseller';
    let param = getCommonParam();

    if (page_size) param.page_size = page_size;
    if (page_no) param.page_no = page_no;

    return hitApi("get", path, param, {}, {})
}


function acceptRejectReturn(action,reverse_order_id,reverse_order_item_ids,reason_id,comment,image_info) {
    let path = '/reverse/getreverseordersforseller';
    let param = getCommonParam();

    if (action) param.action = action;
    if (reverse_order_id) param.reverse_order_id = reverse_order_id;
    if (reverse_order_item_ids) param.reverse_order_item_ids = reverse_order_item_ids;
    if (reason_id) param.reason_id = reason_id;
    if (comment) param.comment = comment;
    if (image_info) param.image_info = image_info;

    return hitApi("get", path, param, {}, {})
}


function getReviewProduct(item_id,current,page_size,order_id,start_time,end_time,status_filter,content_filter) {
    let path = '/order/reverse/return/detail/list';
    let param = getCommonParam();

    if (item_id) param.item_id = item_id;
    if (current) param.current = reverse_order_id;
    if (page_size) param.page_size = page_size;
    if (order_id) param.order_id = order_id;
    if (start_time) param.start_time = start_time;
    if (end_time) param.end_time = end_time;
    if (status_filter) param.status_filter = status_filter;
    if (content_filter) param.content_filter = content_filter;

    return hitApi("get", path, param, {}, {})
}


function sellerPostReview(id,content) {
    let path = '/order/reverse/return/detail/list';
    let param = getCommonParam();

    if (id) param.id = id;
    if (content) param.content = content;

    return hitApi("get", path, param, {}, {})
}
module.exports = { orderRts,getAttribute, updateState, getBrands, getCategory, getSingleOrder, getOrders, getProducts, getSingleProduct, updateProductPrice, updateProductStock, getAllSettlements, updateProduct, createProduct, acceptOrder, cancelOrder,getSingleReturn,getAllReturns,acceptRejectReturn,getReviewProduct,sellerPostReview };