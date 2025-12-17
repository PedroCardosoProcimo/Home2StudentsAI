import { Layout } from "@/frontend/components/layout/Layout";
import { HeroSection } from "@/frontend/components/home/HeroSection";
import { FeaturesSection } from "@/frontend/components/home/FeaturesSection";
import { ResidencesPreview } from "@/frontend/components/home/ResidencesPreview";
import { HowItWorksSection } from "@/frontend/components/home/HowItWorksSection";
import { CTASection } from "@/frontend/components/home/CTASection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <FeaturesSection />
      <ResidencesPreview />
      <HowItWorksSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
