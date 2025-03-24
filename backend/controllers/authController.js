const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const JWT_SECRET = process.env.JWT_SECRET || 'nikhil';

// // Create reusable transporter object using environment variables
// const transporter = nodemailer.createTransport({
//     service: 'gmail',  // Specify the service explicitly
//     host: 'smtp.gmail.com', // Use Gmail's actual SMTP server
//     port: 587,
//     secure: false,
//     auth: {
//         user: 'bebjdjbbansnwbh@gmail.com',
//         pass: 'wmxk xlni plff xpeh',
//     },
//     debug: true, // Enable debug logging
// });

// handle register
exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!email.endsWith("@srkrec.ac.in")) {
        return res.status(400).json({ message: `Enter college mail ID` })
    }

    const regd_no = email.split("@")[0];

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.findOne({ regd_no });
    if (user) {
        return res.status(409).json({ message: `User with this name already exists` });
    }
    // const verificationToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' })
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' })
    // console.log("Verification Token: ", token);
    try {
        const user = await User.create({ regd_no, name, email, password: hashedPassword })
        // send verification mail
        // const verificationLink = `http://localhost:5173/api/verify/${verificationToken}`;
        // await transporter.sendMail({
        //     from: process.env.MAIL_USER || "bebjdjbbansnwbh@gmail.com",
        //     to: email,
        //     subject: "Verify your email",
        //     html: `<p>Click <a href="${verificationLink}">here</a> to verify your account.</p>`,
        // });

        res.status(201).json({
            message: `Registered Successfully`,
            token,
            data: user,
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: `Registration failed`
        });
    }

}

// exports.verifyToken = async (req, res) => {
//     try {
//         const { token } = req.params;
//         const decoded = jwt.verify(token, JWT_SECRET);
//         const user = await User.findOneAndUpdate({ email: decoded.email }, { isVerified: true }, { new: true });

//         if (!user) {
//             return res.status(400).json({ message: `Token invalid or expired` });
//         }
//         res.json({ message: `Email verified Successfully!` });
//     } catch (error) {
//         return res.status(500).json({ message: `Verification failed!` });
//     }
// }

exports.login = async (req, res) => {
    try {
        const { regd_no, password } = req.body;

        const user = await User.findOne({ regd_no });
        if (!user) {
            return res.status(400).json({ message: `Register Number not found` });
        }
        // Compare entered password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect Password!" });
        }
        if(user.isVerified !== true) {
            return res.status(400).json({ message: "Verify email before logging in" });
        }
        const token = jwt.sign({regd_no}, JWT_SECRET, {expiresIn: '1h'})
        res.status(200).json({ message: `Login Successful`, token, data: user });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: `Login failed`
        });
    }
}
