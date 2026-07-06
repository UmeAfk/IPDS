import Hero from "@/components/Hero";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import FeaturedProjects from "@/components/FeaturedProjects";
import Achievements from "@/components/Achievements";
import OngoingProjects from "@/components/OngoingProjects";
import TransformationShowcase from "@/components/TransformationShowcase";
import AboutIntro from "@/components/AboutIntro";
import ServicesCards from "@/components/ServicesCards";
import VideoShowcase from "@/components/VideoShowcase";
import Testimonials from "@/components/Testimonials";
import { getProjectsByCategory, getAllSiteContent } from "@/lib/supabase";
import FontApplier from "@/components/FontApplier";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [ongoingProjects, keyProjects, siteContent] = await Promise.all([
    getProjectsByCategory("ongoing"),
    getProjectsByCategory("key"),
    getAllSiteContent(),
  ]);

  const fontSettings = siteContent.filter(c => c.section === "settings");
  const heroImage = fontSettings.find(c => c.title === "hero_image")?.body || "";
  const contactData = siteContent.filter(c => c.section === "contact");
  const cEmail = contactData.find(c => c.title === "email")?.body || "";
  const cPhone = contactData.find(c => c.title === "phone")?.body || "";
  const cAddress = contactData.find(c => c.title === "address")?.body || "";
  const pipelineText = fontSettings.find(c => c.title === "projects_pipeline_text")?.body || "";

  return (
    <main>
      <FontApplier settings={fontSettings} />
      <Navbar />
      <Hero imageUrl={heroImage} />
      <AboutIntro content={siteContent.filter(c => c.section === "intro")} />
      <ServicesCards />
      <OngoingProjects projects={ongoingProjects} pipelineText={pipelineText} />
      <Achievements stats={siteContent.filter(c => c.section === "stats")} />
      <FeaturedProjects projects={keyProjects} />
      <TransformationShowcase items={siteContent.filter(c => c.section === "transformation")} />
      <VideoShowcase videos={siteContent.filter(c => c.section === "video")} />
      <Testimonials testimonials={siteContent.filter(c => c.section === "testimonial")} />
      <Contact email={cEmail} phone={cPhone} address={cAddress} />
      <Footer />
    </main>
  );
}
