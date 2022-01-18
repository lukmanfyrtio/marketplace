const axios = require('axios')

let signKey = "signKey"
let apiClientId = "apiClientId"
let apiClientSecret = "apiClientId"
let apiKeySeller = "apiKeySeller"
let uri = "https://api.blibli.com/v2";

var moment = require('moment-timezone')

var crypto = require('crypto');

function generateCommonHeaders(reqMethod, body = "", reqContentType = "", urlReq = "") {
    let date = moment();
    let dateNow = date.tz('Asia/Jakarta').format("ddd MMM DD HH:mm:ss z YYYY");
    let milliseconds = new Date(date.toDate()).getTime();


    let reqBody = body !== "" ? hashmd5(body) : "";
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


function hitApi(method = "", path = "", query = {}, body = {}, headers = {}) {
    return new Promise(function (resolve, reject) {
        axios({
            method: method,
            url: uri + path,
            params: query,
            headers: headers,
            auth: {
                username: apiClientId,
                password: apiClientSecret
            }

        }).then(function (response) {
            resolve(response);

        }).catch((e) => {
            let response = {
                code: e.response.status,
                message: e.response.data.errorMessage
            }
            resolve(response);
        });
    });
}


async function getSingleOrder(storeId, orderNo, orderItemNo, channelId) {
    let path = "/proxy/mta/api/businesspartner/v1/order/orderDetail";
    let headers = generateCommonHeaders("get", "", "", path);
    let body = {};
    let param = {};
    param.requestId = await getUUID()
    if (storeId) param.storeId = storeId
    if (orderNo) param.orderNo = orderNo
    if (orderItemNo) param.orderItemNo = orderItemNo
    if (channelId) param.channelId = channelId

    return hitApi(method = "get", path = path, query = param, body = body, headers = headers)
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


module.exports = { getSingleOrder, getUUID };


