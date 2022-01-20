const orderRoutes = require('./routes/order.js')
const productRoutes = require('./routes/products.js')
const settlementRoutes = require('./routes/settlement.js')
const chatRoutes = require('./routes/chat.js')
const express = require('express')
const app = express();

const PORT = 80
app.use(express.json());

app.use('/', orderRoutes,productRoutes,settlementRoutes,chatRoutes);




app.listen(PORT, () => {
  console.log(`Marketplace gateway started on port ${PORT}`);
});