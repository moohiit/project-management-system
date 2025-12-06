import { useForm } from "react-hook-form";
import { api } from "../api/axios.js";
import { useNavigate } from "react-router-dom";
import { handleApiResponse, handleApiError } from "../utils/handleApiResponse.js";

export default function CreateProjectPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (formData) => {
    try {
      const res = await api.post("/projects", formData);

      const data = handleApiResponse(res, {
        showSuccess: true,
        successMessage: "Project created successfully",
      });

      if (data.success) {
        navigate("/projects");
      }
    } catch (error) {
      handleApiError(error, "Failed to create project");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100">
      <div className="bg-gray-800 shadow-2xl rounded-2xl p-10 w-full max-w-lg border border-gray-700">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-100">Create New Project</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Project Name</label>
            <input
              placeholder="Enter project name"
              {...register("name", { required: "Project name is required" })}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400 transition"
            />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
            <input
              placeholder="Enter location"
              {...register("location", { required: "Location is required" })}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400 transition"
            />
            {errors.location && <p className="mt-1 text-xs text-red-400">{errors.location.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Phone (10 digits)</label>
            <input
              placeholder="Enter phone number"
              {...register("phone", { required: "Phone is required", pattern: { value: /^\d{10}$/, message: "Must be 10 digits" } })}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400 transition"
            />
            {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              placeholder="Enter email"
              {...register("email", { required: "Email is required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" } })}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400 transition"
            />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
              <input
                type="date"
                {...register("startDate", { required: "Start date is required" })}
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 transition"
              />
              {errors.startDate && <p className="mt-1 text-xs text-red-400">{errors.startDate.message}</p>}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
              <input
                type="date"
                {...register("endDate", { required: "End date is required" })}
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 transition"
              />
              {errors.endDate && <p className="mt-1 text-xs text-red-400">{errors.endDate.message}</p>}
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition shadow-md"
          >
            Create Project
          </button>
        </form>
      </div>
    </div>
  );
}