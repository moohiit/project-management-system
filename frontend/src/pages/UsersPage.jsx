import { useEffect, useState } from "react";
import { api } from "../api/axios.js";
import { handleApiError, handleApiResponse } from "../utils/handleApiResponse.js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "Client",
  });
  const [isCreating, setIsCreating] = useState(false);
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
        handleApiError(error, "Failed to fetch users");
        setUsers([]);
      }
    };

    fetchUsers();
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const res = await api.post("/users", newUser);
      const result = handleApiResponse(res, {
        showSuccess: true,
        successMessage: "User created successfully",
      });

      if (result.success && result.user) {
        setUsers((prev) => [...prev, result.user]);
        setNewUser({
          username: "",
          password: "",
          role: "Client",
        });
      }
    } catch (error) {
      handleApiError(error, "Failed to create user");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteUser = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this user?");
    if (!confirm) return;

    try {
      const res = await api.delete(`/users/${id}`);
      const result = handleApiResponse(res, {
        showSuccess: true,
        successMessage: "User deleted",
      });

      if (result.success) {
        setUsers((prev) => prev.filter((u) => u._id !== id));
      }
    } catch (error) {
      handleApiError(error, "Failed to delete user");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-5xl mx-auto bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-100">User Management</h2>
          <button
            onClick={() => navigate("/projects")}
            className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-500 transition"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Add User Form */}
        <form
          onSubmit={handleCreateUser}
          className="mb-8 grid grid-cols-1 md:grid-cols-5 gap-3 items-end bg-gray-750 p-4 rounded-xl"
        >
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Username
            </label>
            <input
              name="username"
              value={newUser.username}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="username"
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={newUser.password}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Password"
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Role
            </label>
            <select
              name="role"
              value={newUser.role}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Client">Client</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div className="md:col-span-1">
            <button
              type="submit"
              disabled={isCreating}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl text-sm"
            >
              {isCreating ? "Creating..." : "Add User"}
            </button>
          </div>
        </form>

        {/* Users Table */}
        <table className="w-full text-sm">
          <thead className="bg-gray-700">
            <tr>
              <th className="text-left py-3 px-4">Username</th>
              <th className="text-left py-3 px-4">Role</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u._id}
                className="border-b border-gray-700 hover:bg-gray-700 transition"
              >
                <td className="py-3 px-4">{u.username}</td>
                <td className="py-3 px-4">{u.role}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleDeleteUser(u._id)}
                    className="px-3 py-1.5 text-xs rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium"
                  >
                    Delete
                  </button>
                </td>
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