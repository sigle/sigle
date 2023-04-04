export interface SiteSettings {
  username: string;
  name: string;
  description: string;
  avatar: string;
  banner: string;
  links?: { href: string; label: string }[];
  cta?: { href: string; label: string };
}

export interface SettingsFile {
  /**
   * Custom name for the blog
   */
  siteName?: string;
  /**
   * Custom description for the blog
   */
  siteDescription?: string;
  /**
   * Custom color used
   */
  siteColor?: string;
  /**
   * Custom logo
   */
  siteLogo?: string;
  /**
   * Website link
   */
  siteUrl?: string;
  /**
   * Twitter handle
   */
  siteTwitterHandle?: string;
}
