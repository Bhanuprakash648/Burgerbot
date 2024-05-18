import express from 'express';
import dynamoDB from '../dynamodb.js';
import admin from '../MiddleWare/admin.mid.js'

const router=express.Router();
const tableName='order_model';

router.get('/create',async(req,res)=>{
    const order=req.body;
    if(order.items.length <=0) res.status(400).send('Cart Is Empty!');
    const param={
        TableName:tableName
    }
    try{
    const data=await dynamoDB.scan(param).promise();
    const item=data.Items.filter((item)=> item.user_id.S===order.user_id && item.status.S==="NEW" )
    if(item.length>0){
        const delete_item=item[0].id.S;
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
    const newOrder = {
        name: { S: order.name },
        user_id: { S: order.user_id },
        id: { S: order.id },
        status: { S: "NEW" },
        paymentId: { S: "NULL" },
        totalPrice: { N: order.totalPrice },
        items: {
            L: order.items.map(item => ({
                M: {
                    id: { S: item.id },
                    name: { S: item.name },
                    price: { N: item.price.toString() },
                    quantity: { N: item.quantity.toString() }, // Add quantity attribute
                    tags: { SS: item.tags.split ? item.tags.split(',') : item.tags },
                    favorite: { BOOL: item.favorite },
                    stars: { S: item.stars },
                    imageurl: { S: "food" },
                    origins: { SS: item.origins.split ? item.origins.split(',') : item.origins },
                    cookTime: { S: item.cookTime }
                }
            }))
        },
        address: { S: order.address },
        addressLatLng: { S: order.addressLatLng }
    };
    
    const params={
        TableName: tableName,
        Item:newOrder
    }
    await dynamoDB.putItem(params).promise();
    res.send(convertDynamoDBToNormal(newOrder));

}catch(e){
    return res.send({message: e.message});
}
    
})


//pending
router.put('/pay',async(req,res)=>{
    const paymentId=req.body.paymentId;
    const param={
        TableName:tableName
    }
    console.log(paymentId)
    try{
    const data=await dynamoDB.scan(param).promise();
    console.log(data.Items)
    const item=data.Items.filter((item)=> item.user_id.S===req.body.user.id && item.status.S=="NEW")
    if(item.length==0){
        return res.status(404).send({message:"Order not found!"})
    }
    const id=item[0].id.S;
    await dynamoDB.updateItem({
        TableName: tableName,
        Key: {
            id: { S: id }
        },
        UpdateExpression: "SET #status = :status, paymentId = :paymentId",
        ExpressionAttributeNames: {
            "#status": "status"
        },
        ExpressionAttributeValues: {
            ":status": { S: "pay" },
            ":paymentId": { S: paymentId }
        }
    }).promise();
    res.send({message:"updated succefully"});
    }catch(e){
        return res.status(400).send({message:e.message})
    }
})


router.get('/track/:orderId',async(req,res)=>{
    const {orderId}=req.params;
    console.log(orderId)
    const params={
        TableName:tableName,
        Key:{id:{S:orderId}}
    }
    try{
    const order=await dynamoDB.getItem(params).promise();
    if(!order) return res.send({message:"Order not found"})

    return res.send(convertDynamoDBToNormal(order));
    }catch(e){
        return res.status(400).send({message:e.message})
    }
})

router.get('/newOrderForCurrentUser',async(req,res)=>{
    const params={
        TableName:tableName
    }
    const data=await dynamoDB.scan(params).promise();
    const item=data.Items.filter((item)=> item.user_id.S==req.body.user.id && item.status.S=="NEW" )
    if(item.length!=0){
        return res.send(convertDynamoDBToNormal(item[0]));
    }
    return res.status(404).send({message:"Order not found!"})

})

router.get('/app/:status',async(req,res)=>{
    const {status}=req.params;
    const params={
        TableName:tableName,
    }
    try{
        const data=await dynamoDB.scan(params).promise();
        const items=data.Items.filter(item=> item.status.S===status)
        return res.send(convertListOfDynamoDBToNormal(items));
    }catch(e){
        return res.status(400).send({message:e.message})
    }
})

router.get('/allstatus',(req,res)=>{
    const allstatu={
        NEW:"NEW",
        PAYED:"PAYED",
        SHIPPED: 'SHIPPED',
        CANCELED: 'CANCELED',
        REFUNDED: 'REFUNDED',
    }
    return res.send(allstatu);
})

// Convert DynamoDB object to normal JavaScript object
const convertDynamoDBToNormal = (dynamoObject) => {
    const normalObject = {};
    for (const [key, value] of Object.entries(dynamoObject)) {
        if (value.hasOwnProperty("M")) {
            normalObject[key] = convertDynamoDBToNormal(value.M);
        } else if (value.hasOwnProperty("L")) {
            normalObject[key] = value.L.map(item => convertDynamoDBToNormal(item.M));
        } else if (value.hasOwnProperty("SS")) {
            normalObject[key] = value.SS;
        } else if (value.hasOwnProperty("N")) {
            normalObject[key] = parseFloat(value.N);
        } else if (value.hasOwnProperty("S")) {
            normalObject[key] = value.S;
        } else if (value.hasOwnProperty("BOOL")) {
            normalObject[key] = value.BOOL;
        }
    }
    return normalObject;
};

const convertListOfDynamoDBToNormal = (dynamoList) => {
    return dynamoList.map(item => convertDynamoDBToNormal(item));
};

export default router;