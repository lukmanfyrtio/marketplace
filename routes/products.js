const apiShoppe = require('../api_marketplace/api_shoppe.js')
const apiTokped = require('../api_marketplace/api_tokped.js')
const apiBlibli = require('../api_marketplace/api_blibli.js')
const apiLazada = require('../api_marketplace/api_lazada.js')

const express = require('express')
const router = express.Router();

let response = {
    timestamp: new Date().getTime()
}

function isFloat(n) {
    return Number(n) === n && n % 1 !== 0;
}

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


    const dangerous_goods_level = body.dangerous_goods_level
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
    } else if (unit_weight !== "kg" && marketplace !== "gr") {
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
                    }
                    else {
                        $preorder_time = 'DAY';
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
                let array_variant = [];
                variant.forEach(element => {
                    if (element.status) {
                        status = element.status;
                        if (status !== 'inactive' && status !== 'active') response.message = 'variant status is only "active" or "inactive';
                    } else {
                        response.message = 'Field variant status in body is required';
                    }

                    let status_tokped = status == 'active' ? 'LIMITED' : 'EMPTY';
                    let stock_variant;
                    let sku_variant;
                    let price_variant;

                    if (element.price) {
                        price = element.price;
                        price_variant = element.price;

                        if (isInteger(price)) {
                            response.message = 'Field variant price shall be integer, ';
                        } else {
                            if (price <= 100 || price >= 100000000) response.message = 'The possible variant price between 100 to 100.000.000, ';
                        }
                    } else {
                        response.message = 'Field variant price in body is required, ';
                    }

                    if (element.stock) {
                        stock = element.stock;
                        stock_variant = element.stock;
                        if (isInteger(stock)) {
                            response.message = 'Field variant stock shall be integer, ';
                        } else {
                            if (stock <= 1 || stock >= 1000) response.message = 'The variant stock possible stock between 1 to 1.000, ';
                        }
                    } else {
                        response.message = 'Field variant stock in body is required, ';
                    }


                    if (element.sku) {
                        sku_variant = element.sku;
                    } else {
                        response.message = 'Field variant sku in body is required, ';
                    }


                    let arrayImageVariant = []
                    if (element.images) {
                        element.images.forEach(element => {
                            if (element.url === null && element.url === undefined) {
                                response.code = 400;
                                response.message = "url is required in images field";
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
                        sku: sku_variant,
                        combination: element.variant_id,
                        pictures: arrayImageVariant
                    }
                    array_variant.push(variant);

                });
                if (selection) {
                    selection = selection
                } else {
                    response.message = 'Field selection for variant is required ';
                }

                variantTokped = {
                    products: array_variant,
                    selection: selection
                }

            }

            let hitAPI = await apiTokped.createProductV3(shop_id, product_name, Number(category_id), 'IDR', Number(price), status_tokped, minimum_order, weight, u_weight, kondisi
                , dimension, custom_product_logistics, annotations, etalase, description, is_must_insurance, is_free_return, sku, Number(stock), wholesale_tokped, preorderTokopedia
                , arrayImage, videos, variantTokped)
            res.status(hitAPI.code).send(hitAPI);
            return;
        } else if (marketplace == "shopee") {

            let original_price = Number(price)
            let description = description
            let item_name = product_name
            let normal_stock = Number(stock)
            let logistic_info = logistics
            let category_id = Number(category_id)
            let image = imageReq
            let condition = kondisiShoppe
            let item_status = status
            let wholesales;


            if (logistics) {
                response.message = "Field logistics in body is required,";
            } else if (item_dangerous) {
                if (Number.isInteger(item_dangerous)) {
                    //set item_dangerous
                    body.item_dangerous = item_dangerous
                } else {
                    response.message = "Field item_dangerous shall be integer";
                }
            } else if (wholesale_qty || wholesale_price) {
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
                                esponse.message = "Field wholesale_price shall be integer,";
                            }
                        } else {
                            esponse.message = "Field wholesale_qty shall be integer,";
                        }
                    } else {
                        response.message = "Include field wholesale_price if wholesale_qty is defined,";
                    }
                } else {
                    response.message = "Include field wholesale_qty if wholesale_price is defined,";
                }
            } else {

                let array_images = [];
                images.forEach(element => {
                    array_images.push(element.url);
                });
                let imageReq = {
                    image_id_list: array_images
                }

                kondisiShopee = condition == 'used' ? 'USED' : 'NEW'
                statusShopee = status == 'active' ? 'NORMAL' : 'UNLIST';
            }
        } else if (marketplace == "blibli") {
            response.code = 400
            response.message = "still not avalable for blibli"
            response.marketplace = "blibli"
            res.status(response.code).send(response);
            return;
        } else if (marketplace == "lazada") {
            response.code = 400
            console.log(weight);
            console.log("is weight");
            if (brand === null || brand === undefined) {
                response.message = "Field brand in body is required,";
            }else if(height === null || height === undefined){
                response.message = "Field height in body is required,";
            }else if(length === null || length === undefined){
                response.message = "Field length in body is required,";
            }else if(width === null || width === undefined){
                response.message = "Field width in body is required,";
            }else if(height === null || height === undefined){
                response.message = "Field height in body is required,";
            }else if(weight === null || weight === undefined){
                response.message = "Field weight in body is required,";
            }else{
                let arrayImage ="";
                images.forEach(element => {
                    arrayImage+= `<Image>${element.url}</Image>`
                });
                let hitAPI=await apiLazada.createProduct(
                    category_id,arrayImage,product_name,description,brand,"","",url_video,"",sku,"","",stock
    ,price,length,height,weight,width,"",arrayImage
                )
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


    const dangerous_goods_level = body.dangerous_goods_level
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
    } else if (unit_weight !== "kg" && marketplace !== "gr") {
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
                    }
                    else {
                        $preorder_time = 'DAY';
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
                let array_variant = [];
                variant.forEach(element => {
                    if (element.status) {
                        status = element.status;
                        if (status !== 'inactive' && status !== 'active') response.message = 'variant status is only "active" or "inactive';
                    } else {
                        response.message = 'Field variant status in body is required';
                    }

                    let status_tokped = status == 'active' ? 'LIMITED' : 'EMPTY';
                    let stock_variant;
                    let sku_variant;
                    let price_variant;

                    if (element.price) {
                        price = element.price;
                        price_variant = element.price;

                        if (isInteger(price)) {
                            response.message = 'Field variant price shall be integer, ';
                        } else {
                            if (price <= 100 || price >= 100000000) response.message = 'The possible variant price between 100 to 100.000.000, ';
                        }
                    } else {
                        response.message = 'Field variant price in body is required, ';
                    }

                    if (element.stock) {
                        stock = element.stock;
                        stock_variant = element.stock;
                        if (isInteger(stock)) {
                            response.message = 'Field variant stock shall be integer, ';
                        } else {
                            if (stock <= 1 || stock >= 1000) response.message = 'The variant stock possible stock between 1 to 1.000, ';
                        }
                    } else {
                        response.message = 'Field variant stock in body is required, ';
                    }


                    if (element.sku) {
                        sku_variant = element.sku;
                    } else {
                        response.message = 'Field variant sku in body is required, ';
                    }


                    let arrayImageVariant = []
                    if (element.images) {
                        element.images.forEach(element => {
                            if (element.url === null && element.url === undefined) {
                                response.code = 400;
                                response.message = "url is required in images field";
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
                        sku: sku_variant,
                        combination: element.variant_id,
                        pictures: arrayImageVariant
                    }
                    array_variant.push(variant);

                });
                if (selection) {
                    selection = selection
                    variantTokped.selection = selection
                } else {
                    response.message = 'Field selection for variant is required ';
                }
                if (variantTokped.length !== 0) {
                    variant.products = array_variant
                }

            }

            let hitAPI = await apiTokped.updateProductV3(shop_id, product_name, product_id, Number(category_id), 'IDR', Number(price), status_tokped, minimum_order, weight, u_weight, kondisi
                , dimension, custom_product_logistics, annotations, etalase, description, is_must_insurance, is_free_return, sku, Number(stock), wholesale_tokped, preorderTokopedia
                , arrayImage, videos, variantTokped)
            res.status(hitAPI.code).send(hitAPI);
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
            if (sku_id === null || sku_id === undefined) {
                response.code = 400
                response.message = "Field sku_id in body is required in lazada marketplace,";
            }else{
                let arrayImage ="";
                images.forEach(element => {
                    arrayImage+= `<Image>${element.url}</Image>`
                });
            let hitAPI = await apiLazada.updateProduct(product_id,product_name,description,sku_id,sku,stock,price,length,height,weight,width,arrayImage,null)
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
            let hitAPI = await apiTokped.getProduct('shopid', search.productid, search.product_url, shop_id, page, limit, 1);
            res.status(hitAPI.code).send(hitAPI);
            return;
        } else if (marketplace == "shopee") {
            let hitAPI = await apiShoppe.getAllProducts(shop_id, page, limit);
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
            let hitAPI = await apiShoppe.getSingleProduct(shop_id, [Number(productId)])
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
    } else if (marketplace == "lazada" && sku_id === null || sku_id === undefined) {
        response.code = 400
        response.message = "Parameter sku_id is required on lazada marketplace"
    } else {
        if (marketplace == "tokopedia") {
            let hitAPI = await apiTokped.updateProductPrice(shop_id, new_price, product_id);
            res.send(hitAPI);
            return;
        } else if (marketplace == "shopee") {
            let hitAPI = await apiShoppe.updatePrice(shop_id, product_id, new_price);
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
    } else if (marketplace == "lazada" && sku_id === null || sku_id === undefined) {
        response.code = 400
        response.message = "Parameter sku_id is required on lazada marketplace"
    } else {
        if (marketplace == "tokopedia") {
            let hitAPI = await apiTokped.updateProductStock(shop_id, new_stock, product_id);
            console.log(hitAPI);
            res.send(hitAPI);
            return;
        } else if (marketplace == "shopee") {
            let hitAPI = await apiShoppe.updateStock(shop_id, product_id, new_stock);
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
    } else if (marketplace=="lazada" &&state !== "inactive") {
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
            let hitAPI = await apiShoppe.updateState(shop_id, state == "active" ? true : false, product_id);
            res.send(hitAPI);
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
            let hitAPI = await apiShoppe.getCategory(shop_id);
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

    const page = search.page;
    const limit = search.limit;
    const keyword = search.keyword;

    if (marketplace === null || marketplace === undefined) {
        response.code = 400
        response.message = "Parameter marketplace is required"
    } else if (marketplace !== "blibli" && marketplace !== "lazada") {
        response.code = 400
        response.message = "Parameter marketplace only available for blibli or lazada"
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
    } else if (marketplace !== "shoppe") {
        response.code = 400
        response.message = "Parameter marketplace only available for shoppe"
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


//creation status
router.get('/product/creation-status', async function (req, res) {
    const search = req.query;
    const shop_id = search.shop_id;
    const marketplace = search.marketplace;
    const requestId = search.requestId;

    if (marketplace === null || marketplace === undefined) {
        response.code = 400
        response.message = "Parameter marketplace is required"
    } else if (marketplace !== "tokopedia" || marketplace !== "blibli") {
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
    } else if (marketplace !== "lazada" || marketplace !== "blibli" || marketplace !== "shopee") {
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
    } else if (Object.values(languageList).includes(language)) {
        response.message = "possible value is en(English), vi(Vietnamese), id(Indonesian), th(Thai), zh-Hant(Traditional Chinese), zh-Hans(Simplified Chinese), ms-my(Malaysian Malay), pt-br(Brazil). default value is 'id"
    } else {
        if (marketplace == "tokopedia") {
            let hitAPI = await apiTokped.getStatusProduct(shop_id, requestId);
            res.send(hitAPI);
            return;
        } else if (marketplace == "shopee") {
            let hitAPI = await apiShoppe.getAttribute(shop_id, language, category_id)
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
    const marketplace = search.marketplace;


    console.log(req.body);

    req.body.order.forEach(element => {
        console.log(element.order_id);
    });


    if (marketplace === null || marketplace === undefined) {
        response.code = 400;
        response.message = "Parameter marketplace is required";
    } else if (marketplace !== "lazada" && marketplace !== "shopee" && marketplace !== "" && marketplace !== "tokopedia" && marketplace !== "blibli") {
        response.code = 400;
        response.message = "Parameter marketplace only available for for blibli ,lazada, shopee, or tokopedia";
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






module.exports = router;


