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
        openings, and a company directory in one minimal, fast feed.
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
          <strong style={{ color: 'var(--text-primary)' }}>Events</strong> are pulled from lu.ma's
          Salt Lake City discovery feed and filtered to Utah tech (AI, startups, healthtech,
          design, and adjacent communities). Each listing links back to the lu.ma event page so
          RSVPs and details stay with the organizer. Meetup is on the roadmap once OAuth access is
          provisioned.
        </p>
        <p>
          <strong style={{ color: 'var(--text-primary)' }}>Jobs</strong> are pulled directly from
          the public ATS feeds (Greenhouse, Lever, Ashby) of the Utah employers in our company
          directory. Roles are filtered to Utah on-site and US-remote tech positions. Each listing
          links back to the company's own application page, so applications go through them, not us.
        </p>
        <p>
          <strong style={{ color: 'var(--text-primary)' }}>Companies</strong> are a hand-maintained
          directory of Utah-headquartered or Utah-major-presence tech employers. The "Hiring" flag
          is updated when the directory is refreshed; for current openings, follow the careers link
          to the company's site.
        </p>
        <p>
          Saw a broken listing or something missing? Drop us a line at{' '}
          <a href="mailto:hello@slctechpulse.com" style={{ color: 'var(--accent)' }}>
            hello@slctechpulse.com
          </a>
          .
        </p>
      </Section>

      <Section title="Notes on freshness">
        <ul style={{ paddingLeft: '18px', marginTop: '8px', lineHeight: 1.7 }}>
          <li>
            Aggregation runs on a schedule, not in real-time. Expect listings to be current within
            a day or so of being posted upstream.
          </li>
          <li>
            Events posted only on Meetup, Eventbrite, or LinkedIn won't appear unless they're
            cross-listed on lu.ma or submitted by the organizer. Many SLC tech communities post to
            both, so coverage is reasonable but not exhaustive.
          </li>
          <li>
            If a company isn't on a supported ATS (Greenhouse, Lever, Ashby), their roles won't
            appear here automatically. Tell us and we'll see what we can do.
          </li>
        </ul>
      </Section>

      <Section title="Submit an event or job">
        <p>
          Organizing a meetup or hiring at a Utah company? Send the details (event page, title,
          date, location, short description, or job posting URL) to{' '}
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
