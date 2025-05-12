import { HomeCommunity } from "@/components/Home/Community";
import { HomeFeatures } from "@/components/Home/Features";
import { HomeHero } from "@/components/Home/Hero";
import { HomeTrendingPosts } from "@/components/Home/TrendingPosts";
import { HomeTrendingUsers } from "@/components/Home/TrendingUsers";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div>
      <HomeHero />
      <HomeFeatures />
      <HomeTrendingPosts />
      <HomeTrendingUsers />
      <HomeCommunity />
    </div>
  );
}
