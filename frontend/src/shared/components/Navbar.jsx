import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

export function Navbar() {
  const location = useLocation();
  const { isLoggedIn, signOut } = useAuth();

  const navItems = [
    { path: '/', label: 'HOME' },
    { path: '/reviews', label: 'REVIEWS' },
    ...(isLoggedIn ? [
      { path: '/favorites', label: 'FAVORITES' },
      { path: '/groups', label: 'GROUPS' },
      { path: '/mygroups', label: 'MY_GROUPS' }
    ] : []),
    { path: '/showtimes', label: 'SHOWTIMES' }
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/">RottenReact</Link>
        </div>
        <ul className="navbar-nav">
          {navItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link 
                to={item.path} 
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="navbar-auth">
             {isLoggedIn ? (
               <>
                 <Link to="/profile" className="profile-btn">
                   <span>⚙</span>
                 </Link>
                 <button onClick={signOut} className="auth-toggle-btn">
                   LOGOUT
                 </button>
               </>
             ) : (
            <Link to="/signin" className="auth-toggle-btn">
            LOGIN
         </Link>
           )}
        </div>
      </div>
    </nav>
  );
}