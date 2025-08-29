import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../index.css";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Email and password are required");
      return;
    }
    setLoading(true);

    axios
      .post(
        "http://localhost:3000/api/auth/login",
        {
          email: form.email,
          password: form.password,
        },
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        navigate("/");
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(setLoading(false));
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            type="email"
            placeholder="Email"
            required
          />
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            type="password"
            placeholder="Password"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
        <p>
          Don’t have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
