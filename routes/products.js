const apiTokped = require('../api_marketplace/api_tokped.js')

const express = require('express')
const router = express.Router();

let response = {
    code: 404,
    message: "Something Wrong"
}

//getAllProduct
router.get('/products', async function (req, res) {
    const search = req.query;
    const shop_id = search.shop_id;
    const marketplace = search.marketplace;
    const page = search.page;
    const limit = search.limit;

    if (marketplace === null || marketplace === undefined|| marketplace === '') {
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
            console.log("hitShoppe");
        } else if (marketplace == "blibli") {
            console.log("hitBliBli");
        } else if (marketplace == "lazada") {
            console.log("hitLazada");
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

    if (marketplace === null || marketplace === undefined|| marketplace === '') {
        response.code = 400
        response.message = "Parameter marketplace is required"
    } else if (marketplace !== "lazada" && marketplace !== "shopee" && marketplace !== "" && marketplace !== "tokopedia" && marketplace !== "blibli") {
        response.code = 400
        response.message = "Parameter marketplace only available for blibli ,lazada, shopee, or tokopedia"
    }else if (shop_id === null || shop_id === undefined) {
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
            console.log("hitShoppe");
        } else if (marketplace == "blibli") {
            console.log("hitBliBli");
        } else if (marketplace == "lazada") {
            console.log("hitLazada");
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
    const marketplace = search.marketplace;

    console.log(product_id);
    if (marketplace === null || marketplace === undefined|| marketplace === '') {
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
    } else {
        if (marketplace == "tokopedia") {
            let hitAPI = await apiTokped.updateProductPrice(shop_id, new_price, product_id);
            res.send(hitAPI);
            return;
        } else if (marketplace == "shopee") {
            console.log("hitShoppe");
        } else if (marketplace == "blibli") {
            console.log("hitBliBli");
        } else if (marketplace == "lazada") {
            console.log("hitLazada");
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
    } else {
        if (marketplace == "tokopedia") {
            let hitAPI = await apiTokped.updateProductStock(shop_id, new_stock, product_id);
            console.log(hitAPI);
            res.send(hitAPI);
            return;
        } else if (marketplace == "shopee") {
            console.log("hitShoppe");
        } else if (marketplace == "blibli") {
            console.log("hitBliBli");
        } else if (marketplace == "lazada") {
            console.log("hitLazada");
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
    } else if (product_id === null || product_id === undefined) {
        response.code = 400
        response.message = "Parameter product_id is required"
    } else {
        if (marketplace == "tokopedia") {
            let hitAPI = await apiTokped.updateProductState(state, shop_id, product_id);
            res.send(hitAPI);
            return;
        } else if (marketplace == "shopee") {
            console.log("hitShoppe");
        } else if (marketplace == "blibli") {
            console.log("hitBliBli");
        } else if (marketplace == "lazada") {
            console.log("hitLazada");
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
            console.log("hitShoppe");
        } else if (marketplace == "blibli") {
            console.log("hitBliBli");
        } else if (marketplace == "lazada") {
            console.log("hitLazada");
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
            console.log("hitShoppe");
        } else if (marketplace == "blibli") {
            console.log("hitBliBli");
        } else if (marketplace == "lazada") {
            console.log("hitLazada");
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
            console.log("hitShoppe");
        } else if (marketplace == "blibli") {
            console.log("hitBliBli");
        } else if (marketplace == "lazada") {
            console.log("hitLazada");
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
            console.log("hitShoppe");
        } else if (marketplace == "shopee") {
            console.log("hitShoppe");
        } else if (marketplace == "blibli") {
            console.log("hitBliBli");
        } else if (marketplace == "lazada") {
            console.log("hitLazada");
        }
    }
    res.status(response.code).send(response)
});

//get get brand
router.get('/get_brand', async function (req, res) {
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
            console.log("hitShoppe");
        } else if (marketplace == "shopee") {
            console.log("hitShoppe");
        } else if (marketplace == "blibli") {
            console.log("hitBliBli");
        } else if (marketplace == "lazada") {
            console.log("hitLazada");
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
            console.log("hitShoppe");
        } else if (marketplace == "shopee") {
            console.log("hitShoppe");
        } else if (marketplace == "blibli") {
            console.log("hitBliBli");
        } else if (marketplace == "lazada") {
            console.log("hitLazada");
        }
    }
    res.status(response.code).send(response)
});


//creation status
router.get('/creation-status', async function (req, res) {
    const search = req.query;
    const shop_id = search.shop_id;
    const marketplace = search.marketplace;
    const requestId = search.requestId;

    if (marketplace === null || marketplace === undefined) {
        response.code = 400
        response.message = "Parameter marketplace is required"
    } else if (marketplace !== "tokopedia"||marketplace !== "blibli") {
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
            let hitAPI = await apiTokped.getStatusProduct(shop_id,requestId);
            res.send(hitAPI);
            return;
        } else if (marketplace == "shopee") {
            console.log("hitShoppe");
        } else if (marketplace == "blibli") {
            console.log("hitBliBli");
        } else if (marketplace == "lazada") {
            console.log("hitLazada");
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
            console.log("hitShoppe");
        } else if (marketplace == "shopee") {
            console.log("hitShoppe");
        } else if (marketplace == "blibli") {
            console.log("hitBliBli");
        } else if (marketplace == "lazada") {
            console.log("hitLazada");
        }
    }
    res.status(response.code).send(response)
});






module.exports = router;


