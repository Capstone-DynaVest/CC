const Firestore = require("@google-cloud/firestore");
require("dotenv").config();

const db = new Firestore({
    projectId: process.env.PROJECT_ID,
    keyFilename:  process.env.GOOGLE_APPLICATION_CREDENTIALS,
    databaseId : process.env.DATABASE_ID
});


module.exports = db;

