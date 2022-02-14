**API - Marketplace**

**Server Dev**<br>
IP Public 222.165.224.195<br>
User Password ssh : root, password: pr0jectwms

Dev Account<br>
user : it.vci.development@gmail.com<br>
user khusus Blibli: ptgri@gosyenretail.co.id<br>
pass : it.VCI.2020

1. Tokopedia https://developer.tokopedia.com/openapi/guide/#/
	- Testing
	App ID: 15991 <br>
	Client ID: 7db04fe68ef243d492f45d9754dc4efd <br>
	Client Secret: 4f4f08c861284c55acdeda6f33327d15
	
	_Seller Account_<br>
	Email: coba_coba.sellerapi.test.account2@tokopedia.com <br>
	Password: Knry16UhY <br>
	Shop Name: SellerAPI-Coba-coba <br>
	Shop URL: https://www.tokopedia.com/sellerapi-coba-coba <br>
	Shop ID: 13104043

	_Buyer Account_<br>
	Email: coba_coba.sellerapi.test.account1@tokopedia.com <br>
	Password: uijbD0yjG

	- Live
	App ID: 15049<br>
	Client ID: fad615c325cc42bf8c4d183756302b55 <br>
	Client Secret: 12f6262306954aa6bb9845f6b937a820 <br>
	Shop ID: 12688456

2. Shopee https://open.shopee.com/documents?version=2

	Generate Auth Link

	`<?php

	date_default_timezone_set("Asia/Jakarta");

	$ts = time();
	$ru = 'http://wms.gosyenretail.co.id/';
	$hs = 'https://partner.shopeemobile.com';
	$ap = '/api/v2/shop/auth_partner';
	$pi = 2003185;
	$pk = '9ec9c195a75af4b3312d35f30a743af9657a6e745432df64d357144d25851150';
	$bs = $pi.$ap.$ts;
	$sign = hash_hmac('sha256', $bs, $pk);
	$url = $hs.$ap."?partner_id=$pi&sign=$sign&timestamp=$ts&redirect=$ru";
	echo $url;

	?>`

	Partner ID: 1005913<br>
	Partner Key: cd7e475dee4d76c283b06acc9ee0eca28d8a75bea7aff3b2e61adfc292a79f13

	- Akun Seller<br>
	Shop ID：38923<br>
	https://seller.test-stable.shopee.co.id/account/signin?next=%2F<br>
	username : SANDBOX.7c328b48afb9016922f8<br>
	password : 2ce147a7e1526ec7

	- Akun Buyer<br>
	https://test-stable.shopee.co.id/shop/38923<br>
	Username : SANDBOX_BUYER.d9eb67b03d07ee<br>
	Password : 307f19f185dbbcf7

3. Lazada https://open.lazada.com/doc/doc.htm?spm=a2o9m.11193487.0.0.3ac413fe41w3Fp&nodeId=27493&docId=118729#?nodeId=29586&docId=120248

App Key: 106390<br>
App Secret: 35D7YglUofxHQRZ85xzLd7dopVjo4XBw

- Testing<br>
Seller Email: lazada.lt.v2@gmail.com<br>
Password: it.vci.development@gmail.com|it.VCI.2020<br>
Shop ID: ID11EA9

4. Blibli https://seller-api.blibli.com/docs/sections/60/contents/2867?title=introduction

API Client Key: mta-api-5uApGjMJCx0RkkD2MQRjzXKGn0pEmbfzZmnqmagl9f2DlyxDdl
