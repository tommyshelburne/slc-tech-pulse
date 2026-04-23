import { Card } from '../ui/Card';

interface Stat {
  label: string;
  value: number;
}

interface StatsStripProps {
  stats: Stat[];
}

export function StatsStrip({ stats }: StatsStripProps) {
  return (
    <div
      role="list"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))`,
        gap: '12px',
        marginBottom: '40px',
      }}
    >
      {stats.map((stat) => (
        <div role="listitem" key={stat.label}>
          <Card padding="20px">
            <div
              style={{
                color: 'var(--accent)',
                fontSize: '28px',
                fontWeight: 700,
                lineHeight: 1,
                marginBottom: '6px',
              }}
            >
              {stat.value}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 500 }}>
              {stat.label}
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
}
