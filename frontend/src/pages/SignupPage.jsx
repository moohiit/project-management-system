import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useState, useEffect, useMemo } from "react";
import { handleApiError, handleApiResponse } from "../utils/handleApiResponse.js";

export default function SignupPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password", "");

  useEffect(() => {
    if (user) navigate("/projects", { replace: true });
  }, [user, navigate]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const { role, ...payload } = data;
      const res = await api.post("/auth/signup", payload);
      handleApiResponse(res, { showSuccess: true, successMessage: "Account created! Redirecting..." });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      handleApiError(err, "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return "";
    if (password.length < 8) return "text-red-400";
    if (password.length >= 12) return "text-green-400 font-bold";
    if (password.length >= 10) return "text-yellow-400";
    return "text-red-400";
  };

  const passwordRegex = useMemo(
    () => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&])[A-Za-z\d@#$!%*?&]{8,}$/,
    []
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-10 border border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-100">Create Account</h1>
          <p className="text-gray-400 mt-2">Join Ubiquitous Pvt. Ltd.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              {...register("username", {
                required: "Username is required",
                minLength: { value: 3, message: "At least 3 characters" },
              })}
              placeholder="username123"
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400 transition"
              disabled={isLoading}
            />
            {errors.username && <p className="mt-1 text-xs text-red-400">{errors.username.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              {...register("password", {
                required: "Password is required",
                pattern: {
                  value: passwordRegex,
                  message: "Must include uppercase, lowercase, number, and special char",
                },
                minLength: { value: 8, message: "Minimum 8 characters" },
              })}
              placeholder="Create a strong password"
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400 transition"
              disabled={isLoading}
            />

            {password && (
              <div className="mt-3 space-y-1 text-xs">
                <div className="flex gap-4">
                  <span className={password.length >= 8 ? "text-green-400" : "text-red-400"}>
                    ≥8 characters
                  </span>
                  <span className={/[A-Z]/.test(password) ? "text-green-400" : "text-red-400"}>
                    Uppercase
                  </span>
                </div>
                <div className="flex gap-4">
                  <span className={/\d/.test(password) ? "text-green-400" : "text-red-400"}>
                    Number
                  </span>
                  <span className={/[@#$!%*?&]/.test(password) ? "text-green-400" : "text-red-400"}>
                    Special (@#$!%*?&)
                  </span>
                </div>
                <p className={`${getPasswordStrength()} font-medium`}>
                  Strength: {password.length < 8 ? "Weak" : password.length >= 12 ? "Strong" : "Good"}
                </p>
              </div>
            )}

            {errors.password && <p className="mt-2 text-xs text-red-400">{errors.password.message}</p>}
          </div>

          <input type="hidden" {...register("role")} value="Client" />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-md disabled:opacity-50"
          >
            {isLoading ? "Creating..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-blue-400 hover:text-blue-300 underline transition">
              Log in here
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-500 mt-8">
          Only Admins can create Admin accounts • Clients register here
        </p>
      </div>
    </div>
  );
}