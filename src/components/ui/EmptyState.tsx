interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon = '🔍', title, subtitle }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 24px',
        textAlign: 'center',
      }}
    >
      <span style={{ fontSize: '36px', marginBottom: '16px' }}>{icon}</span>
      <h3
        style={{
          color: 'var(--text-primary)',
          fontSize: '16px',
          fontWeight: 600,
          margin: '0 0 8px',
        }}
      >
        {title}
      </h3>
      {subtitle && (
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '13px',
            margin: 0,
            maxWidth: '320px',
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
