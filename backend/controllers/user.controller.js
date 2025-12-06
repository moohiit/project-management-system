import { User } from "../models/user.model.js";

const fetchAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash");
    res.json({ success: true, users, message: users.length ? "Users fetched" : "No users found" });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server error",
    });
  }
};

export default { fetchAllUsers };