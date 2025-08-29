import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../index.css";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // basic client-side validation
    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !form.password
    ) {
      setError("All fields are required");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    axios
      .post(
        "http://localhost:3000/api/auth/register",
        {
          email: form.email,
          fullName: {
            firstName: form.firstName,
            lastName: form.lastName,
          },
          password: form.password,
        },
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        console.log(res);
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
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            type="text"
            placeholder="First Name"
            required
          />
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            type="text"
            placeholder="Last Name"
            required
          />
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
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
