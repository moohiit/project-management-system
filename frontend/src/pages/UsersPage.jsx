import { useEffect, useState } from "react";
import { api } from "../api/axios.js";
import { handleApiError, handleApiResponse } from "../utils/handleApiResponse.js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== "Admin") {
      navigate("/projects");
      return;
    }
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users");
        const result = handleApiResponse(res, { showSuccess: false });
        if (result.success) setUsers(result.users || []);
      } catch (error) {
        handleApiError(error);
        setUsers([]);
      }
    };
    fetchUsers();
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-100">User Management</h2>
          <button
            onClick={() => navigate("/projects")}
            className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-500 transition"
          >
            Back to Dashboard
          </button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-700">
            <tr>
              <th className="text-left py-3 px-4">Username</th>
              <th className="text-left py-3 px-4">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-gray-700 hover:bg-gray-700 transition">
                <td className="py-3 px-4">{u.username}</td>
                <td className="py-3 px-4">{u.role}</td>
              </tr>
            ))}
            {!users.length && (
              <tr>
                <td colSpan={3} className="py-6 text-center text-gray-400">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}