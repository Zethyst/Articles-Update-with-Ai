export interface Article {
  id: number;
  title: string;
  excerpt: string;
  content?: string; // Full content for updated articles
  author: string;
  date: string;
  published_at?: string; // ISO date string
  category: string;
  readTime: string;
  slug?: string;
  version?: string;
  references?: string[];
}
