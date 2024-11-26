const express = require("express");

const { registerEmail, loginEmail, logoutUser } = require("../controller/user_controller");
const { isAuthenticated } = require("../middleware/middleware");

const router = express.Router();
/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: mysecurepassword
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 email:
 *                   type: string
 *                 create_at:
 *                   type: string
 *                   format: date-time
 *                 token:
 *                   type: string
 *       400:
 *         description: Bad request - Missing required fields or user already exists
 *       500:
 *         description: Internal server error
 */
router.post("/register", registerEmail);
/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Log in a user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: mysecurepassword
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *       401:
 *         description: Unauthorized - Invalid credentials
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.post("/login", loginEmail);

router.get("/protected-route", isAuthenticated, (req, res) => {
    res.status(200).json({
        success: true,
        message: "You have accessed a protected route",
        user: req.user,
    });
});
/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: Log out a user
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: User logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: No active session to log out
 *       500:
 *         description: Internal server error
 */
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