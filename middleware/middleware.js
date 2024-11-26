const session = require("express-session");
const jwt = require("jsonwebtoken");
require("dotenv").config();

 key = process.env.JWT_KEY;
 console.log("Key:", key);

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure : process.env.NODE_ENV === "development",
        maxAge: 24 * 60 * 60 * 1000   
    }
});

const isAuthenticated = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        console.log("Authorization header missing");
        return res.status(401).json({
            success: false,
            message: "Authorization header is missing",
        });
    }

    const token = authHeader.split(" ")[1]; 
    console.log("Token received:", token);

    jwt.verify(token, key, (err, user) => {
        if (err) {
            console.log("JWT verification error:", err.message);
            return res.status(403).json({
                success: false,
                message: "Invalid or expired token",
            });
        }

        req.user = user; 
        console.log("Token valid, user:", user);
        next(); 
    });
};


const setSessionUser = (req, user) => {
    req.session.user = user;
}

module.exports = {
    sessionMiddleware,
    isAuthenticated,
    setSessionUser}