import express from 'express';
import user_router from './Routes/User.js'
import cors from 'cors';
import food_router from './Routes/food.js'
import order_router from './Routes/order.js'
const app=express();
app.use(express.json());
app.use(cors())
app.use('/user',user_router);
app.use("/food",food_router);
app.use("/order",order_router);
app.get('/',(req,res)=>{  
    res.send('Hello World');
});

app.listen(5000,()=>{
  console.log("listending to port 5000");
})