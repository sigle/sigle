export interface SiteSettings {
  username: string;
  name: string;
  description: string;
  avatar: string;
  banner: string;
  links?: { href: string; label: string }[];
}
