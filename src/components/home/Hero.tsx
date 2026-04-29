import { Button } from '../ui/Button';

export function Hero() {
  return (
    <section
      style={{
        padding: '56px 24px',
        borderRadius: 'var(--radius-lg)',
        background:
          'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-base) 100%)',
        border: '1px solid var(--border)',
        marginBottom: '32px',
      }}
    >
      <div style={{ maxWidth: '640px' }}>
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 700,
            margin: '0 0 12px',
            letterSpacing: '-0.02em',
          }}
        >
          What's happening in Silicon Slopes
        </h1>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '15px',
            margin: '0 0 24px',
            lineHeight: 1.5,
          }}
        >
          Events, jobs, and companies from Utah's tech scene. Updated continuously from meetups,
          company pages, and community submissions.
        </p>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <Button to="/events" variant="primary" size="lg">
            Browse Events
          </Button>
          <Button to="/jobs" variant="outline" size="lg">
            View Jobs
          </Button>
        </div>
      </div>
    </section>
  );
}
