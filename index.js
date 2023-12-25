const express = require('express');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger');
//const swaggerjsdoc = require('swagger-jsdoc');

const bcrypt = require('bcryptjs');
const saltRounds = 10;

const app = express();
const port = process.env.PORT || 6000;
const{ MongoClient, ServerApiVersion } = require('mongodb');
const uri = 'mongodb+srv://CHUA0528:CCF12345@chua.ch7khae.mongodb.net/';

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true, 
    }
  });

  client.connect();
  
// var axios = require('axios');
// var data = JSON.stringify({
//     "collection": "users",
//     "database": "Visitor_Management_v1",
//     "dataSource": "CHUA",
//     "projection": {
//         "_id": 1
//     }
// });
            
// var config = {
//     method: 'post',
//     url: 'https://ap-southeast-1.aws.data.mongodb-api.com/app/data-poxgq/endpoint/data/v1/action/findOne',
//     headers: {
//       'Content-Type': 'application/json',
//       'Access-Control-Request-Headers': '*',
//       'api-key': 'CHUA',
//     },
//     data: data
// };
            
// axios(config)
//     .then(function (response) {
//         console.log(JSON.stringify(response.data));
//     })
//     .catch(function (error) {
//         console.log(error);
//     });

  //variables to define which collection used
//const admin = client.db("Visitor_Management_v1").collection("admin")
const user = client.db("Visitor_Management_v1").collection("users")
const visitor_passes = client.db("Visitor_Management_v1").collection("visitor")

//decode of requests
app.use(express.json());
// connection to database
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})




// Swagger

 app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));




 
 
//login GET request
app.get ('/login', async (req, res) => {


    let data = req.body
    let result = await login(data);

    const loginUser = result.verify
    const token = result.token
    
    //check the returned result if its a object, only then can we welcome the user
    if (typeof loginUser == "object") { 
      res.write(loginUser.user_id + " has logged in!")
      res.write("\nWelcome "+ loginUser.name + "!")
      res.end("\nYour token : " + token)
    }else {
      //else send the failure message
      res.send(errorMessage() + result)
    }
  });


async function login(data) {

  console.log("Alert! Alert! Someone is logging in!") //Display message to ensure function is called
  //Verify username is in the database
  let verify = await user.findOne({user_id : data.user_id});
  console.log(verify)
  if (verify){
    //verify password is correct
    const correctPassword = await bcrypt.compare(data.password,verify.password);
    if (correctPassword){
      token = generateToken(verify)
      return{verify,token};
    }else{
      return ("Wrong password D: Forgotten your password?")
    }
  }else{
    return ("No such user ID found D:")
}}

  //generate token for login authentication
  function generateToken(loginProfile){
    return jwt.sign(loginProfile, 'UltimateSuperMegaTitanicBombasticGreatestBestPOGMadSuperiorTheOneandOnlySensationalSecretPassword', { expiresIn: '1h' });
  }
  
//   //verify generated tokens
//   function verifyToken(req, res, next){
//     let header = req.headers.authorization
//     let token = header.split(' ')[1] //checking header
//     jwt.verify(token,'UltimateSuperMegaTitanicBombasticGreatestBestPOGMadSuperiorTheOneandOnlySensationalSecretPassword',function(err,decoded){
//       if(err) {
//         res.send(errorMessage() + "Token is not valid D:, go to the counter to exchange")
//         //return
//       }
//       req.user = decoded // bar
  
//       next()
//     });
//   }
  
//   //bcrypt functions to generate a hashed password
//   async function encryption(data){
//     const salt= await bcrypt.genSalt(saltRounds)
//     const hashh = await bcrypt.hash(data,salt)
//     return hashh
//   }
  
  function errorMessage(){
    const x = Math.floor(Math.random()*6)
    if (x == 0){
      return ("Oopsie Daisy\n")
    }else if (x == 1){
      return ("Error! Error! Error!\n")
    }else if (x==2){
      return ("I can accept failure. Everyone fails at something. But I can't accept not trying. ― Michael Jordan\n")
    }else if (x==3){
      return ("Waoh how did you even get an error here?\n")
    }else if (x==4){
      return ("Something went wrong! FeelsBadMan\n")
    }else if (x==5){
      return ("Hi, I'm Error Man , I'm here to tell you\n")
    }else{
      return ("Oi bo- Sir/Madam, we seem to have an error\n")
    }
  }

