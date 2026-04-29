export interface Event {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  date: string;
  endDate?: string;
  location: string;
  venue?: string;
  isOnline: boolean;
  url: string;
  imageUrl?: string;
  topics: string[];
  company?: string;
  isFeatured: boolean;
  source: 'meetup' | 'luma' | 'eventbrite' | 'manual' | 'company';
  createdAt: string;
  updatedAt: string;
}
