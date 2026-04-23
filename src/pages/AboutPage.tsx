import { Card } from '../components/ui/Card';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function AboutPage() {
  useDocumentTitle('About');
  return (
    <div style={{ maxWidth: '720px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 12px' }}>About SLC Tech Pulse</h1>
      <p
        style={{
          color: 'var(--text-secondary)',
          fontSize: '15px',
          lineHeight: 1.6,
          marginBottom: '32px',
        }}
      >
        A community resource for the Salt Lake City and Silicon Slopes tech scene. Events, job
        openings, and company directory — in one minimal, fast feed.
      </p>

      <Section title="What you'll find here">
        <p>
          Upcoming meetups, conferences, and hackathons across SLC, Provo, and the Lehi corridor.
          Open engineering roles at Utah tech employers from startups to enterprise. A running
          directory of the companies shaping Silicon Slopes.
        </p>
      </Section>

      <Section title="How data is sourced">
        <p>
          Events come from Meetup, Eventbrite, lu.ma, and direct company postings. Jobs are curated
          from linkedin, company careers pages, and community tips. Companies are hand-maintained.
        </p>
        <p>
          Saw a broken listing or something missing? Drop us a line at{' '}
          <a href="mailto:hello@slctechpulse.com" style={{ color: 'var(--accent)' }}>
            hello@slctechpulse.com
          </a>
          .
        </p>
      </Section>

      <Section title="Submit an event or job">
        <p>
          Organizing a meetup or hiring at a Utah company? Send the details — event page, title,
          date, location, short description (or job posting URL) — to{' '}
          <a href="mailto:hello@slctechpulse.com?subject=Submission" style={{ color: 'var(--accent)' }}>
            hello@slctechpulse.com
          </a>
          . We'll add it within 24 hours.
        </p>
      </Section>

      <Section title="Built with">
        <Card padding="16px">
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
            React 19, TypeScript, Vite, Tailwind v4, React Router v7, Zustand, date-fns, and
            Firebase (Firestore + Hosting). Source available on request.
          </p>
        </Card>
      </Section>
    </div>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <section style={{ marginBottom: '28px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 10px' }}>{title}</h2>
      <div
        style={{
          color: 'var(--text-primary)',
          fontSize: '14px',
          lineHeight: 1.6,
        }}
      >
        {children}
      </div>
    </section>
  );
}
