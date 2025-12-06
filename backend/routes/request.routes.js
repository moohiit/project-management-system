// backend/routes/request.routes.js
import express from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";
import requestController from "../controllers/request.controller.js";
const router = express.Router();

// Client: POST /api/requests  (request access to a project)
router.post("/", requireAuth, requestController.createRequest);

// Admin: GET /api/requests/pending
router.get("/pending", requireAdmin, requestController.fetchPendingRequests);

// Admin: POST /api/requests/:id/decision  (approve/deny)
router.post("/:id/decision", requireAdmin, requestController.processRequestDecision);

// Client: GET /api/requests/my-requests → view own requests
router.get("/my-requests", requireAuth, requestController.fetchUserRequests);

export default router;
