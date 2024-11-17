const session = require("express-session");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const key = process.env.JWT_KEY;

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
        return res.status(401).json({
            success: false,
            message: "Authorization header is missing",
        });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, key, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: "Invalid or expired token",
            });
        }

        req.user = user; 
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