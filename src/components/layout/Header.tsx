import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { SearchInput } from '../ui/SearchInput';
import { useUIStore } from '../../store/uiStore';

const NAV_LINKS = [
  { to: '/events', label: 'Events' },
  { to: '/jobs', label: 'Jobs' },
  { to: '/companies', label: 'Companies' },
  { to: '/about', label: 'About' },
];

export function Header() {
  const searchQuery = useUIStore((s) => s.searchQuery);
  const setSearchQuery = useUIStore((s) => s.setSearchQuery);
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);

  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <nav
        aria-label="Primary"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '12px 24px',
        }}
      >
        <NavLink to="/" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ color: 'var(--accent)', fontSize: '14px', fontWeight: 700, lineHeight: 1 }}>
            SLC Tech Pulse
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '11px', lineHeight: 1 }}>
            Silicon Slopes · Updated daily
          </span>
        </NavLink>

        <div className="header-desktop-nav">
          <ul
            style={{
              display: 'flex',
              gap: '20px',
              listStyle: 'none',
              margin: 0,
              padding: 0,
            }}
          >
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} style={navLinkStyle}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div style={{ maxWidth: '240px', width: '100%' }}>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search events, jobs, companies"
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setSearchOpen(false)}
            />
          </div>
        </div>

        <button
          type="button"
          className="header-mobile-toggle"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="header-mobile-panel"
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            background: 'transparent',
            border: '1px solid var(--border-mid)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            padding: '8px 10px',
            cursor: 'pointer',
            fontSize: '16px',
            lineHeight: 1,
          }}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {menuOpen && (
        <div
          id="header-mobile-panel"
          className="header-mobile-panel"
          style={{
            flexDirection: 'column',
            gap: '16px',
            padding: '16px 24px 24px',
            borderTop: '1px solid var(--border)',
            background: 'var(--bg-surface)',
          }}
        >
          <ul
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              listStyle: 'none',
              margin: 0,
              padding: 0,
            }}
          >
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} style={navLinkStyle}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search events, jobs, companies"
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setSearchOpen(false)}
          />
        </div>
      )}
    </header>
  );
}

function navLinkStyle({ isActive }: { isActive: boolean }): React.CSSProperties {
  return {
    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
    fontSize: '13px',
    fontWeight: 500,
  };
}
