import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <Link to={isAuthenticated ? '/dashboard' : '/login'} className="navbar-logo">
        <span className="globe-icon">🌍</span>
        GlobeTrotter
      </Link>

      {isAuthenticated && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
          <Link to="/dashboard" className="btn btn-ghost btn-sm" style={{ display: 'none' }}>
            Dashboard
          </Link>

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-teal-500), var(--color-teal-600))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem', fontWeight: 700, color: 'white', flexShrink: 0
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              {user?.name?.split(' ')[0]}
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ transform: menuOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {menuOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-md)',
              padding: '8px',
              minWidth: '180px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              zIndex: 200,
              animation: 'slideDown 0.2s ease',
            }}>
              <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border)', marginBottom: '6px' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>{user?.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{user?.email}</div>
              </div>
              <Link
                to="/dashboard"
                className="btn btn-ghost btn-sm btn-full"
                style={{ justifyContent: 'flex-start', marginBottom: '4px' }}
                onClick={() => setMenuOpen(false)}
              >
                🗺️ Dashboard
              </Link>
              <Link
                to="/profile"
                className="btn btn-ghost btn-sm btn-full"
                style={{ justifyContent: 'flex-start', marginBottom: '4px' }}
                onClick={() => setMenuOpen(false)}
              >
                👤 Profile
              </Link>
              <button
                className="btn btn-danger btn-sm btn-full"
                style={{ justifyContent: 'flex-start' }}
                onClick={handleLogout}
              >
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
