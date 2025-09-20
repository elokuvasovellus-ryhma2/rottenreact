import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/useUser";

export const AuthenticationMode = Object.freeze({
  SignIn: "Login",
  SignUp: "SignUp",
});

export default function Authentication({ authenticationMode }) {
  const { user, setUser, signUp, signIn } = useUser();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (authenticationMode === AuthenticationMode.SignUp) {
        await signUp(user.email, user.password);
      } else {
        await signIn(user.email, user.password);
      }
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.error?.message || "An error occurred");
    }
  };

  return (
    <div>
      <h3>{authenticationMode === AuthenticationMode.SignIn ? "Sign in" : "Sign up"}</h3>
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          placeholder="Email"
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
        />
        <label>Password</label>
        <input
          placeholder="Password"
          type="password"
          value={user.password}
          onChange={(e) => setUser({ ...user, password: e.target.value })}
        />
        {error && <div style={{ color: "red" }}>{error}</div>}
        <button type="submit">
          {authenticationMode === AuthenticationMode.SignIn ? "Login" : "Submit"}
        </button>
        <Link to={authenticationMode === AuthenticationMode.SignIn ? "/signup" : "/signin"}>
          {authenticationMode === AuthenticationMode.SignIn ? "No account? Sign up" : "Already signed up? Sign in"}
        </Link>
      </form>
    </div>
  );
}
