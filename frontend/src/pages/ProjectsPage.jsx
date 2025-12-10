import { useEffect, useState } from "react";
import { api } from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import {
  handleApiResponse,
  handleApiError,
} from "../utils/handleApiResponse.js";

export default function ProjectsPage() {
  const { user, setUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      const result = handleApiResponse(res, { showSuccess: false });
      if (result.success) setProjects(result.projects || []);
    } catch (error) {
      handleApiError(error);
      setProjects([]);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const res = await api.get("/requests/pending");
      const result = handleApiResponse(res, { showSuccess: false });
      if (result.success) setRequests(result.requests || []);
    } catch (error) {
      handleApiError(error);
      setRequests([]);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
      if (user.role === "Admin") fetchPendingRequests();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      const res = await api.post("/auth/logout");
      handleApiResponse( res, { showSuccess: true });
      setUser(null);
      navigate("/login");
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleRequestAccess = async (projectId) => {
    try {
      const res = await api.post("/requests", { projectId });
      handleApiResponse(res, { showSuccess: true });
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleDecision = async (id, status) => {
    try {
      const res = await api.post(`/requests/${id}/decision`, { status });
      handleApiResponse(res, { showSuccess: true });
      fetchPendingRequests();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleEditProject = (project) => {
    // pass project in location.state
    navigate("/createProject", { state: { project } });
  };

  const handleDeleteProject = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this project?");
    if (!confirm) return;

    try {
      const res = await api.delete(`/projects/${id}`);
      const result = handleApiResponse(res, {
        showSuccess: true,
        successMessage: "Project deleted successfully",
      });

      if (result.success) {
        setProjects((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (error) {
      handleApiError(error, "Failed to delete project");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <nav className="flex justify-between items-center px-8 py-4 bg-gray-800 shadow-lg border-b border-gray-700">
        <h1 className="text-2xl font-bold text-gray-100">
          Dashboard – {user?.role} ({user?.username})
        </h1>
        <div className="flex gap-4">
          {user?.role === "Admin" && (
            <>
              <button
                onClick={() => navigate("/createProject")}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow"
              >
                Create Project
              </button>
              <button
                onClick={() => navigate("/users")}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow"
              >
                Manage Users
              </button>
              <button
                onClick={() => navigate("/reports")}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition shadow"
              >
                Reports
              </button>
            </>
          )}
          {user?.role === "Client" && (
            <button
              onClick={() => navigate("/request-access")}
              className="px-4 py-2 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition shadow"
            >
              Request Project Access
            </button>
          )}
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition shadow"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="p-8 space-y-10">
        {/* Pending Requests for Admin */}
        {user?.role === "Admin" && (
          <div className="bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 text-gray-100">
              Pending Access Requests
            </h2>
            <table className="w-full text-sm">
              <thead className="bg-gray-700">
                <tr>
                  <th className="text-left py-3 px-4">Client</th>
                  <th className="text-left py-3 px-4">Project</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr
                    key={r._id}
                    className="border-b border-gray-700 hover:bg-gray-700 transition"
                  >
                    <td className="py-3 px-4">{r.client.username}</td>
                    <td className="py-3 px-4">{r.project.name}</td>
                    <td className="py-3 px-4">{r.status}</td>
                    <td className="py-3 px-4 flex justify-center gap-2">
                      <button
                        onClick={() => handleDecision(r._id, "APPROVED")}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleDecision(r._id, "DENIED")}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Deny
                      </button>
                    </td>
                  </tr>
                ))}
                {!requests.length && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-400">
                      No pending requests
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Projects Section */}
        <div className="bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 text-gray-100">Projects</h2>
          <table className="w-full text-sm">
            <thead className="bg-gray-700">
              <tr>
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Location</th>
                <th className="text-left py-3 px-4">Phone</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Start Date</th>
                <th className="text-left py-3 px-4">End Date</th>
                {user?.role === "Admin" && (
                  <th className="text-left py-3 px-4">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr
                  key={p._id}
                  className="border-b border-gray-700 hover:bg-gray-700 transition"
                >
                  <td className="py-3 px-4">{p.name}</td>
                  <td className="py-3 px-4">{p.location}</td>
                  <td className="py-3 px-4">{p.phone}</td>
                  <td className="py-3 px-4">{p.email}</td>
                  <td className="py-3 px-4">
                    {p.startDate ? p.startDate.split("T")[0] : "-"}
                  </td>
                  <td className="py-3 px-4">
                    {p.endDate ? p.endDate.split("T")[0] : "-"}
                  </td>

                  {user?.role === "Admin" && (
                    <td className="py-3 px-4 flex gap-2">
                      <button
                        onClick={() => handleEditProject(p)}
                        className="px-3 py-1 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-400 text-xs font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProject(p._id)}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}

              {!projects.length && (
                <tr>
                  <td
                    colSpan={user?.role === "Admin" ? 7 : 6}
                    className="py-6 text-center text-gray-400"
                  >
                    No projects available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
      </div>
    </div>
  );
}
