import express from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";
import projectController from "../controllers/project.controller.js";

const router = express.Router();

// GET /api/projects
// Admin: all projects
// Client: only granted projects
router.get("/", requireAuth, projectController.fetchProjects);

// GET /api/projects/all-for-request-access  (client only)
router.get(
  "/all-for-request-access",
  requireAuth,
  projectController.getAllProjectsForRequestAccess
);

// POST /api/projects  (Admin create project)
router.post("/", requireAdmin, projectController.createProject);

// PUT /api/projects/:id  (Admin update project)
router.put("/:id", requireAdmin, projectController.updateProject);

// DELETE /api/projects/:id  (Admin delete project)
router.delete("/:id", requireAdmin, projectController.deleteProject);

export default router;
