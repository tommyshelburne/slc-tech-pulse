export type CompanySize = 'startup' | 'small' | 'mid' | 'large' | 'enterprise';

export interface Company {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
  website: string;
  location: string;
  size: CompanySize;
  topics: string[];
  careersUrl?: string;
  linkedinUrl?: string;
  isHiring: boolean;
  isFeatured: boolean;
}
