const express = require("express");
const db = require("./firebaseClient");
const { sessionMiddleware } = require("./middleware/middleware");
const userRoute = require("./routes/user_routes");
const cors = require("cors");
require("dotenv").config();
const app = express();

app.use(express.json());
app.use(sessionMiddleware);
app.use(cors());
app.use(userRoute);


app.get('/', (req, res) => {
    res.status(404).json({
        message: 'resource not found'
    })
});


app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

