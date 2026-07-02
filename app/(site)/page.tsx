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

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <AboutIntro />
      <ServicesCards />
      <OngoingProjects />
      <Achievements />
      <FeaturedProjects />
      <TransformationShowcase />
      <VideoShowcase />
      <Testimonials />
      <Contact />
      <Footer />
    </main>
  );
}
