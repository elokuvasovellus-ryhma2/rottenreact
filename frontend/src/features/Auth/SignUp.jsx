import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordChecklist from "react-password-checklist";
import { useAuth } from "../../shared/contexts/AuthContext";

export default function SignUp() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isValidPwd, setIsValidPwd] = useState(false); 
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isValidPwd) return; 

    try {
      await signUp(email, password);
      navigate("/signin");
    } catch (err) {
      setError(err?.response?.data?.error || "Sign up failed. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <label htmlFor="pwd">Password</label>
        <input
          id="pwd"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
        />

        <label htmlFor="pwd2">Confirm Password</label>
        <input
          id="pwd2"
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          required
        />

        <div style={{ marginTop: 8 }}>
          <PasswordChecklist
            rules={["minLength", "capital", "number", "match"]}
            minLength={8}
            value={password}
            valueAgain={confirmPassword} 
            onChange={(ok) => setIsValidPwd(ok)}
            messages={{
              minLength: "Vähintään 8 merkkiä",
              capital: "Vähintään yksi iso kirjain (A–Z)",
              number: "Vähintään yksi numero (0–9)",
              match: "Salasanat täsmäävät",
            }}
          />
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" disabled={!isValidPwd}>
          Register
        </button>
      </form>

      <p>
        Already have an account? <Link to="/signin">Sign in</Link>
      </p>
    </div>
  );
}