import AWS from 'aws-sdk';
 
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
    region: process.env.AWS_REGION,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY

});
const dynamoDB = new AWS.DynamoDB();
export default dynamoDB;