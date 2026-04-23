import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  padding?: string;
  hover?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function Card({ children, padding = '16px', hover = false, style, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding,
        boxShadow: 'var(--shadow-sm)',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        cursor: onClick ? 'pointer' : undefined,
        ...(hover
          ? {
              // hover handled via onMouseEnter/Leave in consuming components
            }
          : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
}
