import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/authService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login({ email, password });
      setSuccess("Je kyçur me sukses! Duke të ridrejtuar...");

      const dest =
        data.user.role === "company" ? "/company/dashboard" :
        data.user.role === "admin" ? "/admin/dashboard" : "/jobs";

      // Lëmë mesazhin të duket shkurt para se të ridrejtojmë
      setTimeout(() => navigate(dest), 800);
    } catch (err) {
      setError(err.response?.data?.error || "Diçka shkoi keq. Provo përsëri.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-semibold mb-6">Kyçu</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Fjalëkalimi</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Duke u kyçur..." : "Kyçu"}
        </button>
      </form>

      <p className="text-sm text-center text-gray-600 mt-4">
        S'ke llogari?{" "}
        <Link to="/register" className="text-indigo-600 font-medium">
          Regjistrohu këtu
        </Link>
      </p>
    </div>
  );
}
