
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../shared/contexts/useUser";
import "./auth.css";

export default function SignIn() {
  const { signIn } = useUser();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await signIn(email, password);
      navigate("/"); 
    } catch (err) {
      setError("Login failed. Check your email and password.");
    }
  };

  return (
    <div className="auth-page">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit">Login</button>
      </form>

      <p>
        No account? <Link to="/signup">Sign up here</Link>
      </p>
    </div>
  );
}