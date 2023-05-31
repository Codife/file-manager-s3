var express = require("express");
var router = express.Router();
const User = require("../models/UserSchema");
const bcrypt = require("bcrypt");
const verifyJWT = require("../middlewares/auth");
const checkUserRole = require("../middlewares/isAdmin");

router.post("/create", verifyJWT, checkUserRole("Admin"), async (req, res) => {
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
      phoneNumber,
    });

    await newUser.save();

    return res.status(201).json({ message: "Sign-up successful", newUser });
  } catch (error) {
    console.error("Error during sign-up", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/edit/:id", verifyJWT, checkUserRole("Admin"), async (req, res) => {
  const { name, email, password, userType, userRole, phoneNumber, team } =
    req.body;
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name;
    user.email = email;
    user.password = await bcrypt.hash(password, 10);
    user.userType = userType;
    user.phoneNumber = phoneNumber;

    await user.save();

    return res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error during user update", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get(
  "/get-all-users",
  verifyJWT,
  checkUserRole("Admin"),
  async (req, res) => {
    try {
      const users = await User.find().populate("team");
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.get(
  "/get-user-by-type/:userType",
  verifyJWT,
  checkUserRole("Admin"),
  async (req, res) => {
    const { userType } = req.params;
    try {
      const users = await User.find({ userType: userType });
      res.status(200).json({ message: "Success", users });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);


module.exports = router;
