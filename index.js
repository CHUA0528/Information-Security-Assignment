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
//       'Access-Control-Request-Headers': 'port',
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
app.post ('/login', async (req, res) => {


    let data = req.body
    let result = await login(data);
    //res.setHeader('Content-Type', 'application/pdf');
    //res.setHeader('Content-Disposition', 'attachment; filename=quote.pdf');
   // res.status(200).send(pdfData); // Assuming pdfData is a Buffer or binary data

    

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


// async function login(data) {

//   console.log("Alert! Alert! Someone is logging in!") //Display message to ensure function is called
//   //Verify username is in the database
//   let verify = await user.find({user_id : data.user_id}).next();
//   console.log(verify)
//   if (verify){
//     //verify password is correct
//     const correctPassword = await bcrypt.compare(data.password,verify.password);
//     if (correctPassword){
//       token = generateToken(verify)
//       return{verify,token};
//     }else{
//       return ("Wrong password D: Forgotten your password?")
//     }
//   }else{
//     return ("No such user ID found D:")
// }}

async function login(data) {

  console.log("Alert! Alert! Someone is logging in!");

  try {
    // Verify username in the database
    let verify = await user.findOne({ user_id: data.user_id });

    if (verify) {
      // Verify password is correct
      const correctPassword = await bcrypt.compare(data.password, verify.password);

      if (correctPassword) {
        token = generateToken(verify);

        return { success: true, verify, token };
      } else {
        return { success: false, error: "Wrong password D: Forgotten your password?" };
      }
    } else {
      return { success: false, error: "No such user ID found D:" };
    }
  } catch (error) {
    console.error("Error during login:", error);
    return { success: false, error: "Internal server error during login" };
  }
}


  //generate token for login authentication
  function generateToken(loginProfile){
    return jwt.sign(loginProfile, 'UltimateSuperMegaTitanicBombasticGreatestBestPOGMadSuperiorTheOneandOnlySensationalSecretPassword', { expiresIn: '1h' });
  }
  
//find user GET request
app.get('/finduser', verifyToken, async (req, res)=>{
  let authorize = req.user.role //reading the token for authorisation
  let data = req.body //requesting the data from body
  //checking the role of user
  if (authorize == "resident"|| authorize == "security"){
    res.send(errorMessage() + "\nyou do not have access to finding users!")
  }else if (authorize == "admin"){
    const newUser = await findUser(data) //calling the function to find user
    if (newUser){ //checking if user exist
      res.send(newUser)
    }else{
      res.send(errorMessage() + "User does not exist sadly :[")
    }
  //token does not exist
  }else {
      res.send(errorMessage() + "Token not valid!")
    }
  })

//register user post request
app.post('/registeruser', verifyToken, async (req, res)=>{
  let authorize = req.user.role //reading the token for authorisation
  let data = req.body //requesting the data from body
  //checking the role of user
  if (authorize == "security" || authorize == "resident"){
    res.send("you do not have access to registering users!")
  }else if (authorize == "admin" ){
    const newUser = await registerUser(data)
    if (newUser){ //checking is registration is succesful
      res.send("Registration request processed, new user is " + newUser.name)
    }else{
      res.send(errorMessage() + "User already exists!")
    }
  //token does not exist
  }else {
      res.send(errorMessage() + "Token not valid!")
    }
  })

//update user PATCH request
app.patch('/updateuser', verifyToken, async (req, res)=>{
  let authorize = req.user.role //reading the token for authorisation
  let data = req.body //requesting the data from body
  //checking the role of user
  if (authorize == "security" || authorize == "resident"){
    res.send("you do not have access to update user information!")
  }else if (authorize == "admin" ){
    const result = await updateUser(data)
    if (result){ // checking if the user exist and updated
      console.log(result)
      res.send("User updated! " + result.value.name)
    }else{
      res.send(errorMessage() + "User does not exist!")
    }
  }else {
      res.send(errorMessage() + "Token is not found!")
    }
})

//delete user DELETE request
app.delete('/deleteuser', verifyToken, async (req, res)=>{
  let data = req.body
  let authorize = req.user.role
  //checking the role of user
  if (authorize == "security" || authorize == "resident"){
    res.send("you do not have access to registering users!")
  }else if (authorize == "admin" ){
    const lmao = await deleteUser(data)
    //checking if item is deleted
    if (lmao.deletedCount == "1"){
      res.send("user deleted " + data.user_id)
    }else{
      res.send(errorMessage() + "Cannot find the user to delete!")
    }
  }else {
      res.send(errorMessage() + "Token not valid!")
    }
  }
)

//register visitor POST request
app.post('/registervisitor', verifyToken, async (req, res)=>{
  let authorize = req.user.role
  let loginUser = req.user.user_id
  let data = req.body
  //checking if token is valid
  if(authorize){
  const lmao = await registerVisitor(data, loginUser)
    if (lmao){
      res.send("Registration request processed, visitor is " + lmao.name)
    }else{
      res.send(errorMessage() + "Visitor already exists! Add a visit log instead!")
    }
  }else {
      res.send(errorMessage() + "Not a valid token!")
    }
  }
)

//find visitor GET request
app.get('/findvisitor', verifyToken, async (req, res)=>{
  let authorize = req.user//reading t he token for authorisation
  let data = req.body //requesting the data from body
  //checking the role of user
  if (authorize.role){
    const result = await findVisitor(data,authorize)
    res.send(result)
  }else{
    res.send(errorMessage() + "Not a valid token!") 
  }
  })

async function findUser(newdata) {
  //verify if there is duplicate username in databse
  const match = await user.find({user_id : newdata.user_id},{projection: {password: 0, _id : 0}}).next()
  return (match)
}

async function registerUser(newdata) {
  //verify if there is duplicate username in databse
  const match = await user.find({user_id : newdata.user_id}).next()
    if (match) {
      return 
    } else {
      //encrypt password by hashing
      const hashed = await encryption(newdata.password)
      // add info into database
      await user.insertOne({
        "user_id": newdata.user_id,
        "password": hashed,
        "name": newdata.name,
        "unit": newdata.unit,
        "hp_num" : newdata.hp_num,
        "role" : newdata.role
      })
  const newUser=await user.find({user_id : newdata.user_id}).next()
  return (newUser)
}}
    
async function updateUser(data) {

  result = await user.findOneAndUpdate({user_id : data.user_id},{$set : data}, {new: true})
  if(result.value == null){
    return 
  }else{
    return (result)
  }
}

async function deleteUser(data) {
  //verify if username is already in databse
  success = await user.deleteOne({user_id : data.user_id})
  return (success) // return success message
}

async function registerVisitor(newdata, currentUser) {
  //verify if there is duplciate ref_num
  const match = await visitor.find({"ref_num": newdata.ref}).next()
    if (match) {
      return 
    } else {
      // add info into database
      await visitor.insertOne({
        "ref_num" : newdata.ref,
        "name": newdata.name,
        "IC_num": newdata.IC_num,
        "car_num": newdata.car_num,
        "hp" : newdata.hp_num,
        "pass": newdata.pass,
        "category" : newdata.category,
        "visit_date" : newdata.date,
        "unit" : newdata.unit,
        "user_id" : currentUser
      })
          return (newdata)
    }  
}

async function findVisitor(newdata, currentUser){
  if (currentUser.role == "resident"){
    filter=Object.assign(newdata, {"user_id" : currentUser.user_id})
    match = await visitor.find(filter, {projection: {_id :0}}).toArray()
  }else if (currentUser.role == "security" || currentUser.role == "admin"){
    match = await visitor.find(newdata).toArray()
  }
  if (match.length != 0){
    return (match)
  } else{
    return (errorMessage() + "Visitor does not exist!")
  }
}

//verify generated tokens
function verifyToken(req, res, next){
  let header = req.headers.authorization
  let token = header.split(' ')[1] //checking header
  jwt.verify(token,'UltimateSuperMegaTitanicBombasticGreatestBestPOGMadSuperiorTheOneandOnlySensationalSecretPassword',function(err,decoded){
    if(err) {
      res.send(errorMessage() + "Token is not valid D:, go to the counter to exchange")
      //return
    }
    req.user = decoded // bar

    next()
  });
}

//bcrypt functions to generate a hashed password
async function encryption(data){
  const salt= await bcrypt.genSalt(saltRounds)
  const hashh = await bcrypt.hash(data,salt)
  return hashh
}

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

