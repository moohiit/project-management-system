import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ReportsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    denied: 0,
  });

  useEffect(() => {
    if (user?.role !== "Admin") {
      navigate("/projects");
      return;
    }

    const controller = new AbortController();

    const fetchReports = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/reports", {
          credentials: "include",
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Failed to load reports");

        // ⬇️ Simple: parse whole JSON array
        const data = await response.json(); // data is an array

        setReports(data);

        // compute stats with uppercase normalization
        const statsCalc = data.reduce(
          (acc, r) => {
            const st = (r.status || "").toUpperCase();
            acc.total += 1;
            if (st === "PENDING") acc.pending += 1;
            else if (st === "APPROVED") acc.approved += 1;
            else if (st === "DENIED") acc.denied += 1;
            return acc;
          },
          { total: 0, pending: 0, approved: 0, denied: 0 }
        );

        setStats(statsCalc);
      } catch (err) {
        if (err.name !== "AbortError") {
          alert("Error loading reports: " + err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReports();

    return () => controller.abort();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-gray-300 mb-4">
            Loading reports stream...
          </div>
          <div className="text-sm text-gray-500">
            Received: {reports.length} records
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            Live Access Requests Report (Streaming)
          </h1>
          <button
            onClick={() => navigate("/projects")}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl transition"
          >
            ← Back
          </button>
        </div>

        {/* Live Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 p-5 rounded-xl text-center">
            <div className="text-3xl font-bold text-blue-400">
              {stats.total}
            </div>
            <div className="text-sm text-gray-400">Total</div>
          </div>
          <div className="bg-gray-800 p-5 rounded-xl text-center">
            <div className="text-3xl font-bold text-yellow-400">
              {stats.pending}
            </div>
            <div className="text-sm text-gray-400">Pending</div>
          </div>
          <div className="bg-gray-800 p-5 rounded-xl text-center">
            <div className="text-3xl font-bold text-green-400">
              {stats.approved}
            </div>
            <div className="text-sm text-gray-400">Approved</div>
          </div>
          <div className="bg-gray-800 p-5 rounded-xl text-center">
            <div className="text-3xl font-bold text-red-400">
              {stats.denied}
            </div>
            <div className="text-sm text-gray-400">Denied</div>
          </div>
        </div>

        {/* Live Table */}
        <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 bg-gray-800 border-b border-gray-700">
            <span className="text-sm text-gray-400">
              Total records loaded: {reports.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="text-left px-6 py-4">Client</th>
                  <th className="text-left px-6 py-4">Email</th>
                  <th className="text-left px-6 py-4">Project</th>
                  <th className="text-left px-6 py-4">Status</th>
                  <th className="text-left px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {reports.map((r) => {
                  const statusUpper = (r.status || "").toUpperCase();
                  return (
                    <tr key={r._id} className="hover:bg-gray-800 transition">
                      <td className="px-6 py-4 font-medium">
                        {r.client?.username}
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {r.project?.email}
                      </td>
                      <td className="px-6 py-4">{r.project?.name}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${statusUpper === "APPROVED"
                              ? "bg-green-900 text-green-300"
                              : statusUpper === "DENIED"
                                ? "bg-red-900 text-red-300"
                                : "bg-yellow-900 text-yellow-300"
                            }`}
                        >
                          {statusUpper}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {r.createdAt
                          ? new Date(r.createdAt).toLocaleString()
                          : ""}
                      </td>
                    </tr>
                  );
                })}
                {reports.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-6 text-center text-gray-500"
                    >
                      No reports available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
