import express from 'express';
import dynamoDB from '../dynamodb.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {v4 as uuidv4} from 'uuid';
import admin from '../MiddleWare/admin.mid.js'
import { ConditionalOperator } from '@aws-sdk/client-dynamodb';

const PASSWORD_HASH_SALT_ROUNDS = 10;
const router=express.Router();
const tableName='user_model';
router.post('/login', async (req,res)=>{
    const {email,password}=req.body; 
    const params = {
        TableName: tableName,
        Key: email
      }; 
    
      try {
        const user = await dynamoDB.getItem(params).promise();
        if(user && bcrypt.compare(password,user.password.S)){
            return res.send(generateTokenResponse(user));
        }
        else{
            res.status(401).send({message: "Invalid password or user name"});
        }
      } catch (err) {
        console.error("Error getting item:", err);
        throw err;
      }
})


router.post('/register',async(req,res)=>{
    const {name,email,password,address}=req.body;
    const params = {
        TableName: tableName
      };
    
      try {
        const data = await dynamoDB.scan(params).promise();
        const users=data.Items;
        const user=users.find(detail => detail.email.S===email);
        console.log(users,user);
        if(user){
          return res.status(400).send({message: "User already exists"});
        }
        const uniqueId = uuidv4();
        const hashsedPassword= await bcrypt.hash(password, PASSWORD_HASH_SALT_ROUNDS);
        const newUser={
            'id':{S:uniqueId},
            'name':{S:name},
            'email':{S:email},
            'password':{S:hashsedPassword},
            'address':{S:address},
            'isAdmin':{BOOL:false},
            'isBlocked':{BOOL:false}
        }
        const param={
            TableName: tableName,
            Item: newUser
        }
        await dynamoDB.putItem(param).promise();
        return res.send(generateTokenResponse(newUser));
      } catch (err) {
        console.error("Error getting item:", err);
        throw err;
      }
})

//Route to get all users data
router.get("/all_data",async(req,res)=>{
  const params = {
    TableName: tableName
 };
  try {
    const data = await dynamoDB.scan(params).promise();
    console.log(data.Items);
    const new_data=convertDynamoDBDataToObject(data.Items);
    console.log(new_data);
    return res.send(new_data);
  } catch (err) {
    console.error("Error scanning table:", err);
    throw err;
  }

})

router.get('/:id',async(req,res)=>{
  const {id}=req.params;
  const params = {
    TableName: tableName,
    Key: {
      id: {
        S: id
      }
    }
  };
  const user=await dynamoDB.getItem(params).promise();
  if(user){
    return res.send(user);
  }
  return res.send({message: "user not found"});
})

router.put("/:id", admin, async (req, res) => {
  
  const { id } = req.params;
  const { name, email, address } = req.body; // Extract updated attributes from request body

  const params = {
    TableName: 'YOUR_TABLE_NAME', // Replace 'YOUR_TABLE_NAME' with your DynamoDB table name
    Key: {
      id: { S: id }
    },
    UpdateExpression: 'SET #name = :name, email = :email, address = :address', // Update expression
    ExpressionAttributeNames: { '#name': 'name' }, // Attribute name mapping
    ExpressionAttributeValues: { ':name': { S: name }, ':email': { S: email }, ':address': { S: address } } // Attribute values
  };

  try {
    const command = new UpdateItemCommand(params);
    await dynamoDBClient.send(command);
    res.send({ message: "Item updated successfully" });
  } catch (error) {
    console.error("Error updating item:", error);
    return res.status(500).send({ message: "Internal server error" });
  }
});


const generateTokenResponse = user => {
    const token = jwt.sign(
      {
        id:user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '30d',
      }
    );
    return {
      id:user.id,
      email: user.email,
      name: user.name,
      address: user.address,
      isAdmin: user.isAdmin,
      token,
    };
  };

  const convertDynamoDBDataToObject = dynamoDBData => {
    return dynamoDBData.map(item => {
      const objectItem = {};
      for (const key in item) {
        if (Object.hasOwnProperty.call(item, key)) {
          objectItem[key] = item[key][Object.keys(item[key])[0]];
        }
      }
      return objectItem;
    });
  };

  export default router;