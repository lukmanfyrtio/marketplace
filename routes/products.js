const apiShoppe = require('../api_marketplace/api_shoppe.js')
const apiTokped = require('../api_marketplace/api_tokped.js')
const apiBlibli = require('../api_marketplace/api_blibli.js')
const apiLazada = require('../api_marketplace/api_lazada.js')
const moment = require('moment')

const db = require('mariadb')
const {conf, env} = require('../conf')

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

const express = require('express')
const router = express.Router();

let response = {
    timestamp: new Date().getTime()
}

function isFloat(n) {
    return Number(n) === n && n % 1 !== 0;
}

function isValidDate(date) {
    return moment(date, 'YYYY-MM-DD', true).isValid();
}
function unixTms(date) {
    return Math.floor(new Date(date).getTime() / 1000.0)
}

// reload env
router.get('/envstores/reload', async function (req, res) {
  getEnvStores()
  response.code = 200
  response.message = 'env reloaded'
  res.status(response.code).send(response);
})

//create product
router.post('/product/create', async function (req, res) {
    const search = req.query;
    const shop_id = search.shop_id;
    const marketplace = search.marketplace;
    const page = search.page;
    const limit = search.limit;
    let dimension;
    let custom_product_logistics;
    let annotations;

    const body = req.body;


    const sku = body.sku
    const product_name = body.product_name
    const description = body.description
    const status = body.status
    const price = body.price
    const stock = body.stock
    const images = body.images

    const minimum_order = body.minimum_order
    const weight = body.weight
    const unit_weight = body.unit_weight
    const condition = body.condition
    const category_id = body.category_id
    const etalase_id = body.etalase_id
    const is_must_insurance = body.is_must_insurance
    const is_free_return = body.is_free_return


    const preorder = body.preorder

    if (preorder !== null && preorder !== undefined) {
        if (preorder.duration === null && preorder.duration === undefined) {
            response.code = 400;
            response.message = "duration is required in preorder field";
        } else if (preorder.time_unit === null && preorder.time_unit === undefined) {
            response.code = 400;
            response.message = "time_unit is required in preorder field";
        }
    }


    const wholesale_qty = body.wholesale_qty
    const wholesale_price = body.wholesale_price
    const url_video = body.url_video
    const variant = body.variant

    const selection = body.selection
    const logistics = body.logistics

    const attributes = body.attributes

    const attributes_sku = body.attributes_sku

    const length = body.length
    const width = body.width
    const height = body.height
    const size_chart = body.size_chart
    const insta_flagselection = body.insta_flag
    const sla = body.sla

    const max_quantity = body.max_quantity
    const brand = body.brand
    const brand_id = body.brand_id



    const item_dangerous = body.dangerous_goods_level
    const special_price = body.special_price
    const pickup_point_code = body.pickup_point_code
    const product_type = body.product_type


    if (marketplace === null || marketplace === undefined || marketplace === '') {
        response.code = 400
        response.message = "Parameter marketplace is required"
    } else if (marketplace !== "lazada" && marketplace !== "shopee" && marketplace !== "" && marketplace !== "tokopedia" && marketplace !== "blibli") {
        response.code = 400
        response.message = "Parameter marketplace only available for blibli ,lazada, shopee, or tokopedia"
    } else if (shop_id === null || shop_id === undefined) {
        response.code = 400
        response.message = "Parameter shop_id is required"
    } else if (sku === null || sku === undefined) {
        response.code = 400
        response.message = "Field sku in request body required"
    } else if (product_name === null || product_name === undefined) {
        response.code = 400
        response.message = "Field product_name in request body required"
    } else if (description === null || description === undefined) {
        response.code = 400
        response.message = "Field description in request body required"
    } else if (status === null || status === undefined) {
        response.code = 400
        response.message = "Field status in request body required"
    } else if (status !== 'active' && status !== 'inactive') {
        response.code = 400
        response.message = "Field status is only active or inactive"
    } else if (price === null || price === undefined) {
        response.code = 400
        response.message = "Field price in request body required"
    } else if (!Number.isInteger(price)) {
        response.code = 400
        response.message = "Field price is should be integer"
    } else if (Number(price) <= 100 || Number(price) >= 100000000) {
        response.code = 400
        response.message = "The possible price between 100 to 100.000.000"
    } else if (stock === null || stock === undefined) {
        response.code = 400
        response.message = "Field stock in request body required"
    } else if (!Number.isInteger(stock)) {
        response.code = 400
        response.message = "Field stock is should be integer"
    } else if (Number(stock) <= 1 || Number(stock) >= 1000) {
        response.code = 400
        response.message = "The possible stock between 1 to 1.000"
    } else if (images === null || images === undefined) {
        response.code = 400
        response.message = "Field images in request body required"
    } else if (!Array.isArray(images)) {
        response.code = 400;
        response.message = `Field images in request body shall be array object example => images:[{url: URLString}]`;
    } else if (images === undefined || images.length == 0) {
        response.code = 400;
        response.message = `Field images in request body should not be empty`;
    } else if (minimum_order === null || minimum_order === undefined) {
        response.code = 400
        response.message = "Field minimum_order in request body required"
    }
    else if (!Number.isInteger(minimum_order)) {
        response.code = 400
        response.message = "Field minimum_order is should be integer"
    } else if (weight === null || weight === undefined) {
        response.code = 400
        response.message = "Field weight in request body required"
    } else if (!isFloat(weight) && !Number.isInteger(weight)) {
        response.code = 400
        response.message = "Field weight is is should be float"
    } else if (unit_weight === null || unit_weight === undefined) {
        response.code = 400
        response.message = "Field unit_weight in request body required"
    } else if (unit_weight !== "kg" && unit_weight !== "gr") {
        response.code = 400
        response.message = "Field unit_weight is only kg or gr"
    } else if (condition === null || condition === undefined) {
        response.code = 400
        response.message = "Field condition in request body required"
    } else if (condition !== "new" && condition !== "used") {
        response.code = 400
        response.message = "Field condition is only new or used"
    } else if (category_id === null || category_id === undefined) {
        response.code = 400
        response.message = "Field category_id in request body required"
    }

    else {
        if (marketplace == "tokopedia") {
            let arrayImage = []
            images.forEach(element => {
                let img = {
                    file_path: element.url
                }
                arrayImage.push(img);
            });

            if (etalase_id === null || etalase_id === undefined) {
                response.message = "Parameter etalase_id is required"
            }
            let u_weight = unit_weight == 'kg' ? 'KG' : 'GR'
            let kondisi = condition == 'used' ? 'USED' : 'NEW'
            let status_tokped = status == 'active' ? 'LIMITED' : 'EMPTY';

            let etalase = {
                id: etalase_id
            }

            if (is_must_insurance === null || is_must_insurance === undefined) {
                if (typeof is_must_insurance == "boolean") {
                    response.message = "Parameter is_must_insurance shall be boolean,"
                }
            }

            if (is_free_return === null || is_free_return === undefined) {
                if (typeof is_free_return == "boolean") {
                    response.message = "Parameter is_free_return shall be boolean,"
                }
            }
            let wholesale_tokped
            if (wholesale_price || wholesale_qty) {
                if (wholesale_qty) {
                    if (wholesale_price) {
                        if (isInteger(wholesale_qty)) {
                            if (isInteger(wholesale_price)) {
                                wholesale_tokped = [
                                    {
                                        min_qty: wholesale_qty,
                                        price: wholesale_price
                                    }
                                ]
                            } else {
                                response.message = "Field wholesale_price shall be integer,"
                            }
                        } else {
                            response.message = "Field wholesale_qty shall be integer,"
                        }
                    } else {
                        response.message = "Include field wholesale_price if wholesale_qty is defined,"
                    }

                } else {
                    response.message = "Include field wholesale_qty if wholesale_price is defined,"
                }
            }
            let preorderTokopedia;
            if (preorder) {
                if (preorder.duration) {
                    if (preorder.time_unit) {
                        time_unit = preorder.time_unit
                        preorder_time = time_unit == 'day' ? 'DAY' : 'WEEK';

                        if (time_unit !== 'day' && time_unit !== 'week') response.message = 'preorder.time_unit is only day or week, ';
                    } else {
                        $preorder_time = 'DAY';
                        preorderTokopedia = {
                            is_active: true,
                            duration: Number(preorder.duration),
                            time_unit: preorder_time
                        }
                    }
                } else {
                    response.message = 'Include field preorder.duration if preorder is defined';
                }
            }

            let videos;
            if (url_video) {
                videos = [
                    {
                        url: url_video,
                        source: 'youtube'
                    }
                ]
            }

            let variantTokped;
            if (variant) {
                response.code = 400;
                let array_variant = [];
                if (!Array.isArray(variant)) {
                    response.code = 400;
                    response.message = `Field variant in request body shall be array object`;
                    res.status(response.code).send(response);
                    return;
                } else if (variant.length === 0) {
                    response.code = 400;
                    response.message = `Field variant cant be empty`;
                    res.status(response.code).send(response);
                    return;
                } else {
                    variant.forEach(element => {
                        let stock_variant;
                        let sku_variant;
                        let price_variant;
                        let combination;
                        if (!element.status) {
                            response.message = 'Field variant status in body is required';
                            res.status(response.code).send(response);
                            return;
                        } else if (element.status !== 'inactive' && element.status !== 'active') {
                            response.message = 'variant status is only "active" or "inactive';
                            res.status(response.code).send(response);
                            return;
                        } else if (!element.price) {
                            response.message = 'Field variant price in body is required, ';
                            res.status(response.code).send(response);
                            return;
                        } else if (Number.isInteger(price_variant)) {
                            response.message = 'Field variant price shall be integer, ';
                            res.status(response.code).send(response);
                            return;
                        } else if (price_variant <= 100 || price_variant >= 100000000) {
                            response.message = 'The possible variant price between 100 to 100.000.000, ';
                            res.status(response.code).send(response);
                            return;
                        } else if (!element.stock) {
                            response.message = 'Field variant stock in body is required, ';
                            res.status(response.code).send(response);
                            return;
                        } else if (Number.isInteger(stock_variant)) {
                            response.message = 'Field variant stock shall be integer, ';
                            res.status(response.code).send(response);
                            return;
                        } else if (stock_variant <= 1 || stock_variant >= 1000) {
                            response.message = 'The variant stock possible stock between 1 to 1.000, ';
                            res.status(response.code).send(response);
                            return;
                        } else if (!element.sku) {
                            response.message = 'Field variant sku in body is required, ';
                        } else if (element.combination === null | element.combination === undefined) {
                            response.message = 'Field variant combination in body is required, ';
                            res.status(response.code).send(response);
                            return;
                        } else {
                            console.log("sini");
                            price_variant = element.price;
                            stock_variant = element.stock;
                            sku_variant = element.sku;
                            let status_tokped;
                            if (element.status) status_tokped = element.status == 'active' ? 'LIMITED' : 'EMPTY';

                            let arrayImageVariant = []
                            if (element.images) {
                                element.images.forEach(element => {
                                    if (element.url === null && element.url === undefined) {
                                        response.code = 400;
                                        response.message = "url is required in images field";
                                        res.status(response.code).send(response);
                                        return;
                                    } else {
                                        let img = {
                                            file_path: element.url
                                        }
                                        arrayImageVariant.push(img);
                                    }
                                });
                            }
                            let variant = {
                                is_primary: element.is_primary,
                                status: status_tokped,
                                price: Number(price_variant),
                                stock: stock_variant,
                                sku: sku_variant.toString(),
                                combination: [element.combination],
                                // pictures: arrayImageVariant
                            }
                            array_variant.push(variant);
                        }
                    });

                    if (selection) {
                        variantTokped = {
                            products: array_variant,
                            selection: selection
                        }
                        let variant_selection = selection
                        if (!Array.isArray(variant_selection)) {
                            response.code = 400;
                            response.message = `Field variant selection in request body shall be array object`;
                            res.status(response.code).send(response);
                            return;
                        } else if (variant_selection.length === 0) {
                            response.code = 400;
                            response.message = `Field variant selection cant be empty`;
                            res.status(response.code).send(response);
                            return;
                        } else {
                            variant_selection.forEach(element => {
                                if (element.id) {
                                    id = element.id;
                                } else {
                                    response.message = 'Field selection id in body is required, ';
                                    res.status(response.code).send(response);
                                    return;
                                }
                                if (element.unit_id !== null || element.unit_id !== undefined) {
                                    unit_id = element.unit_id;
                                } else {
                                    response.message = 'Field selection unit_id in body is required, ';
                                    res.status(response.code).send(response);
                                    return;
                                }

                                if (element.options) {
                                    if (!Array.isArray(element.options)) {
                                        response.code = 400;
                                        response.message = `Field variant images in request body shall be array object`;
                                        res.status(response.code).send(response);
                                        return;
                                    } else if (element.options.length === 0) {
                                        response.code = 400;
                                        response.message = `Field selection options cant be empty`;
                                        res.status(response.code).send(response);
                                        return;
                                    } else {
                                        element.options.forEach(element => {
                                            if (!element.unit_value_id) {
                                                response.code = 400;
                                                response.message = `Field selection.options.unit_value_id cant be empty`;
                                                res.status(response.code).send(response);
                                                return;
                                            } else if (!element.value) {
                                                response.code = 400;
                                                response.message = `Field selection.options.value cant be empty`;
                                                res.status(response.code).send(response);
                                                return;
                                            }
                                        });
                                    }
                                } else {
                                    response.message = 'Field seleection options in body is required, ';
                                    res.status(response.code).send(response);
                                    return;
                                }
                            });
                        }
                    } else {
                        response.code = 400;
                        response.message = 'Field selection for variant is required ';
                        res.status(response.code).send(response);
                        return;
                    }
                }

            }

            let hitAPI = await apiTokped.createProductV3(shop_id, product_name, Number(category_id), 'IDR', Number(price), status_tokped, minimum_order, weight, u_weight, kondisi
                , dimension, custom_product_logistics, annotations, etalase, description, is_must_insurance, is_free_return, sku, Number(stock), wholesale_tokped, preorderTokopedia
                , arrayImage, videos, variantTokped)
            res.status(hitAPI.code).send(hitAPI);
            return;

        } else if (marketplace == "shopee") {
            response.code = 200;
            let brandBody;
            let item_sku = sku;
            let original_price = Number(price)//required
            let descriptionShopee = description// required
            let item_name = product_name// required
            let normal_stock = Number(stock)//required
            let logistic_info = logistics
            let wholesales;
            let preorder_shopee;

            let array_images = [];
            let attribute_list = []
            images.forEach(element => {
                array_images.push(element.url);
            });

            let imageReq = {
                image_id_list: array_images
            };//Required

            let kondisiShopee = condition == 'used' ? 'USED' : 'NEW'
            let statusShopee = status == 'active' ? 'NORMAL' : 'UNLIST';

            if (item_dangerous) {
                if (!Number.isInteger(item_dangerous)) {
                    response.message = "Field item_dangerous shall be integer";
                    response.code = 400;
                    res.status(response.code).send(response);
                    return;
                }
            }


            if (preorder) {
                if (preorder.duration) {
                    preorder_shopee={
                        is_pre_order:true,
                        days_to_ship:preorder.duration
                    }
                } else {
                    response.message = 'Include field preorder.duration if preorder is defined';
                    response.code = 400;
                    res.status(response.code).send(response);
                    return;
                }
            }

        if (wholesale_qty || wholesale_price) {
            if (wholesale_qty) {
                if (wholesale_price) {
                    if (Number.isInteger(wholesale_qty)) {
                        if (Number.isInteger(wholesale_price)) {
                            wholesales = [{
                                "min_count": Number(wholesale_qty),
                                "max_count": Number(wholesale_qty),
                                "unit_price": Number(wholesale_price),
                            }];
                        } else {
                            response.message = "Field wholesale_price shall be integer,";
                            response.code = 400;
                            res.status(response.code).send(response);
                            return;
                        }
                    } else {
                        response.message = "Field wholesale_qty shall be integer,";
                        response.code = 400;
                        res.status(response.code).send(response);
                        return;
                    }
                } else {
                    response.message = "Include field wholesale_price if wholesale_qty is defined,";
                    response.code = 400;
                    res.status(response.code).send(response);
                    return;
                }
            } else {
                response.message = "Include field wholesale_qty if wholesale_price is defined,";
                response.code = 400;
                res.status(response.code).send(response);
                return;
            }
        }
        if (brand) {
            if (brand_id !== null && brand !== undefined) {
                brandBody = {
                    brand_id: brand_id,
                    original_brand_name: brand
                }
            } else {
                response.message = "Field brand_id if brand_id is defined";
                response.code = 400;
                res.status(response.code).send(response);
                return;
            }
        }

        if (attributes) {
            if (!Array.isArray(attributes)) {
                response.code = 400;
                response.message = `Field variant in request body shall be array object`;
                res.status(response.code).send(response);
                return;
            } else if (attributes.length === 0) {
                response.code = 400;
                response.message = `Field variant cant be empty`;
                res.status(response.code).send(response);
                return;
            } else {
                for await (const element of attributes) {
                    if (element.attribute_id === null || element.attribute_id === undefined) {
                        response.code = 400;
                        response.message = "attribute_id is required in attributes field";
                        res.status(response.code).send(response);
                        return;
                    } else if (!Array.isArray(element.value)) {
                        response.code = 400;
                        response.message = `Field variant in request body shall be array object`;
                        res.status(response.code).send(response);
                        return;
                    } else if (element.value.length === 0) {
                        response.code = 400;
                        response.message = `Field value cant be empty in attributes field"`;
                        res.status(response.code).send(response);
                        return;
                    } else {
                        let attributes_value = [];
                        for await (const elementVal of element.value) {
                            let attr_value = {};
                            if (elementVal.id === null || elementVal.id === undefined) {
                                response.code = 400;
                                response.message = `Field value.[id] cant be empty in attributes field"`;
                                res.status(response.code).send(response);
                                return;
                            } else {
                                attr_value.value_id = elementVal.id;
                                if (elementVal.value_name) attr_value.original_value_name = elementVal.value_name;
                                if (elementVal.unit_value) attr_value.value_unit = elementVal.unit_value;

                                attributes_value.push(attr_value);
                            }
                        }
                        attribute_list.push(
                            {
                                attribute_id: element.attribute_id,
                                attribute_value_list: attributes_value
                            }
                        )

                    }

                }
            }
        }

        if (logistics) {
            if (!Array.isArray(logistics)) {
                response.code = 400;
                response.message = `Field variant in request body shall be array object`;
                res.status(response.code).send(response);
                return;
            } else if (logistics.length === 0) {
                response.code = 400;
                response.message = `Field variant cant be empty`;
                res.status(response.code).send(response);
                return;
            } else {
                logistics.forEach(element => {
                    if (element.logistic_id === null || element.logistic_id === undefined) {
                        response.code = 400;
                        response.message = "logistic_id is required in logistics field";
                        res.status(response.code).send(response);
                        return;
                    } else if (element.enabled === null || element.enabled === undefined) {
                        response.code = 400;
                        response.message = "enabled is required in logistics field";
                        res.status(response.code).send(response);
                        return;
                    } else if (element.shipping_fee === null || element.shipping_fee === undefined) {
                        response.code = 400;
                        response.message = "shipping_fee is required in logistics field";
                        res.status(response.code).send(response);
                        return;
                    } else if (element.size_id === null || element.size_id === undefined) {
                        response.code = 400;
                        response.message = "size_id is required in logistics field";
                        res.status(response.code).send(response);
                        return;
                    } else if (element.is_free === null || element.is_free === undefined) {
                        response.code = 400;
                        response.message = "is_free is required in logistics field";
                        res.status(response.code).send(response);
                        return;
                    }
                });
            }
        } else {
            response.code = 400;
            response.message = `Field logistics is required on shopee`;
            res.status(response.code).send(response);
            return;
        }

        if (height || length || width) {
            if (!height) {
                response.code = 400;
                response.message = `Field height if one of the field height,length,width is defined`;
                res.status(response.code).send(response);
                return;
            } else if (!length) {
                response.code = 400;
                response.message = `Field length if one of the field height,length,width is defined`;
                res.status(response.code).send(response);
                return;
            } else if (!width) {
                response.code = 400;
                response.message = `Field width if one of the field height,length,width is defined`;
                res.status(response.code).send(response);
                return;
            } else {
                dimension = {
                    package_height: height,
                    package_length: length,
                    package_width: width
                }
            }
        }

        if (response.code === 200) {
            let hitAPI = await apiShoppe.createProduct(shop_id, original_price, descriptionShopee, weight, item_name, statusShopee, dimension
                , normal_stock, logistic_info, attribute_list, category_id, imageReq, preorder_shopee, item_sku, kondisiShopee, wholesales, url_video, brandBody, Number(item_dangerous) == 1 ? 1 : 0
                , null, null, req.envStore)
            res.status(hitAPI.code).send(hitAPI);
        }
        return;
    } else if (marketplace == "blibli") {
        let hitAPI = await apiBlibli.createProductV3(shop_id, "username", attributes, brand, category_id, description, dimension, images, logistics, product_name, brand, pickup_point_code
            , null, preorder, attributes, product_type, url_video)
        res.status(hitAPI.code).send(hitAPI);
        return;
    } else if (marketplace == "lazada") {
        let new_weight;
        if (unit_weight !== 'KG') new_weight = weight / 1000
        response.code = 400
        if (brand === null || brand === undefined) {
            response.message = "Field brand in body is required,";
        } else {
            let array_variant = [];
            if (variant) {
                if (!Array.isArray(variant)) {
                    response.code = 400;
                    response.message = `Field variant in request body shall be array object`;
                    res.status(response.code).send(response);
                    return;
                } else if (variant.length === 0) {
                    response.code = 400;
                    response.message = `Field variant cant be empty`;
                    res.status(response.code).send(response);
                    return;
                } else {
                    variant.forEach(element => {
                        let variantLazada = `<Sku>`;
                        if (element.sku == null || element.sku == undefined) {
                            response.message = "Field sku in variant object is required,";
                            res.status(response.code).send(response);
                            return;
                        } else if (element.price == null || element.price == undefined) {
                            response.message = "Field price in variant object is required,";
                            res.status(response.code).send(response);
                            return;
                        } else if (element.stock == null || element.stock == undefined) {
                            response.message = "Field stock in variant object is required,";
                            res.status(response.code).send(response);
                            return;
                        } else if (element.length == null || element.length == undefined) {
                            response.message = "Field length in variant object is required,";
                            res.status(response.code).send(response);
                            return;
                        } else if (element.weight == null || element.weight == undefined) {
                            response.message = "Field weight in variant object is required,";
                            res.status(response.code).send(response);
                            return;
                        } else if (element.height == null || element.weight == undefined) {
                            response.message = "Field height in variant object is required,";
                            res.status(response.code).send(response);
                            return;
                        } else {
                            let sellerSku = element.sku;
                            if (sellerSku) variantLazada += `<SellerSku>${sellerSku}</SellerSku>`

                            let color_family = element.color_family;
                            if (color_family) variantLazada += `<color_family>${color_family}</color_family>`

                            let size = element.size;
                            if (size) variantLazada += `<size>${size}</size>`

                            let stock = element.stock;
                            if (stock) variantLazada += `<quantity>${stock}</quantity>`

                            let price = element.price;
                            if (price) variantLazada += `<price>${price}</price>`

                            let length = element.length;
                            if (length) variantLazada += `<package_length>${length}</package_length>`

                            //height
                            let height = element.height;
                            if (height) variantLazada += `<package_height>${height}</package_height>`

                            //weight
                            let weight;
                            if (unit_weight !== 'KG') weight = element.weight / 1000
                            if (weight) variantLazada += `<package_weight>${weight}</package_weight>`

                            let width = element.width;
                            if (width) variantLazada += `<package_width>${width}</package_width>`


                            if (element.images) {
                                variantLazada += `<Images>`
                                element.images.forEach(element => {
                                    if (element.url) {
                                        variantLazada += `<Image>${element.url}</Image>`
                                    }
                                });
                                variantLazada += `</Images>`
                            }

                            variantLazada += `</Sku>`
                            array_variant.push(variantLazada);
                        }
                    });
                }
            } else {
                response.message = "Field variant on body is required on lazada";
                res.status(response.code).send(response);
                return;
            }

            let array_images_product = [];
            images.forEach(element => {
                let imageProduct;
                if (element.url) {
                    imageProduct = `<Image>${element.url}</Image>`
                    array_images_product.push(imageProduct);
                }
            });
            let hitAPI = await apiLazada.createProduct(category_id, array_images_product, product_name, description, brand, array_variant.join(''));
            res.status(hitAPI.code).send(hitAPI);
            return;
        }
        res.status(response.code).send(response);
        return
    }
}
    res.status(response.code).send(response);
});



//update product
router.post('/product/update', async function (req, res) {
    const search = req.query;
    const shop_id = search.shop_id;
    const marketplace = search.marketplace;
    const page = search.page;
    const limit = search.limit;
    let dimension;
    let custom_product_logistics;
    let annotations;

    const body = req.body;

    const product_id = body.product_id
    const sku = body.sku
    const product_name = body.product_name
    const description = body.description
    const status = body.status
    const price = body.price
    const stock = body.stock
    const images = body.images


    const minimum_order = body.minimum_order
    const weight = body.weight
    const unit_weight = body.unit_weight
    const condition = body.condition
    const category_id = body.category_id
    const etalase_id = body.etalase_id
    const is_must_insurance = body.is_must_insurance
    const is_free_return = body.is_free_return


    const preorder = body.preorder

    if (preorder !== null && preorder !== undefined) {
        if (preorder.duration === null && preorder.duration === undefined) {
            response.code = 400;
            response.message = "duration is required in preorder field";
        } else if (preorder.time_unit === null && preorder.time_unit === undefined) {
            response.code = 400;
            response.message = "time_unit is required in preorder field";
        }
    }


    const wholesale_qty = body.wholesale_qty
    const wholesale_price = body.wholesale_price
    const url_video = body.url_video
    const variant = body.variant
    const sku_id = body.sku_id


    // if (variant !== null && variant !== undefined) {
    //     if (variant.name === null && variant.name === undefined) {
    //         response.code = 400;
    //         response.message = "name is required in variant field";
    //     } else if (variant.is_primary === null && variant.is_primary === undefined) {
    //         response.code = 400;
    //         response.message = "is_primary is required in variant field";
    //     } else if (variant.status === null && variant.status === undefined) {
    //         response.code = 400;
    //         response.message = "status is required in variant field";
    //     } else if (variant.price === null && variant.price === undefined) {
    //         response.code = 400;
    //         response.message = "price is required in variant field";
    //     } else if (variant.stock === null && variant.stock === undefined) {
    //         response.code = 400;
    //         response.message = "stock is required in variant field";
    //     } else if (variant.sku === null && variant.sku === undefined) {
    //         response.code = 400;
    //         response.message = "sku is required in variant field";
    //     }
    // }

    const selection = body.selection
    const logistics = body.logistics
    if (logistics !== null && logistics !== undefined) {
        if (logistics.length !== 0) {
            logistics.forEach(element => {
                if (element.logistic_id === null && element.logistic_id === undefined) {
                    response.code = 400;
                    response.message = "logistic_id is required in logistics field";
                } else if (element.enabled === null && element.enabled === undefined) {
                    response.code = 400;
                    response.message = "enabled is required in logistics field";
                } else if (element.shipping_fee === null && element.shipping_fee === undefined) {
                    response.code = 400;
                    response.message = "shipping_fee is required in logistics field";
                } else if (element.size_id === null && element.size_id === undefined) {
                    response.code = 400;
                    response.message = "size_id is required in logistics field";
                } else if (element.is_free === null && element.is_free === undefined) {
                    response.code = 400;
                    response.message = "is_free is required in logistics field";
                }
            });
        }
    }

    const attributes = body.attributes
    if (attributes !== null && attributes !== undefined) {
        if (attributes.length !== 0) {
            attributes.forEach(element => {
                if (element.attributes_id === null && element.attributes_id === undefined) {
                    response.code = 400;
                    response.message = "attributes_id is required in attributes field";
                } else if (element.value !== null && element.value !== undefined && element.value.length == 0) {
                    response.code = 400;
                    response.message = "value is required in attributes field";
                }
            });
        }
    }

    const attributes_sku = body.attributes_sku
    if (attributes_sku !== null && attributes_sku !== undefined) {
        if (attributes_sku.length !== 0) {
            attributes_sku.forEach(element => {
                if (element.attributes_id === null && element.attributes_id === undefined) {
                    response.code = 400;
                    response.message = "attributes_id is required in attributes_sku field";
                } else if (element.value === null && element.value === undefined) {
                    response.code = 400;
                    response.message = "value is required in attributes_sku field";
                }
            });
        }
    }

    const length = body.length
    const width = body.width
    const height = body.height
    const size_chart = body.size_chart
    const insta_flagselection = body.insta_flag
    const sla = body.sla
    if (sla !== null && sla !== undefined) {
        if (sla.type !== null && sla.type !== undefined) {
            response.code = 400;
            response.message = "type is required in sla field";
        } else if (sla.value !== null && sla.value !== undefined) {
            response.code = 400;
            response.message = "value is required in sla field";
        }
    }
    const max_quantity = body.max_quantity
    const brand = body.brand


    const item_dangerous = body.dangerous_goods_level
    const special_price = body.special_price
    const pickup_point_code = body.pickup_point_code
    const product_type = body.product_type




    if (marketplace === null || marketplace === undefined || marketplace === '') {
        response.code = 400
        response.message = "Parameter marketplace is required"
    } else if (marketplace !== "lazada" && marketplace !== "shopee" && marketplace !== "" && marketplace !== "tokopedia" && marketplace !== "blibli") {
        response.code = 400
        response.message = "Parameter marketplace only available for blibli ,lazada, shopee, or tokopedia"
    } else if (shop_id === null || shop_id === undefined) {
        response.code = 400
        response.message = "Parameter shop_id is required"
    } else if (product_id === null || product_id === undefined) {
        response.code = 400
        response.message = "Field product_id in request body required"
    }
    // else if (sku === null || sku === undefined) {
    //     response.code = 400
    //     response.message = "Field sku in request body required"
    // }
    // else if (product_name === null || product_name === undefined) {
    //     response.code = 400
    //     response.message = "Field product_name in request body required"
    // } else if (description === null || description === undefined) {
    //     response.code = 400
    //     response.message = "Field description in request body required"
    // } else if (status === null || status === undefined) {
    //     response.code = 400
    //     response.message = "Field status in request body required"
    // } else if (status !== 'active' && status !== 'inactive') {
    //     response.code = 400
    //     response.message = "Field status is only active or inactive"
    // } else if (price === null || price === undefined) {
    //     response.code = 400
    //     response.message = "Field price in request body required"
    // } else if (!Number.isInteger(price)) {
    //     response.code = 400
    //     response.message = "Field price is should be integer"
    // } else if (Number(price) <= 100 || Number(price) >= 100000000) {
    //     response.code = 400
    //     response.message = "The possible price between 100 to 100.000.000"
    // } else if (stock === null || stock === undefined) {
    //     response.code = 400
    //     response.message = "Field stock in request body required"
    // } else if (!Number.isInteger(stock)) {
    //     response.code = 400
    //     response.message = "Field stock is should be integer"
    // } else if (Number(stock) <= 1 || Number(stock) >= 1000) {
    //     response.code = 400
    //     response.message = "The possible stock between 1 to 1.000"
    // } else if (images === null || images === undefined) {
    //     response.code = 400
    //     response.message = "Field images in request body required"
    // } else if (!Array.isArray(images)) {
    //     response.code = 400;
    //     response.message = `Field images in request body shall be array object example => images:[{url: URLString}]`;
    // } else if (images === undefined || images.length == 0) {
    //     response.code = 400;
    //     response.message = `Field images in request body should not be empty`;
    // } else if (minimum_order === null || minimum_order === undefined) {
    //     response.code = 400
    //     response.message = "Field minimum_order in request body required"
    // }
    // else if (!Number.isInteger(minimum_order)) {
    //     response.code = 400
    //     response.message = "Field minimum_order is should be integer"
    // } else if (weight === null || weight === undefined) {
    //     response.code = 400
    //     response.message = "Field weight in request body required"
    // } else if (!isFloat(weight) && !Number.isInteger(weight)) {
    //     response.code = 400
    //     response.message = "Field weight is is should be float"
    // } else if (unit_weight === null || unit_weight === undefined) {
    //     response.code = 400
    //     response.message = "Field unit_weight in request body required"
    // } else if (unit_weight !== "kg" && marketplace !== "gr") {
    //     response.code = 400
    //     response.message = "Field unit_weight is only kg or gr"
    // } else if (condition === null || condition === undefined) {
    //     response.code = 400
    //     response.message = "Field condition in request body required"
    // } else if (condition !== "new" && condition !== "used") {
    //     response.code = 400
    //     response.message = "Field condition is only new or used"
    // } else if (category_id === null || category_id === undefined) {
    //     response.code = 400
    //     response.message = "Field category_id in request body required"
    // }

    else {
        if (marketplace == "tokopedia") {
            let arrayImage = []
            images.forEach(element => {
                let img = {
                    file_path: element.url
                }
                arrayImage.push(img);
            });

            if (etalase_id === null || etalase_id === undefined) {
                response.message = "Parameter etalase_id is required"
            }
            let u_weight = unit_weight == 'kg' ? 'KG' : 'GR'
            let kondisi = condition == 'used' ? 'USED' : 'NEW'
            let status_tokped = status == 'active' ? 'LIMITED' : 'EMPTY';

            let etalase = {
                id: etalase_id
            }

            if (is_must_insurance === null || is_must_insurance === undefined) {
                if (typeof is_must_insurance == "boolean") {
                    response.message = "Parameter is_must_insurance shall be boolean,"
                }
            }

            if (is_free_return === null || is_free_return === undefined) {
                if (typeof is_free_return == "boolean") {
                    response.message = "Parameter is_free_return shall be boolean,"
                }
            }
            let wholesale_tokped
            if (wholesale_price || wholesale_qty) {
                if (wholesale_qty) {
                    if (wholesale_price) {
                        if (isInteger(wholesale_qty)) {
                            if (isInteger(wholesale_price)) {
                                wholesale_tokped = [
                                    {
                                        min_qty: wholesale_qty,
                                        price: wholesale_price
                                    }
                                ]
                            } else {
                                response.message = "Field wholesale_price shall be integer,"
                            }
                        } else {
                            response.message = "Field wholesale_qty shall be integer,"
                        }
                    } else {
                        response.message = "Include field wholesale_price if wholesale_qty is defined,"
                    }

                } else {
                    response.message = "Include field wholesale_qty if wholesale_price is defined,"
                }
            }
            let preorderTokopedia;
            if (preorder) {
                if (preorder.duration) {
                    if (preorder.time_unit) {
                        time_unit = preorder.time_unit
                        preorder_time = time_unit == 'day' ? 'DAY' : 'WEEK';

                        if (time_unit !== 'day' && time_unit !== 'week') response.message = 'preorder.time_unit is only day or week, ';
                    }
                    else {
                        preorder_time = 'DAY';
                        preorderTokopedia = {
                            is_active: true,
                            duration: Number(preorder.duration),
                            time_unit: preorder_time
                        }
                    }
                }
                else {
                    response.message = 'Field preorder.duration shall be integer, ';
                }
            }
            else {
                response.message = 'Include field preorder.duration if preorder is defined';
            }

            let videos;
            if (url_video) {
                videos = [
                    {
                        url: url_video,
                        source: 'youtube'
                    }
                ]
            }


            let variantTokped;
            if (variant) {
                response.code = 400;
                let array_variant = [];
                if (!Array.isArray(variant)) {
                    response.code = 400;
                    response.message = `Field variant in request body shall be array object`;
                    res.status(response.code).send(response);
                    return;
                } else if (variant.length === 0) {
                    response.code = 400;
                    response.message = `Field variant cant be empty`;
                    res.status(response.code).send(response);
                    return;
                } else {
                    variant.forEach(element => {
                        let stock_variant;
                        let sku_variant;
                        let price_variant;
                        let combination;
                        if (!element.status) {
                            response.message = 'Field variant status in body is required';
                            res.status(response.code).send(response);
                            return;
                        } else if (element.status !== 'inactive' && element.status !== 'active') {
                            response.message = 'variant status is only "active" or "inactive';
                            res.status(response.code).send(response);
                            return;
                        } else if (!element.price) {
                            response.message = 'Field variant price in body is required, ';
                            res.status(response.code).send(response);
                            return;
                        } else if (Number.isInteger(price_variant)) {
                            response.message = 'Field variant price shall be integer, ';
                            res.status(response.code).send(response);
                            return;
                        } else if (price_variant <= 100 || price_variant >= 100000000) {
                            response.message = 'The possible variant price between 100 to 100.000.000, ';
                            res.status(response.code).send(response);
                            return;
                        } else if (!element.stock) {
                            response.message = 'Field variant stock in body is required, ';
                            res.status(response.code).send(response);
                            return;
                        } else if (Number.isInteger(stock_variant)) {
                            response.message = 'Field variant stock shall be integer, ';
                            res.status(response.code).send(response);
                            return;
                        } else if (stock_variant <= 1 || stock_variant >= 1000) {
                            response.message = 'The variant stock possible stock between 1 to 1.000, ';
                            res.status(response.code).send(response);
                            return;
                        } else if (!element.sku) {
                            response.message = 'Field variant sku in body is required, ';
                        } else if (!element.is_primary) {
                            response.message = 'Field variant is_primary in body is required, ';
                            res.status(response.code).send(response);
                            return;
                        } else if (!element.combination) {
                            response.message = 'Field variant combination in body is required, ';
                            res.status(response.code).send(response);
                            return;
                        } else {
                            price_variant = element.price;
                            stock_variant = element.stock;
                            sku_variant = element.sku;
                            let status_tokped = element.status == 'active' ? 'LIMITED' : 'EMPTY';

                            let arrayImageVariant = []
                            if (element.images) {
                                element.images.forEach(element => {
                                    if (element.url === null && element.url === undefined) {
                                        response.code = 400;
                                        response.message = "url is required in images field";
                                        res.status(response.code).send(response);
                                        return;
                                    } else {
                                        let img = {
                                            file_path: element.url
                                        }
                                        arrayImage.push(img);
                                    }
                                });
                            }
                            let variant = {
                                is_primary: element.is_primary,
                                status: status_tokped,
                                price: Number(price_variant),
                                stock: stock_variant,
                                sku: sku_variant.toString(),
                                combination: [combination],
                                pictures: arrayImageVariant
                            }
                            array_variant.push(variant);
                        }
                    });
                    if (selection) {
                        let variant_selection = selection
                        if (!Array.isArray(variant_selection)) {
                            response.code = 400;
                            response.message = `Field variant selection in request body shall be array object`;
                            res.status(response.code).send(response);
                            return;
                        } else if (variant_selection.length === 0) {
                            response.code = 400;
                            response.message = `Field variant selection cant be empty`;
                            res.status(response.code).send(response);
                            return;
                        } else {
                            variant_selection.forEach(element => {
                                if (element.variant_id) {
                                    variant_id = element.variant_id;
                                } else {
                                    response.message = 'Field seleection variant_id in body is required, ';
                                    res.status(response.code).send(response);
                                    return;
                                }
                                if (element.variant_unit_id) {
                                    variant_unit_id = element.variant_unit_id;
                                } else {
                                    response.message = 'Field seleection variant_unit_id in body is required, ';
                                    res.status(response.code).send(response);
                                    return;
                                }

                                if (element.options) {
                                    if (!Array.isArray(element.options)) {
                                        response.code = 400;
                                        response.message = `Field variant images in request body shall be array object`;
                                        res.status(response.code).send(response);
                                        return;
                                    } else if (element.options.length === 0) {
                                        response.code = 400;
                                        response.message = `Field selection options cant be empty`;
                                        res.status(response.code).send(response);
                                        return;
                                    } else {
                                        element.options.forEach(element => {
                                            if (!element.unit_value_id) {
                                                response.code = 400;
                                                response.message = `Field selection.options.unit_value_id cant be empty`;
                                                res.status(response.code).send(response);
                                                return;
                                            } else if (!element.value) {
                                                response.code = 400;
                                                response.message = `Field selection.options.value cant be empty`;
                                                res.status(response.code).send(response);
                                                return;
                                            }
                                        });
                                    }
                                } else {
                                    response.message = 'Field seleection options in body is required, ';
                                    res.status(response.code).send(response);
                                    return;
                                }
                            });
                        }
                    } else {
                        response.code = 400;
                        response.message = 'Field selection for variant is required ';
                        res.status(response.code).send(response);
                        return;
                    }
                }

            }



            let hitAPI = await apiTokped.updateProductV3(shop_id, product_name, product_id, Number(category_id), 'IDR', Number(price), status_tokped, minimum_order, weight, u_weight, kondisi
                , dimension, custom_product_logistics, annotations, etalase, description, is_must_insurance, is_free_return, sku, Number(stock), wholesale_tokped, preorderTokopedia
                , arrayImage, videos, variantTokped)
            res.status(hitAPI.code).send(hitAPI);
            return;
        } else if (marketplace == "shopee") {
            response.code = 200;
            let brandBody;
            let item_sku = sku;
            // let original_price = Number(price)//required
            let descriptionShopee = description// required
            let item_name = product_name// required
            // let normal_stock = Number(stock)
            let logistic_info = logistics
            let wholesales;
            let preorder_shopee;

            let array_images = [];
            let attribute_list = [];
            let imageReq ;
            if(images){
                images.forEach(element => {
                    array_images.push(element.url);
                });

                imageReq = {
                    image_id_list: array_images
                };//Required
            }

            let kondisiShopee = condition == 'used' ? 'USED' : 'NEW'
            let statusShopee = status == 'active' ? 'NORMAL' : 'UNLIST';

            if (item_dangerous) {
                if (!Number.isInteger(item_dangerous)) {
                    response.message = "Field item_dangerous shall be integer";
                    response.code = 400;
                    res.status(response.code).send(response);
                    return;
                }
            }


            if (preorder) {
                if (preorder.duration) {
                    preorder_shopee={
                        is_pre_order:true,
                        days_to_ship:preorder.duration
                    }
                } else {
                    response.message = 'Include field preorder.duration if preorder is defined';
                    response.code = 400;
                    res.status(response.code).send(response);
                    return;
                }
            }

        if (wholesale_qty || wholesale_price) {
            if (wholesale_qty) {
                if (wholesale_price) {
                    if (Number.isInteger(wholesale_qty)) {
                        if (Number.isInteger(wholesale_price)) {
                            wholesales = [{
                                "min_count": Number(wholesale_qty),
                                "max_count": Number(wholesale_qty),
                                "unit_price": Number(wholesale_price),
                            }];
                        } else {
                            response.message = "Field wholesale_price shall be integer,";
                            response.code = 400;
                            res.status(response.code).send(response);
                            return;
                        }
                    } else {
                        response.message = "Field wholesale_qty shall be integer,";
                        response.code = 400;
                        res.status(response.code).send(response);
                        return;
                    }
                } else {
                    response.message = "Include field wholesale_price if wholesale_qty is defined,";
                    response.code = 400;
                    res.status(response.code).send(response);
                    return;
                }
            } else {
                response.message = "Include field wholesale_qty if wholesale_price is defined,";
                response.code = 400;
                res.status(response.code).send(response);
                return;
            }
        }
        if (brand) {
            if (brand_id !== null && brand !== undefined) {
                brandBody = {
                    brand_id: brand_id,
                    original_brand_name: brand
                }
            } else {
                response.message = "Field brand_id if brand_id is defined";
                response.code = 400;
                res.status(response.code).send(response);
                return;
            }
        }

        if (attributes) {
            if (!Array.isArray(attributes)) {
                response.code = 400;
                response.message = `Field variant in request body shall be array object`;
                res.status(response.code).send(response);
                return;
            } else if (attributes.length === 0) {
                response.code = 400;
                response.message = `Field variant cant be empty`;
                res.status(response.code).send(response);
                return;
            } else {
                for await (const element of attributes) {
                    if (element.attribute_id === null || element.attribute_id === undefined) {
                        response.code = 400;
                        response.message = "attribute_id is required in attributes field";
                        res.status(response.code).send(response);
                        return;
                    } else if (!Array.isArray(element.value)) {
                        response.code = 400;
                        response.message = `Field variant in request body shall be array object`;
                        res.status(response.code).send(response);
                        return;
                    } else if (element.value.length === 0) {
                        response.code = 400;
                        response.message = `Field value cant be empty in attributes field"`;
                        res.status(response.code).send(response);
                        return;
                    } else {
                        let attributes_value = [];
                        for await (const elementVal of element.value) {
                            let attr_value = {};
                            if (elementVal.id === null || elementVal.id === undefined) {
                                response.code = 400;
                                response.message = `Field value.[id] cant be empty in attributes field"`;
                                res.status(response.code).send(response);
                                return;
                            } else {
                                attr_value.value_id = elementVal.id;
                                if (elementVal.value_name) attr_value.original_value_name = elementVal.value_name;
                                if (elementVal.unit_value) attr_value.value_unit = elementVal.unit_value;

                                attributes_value.push(attr_value);
                            }
                        }
                        attribute_list.push(
                            {
                                attribute_id: element.attribute_id,
                                attribute_value_list: attributes_value
                            }
                        )

                    }

                }
            }
        }

        if (logistics) {
            if (!Array.isArray(logistics)) {
                response.code = 400;
                response.message = `Field variant in request body shall be array object`;
                res.status(response.code).send(response);
                return;
            } else if (logistics.length === 0) {
                response.code = 400;
                response.message = `Field variant cant be empty`;
                res.status(response.code).send(response);
                return;
            } else {
                logistics.forEach(element => {
                    if (element.logistic_id === null || element.logistic_id === undefined) {
                        response.code = 400;
                        response.message = "logistic_id is required in logistics field";
                        res.status(response.code).send(response);
                        return;
                    } else if (element.enabled === null || element.enabled === undefined) {
                        response.code = 400;
                        response.message = "enabled is required in logistics field";
                        res.status(response.code).send(response);
                        return;
                    } else if (element.shipping_fee === null || element.shipping_fee === undefined) {
                        response.code = 400;
                        response.message = "shipping_fee is required in logistics field";
                        res.status(response.code).send(response);
                        return;
                    } else if (element.size_id === null || element.size_id === undefined) {
                        response.code = 400;
                        response.message = "size_id is required in logistics field";
                        res.status(response.code).send(response);
                        return;
                    } else if (element.is_free === null || element.is_free === undefined) {
                        response.code = 400;
                        response.message = "is_free is required in logistics field";
                        res.status(response.code).send(response);
                        return;
                    }
                });
            }
        }

        if (height || length || width) {
            if (!height) {
                response.code = 400;
                response.message = `Field height if one of the field height,length,width is defined`;
                res.status(response.code).send(response);
                return;
            } else if (!length) {
                response.code = 400;
                response.message = `Field length if one of the field height,length,width is defined`;
                res.status(response.code).send(response);
                return;
            } else if (!width) {
                response.code = 400;
                response.message = `Field width if one of the field height,length,width is defined`;
                res.status(response.code).send(response);
                return;
            } else {
                dimension = {
                    package_height: height,
                    package_length: length,
                    package_width: width
                }
            }
        }

        if (response.code === 200) {
            let hitAPI = await apiShoppe.updateProduct(shop_id, product_id, descriptionShopee, weight, item_name, statusShopee, dimension, logistic_info, attribute_list, category_id, imageReq, preorder_shopee
                , item_sku, statusShopee,wholesales, url_video, brandBody, item_dangerous?Number(item_dangerous) == 1 ? 1 : 0:null, null, null,req.envStore)
            res.status(hitAPI.code).send(hitAPI);
        }
        return;
        } else if (marketplace == "blibli") {
            let items = [
                {
                    "height": height,
                    "itemSku": sku,
                    "length": length,
                    "merchantSku": sku,
                    "pickupPointCode": pickup_point_code,
                    "viewConfigs": [
                        {
                            "buyable": true,
                            "channelId": "DEFAULT"
                        }
                    ],
                    "weight": width,
                    "width": width
                }
            ]


            let hitAPI = await apiBlibli.updateProduct(shop_id, attributes, description, items, product_name, sku, description, 1, url_video)
            res.status(hitAPI.code).send(hitAPI);
            return;
        } else if (marketplace == "lazada") {
            if (sku_id === null || sku_id === undefined) {
                response.code = 400
                response.message = "Field sku_id in body is required in lazada marketplace,";
            } else {
                let arrayImage = "";
                images.forEach(element => {
                    arrayImage += `<Image>${element.url}</Image>`
                });
                let hitAPI = await apiLazada.updateProduct(product_id, product_name, description, sku_id, sku, stock, price, length, height, weight, width, arrayImage, null)
                res.status(hitAPI.code).send(hitAPI);
                return;
            }
            res.status(response.code).send(response);
            return;
        }
    }
    res.status(response.code).send(response);
});

//getAllProduct
router.get('/products', async function (req, res) {
    const search = req.query;
    const shop_id = search.shop_id;
    const marketplace = search.marketplace;
    const page = search.page;
    const limit = search.limit;

    if (marketplace === null || marketplace === undefined || marketplace === '') {
        response.code = 400
        response.message = "Parameter marketplace is required"
    } else if (marketplace !== "lazada" && marketplace !== "shopee" && marketplace !== "" && marketplace !== "tokopedia" && marketplace !== "blibli") {
        response.code = 400
        response.message = "Parameter marketplace only available for blibli ,lazada, shopee, or tokopedia"
    } else if (shop_id === null || shop_id === undefined) {
        response.code = 400
        response.message = "Parameter shop_id is required"
    } else {
        if (marketplace == "tokopedia") {
            // let hitAPI = await apiTokped.getProduct('shopid', search.productid, search.product_url, shop_id, page, limit, 1);
            let hitAPI = await apiTokped.getProduct('shopid', search.productid, search.product_url, shop_id, page, limit, 1, '', (req.envStore ? req.envStore : '')) // env
            res.status(hitAPI.code).send(hitAPI);
            return;
        } else if (marketplace == "shopee") {
            let hitAPI = await apiShoppe.getAllProducts(shop_id, page, limit, null, null, (req.envStore ? req.envStore : ''));
            res.status(hitAPI.code).send(hitAPI);
            return;
        } else if (marketplace == "blibli") {
            let hitAPI = await apiBlibli.getProducts(shop_id, "username");
            res.status(hitAPI.code).send(hitAPI);
            return;
        } else if (marketplace == "lazada") {
            let hitAPI = await apiLazada.getProducts(page, limit);
            res.status(hitAPI.code).send(hitAPI);
            return;
        }
    }
    res.status(response.code).send(response);
});

//getSingleProduct
router.get('/product', async function (req, res) {
    const search = req.query;
    const shop_id = search.shop_id;
    const marketplace = search.marketplace;

    const productId = search.productId;

    if (marketplace === null || marketplace === undefined || marketplace === '') {
        response.code = 400
        response.message = "Parameter marketplace is required"
    } else if (marketplace !== "lazada" && marketplace !== "shopee" && marketplace !== "" && marketplace !== "tokopedia" && marketplace !== "blibli") {
        response.code = 400
        response.message = "Parameter marketplace only available for blibli ,lazada, shopee, or tokopedia"
    } else if (shop_id === null || shop_id === undefined) {
        console.log(shop_id);
        response.code = 400
        response.message = "Parameter shop_id is required"
    } else if (productId === null || productId === undefined) {
        response.code = 400
        response.message = "Parameter productId is required"
    } else {
        if (marketplace == "tokopedia") {
            let hitAPI = await apiTokped.getProduct('pid', productId, search.product_url, shop_id, null, null, 1, null);
            res.status(hitAPI.code).send(hitAPI);
            return;
        } else if (marketplace == "shopee") {
            let hitAPI = await apiShoppe.getSingleProduct(shop_id, [Number(productId)], null, null, req.envStore)
            res.status(hitAPI.code).send(hitAPI);
            return;
        } else if (marketplace == "blibli") {
            let hitAPI = await apiBlibli.getSingleProduct(shop_id, productId)
            res.status(hitAPI.code).send(hitAPI);
            return;
        } else if (marketplace == "lazada") {
            let hitAPI = await apiLazada.getSingleProduct(productId);
            res.status(hitAPI.code).send(hitAPI);
            return;
        }
    }
    res.status(response.code).send(response)
});



//updatePrice
router.post('/product/update_price', async function (req, res) {
    const search = req.query;
    const shop_id = search.shop_id;
    const new_price = search.new_price;
    const product_id = search.product_id;
    const sku_id = search.sku_id;
    const marketplace = search.marketplace;

    console.log(product_id);
    if (marketplace === null || marketplace === undefined || marketplace === '') {
        response.code = 400
        response.message = "Parameter marketplace is required"
    } else if (marketplace !== "lazada" && marketplace !== "shopee" && marketplace !== "" && marketplace !== "tokopedia" && marketplace !== "blibli") {
        response.code = 400
        response.message = "Parameter marketplace only available for blibli ,lazada, shopee, or tokopedia"
    } else if (shop_id === null || shop_id === undefined) {
        response.code = 400
        response.message = "Parameter shop_id is required "
    } else if (new_price === null || new_price === undefined) {
        response.code = 400
        response.message = "Parameter new_price is required "
    } else if (product_id === null || product_id === undefined) {
        response.code = 400
        response.message = "Parameter product_id is required"
    } else if (marketplace == "lazada" && (sku_id === null || sku_id === undefined)) {
        response.code = 400
        response.message = "Parameter sku_id is required on lazada marketplace"
    } else {
        if (marketplace == "tokopedia") {
            let hitAPI = await apiTokped.updateProductPrice(shop_id, new_price, product_id);
            res.send(hitAPI);
            return;
        } else if (marketplace == "shopee") {
            let hitAPI = await apiShoppe.updatePrice(shop_id, Number(product_id), new_price,req.envStore);
            res.send(hitAPI);
            return;
        } else if (marketplace == "blibli") {
            let hitAPI = await apiBlibli.updateProductPrice(product_id, "username", shop_id, new_price)
            res.send(hitAPI);
            return;
        } else if (marketplace == "lazada") {
            let hitAPI = await apiLazada.updateProductPrice(product_id, new_price, sku_id)
            res.send(hitAPI);
            return;
        }
    }
    res.status(response.code).send(response)
});

//updateStock
router.post('/product/update_stock', async function (req, res) {
    const search = req.query;
    const shop_id = search.shop_id;
    const new_stock = search.new_stock;
    const product_id = search.product_id;
    const marketplace = search.marketplace;
    const sku_id = search.sku_id;

    console.log(shop_id);
    if (marketplace === null || marketplace === undefined) {
        response.code = 400
        response.message = "Parameter marketplace is required"
    } else if (marketplace !== "lazada" && marketplace !== "shopee" && marketplace !== "" && marketplace !== "tokopedia" && marketplace !== "blibli") {
        response.code = 400
        response.message = "Parameter marketplace only available for blibli ,lazada, shopee, or tokopedia"
    } else if (shop_id === null || shop_id === undefined) {
        response.code = 400
        response.message = "Parameter shop_id is required "
    } else if (new_stock === null || new_stock === undefined) {
        response.code = 400
        response.message = "Parameter new_stock is required "
    } else if (product_id === null || product_id === undefined) {
        response.code = 400
        response.message = "Parameter product_id is required"
    } else if (marketplace == "lazada" && (sku_id === null || sku_id === undefined)) {
        response.code = 400
        response.message = "Parameter sku_id is required on lazada marketplace"
    } else {
        if (marketplace == "tokopedia") {
            let hitAPI = await apiTokped.updateProductStock(shop_id, new_stock, product_id);
            console.log(hitAPI);
            res.send(hitAPI);
            return;
        } else if (marketplace == "shopee") {
            let hitAPI = await apiShoppe.updateStock(shop_id, Number(product_id), new_stock,req.envStore);
            res.send(hitAPI);
            return;
        } else if (marketplace == "blibli") {
            let hitAPI = await apiBlibli.updateProductStock(product_id, "username", shop_id, new_stock);
            res.send(hitAPI);
            return;
        } else if (marketplace == "lazada") {
            let hitAPI = await apiLazada.updateProductStock(product_id, new_stock, sku_id);
            res.send(hitAPI);
            return;
        }
    }
    res.status(response.code).send(response)
});


//delete
router.delete('/product/delete', async function (req, res) {
    const search = req.query;
    const shop_id = search.shop_id;
    const product_id = search.product_id;
    const marketplace = search.marketplace;

    if (marketplace === null || marketplace === undefined) {
        response.code = 400
        response.message = "Parameter marketplace is required"
    } else if (marketplace !== "lazada" && marketplace !== "shopee" && marketplace !== "" && marketplace !== "tokopedia" && marketplace !== "blibli") {
        response.code = 400
        response.message = "Parameter marketplace only available for blibli ,lazada, shopee, or tokopedia"
    } else if (shop_id === null || shop_id === undefined) {
        response.code = 400
        response.message = "Parameter shop_id is required "
    } else if (product_id === null || product_id === undefined) {
        response.code = 400
        response.message = "Parameter product_id is required"
    } else {
        if (marketplace == "tokopedia") {
            let hitAPI = await apiTokped.deleteProduct(shop_id, product_id);
            res.send(hitAPI);
            return;
        } else if (marketplace == "shopee") {
            response.code = 400
            response.message = "still not avalable for shoppe"
            response.marketplace = "shopee"
            res.status(response.code).send(response);
            return;
        } else if (marketplace == "blibli") {
            response.code = 400
            response.message = "still not avalable for blibli"
            response.marketplace = "blibli"
            res.status(response.code).send(response);
            return;
        } else if (marketplace == "lazada") {
            response.code = 400
            response.message = "still not avalable for lazada"
            response.marketplace = "lazada"
            res.status(response.code).send(response);
            return;
        }
    }
    res.status(response.code).send(response)
});

//updateState
router.post('/product/update_state', async function (req, res) {
    const search = req.query;
    const shop_id = search.shop_id;
    const state = search.state;
    const product_id = search.product_id;
    const marketplace = search.marketplace;

    if (marketplace === null || marketplace === undefined) {
        response.code = 400
        response.message = "Parameter marketplace is required"
    } else if (marketplace !== "lazada" && marketplace !== "shopee" && marketplace !== "" && marketplace !== "tokopedia" && marketplace !== "blibli") {
        response.code = 400
        response.message = "Parameter marketplace only available for blibli ,lazada, shopee, or tokopedia"
    } else if (shop_id === null || shop_id === undefined) {
        response.code = 400
        response.message = "Parameter shop_id is required "
    } else if (state === null || state === undefined) {
        response.code = 400
        response.message = "Parameter state is required "
    } else if (state !== "active" && state !== "inactive") {
        response.code = 400
        response.message = "Parameter state is only available for  active or inactive"
    } else if (marketplace == "lazada" && state !== "inactive") {
        response.code = 400
        response.message = "Parameter state on lazada is only available for inactive"
    } else if (product_id === null || product_id === undefined) {
        response.code = 400
        response.message = "Parameter product_id is required"
    } else {
        if (marketplace == "tokopedia") {
            let hitAPI = await apiTokped.updateProductState(state, shop_id, product_id);
            res.send(hitAPI);
            return;
        } else if (marketplace == "shopee") {
            response.code = 400
            response.message = "still not avalable for shoppe"
            response.marketplace = "shopee"
            res.status(response.code).send(response);
            return;
        } else if (marketplace == "blibli") {
            let hitAPI = await apiBlibli.updateState(product_id, shop_id, "username", state == "active" ? true : false);
            res.send(hitAPI);
            return;
        } else if (marketplace == "lazada") {
            let hitAPI = await apiLazada.updateState(product_id);
            res.send(hitAPI);
            return;
        }
    }
    res.status(response.code).send(response)
});



//get categories
router.get('/product/category', async function (req, res) {
    const search = req.query;
    const shop_id = search.shop_id;
    const keyword = search.keyword;
    const marketplace = search.marketplace;

    if (marketplace === null || marketplace === undefined) {
        response.code = 400
        response.message = "Parameter marketplace is required"
    } else if (marketplace !== "lazada" && marketplace !== "shopee" && marketplace !== "" && marketplace !== "tokopedia" && marketplace !== "blibli") {
        response.code = 400
        response.message = "Parameter marketplace only available for blibli ,lazada, shopee, or tokopedia"
    } else if (shop_id === null || shop_id === undefined) {
        response.code = 400
        response.message = "Parameter shop_id is required "
    } else {
        if (marketplace == "tokopedia") {
            let hitAPI = await apiTokped.getCategories(keyword);
            res.send(hitAPI);
            return;
        } else if (marketplace == "shopee") {
            let hitAPI = await apiShoppe.getCategory(shop_id,req.envStore);
            res.send(hitAPI);
            return;
        } else if (marketplace == "blibli") {
            let hitAPI = await apiBlibli.getCategory(shop_id);
            res.send(hitAPI);
            return;
        } else if (marketplace == "lazada") {
            let hitAPI = await apiLazada.getCategory(keyword);
            res.send(hitAPI);
            return;
        }
    }
    res.status(response.code).send(response)
});


//get etalase
router.get('/product/etalase', async function (req, res) {
    const search = req.query;
    const shop_id = search.shop_id;
    const marketplace = search.marketplace;

    if (marketplace === null || marketplace === undefined) {
        response.code = 400
        response.message = "Parameter marketplace is required"
    } else if (marketplace !== "lazada" && marketplace !== "shopee" && marketplace !== "" && marketplace !== "tokopedia" && marketplace !== "blibli") {
        response.code = 400
        response.message = "Parameter marketplace only available for blibli ,lazada, shopee, or tokopedia"
    } else if (shop_id === null || shop_id === undefined) {
        response.code = 400
        response.message = "Parameter shop_id is required "
    } else {
        if (marketplace == "tokopedia") {
            let hitAPI = await apiTokped.getAllEtalase(shop_id);
            res.send(hitAPI);
            return;
        } else if (marketplace == "shopee") {
            response.code = 400
            response.message = "still not avalable for shoppe"
            response.marketplace = "shopee"
            res.status(response.code).send(response);
            return;
        } else if (marketplace == "blibli") {
            response.code = 400
            response.message = "still not avalable for blibli"
            response.marketplace = "blibli"
            res.status(response.code).send(response);
            return;
        } else if (marketplace == "lazada") {
            response.code = 400
            response.message = "still not avalable for lazada"
            response.marketplace = "lazada"
            res.status(response.code).send(response);
            return;
        }
    }
    res.status(response.code).send(response)
});



//get variant
router.get('/product/variant', async function (req, res) {
    const search = req.query;
    const shop_id = search.shop_id;
    const marketplace = search.marketplace;
    const category_id = search.category_id;

    if (marketplace === null || marketplace === undefined) {
        response.code = 400
        response.message = "Parameter marketplace is required"
    } else if (marketplace !== "lazada" && marketplace !== "shopee" && marketplace !== "" && marketplace !== "tokopedia" && marketplace !== "blibli") {
        response.code = 400
        response.message = "Parameter marketplace only available for blibli ,lazada, shopee, or tokopedia"
    } else if (shop_id === null || shop_id === undefined) {
        response.code = 400
        response.message = "Parameter shop_id is required "
    } else if (category_id === null || category_id === undefined) {
        response.code = 400
        response.message = "Parameter category_id is required "
    } else {
        if (marketplace == "tokopedia") {
            let hitAPI = await apiTokped.getProductVariant("cat_id", null, category_id);
            res.send(hitAPI);
            return;
        } else if (marketplace == "shopee") {
            response.code = 400
            response.message = "still not avalable for shoppe"
            response.marketplace = "shopee"
            res.status(response.code).send(response);
            return;
        } else if (marketplace == "blibli") {
            response.code = 400
            response.message = "still not avalable for blibli"
            response.marketplace = "blibli"
            res.status(response.code).send(response);
            return;
        } else if (marketplace == "lazada") {
            response.code = 400
            response.message = "still not avalable for lazada"
            response.marketplace = "lazada"
            res.status(response.code).send(response);
            return;
        }
    }
    res.status(response.code).send(response)
});

//get pickup point
router.get('/pickup-point', async function (req, res) {
    const search = req.query;
    const shop_id = search.shop_id;
    const marketplace = search.marketplace;

    if (marketplace === null || marketplace === undefined) {
        response.code = 400
        response.message = "Parameter marketplace is required"
    } else if (marketplace !== "blibli") {
        response.code = 400
        response.message = "Parameter marketplace only available for blibli"
    } else if (shop_id === null || shop_id === undefined) {
        response.code = 400
        response.message = "Parameter shop_id is required "
    } else {
        if (marketplace == "tokopedia") {
            response.code = 400
            response.message = "still not avalable for shoppe"
            response.marketplace = "shopee"
            res.status(response.code).send(response);
            return;
        } else if (marketplace == "shopee") {
            response.code = 400
            response.message = "still not avalable for shoppe"
            response.marketplace = "shopee"
            res.status(response.code).send(response);
            return;
        } else if (marketplace == "blibli") {
            let hitAPI = await apiBlibli.getPickupPoint(shop_id);
            res.send(hitAPI);
            return;
        } else if (marketplace == "lazada") {
            response.code = 400
            response.message = "still not avalable for lazada"
            response.marketplace = "lazada"
            res.status(response.code).send(response);
            return;
        }
    }
    res.status(response.code).send(response)
});

//get get brand
router.get('/brands', async function (req, res) {
    const search = req.query;
    const shop_id = search.shop_id;
    const marketplace = search.marketplace;
    const category_id = search.category_id;

    const page = search.page;
    const limit = search.limit;
    const keyword = search.keyword;

    if (marketplace === null || marketplace === undefined) {
        response.code = 400
        response.message = "Parameter marketplace is required"
    } else if (marketplace !== "blibli" && marketplace !== "lazada" && marketplace !== "shopee") {
        response.code = 400
        response.message = "Parameter marketplace only available for blibli or lazada"
    } else if (shop_id === null || shop_id === undefined) {
        response.code = 400
        response.message = "Parameter shop_id is required "
    } else {
        if (marketplace == "tokopedia") {
            response.code = 400
            response.message = "still not avalable for tokopedia"
            response.marketplace = "shopee"
            res.status(response.code).send(response);
            return;
        } else if (marketplace == "shopee") {
            if (category_id === null || category_id === undefined) {
                response.code = 400
                response.message = "Parameter category_id is required on shopee"
            } else {
                let hitAPI = await apiShoppe.getBrands(shop_id, category_id, 'id', page, limit,req.envStore)
                res.send(hitAPI);
                return;
            }
        } else if (marketplace == "blibli") {
            let hitAPI = await apiBlibli.getBrands(shop_id, "username", keyword, page, limit);
            res.send(hitAPI);
            return;
        } else if (marketplace == "lazada") {
            let hitAPI = await apiLazada.getBrands(page, limit)
            res.send(hitAPI);
            return;
        }
    }
    res.status(response.code).send(response)
});


//get logistic
router.get('/logistic', async function (req, res) {
    const search = req.query;
    const shop_id = search.shop_id;
    const marketplace = search.marketplace;

    if (marketplace === null || marketplace === undefined) {
        response.code = 400
        response.message = "Parameter marketplace is required"
    } else if (marketplace !== "shopee") {
        response.code = 400
        response.message = "Parameter marketplace only available for shopee"
    } else if (shop_id === null || shop_id === undefined) {
        response.code = 400
        response.message = "Parameter shop_id is required "
    } else {
        if (marketplace == "tokopedia") {
            response.code = 400
            response.message = "still not avalable for tokopedia"
            response.marketplace = "tokopedia"
            res.status(response.code).send(response);
            return;
        } else if (marketplace == "shopee") {
            let hitAPI = await apiShoppe.getLogistic(shop_id,req.envStore)
            res.send(hitAPI);
            return;
        } else if (marketplace == "blibli") {
            response.code = 400
            response.message = "still not avalable for blibli"
            response.marketplace = "blibli"
            res.status(response.code).send(response);
            return;
        } else if (marketplace == "lazada") {
            response.code = 400
            response.message = "still not avalable for lazada"
            response.marketplace = "lazada"
            res.status(response.code).send(response);
            return;
        }
    }
    res.status(response.code).send(response)
});


//creation status
router.get('/product/creation-status', async function (req, res) {
    const search = req.query;
    const shop_id = search.shop_id;
    const marketplace = search.marketplace;
    const requestId = search.requestId;

    if (marketplace === null || marketplace === undefined) {
        response.code = 400
        response.message = "Parameter marketplace is required"
    } else if (marketplace !== "tokopedia" && marketplace !== "blibli") {
        response.code = 400
        response.message = "Parameter marketplace only available for tokopedia or blibli"
    } else if (shop_id === null || shop_id === undefined) {
        response.code = 400
        response.message = "Parameter shop_id is required "
    } else if (requestId === null || requestId === undefined) {
        response.code = 400
        response.message = "Parameter requestId is required "
    } else {
        if (marketplace == "tokopedia") {
            let hitAPI = await apiTokped.getStatusProduct(shop_id, requestId);
            res.send(hitAPI);
            return;
        } else if (marketplace == "shopee") {
            response.code = 400
            response.message = "still not avalable for shoppe"
            response.marketplace = "shopee"
            res.status(response.code).send(response);
            return;
        } else if (marketplace == "blibli") {
            let hitAPI = await apiBlibli.getCreationStatus(requestId, shop_id, "username")
            res.send(hitAPI);
            return;
        } else if (marketplace == "lazada") {
            response.code = 400
            response.message = "still not avalable for lazada"
            response.marketplace = "lazada"
            res.status(response.code).send(response);
            return;
        }
    }
    res.status(response.code).send(response)
});

//get attribute
router.get('/product/attribute', async function (req, res) {
    const search = req.query;
    const shop_id = search.shop_id;
    const marketplace = search.marketplace;
    const category_id = search.category_id;
    const language = search.language ? search.language : "id";
    let languageList = {
        English: 'en',
        Vietnamese: 'vi',
        Indonesian: 'id',
        Thai: 'th',
        'Traditional-Chinese': 'zh-Hant',
        "Simplified Chinese": 'zh-Hans',
        "Simplified Chinese": 'zh-Hans',
        "Malaysian Malay": "ms-my",
        "Brazil": "pt-br",
    }
    if (marketplace === null || marketplace === undefined) {
        response.code = 400
        response.message = "Parameter marketplace is required"
    } else if (marketplace !== "lazada" && marketplace !== "blibli" && marketplace !== "shopee") {
        response.code = 400
        response.message = "Parameter marketplace only available for lazada,shopee or blibli"
    } else if (shop_id === null || shop_id === undefined) {
        response.code = 400
        response.message = "Parameter shop_id is required "
    } else if (category_id === null || category_id === undefined) {
        response.code = 400
        response.message = "Parameter category_id is required "
    } else if (category_id === null || category_id === undefined) {
        response.code = 400
        response.message = "Parameter category_id is required "
    } else if (!Object.values(languageList).includes(language)) {
        response.code = 400
        response.message = "possible language is en(English), vi(Vietnamese), id(Indonesian), th(Thai), zh-Hant(Traditional Chinese), zh-Hans(Simplified Chinese), ms-my(Malaysian Malay), pt-br(Brazil). default value is 'id"
    } else {
        if (marketplace == "tokopedia") {
            let hitAPI = await apiTokped.getStatusProduct(shop_id, requestId);
            res.send(hitAPI);
            return;
        } else if (marketplace == "shopee") {
            let hitAPI = await apiShoppe.getAttribute(shop_id, language, category_id,req.envStore)
            res.send(hitAPI);
            return;
        } else if (marketplace == "blibli") {
            let hitAPI = await apiBlibli.getAttribute(category_id, shop_id, "username")
            res.send(hitAPI);
            return;
        } else if (marketplace == "lazada") {
            let hitAPI = await apiLazada.getAttribute(category_id, language);
            res.send(hitAPI);
            return;
        }
    }
    res.status(response.code).send(response)
});

//Request Pick UP
router.post('/request-pickup', async function (req, res) {
    const search = req.query;
    const shop_id = search.shop_id;
    const body = req.body;
    const marketplace = search.marketplace;

    const orders = body.orders;


    if (marketplace === null || marketplace === undefined) {
        response.code = 400;
        response.message = "Parameter marketplace is required";
    } else if (marketplace !== "lazada" && marketplace !== "shopee" && marketplace !== "" && marketplace !== "tokopedia" && marketplace !== "blibli") {
        response.code = 400;
        response.message = "Parameter marketplace only available for for blibli ,lazada, shopee, or tokopedia";
    } else if (shop_id === null || shop_id === undefined) {
        response.code = 400
        response.message = "Parameter shop_id is required "
    } else if (orders === null || orders === undefined) {
        response.code = 400
        response.message = "Filed orders in body is required "
    } else if (orders.length > 50) {
        response.code = 400
        response.message = "Max order is 50"
    } else {
        let hitAPI = {

        };
        if (marketplace == "tokopedia") {
            response.code = 200;
            response.message = "Your request has been processed successfully"
            response.marketplace = "tokopedia"
            if (orders.length == 0) {
                response.code = 400
                response.message = "Field orders can`t empty"
                res.status(response.code).send(response);
                return;
            } else {
                orders.forEach(async element => {
                    if (element.order_id == null || element.order_id == undefined) {
                        response.code = 400
                        response.message = "Field order_id on order list object is required"
                        res.status(response.code).send(response);
                        return;
                    } else {
                        hitAPI = await apiTokped.requestPickup(element.order_id, shop_id);
                        if (hitAPI.code != 200) {
                            res.status(hitAPI.code).send(hitAPI);
                            return;
                        } else {
                            res.status(response.code).send(response);
                            return;
                        }
                    }
                });
            }
            return;
        } else if (marketplace == "shopee") {
            response.code = 200;
            response.message = "Your request has been processed successfully"
            response.marketplace = "shopee"
            if (orders.length == 0) {
                response.code = 400
                response.message = "Field orders can`t empty"
                res.status(response.code).send(response);
                return;
            } else {
                let address_id;
                let pickup_time_id;
                let branch_id;
                let sender_real_name;
                let tracking_number;
                let slug;
                let non_integrated_pkgn;
                let package_number;
                let notError = true;
                orders.forEach(async element => {
                    if (element.order_id == null || element.order_id == undefined) {
                        response.code = 400
                        response.message = "Field order_id on order list object is required"
                        res.status(response.code).send(response);
                        return;
                    } else {
                        hitAPI = await apiShoppe.getShipParameter(shop_id, element.order_id,req.envStore);
                        console.log(hitAPI.code);
                        if (hitAPI.code !== 200) {
                            console.log(hitAPI);
                            notError = false;
                            res.status(hitAPI.code).send(hitAPI);
                            return;
                        } else {
                            if (response.info_needed.pickup) {
                                address_id = response.pickup.address_list[0].address_id
                                pickup_time_id = response.pickup.address_list[0].time_slot_list[0].pickup_time_id
                            } else if (response.info_needed.dropoff) {
                                branch_id = response.dropoff.branch_list[0].branch_id
                                if (response.info_needed.dropoff.includes("sender_real_name")) sender_real_name = response.info_needed.dropoff.sender_real_name;
                                if (response.info_needed.dropoff.includes("tracking_no")) sender_real_name = response.info_needed.dropoff.tracking_no;
                            } else {
                                if (response.info_needed.non_integrated[0] == "tracking_no") {
                                    if (element.no_awb == null || element.no_awb == undefined) {
                                        response.code = 400
                                        response.message = "Field no_awb on order list object is required"
                                        res.status(response.code).send(response);
                                        return;
                                    } else {
                                        non_integrated_pkgn = element.no_awb
                                    }
                                }
                            }

                            if (element.package_id) {
                                package_number = element.package_id;
                            }

                            if (notError) {
                                hitAPI = await apiShoppe.shipOrder(shop_id, element.order_id, package_number, address_id, pickup_time_id, tracking_number, branch_id, sender_real_name, tracking_number, slug, non_integrated_pkgn,req.envStore)
                                if (hitAPI.data.error == "") {
                                    res.status(response.code).send(response);
                                    return;
                                } else {
                                    res.status(hitAPI.code).send(hitAPI);
                                    return;
                                }
                            }
                        }
                    }
                })
            }
        } else if (marketplace == "blibli") {
            response.code = 200;
            if (orders.length == 0) {
                response.code = 400
                response.message = "Field orders can`t empty"
                res.status(response.code).send(response);
                return;
            } else {
                orders.forEach(async element => {
                    if (!element.product_type) {
                        response.code = 400
                        response.message = "Field product_type is required in blibli"
                        res.status(response.code).send(response);
                        return;
                    } else if (element.product_type == "regular") {
                        if (element.package_id) {
                            response.code = 400
                            response.message = "Field orders.package_id is required in blibli"
                            res.status(response.code).send(response);
                            return;
                        } else {
                            if (element.delivery_type) {
                                let enumDelivery = ['pickup', 'dropoff']
                                if (enumDelivery.includes(element.delivery_type)) {
                                    if (element.delivery_type == "dropoff") {
                                        if (!element.no_awb) {
                                            response.code = 400
                                            response.message = "Field orders.no_awb mandatory if delivery_type value is dropoff"
                                            res.status(response.code).send(response);
                                            return;
                                        }
                                    }
                                } else {
                                    response.code = 400
                                    response.message = "possible order.delivery_type for blibli is pickup or dropoff,"
                                    res.status(response.code).send(response);
                                    return;
                                }
                            }
                        }
                        if (response.code == 200) {
                            hitAPI = await apiBlibli.regularPickup(element.package_id, shop_id, "username", element.no_awb);
                            if (hitAPI.code != 200) {
                                res.status(hitAPI.code).send(hitAPI);
                                return;
                            } else {
                                response.code = 200;
                                response.message = "Your request has been processed successfully"
                                response.marketplace = "blibli"
                                res.status(response.code).send(response);
                                return;
                            }
                        }
                    } else if (element.product_type == "bigProduct") {
                        if (element.package_id) {
                            response.code = 400
                            response.message = "Field orders.package_id is required in blibli"
                            res.status(response.code).send(response);
                            return;
                        } else if (element.delivery_date_start) {
                            response.code = 400
                            response.message = "Field orders.delivery_date_start is required in blibli if product type bigProduct"
                            res.status(response.code).send(response);
                            return;
                        } else if (element.delivery_date_end) {
                            response.code = 400
                            response.message = "Field orders.delivery_date_end is required in blibli if product type bigProduct"
                            res.status(response.code).send(response);
                            return;
                        } else if (element.settlement_code) {
                            response.code = 400
                            response.message = "Field orders.settlement_code is required in blibli if product type bigProduct"
                            res.status(response.code).send(response);
                            return;
                        } else if (element.courier_name) {
                            response.code = 400
                            response.message = "Field orders.courier_name is required in blibli if product type bigProduct"
                            res.status(response.code).send(response);
                            return;
                        } else if (element.courier_type) {
                            response.code = 400
                            response.message = "Field orders.courier_type is required in blibli if product type bigProduct"
                            res.status(response.code).send(response);
                            return;
                        }
                        if (response.code == 200) {
                            hitAPI = await apiBlibli.bigProductPickup(element.package_id, shop_id, "username", element.delivery_date_start, element.delivery_date_end, element.courier_name, element.courier_type, element.settlement_code)
                            if (hitAPI.code != 200) {
                                res.status(hitAPI.code).send(hitAPI);
                                return;
                            } else {
                                response.code = 200;
                                response.message = "Your request has been processed successfully"
                                response.marketplace = "blibli"
                                res.status(response.code).send(response);
                                return;
                            }
                        }
                    } else if (element.product_type == "bopis") {
                        if (element.order_id) {
                            response.code = 400
                            response.message = "Field orders.order_id is required in blibli if product type bopis"
                            res.status(response.code).send(response);
                            return;
                        }

                        if (response.code == 200) {
                            hitAPI = await apiBlibli.bopisPickup(element.order_id, element.sku_id);
                            if (hitAPI.code != 200) {
                                res.status(hitAPI.code).send(hitAPI);
                                return;
                            } else {
                                response.code = 200;
                                response.message = "Your request has been processed successfully"
                                response.marketplace = "blibli"
                                res.status(response.code).send(response);
                                return;
                            }
                        }
                    } else if (element.product_type == "partial") {
                        if (element.order_id) {
                            response.code = 400
                            response.message = "Field orders.order_id is required in blibli if product type partial"
                            res.status(response.code).send(response);
                            return;
                        } else if (element.quantity) {
                            response.code = 400
                            response.message = "Field orders.quantity is required in blibli if product type partial"
                            res.status(response.code).send(response);
                            return;
                        }
                        if (response.code == 200) {
                            hitAPI = await apiBlibli.partialPickup(element.reason, element.order_id, element.quantity, element.invoice);
                            if (hitAPI.code != 200) {
                                res.status(hitAPI.code).send(hitAPI);
                                return;
                            } else {
                                response.code = 200;
                                response.message = "Your request has been processed successfully"
                                response.marketplace = "blibli"
                                res.status(response.code).send(response);
                                return;
                            }
                        }
                    } else {
                        response.code = 400
                        response.message = "product_type not support in blibli"
                        res.status(response.code).send(response);
                        return;
                    }
                })
            }
        } else if (marketplace == "lazada") {
            response.code = 200;
            response.message = "Your request has been processed successfully"
            response.marketplace = "lazada"
            if (orders.length == 0) {
                response.code = 400
                response.message = "Field orders can`t empty"
                res.status(response.code).send(response);
                return;
            } else {
                orders.forEach(async element => {
                    if (element.order_id == null || element.order_id == undefined) {
                        response.code = 400
                        response.message = "Field order_id on order list object is required"
                        res.status(response.code).send(response);
                        return;
                    } else if (element.delivery_type == null || element.delivery_type == undefined) {
                        response.code = 400
                        response.message = "Field delivery_type on order list object is required"
                        res.status(response.code).send(response);
                        return;
                    } else if (element.delivery_type != "dropship") {
                        response.code = 400
                        response.message = "Field delivery_type on lazada only dropship"
                        res.status(response.code).send(response);
                        return;
                    } else if (element.shipping_provider == null || element.shipping_provider == undefined) {
                        response.code = 400
                        response.message = "Field shipping_provider on order list object is required"
                        res.status(response.code).send(response);
                        return;
                    } else {
                        hitAPI = await apiLazada.acceptOrder(`[${element.order_id}]`, element.shipping_provider, element.delivery_type)
                        if (hitAPI.codeStatus != '0') {
                            res.status(hitAPI.code).send(hitAPI);
                            return;
                        } else {
                            hitAPI = await apiLazada.orderRts(`[${element.order_id}]`, element.shipping_provider, element.delivery_type, hitAPI.data.order_items[0].tracking_number);
                            if (hitAPI.codeStatus != '0') {
                                res.status(hitAPI.code).send(hitAPI);
                                return;
                            }
                            res.status(response.code).send(response);
                            return;
                        }
                    }
                });
            }
            return;
        }
    }
    if (response.message) {
        res.status(response.code).send(response);
    }
    return;
});


//get review
router.get('/product/reviews', async function (req, res) {
    const search = req.query;
    const shop_id = search.shop_id;
    const marketplace = search.marketplace;

    const productId = search.productId;

    if (marketplace === null || marketplace === undefined || marketplace === '') {
        response.code = 400
        response.message = "Parameter marketplace is required"
    } else if (marketplace !== "lazada" && marketplace !== "shopee" && marketplace !== "" && marketplace !== "tokopedia" && marketplace !== "blibli") {
        response.code = 400
        response.message = "Parameter marketplace only available for blibli ,lazada, shopee, or tokopedia"
    } else if (shop_id === null || shop_id === undefined) {
        console.log(shop_id);
        response.code = 400
        response.message = "Parameter shop_id is required"
    } else if (productId === null || productId === undefined) {
        response.code = 400
        response.message = "Parameter productId is required"
    } else {
        if (marketplace == "tokopedia") {
            response.code = 400
            response.message = "still not avalable for tokopedia"
            response.marketplace = "tokopedia"
            res.status(response.code).send(response);
            return;
        } else if (marketplace == "shopee") {
            response.code = 400
            response.message = "still not avalable for shopee"
            response.marketplace = "shopee"
            res.status(response.code).send(response);
            return;
        } else if (marketplace == "blibli") {
            response.code = 400
            response.message = "still not avalable for blibli"
            response.marketplace = "blibli"
            res.status(response.code).send(response);
            return;
        } else if (marketplace == "lazada") {
            let hitAPI = await apiLazada.getReviewProduct(productId)
            res.status(hitAPI.code).send(hitAPI);
            return;
        }
    }
    res.status(response.code).send(response)
});

//get review
router.post('/product/review/reply', async function (req, res) {
    const search = req.query;
    const shop_id = search.shop_id;
    const marketplace = search.marketplace;

    const review_id = search.review_id;
    const message = search.message;

    if (marketplace === null || marketplace === undefined || marketplace === '') {
        response.code = 400
        response.message = "Parameter marketplace is required"
    } else if (marketplace !== "lazada" && marketplace !== "shopee" && marketplace !== "" && marketplace !== "tokopedia" && marketplace !== "blibli") {
        response.code = 400
        response.message = "Parameter marketplace only available for blibli ,lazada, shopee, or tokopedia"
    } else if (shop_id === null || shop_id === undefined) {
        console.log(shop_id);
        response.code = 400
        response.message = "Parameter shop_id is required"
    } else if (review_id === null || review_id === undefined) {
        response.code = 400
        response.message = "Parameter review_id is required"
    } else if (message === null || message === undefined) {
        response.code = 400
        response.message = "Parameter message is required"
    } else {
        if (marketplace == "tokopedia") {
            response.code = 400
            response.message = "still not avalable for tokopedia"
            response.marketplace = "tokopedia"
            res.status(response.code).send(response);
            return;
        } else if (marketplace == "shopee") {
            response.code = 400
            response.message = "still not avalable for shopee"
            response.marketplace = "shopee"
            res.status(response.code).send(response);
            return;
        } else if (marketplace == "blibli") {
            response.code = 400
            response.message = "still not avalable for blibli"
            response.marketplace = "blibli"
            res.status(response.code).send(response);
            return;
        } else if (marketplace == "lazada") {
            let hitAPI = await apiLazada.sellerPostReview(review_id, message)
            res.status(hitAPI.code).send(hitAPI);
            return;
        }
    }
    res.status(response.code).send(response)
});


router.get('/product/discussion/list', async function (req, res) {
    const search = req.query;
    const shop_id = search.shop_id;
    const productId = search.productId;
    const page = search.page;
    const limit = search.limit;
    const marketplace = search.marketplace;
    const start_time = search.start_time;
    const end_time = search.end_time;

    if (marketplace === null || marketplace === undefined) {
        response.code = 400
        response.message = "Parameter marketplace is required"
    } else if (marketplace !== "lazada" && marketplace !== "shopee" && marketplace !== "" && marketplace !== "tokopedia" && marketplace !== "blibli") {
        response.code = 400
        response.message = "Parameter marketplace only available for blibli ,lazada, shopee, or tokopedia"
    } else if (shop_id === null || shop_id === undefined) {
        response.code = 400
        response.message = "Parameter shop_id is required "
    } else if (productId === null || productId === undefined) {
        response.code = 400
        response.message = "Parameter productId is required "
    } else {
        if (marketplace == "tokopedia") {
            let hitAPI = await apiTokped.getProductDiscussion(shop_id, productId, page, limit)
            res.send(hitAPI);
            return;
        } else if (marketplace == "shopee") {
            let hitAPI = await apiShoppe.getProductDiscussion(shop_id, productId, null, page, limit,req.envStore)
            res.send(hitAPI);
            return;
        } else if (marketplace == "blibli") {
            let hitAPI = await apiBlibli.getProductDiscussion(shop_id, "username", unixTms(start_time), unixTms(end_time), page, limit)
            res.send(hitAPI);
            return;
        } else if (marketplace == "lazada") {
            response.code = 400
            response.message = "still not avalable for lazada"
            response.marketplace = "lazada"
            res.status(response.code).send(response);
            return;
        }
    }
    res.status(response.code).send(response)
});

//get reply
router.get('/product/discussion', async function (req, res) {
    const search = req.query;
    const shop_id = search.shop_id;
    const start_time = search.start_time;
    const end_time = search.end_time;
    const page = search.page;
    const limit = search.limit;
    const marketplace = search.marketplace;
    const comment_id = search.comment_id;

    if (marketplace === null || marketplace === undefined) {
        response.code = 400
        response.message = "Parameter marketplace is required"
    } else if (marketplace !== "lazada" && marketplace !== "shopee" && marketplace !== "" && marketplace !== "tokopedia" && marketplace !== "blibli") {
        response.code = 400
        response.message = "Parameter marketplace only available for blibli ,lazada, shopee, or tokopedia"
    } else if (shop_id === null || shop_id === undefined) {
        response.code = 400
        response.message = "Parameter shop_id is required "
    } else if (comment_id === null || comment_id === undefined) {
        response.code = 400
        response.message = "Parameter comment_id is required "
    } else {
        if (marketplace == "tokopedia") {
            response.code = 400
            response.message = "still not avalable for tokopedia"
            response.marketplace = "tokopedia"
            res.status(response.code).send(response);
            return;
        } else if (marketplace == "shopee") {
            let hitAPI = await apiShoppe.getProductDiscussion(shop_id, null, comment_id, page, limit,req.envStore)
            res.send(hitAPI);
            return;
        } else if (marketplace == "blibli") {
            let hitAPI = await apiBlibli.getReply(comment_id, shop_id, "username", page, limit);
            res.send(hitAPI);
            return;
        } else if (marketplace == "lazada") {
            response.code = 400
            response.message = "still not avalable for lazada"
            response.marketplace = "lazada"
            res.status(response.code).send(response);
            return;
        }
    }
    res.status(response.code).send(response)
});





//post chat
router.post('/product/discussion/reply', async function (req, res) {
    const search = req.query;
    const shop_id = search.shop_id;
    const start_time = search.start_time;
    const end_time = search.end_time;
    const page = search.page;
    const limit = search.limit;
    const marketplace = search.marketplace;
    const message = search.message;
    const chatid = search.chatid;

    if (marketplace === null || marketplace === undefined) {
        response.code = 400
        response.message = "Parameter marketplace is required"
    } else if (marketplace !== "lazada" && marketplace !== "shopee" && marketplace !== "" && marketplace !== "tokopedia" && marketplace !== "blibli") {
        response.code = 400
        response.message = "Parameter marketplace only available for blibli ,lazada, shopee, or tokopedia"
    } else if (shop_id === null || shop_id === undefined) {
        response.code = 400
        response.message = "Parameter shop_id is required "
    } else if (chatid === null || chatid === undefined) {
        response.code = 400
        response.message = "Parameter chatid is required "
    } else if (message === null || message === undefined) {
        response.code = 400
        response.message = "Parameter message is required "
    } else {
        if (marketplace == "tokopedia") {
            response.code = 400
            response.message = "still not avalable for tokopedia"
            response.marketplace = "tokopedia"
            res.status(response.code).send(response);
            return;
        } else if (marketplace == "shopee") {
            let hitAPI = await apiShoppe.postProductDiscussion(shop_id, comment_id, message,req.envStore)
            res.send(hitAPI);
            return;
        } else if (marketplace == "blibli") {
            let hitAPI = await apiBlibli.postReply(chatid, shop_id, "username", message);
            res.send(hitAPI);
            return;
        } else if (marketplace == "lazada") {
            response.code = 400
            response.message = "still not avalable for lazada"
            response.marketplace = "lazada"
            res.status(response.code).send(response);
            return;
        }
    }
    res.status(response.code).send(response)
});




//get shop info
router.get('/shop_info', async function (req, res) {
    const search = req.query;
    const shop_id = search.shop_id;
    const marketplace = search.marketplace;

    const page = search.page;
    const limit = search.limit;

    if (marketplace === null || marketplace === undefined || marketplace === '') {
        response.code = 400
        response.message = "Parameter marketplace is required"
    } else if (marketplace !== "lazada" && marketplace !== "shopee" && marketplace !== "" && marketplace !== "tokopedia" && marketplace !== "blibli") {
        response.code = 400
        response.message = "Parameter marketplace only available for blibli ,lazada, shopee, or tokopedia"
    } else if (shop_id === null || shop_id === undefined) {
        console.log(shop_id);
        response.code = 400
        response.message = "Parameter shop_id is required"
    } else {
        if (marketplace == "tokopedia") {
            let hitAPI = await apiTokped.getShopInfo(shop_id, page, limit);
            res.send(hitAPI);
            return;
        } else if (marketplace == "shopee") {
            let hitAPI = await apiShoppe.getShopInfo(shop_id,req.envStore);
            res.send(hitAPI);
            return;
        } else if (marketplace == "blibli") {
            response.code = 400
            response.message = "still not avalable for blibli"
            response.marketplace = "blibli"
            res.status(response.code).send(response);
            return;
        } else if (marketplace == "lazada") {
            response.code = 400
            response.message = "still not avalable for lazada"
            response.marketplace = "lazada"
            res.status(response.code).send(response);
            return;
        }
    }
    res.status(response.code).send(response)
});


//get shop info
router.post('/shop_info/update', async function (req, res) {
    const search = req.query;
    const body = req.body;
    const shop_id = search.shop_id;
    const marketplace = search.marketplace;


    const display_pickup_address = body.display_pickup_address;
    const shop_name = body.shop_name;
    const offer = body.offer;
    const shop_description = body.shop_description;
    const videos = body.videos;
    const images = body.images;
    const start_date = body.start_date;
    const end_date = body.end_date;
    const action = body.action;

    const close_note = body.close_note;
    const close_now = body.close_now;




    if (marketplace === null || marketplace === undefined || marketplace === '') {
        response.code = 400
        response.message = "Parameter marketplace is required"
    } else if (marketplace !== "lazada" && marketplace !== "shopee" && marketplace !== "" && marketplace !== "tokopedia" && marketplace !== "blibli") {
        response.code = 400
        response.message = "Parameter marketplace only available for blibli ,lazada, shopee, or tokopedia"
    } else if (shop_id === null || shop_id === undefined) {
        console.log(shop_id);
        response.code = 400
        response.message = "Parameter shop_id is required"
    } else {
        if (marketplace == "tokopedia") {
            if (action === null || action === undefined) {
                response.code = 400
                response.message = "Field action on body is required on tokopedia"
            } else if (action !== "open" && action !== "close") {
                response.code = 400
                response.message = "Field action on body action is only available open or close"
            } else {
                if (action === "close") {
                    if (start_date === null || start_date === undefined) {
                        response.code = 400
                        response.message = "Field start_date on body is required if action is close"
                    } else if (!isValidDate(start_date)) {
                        response.code = 400
                        response.message = "Field start_date on body  format is YYYY-MM-DD"
                    } else if (end_date === null || end_date === undefined) {
                        response.code = 400
                        response.message = "Field end_date on body is required if action is close"
                    } else if (!isValidDate(end_date)) {
                        response.code = 400
                        response.message = "Field end_date on body format is YYYY-MM-DD"
                    } else if (close_now === null || close_now === undefined) {
                        response.code = 400
                        response.message = "Field close_now on body is required if action is close"
                    } else if (!typeof close_now == "boolean") {
                        response.code = 400
                        response.message = "Field close_now on body should be boolean"
                    } if (close_note === null || close_note === undefined) {
                        response.code = 400
                        response.message = "Field close_note on body is required if action is close"
                    } else {
                        let hitAPI = await apiTokped.updateShopInfo(shop_id, action, moment(start_date).format("YYYYMMDD"), moment(end_date).format("YYYYMMDD"), close_note, close_now);
                        res.send(hitAPI);
                        return;
                    }
                } else {
                    let hitAPI = await apiTokped.updateShopInfo(shop_id, action, start_date, end_date, close_note, close_now);
                    res.send(hitAPI);
                    return;
                }
            }
        } else if (marketplace == "shopee") {

            if (offer) {
                if (offer !== true || offer !== false) {
                    response.code = 400
                    response.message = "Parameter offer is only available true or false"
                    res.status(response.code).send(response);
                    return;
                }
            }
            if (display_pickup_address) {
                if (display_pickup_address !== true || display_pickup_address !== false) {
                    response.code = 400
                    response.message = "Parameter display_pickup_address is only available true or false"
                    res.status(response.code).send(response);
                    return;
                }
            }

            let arrayImage = [];
            if (images) {
                images.forEach(element => {
                    if (element.url === null && element.url === undefined) {
                        response.code = 400;
                        response.message = "url is required in images field";
                        res.status(response.code).send(response);
                        return;
                    } else {
                        arrayImage.push(element.url);
                    }
                });
            }

            let arrayVideo = [];
            if (videos) {
                videos.forEach(element => {
                    if (element.url === null && element.url === undefined) {
                        response.code = 400;
                        response.message = "url is required in images field";
                        res.status(response.code).send(response);
                        return;
                    } else {
                        arrayVideo.push(element.url);
                    }
                });
            }
            let hitAPI = await apiShoppe.updateShopInfo(shop_id, shop_description, display_pickup_address, offer ? 0 : 1, arrayVideo, arrayImage, shop_name,req.envStore)
            res.send(hitAPI);
            return;
        } else if (marketplace == "blibli") {
            response.code = 400
            response.message = "still not avalable for blibli"
            response.marketplace = "blibli"
            res.status(response.code).send(response);
            return;
        } else if (marketplace == "lazada") {
            response.code = 400
            response.message = "still not avalable for lazada"
            response.marketplace = "lazada"
            res.status(response.code).send(response);
            return;
        }
    }
    res.status(response.code).send(response)
});

//getAllProduct v2
router.get('/products_', async function (req, res) {
    const search = req.query
    const shop_id = search.shop_id
    let marketplace = search.marketplace
    const page = search.page
    const limit = search.limit

    if (shop_id === null || shop_id === undefined) {
        response.code = 400
        response.message = "Parameter shop_id is required"
    } else if (!req.envStore.marketplace) {
        response.code = 400
        response.message = "shop_id not found"
    } else {
        marketplace = req.envStore.marketplace
        if (marketplace == "tokopedia") {
            let hitAPI = await apiTokped.getProduct('shopid', search.productid, search.product_url, shop_id, page, limit, 1, '', req.envStore) // env
            res.status(hitAPI.code).send(hitAPI)
            return
        } else if (marketplace == "shopee") {
            let hitAPI = await apiShoppe.getAllProducts(shop_id, page, limit)
            res.status(hitAPI.code).send(hitAPI)
            return
        } else if (marketplace == "blibli") {
            let hitAPI = await apiBlibli.getProducts(shop_id, "username")
            res.status(hitAPI.code).send(hitAPI)
            return
        } else if (marketplace == "lazada") {
            let hitAPI = await apiLazada.getProducts(page, limit)
            res.status(hitAPI.code).send(hitAPI)
            return
        }
    }
    res.status(response.code).send(response)
})

router.get('/generate_auth_link', async function (req, res) {
    const search = req.query

    res.send(apiShoppe.getCode(req.envStore));
});


router.get('/generate_code', async function (req, res) {
    const search = req.query
    const shop_id = search.shop_id
    const code = search.code
    if (shop_id === null || shop_id === undefined) {
        response.code = 400
        response.message = "Parameter shop_id is required"
        res.send(response);
    } else if (code === null || code === undefined) {
        response.code = 400
        response.message = "Parameter code is required"
        res.send(response);
    } else {
        res.send(await apiShoppe.getToken(shop_id, null, code, req.envStore));
    }
});


router.get('/generate_refresh', async function (req, res) {
    const search = req.query
    const shop_id = search.shop_id
    const refresh_token = search.refresh_token
    if (shop_id === null || shop_id === undefined) {
        response.code = 400
        response.message = "Parameter shop_id is required"
        res.send(response);
    } else if (refresh_token === null || refresh_token === undefined) {
        response.code = 400
        response.message = "Parameter refresh_token is required"
        res.send(response);
    } else {
        res.send(await apiShoppe.getRefreshToken(shop_id, null, refresh_token, req.envStore));
    }
});

module.exports = router;
