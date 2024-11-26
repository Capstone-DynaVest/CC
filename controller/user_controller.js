const db = require("../firebaseClient");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { setSessionUser } = require("../middleware/middleware");
require("dotenv").config();

// Mendapatkan JWT_KEY dari variabel lingkungan dan memberikan fallback jika tidak ada
const key = process.env.JWT_KEY || 'defaultSecretKey'; // Default jika key tidak ada
if (!process.env.JWT_KEY) {
    console.warn("WARNING: JWT_KEY is not defined. Using default secret key.");
}

// Fungsi untuk mendaftar user
const registerEmail = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validasi input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            });
        }

        // Mengecek apakah user sudah ada
        const userRef = db.collection("users").doc(email);
        const user = await userRef.get();

        if (user.exists) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        // Meng-hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Menyimpan data user
        const userData = {
            email: email,
            password: hashedPassword,
            createAt: new Date()
        };

        await userRef.set(userData);

        // Payload untuk JWT
        const payload = {
            email: email
        };

        // Memastikan key JWT ada sebelum membuat token
        if (!key) {
            return res.status(500).json({
                success: false,
                message: "JWT key is not defined"
            });
        }

        // Membuat JWT token
        const token = jwt.sign(payload, key, {
            expiresIn: "1h"
        });

        res.status(200).json({
            success: true,
            message: "User registered successfully",
            email: email,
            create_at: userData.createAt,
            token: token
        });

    } catch (error) {
        console.error("Error registering user", error);
        res.status(500).json({
            success: false,
            message: "Error registering user",
            error: error.message
        });
    }
};

// Fungsi untuk login user
const loginEmail = async (req, res) => {
    try {
        const { email, password } = req.body;

      
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            });
        }

     
        const userRef = db.collection("users").doc(email);
        const user = await userRef.get();

        if (!user.exists) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const userData = user.data();

     
        const isMatch = await bcrypt.compare(password, userData.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

       
        const payload = {
            email: email
        };

        
        const token = jwt.sign(payload, key, {
            expiresIn: "24h"
        });

        
        setSessionUser(req, { email });

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            token: token
        });

    } catch (error) {
        console.error("Error logging in user", error);
        res.status(500).json({
            success: false,
            message: "Error logging in user",
            error: error.message
        });
    }
};


const logoutUser = (req, res) => {
    try {
        if (req.session) {
            req.session.destroy((err) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: "Error logging out",
                    });
                }

                res.clearCookie("connect.sid"); 
                return res.status(200).json({
                    success: true,
                    message: "Logged out successfully",
                });
            });
        } else {
            res.status(400).json({
                success: false,
                message: "No active session to log out",
            });
        }
    } catch (error) {
        console.error("Error during logout:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred during logout",
        });
    }
};

module.exports = {
    registerEmail,
    loginEmail,
    logoutUser
};
