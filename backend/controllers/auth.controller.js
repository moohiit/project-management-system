import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";

const createUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    const existing = await User.findOne({ username });
    if (existing)
      return res
        .status(400)
        .json({ success: false, message: "Username already exists" });

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
      username,
      passwordHash,
      role: role === "Admin" ? "Admin" : "Client",
    });

    return res
      .status(201)
      .json({ success: true, message: "User created", userId: user._id });
  } catch (error) {
    console.error("Signup error", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server error",
    });
  }
}

const checkUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({success:false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    // Set session
    req.session.user = {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
    };
    return res.status(200).json({
      success:true,
      message: "Login successful",
      user: { id: user._id, username: user.username, role: user.role },
    });
  } catch (err) {
    console.error("Login error", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal Server error",
    });
  }
};

const getCurrentUser = (req, res) => {
  try {
    if (!req.session.user) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }
  
    res.json({
      success: true,
      user: req.session.user, // { id, username, role }
    });
  } catch (error) {
    console.error("Get current user error", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server error",
    });
  }
};

const logoutUser = (req, res) => {
  try {
    if (!req.session) return res.status(200).json({ success:true, message: "Logged out" });
  
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ success: false, message: "Could not logout" });
      res.clearCookie("connect.sid");
      return res.status(200).json({ success:true, message: "Logged out" });
    });
  } catch (error) {
    console.error("Logout error", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server error",
    });
  }
};


export default { createUser, checkUser, getCurrentUser, logoutUser };