import express from 'express';
import dynamoDB from '../dynamodb.js';
import admin from '../MiddleWare/admin.mid.js'

const router=express.Router();
const tableName='food_items';

router.get('/',async(req,res)=>{
    const params={
        TableName: tableName
    }
    try{
        const data = await dynamoDB.scan(params).promise();
        console.log(data.Items);
        const all_data=convertDynamoDBToList(data.Items); 
        console.log(all_data);
        res.send(all_data);
    }catch(err){
        res.send({message: err.message})
    }
})

router.post('/',async(req,res)=>{
    const {id,name,cookTime,price,favorite,origins,stars,imageurl,tags}=req.body;
    try{
    const params={
        TableName: tableName,
        Item:{
            id:{S:id},
            name:{S:name},
            price:{N:price.toString()},
            tags:{SS:tags.split ? tags.split(',') : tags},
            favorite:{BOOL:favorite},
            stars:{S:stars},
            imageurl:{S:"food"},
            origins:{SS:origins.split ? origins.split(',') : origins},
            cookTime:{S:cookTime}
        }
    }
    await dynamoDB.putItem(params).promise();
    res.send({message: 'Successfully item added'});
}catch(err) {
    res.send({message: err.message});
}
})

router.delete('/:foodId',async(req,res)=>{
    const {foodId}=re.params;
    try{
        const params={
            TableName: tableName,
            Key:{
                id:{S:foodId}
            }
        }
        await dynamoDB.deleteItem(params);
        res.send({message: 'Successfully item deleted'});
    }catch(err){
        res.send({message: err.message})
    }
})



router.get('/:foodId',async(req,res)=>{
    const {foodId}=req.params;
    console.log(foodId)
    const params={
        TableName: tableName,
        Key:{
            id:{S:foodId}
        }
    }
    try{
        const data = await dynamoDB.getItem(params).promise();
        if(data){
            const food=convertDynamoDBToObject(data.Item)
            return res.send(food);
        }
        res.send({message:"Not Found"});
    }catch(err){
        res.send({message: err.message})
    }
})



router.get('/search/:searchTerm',async (req,res)=>{
    console.log(req.params)
    const {searchTerm}=req.params;
    const params={
        TableName: tableName
    }
    try{
        const data = await dynamoDB.scan(params).promise();
        const all_data=convertDynamoDBToList(data.Items); 
        const regex = new RegExp(searchTerm, 'i');
        const search_data = all_data.filter(item => regex.test(item.name));
        return res.status(200).send(search_data);
    }catch(err){
        res.send({message: err.message})
    }
})

//not tested yet
router.get('/tag/:tag',async()=>{
    const {tag}=req.params;
    const params={
        TableName: tableName,
        KeyConditionExpression: '#tag = :tag',
        ExpressionAttributeNames:{
            '#tag': 'tags'
        },
        ExpressionAttributeValues:{
            ':tag': tag
        }
    }
    try{
        const data = await dynamoDB.query(params).promise();
        res.send(data.Items);
    }catch(err){
        res.send({message: err.message})
    }
})


function convertDynamoDBToObject(dynamoDBObject) {
    const result = {};
    
    for (const key in dynamoDBObject) {
        if (Object.hasOwnProperty.call(dynamoDBObject, key)) {
            const value = dynamoDBObject[key];
            
            // Check if the attribute value is an object with a single key
            if (typeof value === 'object' && Object.keys(value).length === 1) {
                const dataType = Object.keys(value)[0];
                
                // Extract the value based on the data type
                result[key] = value[dataType];
            }
        }
    }
    
    return result;
}

function convertDynamoDBToList(listOfDynamoDBObjects) {
    return listOfDynamoDBObjects.map(dynamoDBObject => {
        const result = {};
        for (const key in dynamoDBObject) {
            if (Object.hasOwnProperty.call(dynamoDBObject, key)) {
                const value = dynamoDBObject[key];
                if (typeof value === 'object' && Object.keys(value).length === 1) {
                    const dataType = Object.keys(value)[0];
                    result[key] = value[dataType];
                }
            }
        }
        return result;
    });
}


export default router;
