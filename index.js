const express = require("express")
const ejs = require("ejs")
const morgan = require("morgan")

const app = express()

app.set('view engine', 'ejs')
app.use(morgan('dev'))
const multer = require('multer');
const admin = require('firebase-admin')
const credentials = require('./key.json')
app.use(express.static('public'))
//initialise admin
admin.initializeApp({
    credential: admin.credential.cert(credentials),
    storageBucket: "job-site-ea575.appspot.com"
})
const db = admin.firestore()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//const image = " https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
const upload = multer({ storage: multer.memoryStorage() });
//Add Employee
app.post("/home", upload.single('image') ,async (req, res) => {
    try {
      
        const bucket = admin.storage().bucket();
        const file = bucket.file(req.file.originalname);
        const result = await file.createWriteStream().end(req.file.buffer);
        const downloadUrl = await file.getSignedUrl({
          action: 'read',
          expires: '03-17-2025'
        });
console.log(downloadUrl);
        const imgJson ={
            imageUrl: downloadUrl[0]
        }

        const employeeJson = {
            employeeName: req.body.employeeName,
            employeeId: req.body.employeeId,
            employeeEmail: req.body.employeeEmail,
            employeePosition: req.body.employeePosition,
            employeePhoneNumber: req.body.employeePhoneNumber,
            employeeImg: downloadUrl[0]
        }

        const response = await db.collection('employees').add(employeeJson).then(() =>{
            res.redirect("home")
        })
        res.send(response)
    } catch (error) {
        console.log(error);
        res.send(error)
    }
})

//Delete Employee
app.delete("/delete/:id", async (req, res) => {
    try {
        const response = await db.collection("employees").doc(req.params.id).delete();
        res.send(response)
    } catch (error) {
        console.log(error);
        res.send(response)
    }
})

app.put("/update/:id", async (req, res) => {
    const id = req.params.id;
    const updateData = {
        employeeName: req.body.employeeName,
        employeeId: req.body.employeeId,
        employeeEmail: req.body.employeeEmail,
        employeePosition: req.body.employeePosition,
        employeePhoneNumber: req.body.employeePhoneNumber
    }
    db.collection("employees").doc(id).update(updateData).then(() =>{
        console.log("data is successfully updated");
    }).catch((error) =>{
         console.log(error);
         res.send(error)
    })
})


app.get("/profile/:id", async(req,res) =>{
    try {
        const employeeRef = db.collection("employees").doc(req.params.id); 
        const response = await employeeRef.get();
        if (!response.exists) {
            res.status(404).send("Employee not found");
            return;
        }
        const employeeData = response.data();
        const employeeArray = [{...employeeData, id: response.id}];
        res.render("profile", {responseArray: employeeArray})
        console.log(employeeArray);
    } catch (error) {
        console.log(error);
        res.send(error)
    }
})

app.get("/home", async(req,res) =>{
    try {
       const employeeRef = db.collection("employees") 
       const response = await employeeRef.get();
       let responseArray = [];
       response.forEach((results) =>{
        responseArray.push({...results.data(), id:results.id})
       })
       res.render("home", {responseArray})
       console.log(responseArray);
    } catch (error) {
        console.log(error);
        res.send(error)
    }
})

// app.get("/home", (req, res) => {
//     res.render("home")
// })

const PORT = 3000;

app.listen(PORT, (req, res) => {
    console.log("App running on localhost", PORT);
})