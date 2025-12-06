import express from "express";
import { requireAdmin } from "../middleware/auth.middleware.js";
import reportController from "../controllers/report.controller.js";
const router = express.Router();

// GET /api/reports  (admin)
router.get("/", requireAdmin, reportController.fetchReports);

export default router;
