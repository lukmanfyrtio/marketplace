const orderRoutes = require('./routes/order.js')
const productRoutes = require('./routes/products.js')
const settlementRoutes = require('./routes/settlement.js')
const returnRoutes = require('./routes/return.js')
const chatRoutes = require('./routes/chat.js')
const express = require('express')
const db = require('mariadb')
const app = express()

const port = 80 // dev
// const port = 7222 // local
const cdb = {
  // host: 'mpdbv1', // dev
  // port: '3306', // dev
  host: 'localhost', // local
  port: '8888', // local
  database: 'mpapi',
  user:'mpdb',
  password: 'Aku4@kua',
  connectionLimit: 10
  // connectTimeout: 60000,
  // acquireTimeout: 60000,
  // allowPublicKeyRetrieval: true
}

function jsonS(d) {return JSON.stringify(d)}
function jsonP(d) {return d ? JSON.parse(d) : {}}
function jsonPs(d) {return jsonP(jsonS(d))}

const pl = db.createPool(cdb)
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
    `select nama_toko, marketplace, shop_id, api_url, clientid, clientkey, token, code_1, code_2, code_3, code_4, code_5, tipe from stores`
  )
  if (rs && rs.text) console.log(rs)
  else process.env.stores = jsonS(rs)
}

// env selalu dikeluarkan di tiap hit
app.use(function(req, res, next){
  req.envStore = Object.assign([],
    process.env.stores ?
      jsonP(process.env.stores).filter(store => {
        return (store.marketplace === req.query.marketplace && store.shop_id === req.query.shop_id)
      }) : []
  )[0]
  next()
})

app.use(express.json())
app.use('/', orderRoutes,productRoutes,settlementRoutes,chatRoutes,returnRoutes)
app.listen(port, () => {
  getEnvStores()
  // console.log(`Marketplace gateway started on port ${port}`)
})
