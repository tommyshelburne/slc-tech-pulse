import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { Company } from '../../types/company';

interface CompanyCardProps {
  company: Company;
  variant?: 'compact' | 'full';
}

const SIZE_LABELS: Record<Company['size'], string> = {
  startup: 'Startup',
  small: 'Small',
  mid: 'Mid-size',
  large: 'Large',
  enterprise: 'Enterprise',
};

export function CompanyCard({ company, variant = 'compact' }: CompanyCardProps) {
  const topics = company.topics.slice(0, variant === 'compact' ? 3 : 6);

  return (
    <a
      href={company.website}
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}
    >
      <Card padding="16px" style={{ height: '100%' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div
            aria-hidden="true"
            style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-elevated)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {company.name.charAt(0)}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '8px',
              }}
            >
              <h3
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  margin: '0 0 2px',
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {company.name}
              </h3>
              {company.isHiring && <Badge label="Hiring" variant="success" />}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '8px' }}>
              {SIZE_LABELS[company.size]} · {company.location}
            </div>
            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: '13px',
                margin: '0 0 10px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {company.description}
            </p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {topics.map((topic) => (
                <Badge key={topic} label={topic} />
              ))}
            </div>
          </div>
        </div>
      </Card>
    </a>
  );
}
