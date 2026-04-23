import { Link } from 'react-router-dom';

interface SectionHeaderProps {
  title: string;
  viewAllTo: string;
}

export function SectionHeader({ title, viewAllTo }: SectionHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: '16px',
      }}
    >
      <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>{title}</h2>
      <Link
        to={viewAllTo}
        style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 500 }}
      >
        View all →
      </Link>
    </div>
  );
}
