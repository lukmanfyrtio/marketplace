const orderRoutes = require('./routes/order.js')
const productRoutes = require('./routes/products.js')
const settlementRoutes = require('./routes/settlement.js')
const returnRoutes = require('./routes/return.js')
const chatRoutes = require('./routes/chat.js')
const express = require('express')
const db = require('mariadb')
const app = express()

const {conf, env} = require('./conf') // configuration and environment

function jsonS(d) {return JSON.stringify(d)}
function jsonP(d) {return d ? JSON.parse(d) : {}}
function jsonPs(d) {return jsonP(jsonS(d))}

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
      process.env['mpstore' + mpstore.shop_id] = jsonS(mpstore)
      // process.env['mpstore' + mpstore.shop_id + mpstore.marketplace] = jsonS(mpstore)
    }
  }
  // console.log(process.env)
}

// env selalu dikeluarkan di tiap hit
app.use(function(req, res, next){
  // req.envStore = Object.assign([],
  //   process.env.mpstores ?
  //     jsonP(process.env.mpstores).filter(store => {
  //       return (store.marketplace === req.query.marketplace && store.shop_id === req.query.shop_id)
  //     }) : []
  // )[0]
  req.envStore = Object.assign({},
    jsonP(process.env['mpstore' + req.query.shop_id])
    // jsonP(process.env['mpstore' + req.query.shop_id + req.query.marketplace])
  )
  // console.log(req.envStore)
  next()
})

app.use(express.json())
app.use('/', orderRoutes,productRoutes,settlementRoutes,chatRoutes,returnRoutes)
app.listen(conf.port, () => {
  getEnvStores()
  // console.log(`Marketplace gateway started on port ${conf.port}`)
})
