import { User } from "../models/user.model.js";
import { AccessRequest } from "../models/accessRequest.model.js";
import { Project } from "../models/project.model.js";

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

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    // first delete all associted requests, and pull project access either it will create error due to foreign key constraints 
    await AccessRequest.deleteMany({ client: userId });
    await Project.updateMany(
      { clientsWithAccess: userId },
      { $pull: { clientsWithAccess: userId } }
    );
    const deletedUser = await User.findByIdAndDelete(userId).select("-passwordHash");
    if (!deletedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user: deletedUser, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server error",
    });
  }
};

export default { fetchAllUsers, deleteUser };