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
import FontLoader from "@/components/FontLoader";
import { getProjectsByCategory, getAllSiteContent } from "@/lib/supabase";

export default async function Home() {
  const [ongoingProjects, keyProjects, siteContent] = await Promise.all([
    getProjectsByCategory("ongoing"),
    getProjectsByCategory("key"),
    getAllSiteContent(),
  ]);

  return (
    <main>
      <FontLoader />
      <Navbar />
      <Hero />
      <AboutIntro content={siteContent.filter(c => c.section === "intro")} />
      <ServicesCards />
      <OngoingProjects projects={ongoingProjects} />
      <Achievements stats={siteContent.filter(c => c.section === "stats")} />
      <FeaturedProjects projects={keyProjects} />
      <TransformationShowcase items={siteContent.filter(c => c.section === "transformation")} />
      <VideoShowcase videos={siteContent.filter(c => c.section === "video")} />
      <Testimonials testimonials={siteContent.filter(c => c.section === "testimonial")} />
      <Contact />
      <Footer />
    </main>
  );
}
