import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { handleApiResponse, handleApiError } from "../utils/handleApiResponse.js";
import { useEffect } from "react";

export default function LoginPage() {
  const { register, handleSubmit } = useForm();
  const { user, setUser } = useAuth(); // Now setUser handles token too
  const navigate = useNavigate();
  useEffect(() => {
    if (user) navigate("/projects", { replace: true });
  }, [user, navigate]);

  const onSubmit = async (formData) => {
    try {
      const res = await api.post("/auth/login", formData);

      const data = handleApiResponse(res, {
        showSuccess: true,
        successMessage: "Logged in successfully",
      });

      if (data.success) {
        setUser(data.user); 
        navigate("/projects");
      }
    } catch (error) {
      handleApiError(error, "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100">
      <div className="bg-gray-800 shadow-2xl rounded-2xl p-10 w-full max-w-md border border-gray-700">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-100">
          Welcome Back!
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <input
              {...register("username", { required: true })}
              placeholder="Enter your username"
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              {...register("password", { required: true })}
              placeholder="Enter your password"
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition shadow-md"
          >
            Login
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-blue-400 hover:text-blue-300 underline transition"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}