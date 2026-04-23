interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'accent';
  size?: 'sm' | 'md';
}

const variantStyles: Record<string, { bg: string; color: string }> = {
  default: { bg: 'var(--accent-dim)', color: 'var(--accent)' },
  accent: { bg: 'var(--accent-dim)', color: 'var(--accent)' },
  success: { bg: 'rgba(34,197,94,0.12)', color: 'var(--success)' },
  warning: { bg: 'rgba(245,158,11,0.12)', color: 'var(--warning)' },
  danger: { bg: 'rgba(239,68,68,0.12)', color: 'var(--danger)' },
};

export function Badge({ label, variant = 'default', size = 'sm' }: BadgeProps) {
  const style = variantStyles[variant];
  return (
    <span
      style={{
        background: style.bg,
        color: style.color,
        padding: size === 'sm' ? '2px 8px' : '4px 12px',
        borderRadius: 'var(--radius-sm)',
        fontSize: size === 'sm' ? '11px' : '12px',
        fontWeight: 500,
        lineHeight: '1.4',
        whiteSpace: 'nowrap',
        display: 'inline-block',
      }}
    >
      {label}
    </span>
  );
}
