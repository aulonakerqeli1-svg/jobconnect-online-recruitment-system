import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import JobsList from "./pages/JobsList";
import JobDetails from "./pages/JobDetails";
import PostJob from "./pages/PostJob";
import CompanyDashboard from "./pages/CompanyDashboard";
import CompanyProfile from "./pages/CompanyProfile";
import MyApplications from "./pages/MyApplications";
import CandidateProfile from "./pages/CandidateProfile";
import AdminDashboard from "./pages/AdminDashboard";
import { getCurrentUser, logout } from "./services/authService";

function Navbar() {
  const user = getCurrentUser();

  // Navbar shfaqet vetëm nëse je i kyçur (Login/Register s'kanë navbar)
  if (!user) return null;

  const homeLink =
    user.role === "company" ? "/company/dashboard" :
    user.role === "admin" ? "/admin/dashboard" : "/jobs";

  return (
    <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <Link to={homeLink} className="font-bold text-lg">JobConnect</Link>
      <div className="flex gap-4 items-center">
        {user.role === "company" && (
          <>
            <Link to="/company/dashboard" className="text-sm">Paneli Im</Link>
            <Link to="/company/profile" className="text-sm">Profili i Kompanisë</Link>
          </>
        )}
        {user.role === "candidate" && (
          <>
            <Link to="/jobs" className="text-sm">Shpalljet</Link>
            <Link to="/my-applications" className="text-sm">Aplikimet e Mia</Link>
            <Link to="/profile" className="text-sm">Profili Im</Link>
          </>
        )}
        {user.role === "admin" && (
          <Link to="/admin/dashboard" className="text-sm">Paneli i Admin-it</Link>
        )}
        <span className="text-sm text-gray-600">{user.full_name} ({user.role})</span>
        <button
          onClick={async () => { await logout(); window.location.href = "/login"; }}
          className="text-sm text-red-600"
        >
          Dilni
        </button>
      </div>
    </nav>
  );
}

function PrivateRoute({ children, role }) {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
}

// Cakton faqen fillestare sipas gjendjes së kyçjes/rolit
function HomeRedirect() {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" />;
  if (user.role === "company") return <Navigate to="/company/dashboard" />;
  if (user.role === "admin") return <Navigate to="/admin/dashboard" />;
  return <Navigate to="/jobs" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/jobs" element={<PrivateRoute role="candidate"><JobsList /></PrivateRoute>} />
        <Route path="/jobs/:id" element={<PrivateRoute role="candidate"><JobDetails /></PrivateRoute>} />
        <Route path="/my-applications" element={<PrivateRoute role="candidate"><MyApplications /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute role="candidate"><CandidateProfile /></PrivateRoute>} />

        <Route path="/company/dashboard" element={<PrivateRoute role="company"><CompanyDashboard /></PrivateRoute>} />
        <Route path="/company/post-job" element={<PrivateRoute role="company"><PostJob /></PrivateRoute>} />
        <Route path="/company/profile" element={<PrivateRoute role="company"><CompanyProfile /></PrivateRoute>} />

        <Route path="/admin/dashboard" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
