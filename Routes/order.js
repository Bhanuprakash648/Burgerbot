import express from 'express';
import dynamoDB from '../dynamodb.js';
import admin from '../MiddleWare/admin.mid.js'

const router=express.Router();
const tableName='Order_details';

router.get('/create',async(req,res)=>{
    const order=req.body;
    if(order.items.length <=0) res.status(400).send('Cart Is Empty!');
    const param={
        TableName:tableName
    }
    try{
    const data=await dynamoDB.scan(param).promise();
    const item=data.filter((item)=>{
        if(item.user_id==req.user.id && item.status=="NEW" ){
            return item;
        }
    })
    if(item.length>0){
        const delete_item=item[0].id;
        const params={
            TableName: tableName,
            Key: {
                id: {
                    S: delete_item
                }
            }
        }
        await dynamoDB.deleteItem(params).promise();
    }
    const newOrder={
        name:{S:order.name},
        user_id:{S:req.user.id},
        id:{S:order.id},
        status:{S:"NEW"},
        paymentId:{S:"NULL"},
        totalPrice:{S:order.totalPrice},
        items:{S:order.items},
        address:{S:order.address},
        addressLatLng:{S:order.addressLatLng}
    }
    const params={
        TableName: tableName,
        Item:newOrder
    }
    await dynamoDB.putItem(params).promise();
    res.send(newOrder);

}catch(e){
    return res.send({message: e.message});
}
    
})


//pending
router.put('pay',async(req,res)=>{
    const {paymentId}=req.body;
    const param={
        TableName:tableName
    }
    try{
    const data=await dynamoDB.scan(param).promise();
    const item=data.filter((item)=>{
        if(item.user_id==req.user.id && item.status=="NEW" ){
            return item;
        }
    })
    if(item.length==0){
        return res.status(404).send({message:"Order not found!"})
    }
    const order=item[0]
    order.paymentId=paymentId;
    order.status="PAYED";


    }catch(e){
        return res.status(400).send({message:e.message})
    }
})


router.get('track/:orderId',async(req,res)=>{
    const {orderId}=req.params;
    const params={
        TableName:tableName,
        key:{id:{S:orderId}}
    }
    const order=await dynamoDB.getItem(params).promise();
    if(!order) return res.send({message:"Order not found"})

    return res.send(order);
})

router.get('/newOrderForCurrentUser',async(req,res)=>{
    const params={
        TableName:tableName
    }
    const data=await dynamoDB.scan(params).promise();
    const item=data.filter((item)=>{
        if(item.user_id==req.user.id && item.status=="NEW" ){
            return item;
        }
    })
    if(item.length!=0){
        return res.send(item[0]);
    }
    return res.status(404).send({message:"Order not found!"})

})

router.get('/:status',async(req,res)=>{
    const {status}=req.params;
    const params={
        TableName:tableName,
        FilterExpression: "status = :status",
        ExpressionAttributeValues:{
            ":status":status
        }
    }
    try{
        const data=await dynamoDB.scan(params).promise();
        return res.send(data);
    }catch(e){
        return res.status(400).send({message:e.message})
    }
})

router.get('/allstatus',(req,res)=>{
    const allstatus={
        NEW:"NEW",
        PAYED:"PAYED",
        SHIPPED: 'SHIPPED',
        CANCELED: 'CANCELED',
        REFUNDED: 'REFUNDED',
    }
    res.send(allstatus);
})

