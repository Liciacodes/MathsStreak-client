import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api";
import { useAuth } from "../AuthContext";

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "email") setEmail(value);
    else if (name === "password") setPassword(value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await registerUser(email, password);
      login(data.token);
      navigate("/quiz");
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Registration failed. That email might already be in use.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#F7F7FF" }}
    >
      <div className="w-full max-w-md px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-5xl font-black tracking-tight"
            style={{ color: "#1A1A2E" }}
          >
            Quiz<span style={{ color: "#FF6B35" }}>Streak</span>
          </h1>
          <p className="mt-2 text-gray-500 text-sm">
            One question a day. Build your streak.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold mb-6" style={{ color: "#1A1A2E" }}>
            Create your account
          </h2>

          {error && (
            <div
              className="mb-4 p-3 rounded-lg text-sm font-medium"
              style={{ backgroundColor: "#FEE2E2", color: "#EF233C" }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:outline-none focus:border-orange-400 transition-colors text-base"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:outline-none focus:border-orange-400 transition-colors text-base"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-white transition-opacity disabled:opacity-50 text-base"
              style={{ backgroundColor: "#FF6B35" }}
            >
              {loading ? "Creating account..." : "Create account →"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold"
              style={{ color: "#FF6B35" }}
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
