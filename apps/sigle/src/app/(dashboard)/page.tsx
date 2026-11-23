import { HomeCommunitySection } from "@/components/Home/Community";
import { HomeFaq } from "@/components/Home/Faq";
import { HomeHero } from "@/components/Home/Hero";
import { HomeHowItWorks } from "@/components/Home/HowItWorks";
import { HomePlans } from "@/components/Home/Plans";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="pb-24">
      <HomeHero />
      <HomeHowItWorks />
      <HomePlans />
      <HomeFaq />
      <HomeCommunitySection />
    </main>
  );
}
