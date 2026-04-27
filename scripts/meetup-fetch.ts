import type { ICalEvent } from './ical';

const GQL_ENDPOINT = 'https://api.meetup.com/gql';

const UPCOMING_EVENTS_QUERY = `
  query GroupUpcomingEvents($urlname: String!, $first: Int!) {
    groupByUrlname(urlname: $urlname) {
      name
      upcomingEvents(input: { first: $first }) {
        edges {
          node {
            id
            title
            eventUrl
            description
            dateTime
            endTime
            venue {
              name
              address
              city
              state
            }
            onlineVenue {
              url
            }
          }
        }
      }
    }
  }
`;

interface GqlVenue {
  name?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
}

interface GqlOnlineVenue {
  url?: string | null;
}

export interface MeetupGqlEvent {
  id: string;
  title: string;
  eventUrl: string;
  description?: string | null;
  dateTime: string;
  endTime?: string | null;
  venue?: GqlVenue | null;
  onlineVenue?: GqlOnlineVenue | null;
}

interface GqlResponse {
  data?: {
    groupByUrlname?: {
      name?: string;
      upcomingEvents?: {
        edges?: Array<{ node: MeetupGqlEvent }>;
      };
    } | null;
  };
  errors?: Array<{ message: string }>;
}

export async function fetchUpcomingEvents(
  urlname: string,
  accessToken: string,
  first = 20,
): Promise<MeetupGqlEvent[]> {
  const res = await fetch(GQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      query: UPCOMING_EVENTS_QUERY,
      variables: { urlname, first },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Meetup GQL ${urlname}: HTTP ${res.status} — ${text}`);
  }

  const json = (await res.json()) as GqlResponse;
  if (json.errors?.length) {
    throw new Error(`Meetup GQL ${urlname}: ${json.errors.map((e) => e.message).join('; ')}`);
  }

  const edges = json.data?.groupByUrlname?.upcomingEvents?.edges ?? [];
  return edges.map((e) => e.node).filter(Boolean);
}

export function formatVenue(venue: GqlVenue | null | undefined): string | undefined {
  if (!venue) return undefined;
  const parts = [venue.name, venue.city, venue.state].filter((p): p is string => !!p && p.length > 0);
  return parts.length > 0 ? parts.join(', ') : undefined;
}

export function gqlToICalEvent(event: MeetupGqlEvent): ICalEvent {
  const isOnline = !!event.onlineVenue?.url;
  const location = isOnline
    ? event.onlineVenue?.url ?? 'Online'
    : formatVenue(event.venue);

  return {
    uid: event.id,
    summary: event.title,
    description: event.description ?? undefined,
    location,
    url: event.eventUrl,
    start: event.dateTime,
    end: event.endTime ?? undefined,
  };
}
