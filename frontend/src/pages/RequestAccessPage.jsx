import { useEffect, useState } from "react";
import { api } from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import {
  handleApiResponse,
  handleApiError,
} from "../utils/handleApiResponse.js";

export default function RequestAccessPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allProjects, setAllProjects] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all projects (for request list)
  const fetchAllProjects = async () => {
    try {
      const res = await api.get("/projects/all-for-request-access");
      const result = handleApiResponse(res, { showSuccess: false });

      // assuming backend: { success, message, data: [...] }
      if (result.success) setAllProjects(result.projects || []);
    } catch (error) {
      handleApiError(error, "Failed to fetch all projects");
    }
  };

  // Fetch my approved projects (to hide request button)
  const fetchMyProjects = async () => {
    try {
      const res = await api.get("/projects");
      const result = handleApiResponse(res, { showSuccess: false });
      if (result.success) setMyProjects(result.projects || []);
    } catch (error) {
      handleApiError(error, "Failed to fetch my projects");
    }
  };

  // Fetch my pending requests (to show "Pending" instead of button)
  const fetchMyRequests = async () => {
    try {
      const res = await api.get("/requests/my-requests"); // your endpoint
      const result = handleApiResponse(res, { showSuccess: false });
      if (result.success) setPendingRequests(result.requests || []);
    } catch (error) {
      handleApiError(error, "Failed to fetch my requests");
    }
  };

  const handleRequestAccess = async (projectId) => {
    try {
      const res = await api.post("/requests", { projectId });
      const result = handleApiResponse(res, {
        showSuccess: true,
        successMessage: "Access requested!",
      });

      if (result.success) {
        // Push a minimal pending request to local state
        setPendingRequests((prev) => [
          ...prev,
          { project: { _id: projectId }, status: "pending" },
        ]);
      }
    } catch (error) {
      handleApiError(error, "Failed to request access");
    }
  };

  const hasAccess = (projectId) => {
    return myProjects.some((p) => p._id === projectId);
  };

  const hasRequested = (projectId) => {
    return pendingRequests.some(
      (r) => r.project._id === projectId && r.status?.toLowerCase() === "pending"
    );
  };

  useEffect(() => {
    if (!user) return;

    if (user.role !== "Client") {
      navigate("/projects", { replace: true });
      return;
    }

    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchAllProjects(),
        fetchMyProjects(),
        fetchMyRequests(),
      ]);
      setLoading(false);
    };

    loadData();
  }, [user, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-300">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-5 bg-gray-800 border-b border-gray-700">
        <h1 className="text-2xl font-bold">Request Project Access</h1>
        <button
          onClick={() => navigate("/projects")}
          className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl transition"
        >
          Back to My Projects
        </button>
      </nav>

      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <p className="text-gray-400 text-lg">
            Browse all projects and request access to join
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allProjects.map((project) => {
            const alreadyHasAccess = hasAccess(project._id);
            const alreadyRequested = hasRequested(project._id);

            return (
              <div
                key={project._id}
                className={`bg-gray-800 rounded-2xl p-6 border ${alreadyHasAccess
                    ? "border-green-600"
                    : alreadyRequested
                      ? "border-yellow-600"
                      : "border-gray-700"
                  } shadow-lg hover:shadow-xl transition`}
              >
                <h3 className="text-xl font-bold text-white mb-2">
                  {project.name}
                </h3>
                <p className="text-gray-400 flex items-center gap-2 mb-4">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {project.location}
                </p>

                <div className="mt-6">
                  {alreadyHasAccess ? (
                    <div className="text-center">
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-900 text-green-300">
                        Access Granted
                      </span>
                    </div>
                  ) : alreadyRequested ? (
                    <div className="text-center">
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-yellow-900 text-yellow-300">
                        Request Pending
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRequestAccess(project._id)}
                          className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition transform hover:scale-105 shadow-md"
                    >
                      Request Access
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {allProjects.length === 0 && (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500">
              No projects available for request
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
