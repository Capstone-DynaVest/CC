const express = require("express");
const db = require("./firebaseClient");
const { sessionMiddleware } = require("./middleware/middleware");
const userRoute = require("./routes/user_routes");
const cors = require("cors");
const swaggerjsdoc = require("swagger-jsdoc");
const swaggerui = require("swagger-ui-express");
require("dotenv").config();

const app = express();


app.use(express.json());
app.use(cors());


app.use(sessionMiddleware);


app.use("/users", userRoute);

const spacs = swaggerjsdoc({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Capstone API",
            version: "1.0.0",
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 3000}`,
            },
        ],
    },
    apis: ["./routes/user_routes.js"], 
});

app.use("/api-docs", swaggerui.serve, swaggerui.setup(spacs));


app.get("/", (req, res) => {
    res.json({
        message: "Welcome to the Capstone API. Visit /api-docs for API documentation.",
    });
});


app.use((req, res, next) => {
    res.status(404).json({
        message: "Resource not found",
    });
});


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: "Internal server error",
    });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
