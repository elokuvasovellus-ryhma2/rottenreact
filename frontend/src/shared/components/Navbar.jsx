
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Navbar.css";
import logo from "../../assets/logo.png";

export function Navbar() {
  const location = useLocation();
  const { isLoggedIn, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const navItems = [
    { path: "/", label: "HOME" },
    { path: "/reviews", label: "REVIEWS" },
    ...(isLoggedIn
      ? [
          { path: "/favorites", label: "FAVORITES" },
          { path: "/groups", label: "GROUPS" },
          { path: "/mygroups", label: "MY_GROUPS" },
        ]
      : []),
    { path: "/showtimes", label: "SHOWTIMES" },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="logo-img">
          <Link to="/">
          <img src={logo} alt="RottenReact logo" className="logo-img" />
          </Link>
        </div>

        {/* Desktop-linkit */}
        <ul className="nav-links">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={location.pathname === item.path ? "active" : ""}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop auth */}
        <div className="navbar-auth">
          {isLoggedIn ? (
            <>
              <Link to="/profile" className="profile-btn">⚙</Link>
              <button onClick={signOut} className="logout">LOGOUT</button>
            </>
          ) : (
            <Link to="/signin" className="logout">LOGIN</Link>
          )}
        </div>

        {/* Hamburger mobiilille */}
        <button
          className="hamburger"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>

      {/* Drawer mobiilissa */}
      <ul className={`nav-links drawer ${open ? "open" : ""}`}>
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={location.pathname === item.path ? "active" : ""}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          </li>
        ))}

        {/* Auth mobiilissa */}
        <li className="auth-mobile">
          {isLoggedIn ? (
            <>
              <Link
                to="/profile"
                className="profile-btn"
                onClick={() => setOpen(false)}
              >
                ⚙
              </Link>
              <button
                onClick={() => {
                  signOut();
                  setOpen(false);
                }}
                className="logout"
              >
                LOGOUT
              </button>
            </>
          ) : (
            <Link
              to="/signin"
              className="logout"
              onClick={() => setOpen(false)}
            >
              LOGIN
            </Link>
          )}
        </li>
      </ul>

      {/* Overlay */}
      {open && <div className="overlay" onClick={() => setOpen(false)}></div>}
    </nav>
  );
}