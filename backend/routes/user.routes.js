import express from "express";
import { requireAdmin } from "../middleware/auth.middleware.js";
import userController from "../controllers/user.controller.js";
import authController from "../controllers/auth.controller.js";
const router = express.Router();

// GET /api/users  (Admin: view all users)
router.get("/", requireAdmin, userController.fetchAllUsers);

// Admin can create users as well (similar to signup)
router.post("/", requireAdmin, authController.createUser);

// DELETE /api/users/:id  (Admin: delete a user)
router.delete("/:id", requireAdmin, userController.deleteUser);

export default router;
