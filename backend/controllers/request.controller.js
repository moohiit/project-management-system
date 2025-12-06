import { AccessRequest } from "../models/accessRequest.model.js";
import { Project } from "../models/project.model.js";

const createRequest = async (req, res) => {
  try {
    const { role, id } = req.session.user;
    if (role !== "Client") {
      return res
        .status(403)
        .json({ success: false, message: "Only clients can request access" });
    }
    const { projectId } = req.body;

    const project = await Project.findById(projectId);
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });

    const request = await AccessRequest.create({
      project: projectId,
      client: id,
    });

    res
      .status(201)
      .json({ success: true, request, message: "Access request created" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server error",
    });
  }
};

const fetchPendingRequests = async (req, res) => {
  try {
    const requests = await AccessRequest.find({ status: "PENDING" })
      .populate("project")
      .populate("client", "username");
    res.json({
      success: true,
      requests,
      message: requests.length
        ? "Pending requests fetched"
        : "No pending requests",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server error",
    });
  }
};

const processRequestDecision = async (req, res) => {
  try {
    const { status } = req.body; // APPROVED or DENIED
    const { id: adminId } = req.session.user;

    if (!["APPROVED", "DENIED"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const request = await AccessRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success:false, message: "Request not found" });

    request.status = status;
    request.decidedBy = adminId;
    await request.save();

    if (status === "APPROVED") {
      await Project.findByIdAndUpdate(request.project, {
        $addToSet: { clientsWithAccess: request.client },
      });
    }

    return res.status(200).json({ success: true, message: `Request ${status.toLowerCase()}` });
  } catch (error) {
    console.error("processRequestDecision error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

const fetchUserRequests = async (req, res) => {
  try {
    const requests = await AccessRequest.find({ client: req.session.user.id })
      .populate("project", "name")
      .lean();

    res.json({
      success: true,
      requests,
      count: requests.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export default { createRequest, fetchPendingRequests, processRequestDecision, fetchUserRequests };
