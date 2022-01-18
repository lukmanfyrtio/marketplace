const orderRoutes = require('./routes/order.js')
const express = require('express')
const app = express();
const apiTokped = require('./api_marketplace/api_tokped.js')

const PORT = 80
app.use(express.json());

app.use('/order', orderRoutes);

app.get('/token-tokped',function (){
  apiTokped.getToken()
});



app.listen(PORT, () => {
  console.log(`Marketplace gateway started on port ${PORT}`);
});