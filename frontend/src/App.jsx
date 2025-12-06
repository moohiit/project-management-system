// frontend/src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import ProjectsPage from "./pages/ProjectsPage.jsx";
import CreateProjectPage from "./pages/CreateProjectPage.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";
import RequestAccessPage from "./pages/RequestAccessPage.jsx";
import UsersPage from "./pages/UsersPage.jsx"; // New page

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'Admin') return <Navigate to="/projects" replace />;

  return children;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/projects"
        element={
          <PrivateRoute>
            <ProjectsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/request-access"
        element={
          <PrivateRoute>
            <RequestAccessPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/createProject"
        element={
          <PrivateRoute adminOnly>
            <CreateProjectPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <PrivateRoute adminOnly>
            <ReportsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/users"
        element={
          <PrivateRoute adminOnly>
            <UsersPage />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}