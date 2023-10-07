const { Router } = require("express");
const { UserModel } = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const userRouter = Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User-related endpoints
 */

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     requestBody:
 *       description: User registration data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             example:
 *               message: User registered successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             example:
 *               message: Validation error
 *               errors: [ "Name is required", "Email is required", "Password is required" ]
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: Internal server error
 */
userRouter.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const hashedPassword = await bcrypt.hash(password, 5);

        const newUser = new UserModel({
            name,
            email,
            password: hashedPassword,
        });
        await newUser.save();

        res.status(201).json({ message: `${name} successfully registered` });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: User login
 *     tags: [User]
 *     requestBody:
 *       description: User login data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             example:
 *               message: User logged in successfully
 *               token: "your-access-token"
 *       401:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             example:
 *               message: User Not Found or Wrong Password
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: Internal server error
 */
userRouter.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if ( !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const user = await UserModel.findOne({ email });
        if (!user) return res.status(401).json({ message: "User Not Found" });

        const convertedPassword = await bcrypt.compare(password, user.password);
        const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        if (convertedPassword) {
            return res.status(201).json({ message: "User LoggedIn", token });
        } else {
            return res.status(401).json({ message: "Wrong Password" });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = {
    userRouter,
};
