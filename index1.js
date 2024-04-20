import express from 'express';

import AWS from 'aws-sdk';
 
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
    region: process.env.AWS_REGION,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY

}) 
const dynamoClient = new AWS.DynamoDB();

const TABLE_NAME="user_model"

//get data of user
const get_User_data = async ()=>{
    const param = {
      TableName: TABLE_NAME,
      Key: {
        'id': { S: '3' }, 
      }
    };
    dynamoClient.getItem(param, (err, data) => {
      if (err) {
        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
      } else {
        console.log("Added item:", JSON.stringify(data, null, 2));
      }
    });
    // const characters=await dynamoClient.scan(params).promise();
}
get_User_data();



import AWS from 'aws-sdk';
 
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
    region: process.env.AWS_REGION,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY

}) 
const dynamoDB = new AWS.DynamoDB();

// Function to get an item from DynamoDB
async function getItem(tableName, key) {
  const params = {
    TableName: tableName,
    Key: key
  };

  try {
    const data = await dynamoDB.getItem(params).promise();
    return data.Item;
  } catch (err) {
    console.error("Error getting item:", err);
    throw err;
  }
}

// Function to put an item into DynamoDB
async function putItem(tableName, item) {
  const params = {
    TableName: tableName,
    Item: item
  };

  try {
    await dynamoDB.putItem(params).promise();
    console.log("Item added successfully.");
  } catch (err) {
    console.error("Error putting item:", err);
    throw err;
  }
}

// Function to update an item in DynamoDB
async function updateItem(tableName, key, updateExpression, expressionAttributeValues) {
  const params = {
    TableName: tableName,
    Key: key,
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues
  };

  try {
    await dynamoDB.updateItem(params).promise();
    console.log("Item updated successfully.");
  } catch (err) {
    console.error("Error updating item:", err);
    throw err;
  }
}

// Function to delete an item from DynamoDB
async function deleteItem(tableName, key) {
  const params = {
    TableName: tableName,
    Key: key
  };

  try {
    await dynamoDB.deleteItem(params).promise();
    console.log("Item deleted successfully.");
  } catch (err) {
    console.error("Error deleting item:", err);
    throw err;
  }
}
const get_all = async () =>{
    const params = {
        TableName: 'user_model'
    };
    const data = await dynamoDB.scan(params).promise();
    console.log(data);
    return data;
}

// Usage example:
async function main() {
  try {
    const item = await getItem('user_model', { 'id': { S: '1' } });
    console.log("Retrieved item:", item);

    // Modify the item if needed

    // await updateItem('YOUR_TABLE_NAME', { 'id': { S: '1' } }, 'SET #attrName = :attrValue', { '#attrName': 'ATTRIBUTE_NAME', ':attrValue': { S: 'NEW_VALUE' } });

    // await deleteItem('user_model', { 'id': { S: '1' } });
    const all=get_all().Items
    console.log(all)
  } catch (err) {
    console.error("Error:", err);
  }
}

main();

