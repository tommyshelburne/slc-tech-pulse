export interface EventSource {
  urlname: string;       // Meetup group urlname (path slug on meetup.com)
  name: string;          // display name (organizer)
  defaultLocation: string;
  fallbackUrl: string;   // group landing page for events without an explicit URL
}

// Verified SLC/Lehi tech-scene Meetup groups. Slugs confirmed April 2026.
export const EVENT_SOURCES: EventSource[] = [
  {
    urlname: 'ssdevch',
    name: 'Silicon Slopes Developer Chapter',
    defaultLocation: 'Lehi, UT',
    fallbackUrl: 'https://www.meetup.com/ssdevch/events/',
  },
  {
    urlname: 'utahjs',
    name: 'UtahJS',
    defaultLocation: 'Salt Lake City, UT',
    fallbackUrl: 'https://www.meetup.com/utahjs/events/',
  },
  {
    urlname: 'pythonatthepoint',
    name: 'Python at the Point',
    defaultLocation: 'Lehi, UT',
    fallbackUrl: 'https://www.meetup.com/pythonatthepoint/events/',
  },
  {
    urlname: 'reactjs-utah',
    name: 'ReactJS Utah',
    defaultLocation: 'Salt Lake City, UT',
    fallbackUrl: 'https://www.meetup.com/reactjs-utah/events/',
  },
  {
    urlname: 'women-tech-utah',
    name: 'Women&TECH Utah',
    defaultLocation: 'Salt Lake City, UT',
    fallbackUrl: 'https://www.meetup.com/women-tech-utah/events/',
  },
  {
    urlname: 'machine-learning-utah',
    name: 'MLOps and AI Utah',
    defaultLocation: 'Salt Lake City, UT',
    fallbackUrl: 'https://www.meetup.com/machine-learning-utah/events/',
  },
];
