import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { Job } from '../../types/job';

interface JobCardProps {
  job: Job;
  variant?: 'compact' | 'full';
}

const TYPE_LABELS: Record<Job['type'], string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  contract: 'Contract',
  internship: 'Intern',
};

const LEVEL_LABELS: Record<Job['level'], string> = {
  junior: 'Junior',
  mid: 'Mid',
  senior: 'Senior',
  staff: 'Staff',
  any: 'Any level',
};

export function JobCard({ job, variant = 'compact' }: JobCardProps) {
  const topics = job.topics.slice(0, variant === 'compact' ? 3 : 6);

  return (
    <a
      href={job.url}
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
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {job.company.charAt(0)}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{
                fontSize: '15px',
                fontWeight: 600,
                margin: '0 0 2px',
                color: 'var(--text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {job.title}
            </h3>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '8px' }}>
              {job.company} · {job.location}
            </div>
            <div
              style={{
                display: 'flex',
                gap: '6px',
                alignItems: 'center',
                flexWrap: 'wrap',
                marginBottom: variant === 'full' ? '10px' : 0,
              }}
            >
              <Badge label={TYPE_LABELS[job.type]} />
              <Badge label={LEVEL_LABELS[job.level]} />
              {job.salary && <Badge label={job.salary} variant="success" />}
              {topics.map((topic) => (
                <Badge key={topic} label={topic} />
              ))}
            </div>
            {variant === 'full' && (
              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '13px',
                  margin: '8px 0 0',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {job.description}
              </p>
            )}
          </div>
        </div>
      </Card>
    </a>
  );
}
