const axios = require('axios');
const crypto = require('crypto');

let appKey = 123456;
let appSecret = "helloworld";
let uri = "https://api.lazada.co.id/rest";
let access_token = "test";


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
    let header = {
        app_key: appKey,
        timestamp: new Date().getTime(),
        sign_method: 'sha256'
    }
    return header;
}


function hitApi(method = "", path = "", query = {}, body = {}, headers = {}) {
    return new Promise(function (resolve, reject) {
        axios({
            method: method,
            url: uri + path,
            params: query,

        }).then(function (response) {
            let responseCust = {
                code: response.status,
                message: response.data.message
            }
            resolve(responseCust);

        }).catch((e) => {
            let response = {
                code: e.response.status,
                message: e.response.data.message
            }
            resolve(response);
        });
    });
}


function getToken(code) {
    let path = '/auth/token/create'
    let param = getCommonParam();
    param.code = code;
    param.sign = sign(path, param)

    let header = {
        'Content-Type': 'application/x-www-form-urlencodedcharset=utf-8'
    }



    let res = hitApi("post", path, param, {}, header)
    return (res.data.access_token) ? res.data.access_token : "token";
}


function getSingleOrder(order_id) {
    let path = '/order/get'
    let param = getCommonParam();
    param.access_token = access_token
    if (order_id) param.order_id = order_id;

    param.sign = sign(path, param)
    return hitApi("get", path, param, {}, {})
}



function getOrders(update_before, sort_direction, offset, limit, update_after, sort_by, created_before, created_after, status) {
    let path = '/orders/get'
    let param = getCommonParam();
    param.access_token = access_token
    if (update_before) param.update_before = update_before;
    if (sort_direction) param.sort_direction = sort_direction;
    if (offset) param.offset = offset;
    if (limit) param.limit = limit;
    if (update_after) param.update_after = update_after;
    if (sort_by) param.sort_by = sort_by;
    if (created_before) param.created_before = created_before;
    if (created_after) param.created_after = created_after;
    if (status) param.status = status;

    param.sign = sign(path, param)
    return hitApi("get", path, param, {}, {})
}



module.exports = { getSingleOrder };