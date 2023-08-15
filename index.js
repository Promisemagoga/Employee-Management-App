const express = require("express")
const ejs = require("ejs")
const morgan = require("morgan")

const app = express()

app.set("view engine", "ejs")
app.set('view engine', 'ejs')
app.use(morgan('dev'))
// app.use(morgan('dev'), (req,res) =>{
//     res.render("404")
// })
const admin = require('firebase-admin')
const credentials = require('./key.json')
app.use(express.static('public'))
//initialise admin
admin.initializeApp({
    credential: admin.credential.cert(credentials)
})
const db = admin.firestore()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const image = " https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"

//Add Employee
app.post("/home", async (req, res) => {
    try {
        const employeeJson = {
            employeeName: req.body.employeeName,
            employeeId: req.body.employeeId,
            employeeEmail: req.body.employeeEmail,
            employeePosition: req.body.employeePosition,
            employeePhoneNumber: req.body.employeePhoneNumber
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
        // employeeName: req.body.employeeName,
        // employeeId: req.body.employeeId,
        // employeeEmail: req.body.employeeEmail,
        employeePosition: req.body.employeePosition,
        //employeePhoneNumber: req.body.employeePhoneNumber
    }
    db.collection("employees").doc(id).update(updateData).then(() =>{
        console.log("data is successfully updated");
    }).catch((error) =>{
        console.log(error);
        res.send(error)
    })
})

app.get("/home", async(req,res) =>{
    try {
       const employeeRef = db.collection("employees") 
       const response = await employeeRef.get();
       let responseArray = [];
       response.forEach((results) =>{
        responseArray.push({...results.data(),image:image, id:results.id})
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