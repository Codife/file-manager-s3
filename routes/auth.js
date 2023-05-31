var express = require("express");
var router = express.Router();
const User = require("../models/UserSchema");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const result = await bcrypt.compare(password, user.password);
    console.log(result, password, user.password);
    if (!result) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = jwt.sign({ userId: user }, process.env.JWT_SECRET);
    return res.status(200).json({ message: "Sign-in successful", token, user });
  } catch (error) {
    console.error("Error during sign-in", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/signup", async (req, res) => {
  const { name, email, password, userType, userRole, phoneNumber } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      userType,
      userRole,
      phoneNumber,
    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser }, process.env.JWT_SECRET);

    return res.status(201).json({ message: "Sign-up successful", token });
  } catch (error) {
    console.error("Error during sign-up", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
