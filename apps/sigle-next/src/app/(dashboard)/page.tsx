import { HomeFeatures } from '@/components/Home/Features';
import { HomeHero } from '@/components/Home/Hero';
import { HomeTrendingPosts } from '@/components/Home/TrendingPosts';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="pb-20">
      <HomeHero />
      <HomeFeatures />
      <HomeTrendingPosts />
    </div>
  );
}
