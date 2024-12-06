const Firestore = require("@google-cloud/firestore");
require("dotenv").config();

const db = new Firestore({
    projectId: process.env.PROJECT_ID,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    databaseId : process.env.DATABASE_ID
});

// async function testConnection() {
//     try {
//         const snapshot = await db.collection('users').get();
//         console.log("Connection successful. Documents found:", snapshot.size);
//     } catch (err) {
//         console.error("Error connecting to Firestore:", err.message);
//     }
// }

// testConnection();

module.exports = db;