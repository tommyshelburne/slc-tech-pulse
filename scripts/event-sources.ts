export interface EventSource {
  urlname: string;       // Meetup group urlname (path slug on meetup.com)
  name: string;          // display name (organizer)
  defaultLocation: string;
  fallbackUrl: string;   // group landing page for events without an explicit URL
}

// Starter set of SLC/Lehi tech-scene Meetup groups. Eyeball/prune before
// the first live run — group urlnames rot over time as organizers rename.
export const EVENT_SOURCES: EventSource[] = [
  {
    urlname: 'silicon-slopes',
    name: 'Silicon Slopes',
    defaultLocation: 'Lehi, UT',
    fallbackUrl: 'https://www.meetup.com/silicon-slopes/events/',
  },
  {
    urlname: 'utah-javascript-meetup',
    name: 'Utah JavaScript',
    defaultLocation: 'Salt Lake City, UT',
    fallbackUrl: 'https://www.meetup.com/utah-javascript-meetup/events/',
  },
  {
    urlname: 'utah-python-user-group',
    name: 'Utah Python User Group',
    defaultLocation: 'Salt Lake City, UT',
    fallbackUrl: 'https://www.meetup.com/utah-python-user-group/events/',
  },
  {
    urlname: 'slcreact',
    name: 'SLC React',
    defaultLocation: 'Salt Lake City, UT',
    fallbackUrl: 'https://www.meetup.com/slcreact/events/',
  },
  {
    urlname: 'women-in-tech-utah',
    name: 'Women in Tech Utah',
    defaultLocation: 'Salt Lake City, UT',
    fallbackUrl: 'https://www.meetup.com/women-in-tech-utah/events/',
  },
  {
    urlname: 'utah-ai-ml-meetup',
    name: 'Utah AI/ML',
    defaultLocation: 'Lehi, UT',
    fallbackUrl: 'https://www.meetup.com/utah-ai-ml-meetup/events/',
  },
];
