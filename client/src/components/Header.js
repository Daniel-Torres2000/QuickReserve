import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="logo">QuickReserve</div>
      
      {/* Botón de hamburguesa para móvil */}
      <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        <div className={`hamburger ${menuOpen ? 'active' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      
      {/* Nav links que se mostrarán/ocultarán según el estado */}
      <nav className={`nav-links ${menuOpen ? 'active' : ''}`}>
        <Link to="/" onClick={() => setMenuOpen(false)}>Inicio</Link>
        <Link to="/login" onClick={() => setMenuOpen(false)}>Ingresar</Link>
        <Link to="/register" onClick={() => setMenuOpen(false)}>Registrarse</Link>
      </nav>
    </header>
  );
}

export default Header;