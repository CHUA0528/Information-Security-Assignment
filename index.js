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
const e = require('express');
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
//variables to define which collection used
const approvalList = client.db("Visitor_Management_v1").collection("residentapprovalList")
const user = client.db("Visitor_Management_v1").collection("users")
const visitor = client.db("Visitor_Management_v1").collection("visitor")

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
    //console.log(data)
    let result = await login(data);

    const loginUser = result.verify
    //console.log(loginUser)
    const token = result.token
    const hosts =await user.find({"role":"resident"},{projection: {_id :0}}).toArray()
    console.log(hosts)
    
    //check the returned result if its a object, only then can we welcome the user
    if (typeof loginUser == "object") { 

      
      if (loginUser.role == "admin"){
        res.setHeader('Content-Type', 'application/json');
        res.json({
          username: loginUser.name,
          userid: loginUser.user_id,
          token: token,
          hosts: hosts
        });
      
      
       
      // res.write(loginUser.user_id + " has logged in!")
      // res.write("\nWelcome "+ loginUser.name + "!")

      //res.write("\nAll the residents(hosts) are listed below : \n"+JSON.stringify(hosts))

      res.end("\nYour token : " + token)
      res.send(hosts)
   

      }else{
      res.send(loginUser.user_id + " has logged in!\nWelcome "+ loginUser.name + "!\nYour token : "+ token)
      }
    }else {
      //else send the failure message
      res.send(errorMessage() + result)
    }
    
  });



//find user GET request
app.get('/finduser', verifyToken, async (req, res)=>{
  console.log(req.user)
  let authorize = req.user.role //reading the token for authorisation
  console.log(authorize)
  //console.log('req.params:', req.params);
  const data = req.query.user_id; // Accessing the parameter from the query string
  console.log(data);

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
  console.log(data)
  //checking the role of user
  if (authorize == "security" || authorize == "resident"){
    res.send("you do not have access to registering users!")
  }else if (authorize == "admin" ){
    verifypassword=CheckPassword(data.password)
    if(verifypassword==false){
      res.send(errorMessage() + "Password must be 8 to 15 characters which contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character")
    } else{
    const newUser = await registerUser(data)
    if (newUser){ //checking is registration is succesful
      res.send("Registration request processed, new user is " + newUser.name)
    }else{
      res.send(errorMessage() + "User already exists!")

    }
  }
  //token does not exist
  }else {
      res.send(errorMessage() + "Token not valid!")
    }
  })

//update user PATCH request
app.patch('/updateuser', verifyToken, async (req, res)=>{
  let authorize = req.user.role //reading the token for authorisation
  //console.log(authorize)
  let data = req.body //requesting the data from body
  //checking the role of user
  if (authorize == "security" || authorize == "resident"){
    res.send("you do not have access to update user information!")
  }else if (authorize == "admin" ){
    const result = await updateUser(data)
    if (result){ // checking if the user exist and updated
      console.log(result)
      

      res.send("User updated! " + result.name)
    }else{
      res.send(errorMessage() + "User does not exist!")
    }
  }else {
      res.send(errorMessage() + "Token is not found!")
    }
})

//delete user DELETE request
app.delete('/deleteuser', verifyToken, async (req, res)=>{
  let data = req.query.user_id //requesting the data from body  
  console.log(data)
  let authorize = req.user.role
  //checking the role of user
  if (authorize == "security" || authorize == "resident"){
    res.send("you do not have access to delete user!")
  }else if (authorize == "admin" ){
    const lmao = await deleteUser(data)
    //checking if item is deleted
    if (lmao.deletedCount == "1"){
      res.send("user deleted " + data)
    }else{
      res.send(errorMessage() + "Cannot find the user to delete!")
    }
  }else {
      res.send(errorMessage() + "Token not valid!")
    }
  }
)

  //register resident post request
  app.post('/registerresident', verifyToken, async (req, res)=>{
    let authorize = req.user.role //reading the token for authorisation
    let data = req.body //requesting the data from body
    //checking the role of user
    if (authorize == "resident"){
      res.send("you do not have access to registering resident!")
    }else if (authorize == "security" || authorize == "admin" ){
      verifypassword=CheckPassword(data.password)
      if(verifypassword==false){
        res.send(errorMessage() + "Password must be 8 to 15 characters which contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character")
      } else{
      
        const resident = await registerResident(data)
        if (resident){ //checking is registration is succesful
          res.send("Registration request processed, new Resident is " + resident.name)
        }else{
          res.send(errorMessage() + "User already exists!")
        }
      //token does not exist
      }
    
    }else {
        res.send(errorMessage() + "Token not valid!")
      }
    })

  app.post('/public_register_resident',async (req,res)=>{
    let data=req.body
    console.log(data)
    verifypassword=CheckPassword(data.password)
    if(verifypassword==false){
      res.send(errorMessage() + "Password must be 8 to 15 characters which contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character")
    }
    else{
      
      const resident=await publicregisterResident(data)
      if (resident){ //checking is registration is succesful
        res.send(resident.name+" Your registration is pending approval! Please wait for the security to approve your registration!")
      }else{
        res.send(errorMessage() + "User already exists in waitinglist or in system!")
      }

    }

  })

  app.post('/public_register_resident_Testing',async (req,res)=>{

    let data=req.body
    verifypassword=CheckPassword(data.password)
    if(verifypassword==false){
      res.send(errorMessage() + "Password must be 8 to 15 characters which contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character")
    }
    else{

    const resident=await publicregisterResident_Testing(data)
    console.log(resident)


    if (resident){ //checking is registration is succesful

      res.setHeader('Content-Type', 'text/plain');
      res.status(200).send(resident.name+" Your registration is successful!")
    }else{
      
      res.setHeader('Content-Type', 'text/plain');
      const text = errorMessage();
      res.status(409).send(text+ "User already exists!")
    }
  }
  })

//issue visitor pass POST request
app.post('/issuevisitor_pass', verifyToken, async (req, res)=>{
  let authorize = req.user.role
  let loginUser = req.user.user_id
  let data = req.body
  //console.log(data)
  //console.log(authorize)
  //checking if token is valid
  if(authorize=="resident"){
  const lmao = await issueVisitor_pass(data, loginUser)
    if (lmao){
      res.send("Pass issuing request processed, visitor is " + lmao.name)
    }else{
      res.send(errorMessage() + "Visitor pass already exists!")
    }
  }else {
      res.send(errorMessage() + "Not a valid token!You are not a resident!") 
    }
  }
)

//issue visitor pass POST request
app.post('/issuevisitor_pass_Testing', async (req, res)=>{
  let data = req.body
  //console.log(data)
  //checking if token is valid

  const lmao = await issueVisitor_pass(data, "Testing")

    if (lmao){
      res.send("Pass issuing request processed, visitor is " + lmao.name)
    }else{
      res.send(errorMessage() + "Visitor pass already exists!")
    }


  }
)

//retrievevisitor visitor GET request
app.get('/retrievevisitor_pass', async (req, res)=>{

  let data = req.query.IC_num //requesting the data from body
  let ref_num = req.query.ref_num
  //console.log(data,ref_num)
  const result = await retrieveVisitor_pass(data,ref_num)
  res.send(result)
  })

//delete user DELETE request
app.delete('/deletevisitor_pass', verifyToken, async (req, res)=>{
  let data = req.query.visitor_reference_number //requesting the data from body  
  console.log(data)
  let authorize = req.user
  console.log(authorize)
  //checking the role of user
  if (authorize == "security" || authorize == "admin"){
    res.send("you do not have access to delete visitor_pass!")
  }
  else if (authorize.role == "resident" ){
    const lmao = await deletevisitor_pass(data,authorize.user_id)
    //checking if item is deleted
    if (lmao.deletedCount == "1"){
      res.send("user deleted " + data)
    }else{
      res.send(errorMessage() + "Cannot find the visitor_pass to delete!")
    }
  }
  else 
  {
      res.send(errorMessage() + "Token not valid!")
    }
  }
)

//delete user DELETE request
app.delete('/deletevisitor_pass_Testing', async (req, res)=>{
  let data = req.query.visitor_reference_number //requesting the data from body  
  //console.log(data)
    const lmao = await deletevisitor_pass_Testing(data)
    //checking if item is deleted
    if (lmao.deletedCount == "1"){
      res.send(data + "is deleted")
    }else{
      res.send(errorMessage() + "Cannot find the visitor_pass to delete!")
    }

  }
)

//security visitor pass verification GET request
app.get('/securityvisitor_passverify', verifyToken, async(req, res)=>{
  let authorize =req.user.role
  let data = req.query.unit
  if (authorize =="security"){
    const result = await securityVisitor_passverify(data)
    console.log(typeof(result))
    
    if(typeof(result)=="object"){
    res.send(result)
    }else{
      res.send(errorMessage() + "Visitor pass does not exist!")
    }
  }
  else{
    res.send(errorMessage() + "Not a valid token!You are not a security!") 
  }


})

//list visitor GET request
app.get('/visitorlist', verifyToken, async (req, res)=>{
  let authorize = req.user//reading t he token for authorisation
  //let data = req.query.ref_num //requesting the data from body
  //console.log(data)
  //checking the role of user
  //console.log(authorize)
  if (authorize.role == "resident" || authorize.role == "security" || authorize.role == "admin"){
    const result = await listVisitor(authorize)
    console.log(result)
    res.send(result)
  }else{
    res.send(errorMessage() + "Not a valid token!") 
  }
  })

  //list visitor GET request
app.get('/visitorlist_Testing', async (req, res)=>{


    const result = await listVisitor_TESTING()
    console.log(result)
    res.send(result)
  })

app.get('/approvelist', verifyToken, async (req, res)=>{
  let authorize = req.user.role

  if (authorize =="admin"||authorize=="security"){
    const result = await approveList()
    console.log(result)
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(result)
  }else{
    res.setHeader('Content-Type', 'text/plain');
    const text = errorMessage();
    //console.log(typeof(text))
    res.status(401).send(text+"Not a valid token!You are not a admin or security!")
  }
  })


async function login(data) {


  console.log("Alert! Alert! Someone is logging in!");

  try {
    // Verify username in the database
    console.log(data.user_id);
    let verify = await user.findOne({user_id: data.user_id});

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


async function findUser(newdata) {
    //verify if there is duplicate username in databse
    console.log(newdata)
    const match = await user.findOne({user_id : newdata},{projection: {password: 0, _id : 0}})
    console.log(match)
    return (match)
}

  async function registerUser(newdata) {
    //verify if there is duplicate username in databse
    console.log(newdata)
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
    console.log(data)
    console.log(data.user_id)
    data.password=await encryption(data.password)


    const result = await user.findOneAndUpdate({"user_id" : data.user_id},{$set : data}, {new: true})
    console.log(result)
    if(result == null){
      return 
    }else{
      //const hash = await encryption(result.password)
      
      return (result)
    }
  }
  
  async function deleteUser(data) {
    //verify if username is already in databse
    success = await user.deleteOne({user_id : data})
    return (success) // return success message
  }


  async function registerResident(newdata) {
    //verify if there is duplicate username in databse
    console.log(newdata)
    const match = await user.find({user_id : newdata.user_id}).next()
      if (match) {
        return 
      } else {
        const match2 = await approvalList.find({user_id : newdata.user_id}).next()
        if(match2){
        await approvalList.deleteOne({user_id : newdata.user_id})

        //encrypt password by hashing
        const hashed = await encryption(newdata.password)
        // add info into database
        await user.insertOne({
          "user_id": newdata.user_id,
          "password": hashed,
          "name": newdata.name,
          "unit": newdata.unit,
          "hp_num" : newdata.hp_num,
          "role" : "resident"
        })
        const newUser=await user.find({user_id : newdata.user_id}).next()
        return (newUser)          
        }else{
        //encrypt password by hashing
        const hashed = await encryption(newdata.password)
        // add info into database
        await user.insertOne({
          "user_id": newdata.user_id,
          "password": hashed,
          "name": newdata.name,
          "unit": newdata.unit,
          "hp_num" : newdata.hp_num,
          "role" : "resident"
        })
        const newUser=await user.find({user_id : newdata.user_id}).next()
        return (newUser)
  

        }
      }
    }
  
  async function publicregisterResident(newdata){
    const match = await approvalList.find({user_id : newdata.user_id}).next()
    if (match){
      return
    }else
    {
      const match2 = await user.find({user_id : newdata.user_id}).next()
      if (match2){
        return
      }else{
      await approvalList.insertOne({
        "user_id": newdata.user_id,
        "password": newdata.password,
        "name": newdata.name,
        "unit": newdata.unit,
        "hp_num" : newdata.hp_num
      })
      const newUser=await approvalList.find({user_id : newdata.user_id}).next()
      return (newUser)
      }
  }
  }

  async function publicregisterResident_Testing(newdata){
    

  
    const match = await user.find({user_id : newdata.user_id}).next()
    if (match){
      return
  }else{
    //encrypt password by hashing
    const hashed = await encryption(newdata.password)    
    await user.insertOne({
      "user_id": newdata.user_id,
      "password": hashed,
      "name": newdata.name,
      "unit": newdata.unit,
      "hp_num" : newdata.hp_num,
      "role" : "resident"
    })
    const newUser=await user.find({user_id : newdata.user_id}).next()
    return (newUser)
  }
  }

  async function issueVisitor_pass(newdata, currentUser) {
    //verify if there is duplciate ref_num
    const match = await visitor.find({"ref_num": newdata.ref_num}).next()
      if (match) {
        return 
      } else {
        // add info into database
        await visitor.insertOne({
          "ref_num" : newdata.ref_num,
          "name": newdata.name,
          "IC_num": newdata.IC_num,
          "car_num": newdata.car_num,
          "hp" : newdata.hp_num,
          "visit_date" : newdata.visit_date,
          "unit" : newdata.unit,
          "user_id" : currentUser
        })
            return (newdata)
      }  
  }
  
  async function retrieveVisitor_pass(newdata,ref_num){
    console.log(newdata)
    const match = await visitor.findOne({"IC_num":newdata,"ref_num":ref_num},{projection:{unit:1,visit_date:1,_id:0}})
    console.log(match)

    // if (currentUser.role == "resident"){
    //   filter=Object.assign({},{"ref_num": newdata}, {"user_id" : currentUser.user_id})
      
    //   console.log(filter)
    //   match = await visitor.find(filter, {projection: {_id :0}}).toArray()
    // }else if (currentUser.role == "security" || currentUser.role == "admin"){
    //   match = await visitor.find({"ref_num":newdata},{projection: {_id :0}}).toArray()
    // }
    if (match.length != 0){
      return (match)
    } else{
      return (errorMessage() + "Visitor does not exist!")
    }
  }

  async function deletevisitor_pass(data, currentUser) {
    //verify if username is already in databse
    success = await visitor.deleteOne({"ref_num" : data, "user_id" : currentUser})
    return (success) // return success message
  }

  async function deletevisitor_pass_Testing(data) {
    //verify if username is already in databse
    success = await visitor.deleteOne({"ref_num" : data})
    return (success) // return success message
  }

  async function securityVisitor_passverify(address){ 
    console.log(address)
    const match = await user.find({"unit":address},{projection:{"hp_num":1,"name":1,"_id":0}}).next()
    return (match)


  }

  async function listVisitor(currentUser){
    if (currentUser.role == "resident"){
      filter=Object.assign({}, {"user_id" : currentUser.user_id})
      
      //console.log(filter)
      match = await visitor.find(filter, {projection: {_id :0}}).toArray()
    }else if (currentUser.role == "security" || currentUser.role == "admin"){
      match = await visitor.find({},{projection: {_id :0}}).toArray()
    }
    if (match.length != 0){
      return (match)
    } else{
      return (errorMessage() + "Visitor does not exist!")
    }
  }

  async function listVisitor_TESTING(){

      match = await visitor.find({},{projection: {_id :0}}).toArray()
      console.log(match)
      return (match)
  

  }


  async function approveList(){
    const match = await approvalList.find({},{projection:{"_id":0}}).toArray()
    return (match)
  }


  //generate token for login authentication
  function generateToken(loginProfile){
    
    return jwt.sign(loginProfile, 'UltimateSuperMegaTitanicBombasticGreatestBestPOGMadSuperiorTheOneandOnlySensationalSecretPassword', { expiresIn: '1h' });
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
  
  // to get the current time 
  function currentTime(){
  const today = new Date().toLocaleString("en-US", {timeZone: "singapore"})
  return today
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

  function CheckPassword(inputtxt) 
  { 
    console.log(inputtxt)
  //var passw=  /^[A-Za-z]\w{7,14}$/
  var passw = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/
  if(inputtxt.match(passw)) 
  { 
  console.log('Correct, try another...')
  return true;
  }
  else
  { 
  console.log('Wrong...!')
  return false;
  }
  }
    
  
  