import {
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { Link, type LinkProps } from 'react-router-dom';

type Variant = 'primary' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface CommonProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined; to?: undefined };

type ButtonAsAnchor = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    href: string;
    to?: undefined;
  };

type ButtonAsRouterLink = CommonProps &
  Omit<LinkProps, 'to' | 'children'> & { to: LinkProps['to']; href?: undefined };

export type ButtonProps = ButtonAsButton | ButtonAsAnchor | ButtonAsRouterLink;

const base: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  fontWeight: 500,
  borderRadius: 'var(--radius-md)',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  border: 'none',
  lineHeight: '1',
  textDecoration: 'none',
};

const sizes: Record<Size, React.CSSProperties> = {
  sm: { padding: '6px 12px', fontSize: '12px' },
  md: { padding: '8px 16px', fontSize: '13px' },
  lg: { padding: '10px 20px', fontSize: '14px' },
};

const variants: Record<Variant, React.CSSProperties> = {
  primary: {
    background: 'var(--accent-solid)',
    color: '#fff',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
  },
  outline: {
    background: 'transparent',
    color: 'var(--accent)',
    border: '1px solid var(--border-mid)',
  },
};

export function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', children, style, ...rest } = props;
  const composed = { ...base, ...sizes[size], ...variants[variant], ...style };

  if ('to' in rest && rest.to !== undefined) {
    const { to, ...linkRest } = rest as ButtonAsRouterLink;
    return (
      <Link to={to} style={composed} {...linkRest}>
        {children}
      </Link>
    );
  }

  if ('href' in rest && rest.href !== undefined) {
    const { href, ...anchorRest } = rest as ButtonAsAnchor;
    return (
      <a href={href} style={composed} {...anchorRest}>
        {children}
      </a>
    );
  }

  return (
    <button style={composed} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
