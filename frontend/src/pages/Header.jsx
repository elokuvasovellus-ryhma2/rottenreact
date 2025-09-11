import React from 'react';
import './header.css';

function Header({ scroll }) {
  return (
    <header className={scroll > 100 ? 'scrolled' : ''}>
      <h2 style={{ color: 'white', padding: '10px' }}>Cinema Header</h2>
    </header>
  );
}

export default Header;
