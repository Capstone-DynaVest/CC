const Firestore = require("@google-cloud/firestore");


const db = new Firestore({
    projectId: "capstone-c242-ps555",
    keyFilename: "./service-account.json",
});


module.exports = db;

