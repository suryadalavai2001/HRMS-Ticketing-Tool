import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <i className="fa-solid fa-building"></i>
        <span>ConZura HRMS</span>
      </div>

      <div className="navbar-user">
        <span className="user-greeting">Welcome, {user?.name}</span>
        <button className="btn-logout" onClick={handleLogout}>
          <i className="fa-solid fa-sign-out-alt"></i> Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
