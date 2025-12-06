import express from "express";
import authController from "../controllers/auth.controller.js";

const router = express.Router();


// POST /api/auth/signup  -> createUser()
router.post("/signup", authController.createUser);

// POST /api/auth/login  -> checkUser()
router.post("/login", authController.checkUser);

// GET /api/auth/me → returns current logged-in user from session
router.get('/me', authController.getCurrentUser);

// POST /api/auth/logout
router.post("/logout", authController.logoutUser);

export default router;
