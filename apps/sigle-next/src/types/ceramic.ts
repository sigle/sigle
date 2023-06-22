export interface CeramicPost {
  id: string;
  did: string;
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaImage?: string;
  canonicalUrl?: string;
  createdAt: string;
}

export interface CeramicProfile {
  id: string;
  did: string;
  displayName?: string;
  description?: string;
  websiteUrl?: string;
  twitterUsername?: string;
  createdAt: string;
}
