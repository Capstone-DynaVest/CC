const express = require("express");

const { registerEmail, loginEmail, logoutUser } = require("../controller/user_controller");
const { isAuthenticated } = require("../middleware/middleware");

const router = express.Router();

router.post("/register", registerEmail);
router.post("/login", loginEmail);
router.get("/protected-route", isAuthenticated, (req, res) => {
    res.status(200).json({
        success: true,
        message: "You have accessed a protected route",
        user: req.user,
    });
});
router.post("/logout", isAuthenticated, logoutUser);

router.post("/set-session", isAuthenticated, (req, res) => {
    const { key , value } = req.body;
    req.session[key] = value;

    res.status(200).json({
        success: true,
        message: `Session ${key} set to ${value}`,
    });
});

router.get("/get-session", isAuthenticated, (req, res) => {
    res.status(200).json({
        success: true,
        sessionData: req.session,
    });
});



module.exports = router;