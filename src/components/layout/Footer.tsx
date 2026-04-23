export function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        padding: '24px',
        marginTop: '64px',
        color: 'var(--text-muted)',
        fontSize: '12px',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        SLC Tech Pulse · A community resource for Utah's tech scene ·{' '}
        <span style={{ color: 'var(--text-muted)' }}>
          Curated seed data — links open organizer and careers pages
        </span>
      </div>
    </footer>
  );
}
