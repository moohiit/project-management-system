import { Project } from "../models/project.model.js";

const fetchProjects = async (req, res) => {
  try {
    const { role, id } = req.session.user;

    // Build query based on role
    const query = role === "Admin" ? {} : { clientsWithAccess: id };

    const projects = await Project.find(query).lean();

    return res.status(200).json({
      success: true,
      projects,
      count: projects.length,
      message: projects.length ? "Projects fetched" : "No projects found",
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server error",
    });
  }
};

const getAllProjectsForRequestAccess = async (req, res) => {
  try {
    const projects = await Project.find()
      .select("name location clientsWithAccess")
      .lean();
    return res.status(200).json({
      success: true,
      projects,
      count: projects.length,
      message: projects.length ? "Projects fetched" : "No projects found",
    });
  } catch (error) {
    console.error("Error fetching projects for access request:", error);
    return res.status(500).json({ 
      success: false,
      message: error.message || "Internal Server error" 
    });
  }
};

const createProject = async (req, res) => {
  try {
    const { name, location, phone, email, startDate, endDate } = req.body;

    if (phone.length > 10) {
      return res
        .status(400)
        .json({ success: false, message: "Phone must be max 10 digits" });
    }

    const project = await Project.create({
      name,
      location,
      phone,
      email,
      startDate,
      endDate,
      createdBy: req.session.user.id,
    });

    res
      .status(201)
      .json({ success: true, project, message: "Project created" });
  } catch (error) {
    console.error("Create project error", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server error",
    });
  }
};

export default { fetchProjects, getAllProjectsForRequestAccess, createProject };