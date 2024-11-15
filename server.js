const express = require("express");
const db = require("./firebaseClient");
require("dotenv").config();
const app = express();

app.use(express.json());


app.post('/addData', async (req, res) => {
    const { name, password } = req.body;
    console.log("Request received with name:", name, "and password:", password); 
    
    try {
        await db.collection("users").add({ name, password });
        console.log("Data successfully written to Firestore"); 
        res.send("Data written to Firestore");
    } catch (error) {
        console.error("Firestore Error:", error.code, error.message, error.details);
        res.status(500).send("Error writing to Firestore");
    }
});

app.get('/checkFirestore', async (req, res) => {
    console.log("Endpoint /checkFirestore was hit");
    try {
        const snapshot = await db.collection("users").get();
        if (snapshot.empty) {
            res.send("No documents found in 'users' collection.");
        } else {
            res.send("Firestore connection successful, 'users' collection is accessible.");
        }
    } catch (error) {
        console.log("Firestore connection error:", error);
        res.status(500).send(error);
    }
});



app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

