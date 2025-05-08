import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import { QuickInfo } from "@/components/home/quick-info";
import { NoticeBoard } from "@/components/home/notice-board";
import { GalleryPreview } from "@/components/home/gallery-preview";
import { Achievements } from "@/components/home/achievements";
import { AboutPreview } from "@/components/home/about-preview";
import { AdmissionCTA } from "@/components/home/admission-cta";
import { Testimonials } from "@/components/home/testimonials";
import { ContactPreview } from "@/components/home/contact-preview";
import { Helmet } from "react-helmet";

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Trinity International School - Excellence in Education</title>
        <meta 
          name="description" 
          content="Trinity International School provides excellence in education, nurturing minds, building character, and inspiring excellence for a bright future." 
        />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow">
          <HeroSection />
          <QuickInfo />
          <NoticeBoard />
          <GalleryPreview />
          <Achievements />
          <AboutPreview />
          <AdmissionCTA />
          <Testimonials />
          <ContactPreview />
        </main>
        
        <Footer />
      </div>
    </>
  );
}
