const Firestore = require("@google-cloud/firestore");
require("dotenv").config();

const db = new Firestore({
    projectId: "capstone-c242-ps555",
    keyFilename: "./service-account.json",
    databaseId : process.env.DATABASE_ID
});


module.exports = db;

