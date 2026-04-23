import { NavLink } from 'react-router-dom';
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

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        padding: '12px 24px',
      }}
    >
      <nav
        aria-label="Primary"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          maxWidth: '1200px',
          margin: '0 auto',
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
              <NavLink
                to={link.to}
                style={({ isActive }) => ({
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: 500,
                })}
              >
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
      </nav>
    </header>
  );
}
