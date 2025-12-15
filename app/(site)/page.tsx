import { Metadata } from "next";
import Hero from "@/components/Hero";
import Feature from "@/components/Features";
import About from "@/components/About";
import FeaturesTab from "@/components/FeaturesTab";
import FunFact from "@/components/FunFact";
import Integration from "@/components/Integration";
import CTA from "@/components/CTA";
import FAQ from "@/components/FAQ";
import Pricing from "@/components/Pricing";
import Testimonial from "@/components/Testimonial";
import TrustSection from "@/components/Brands";
import {Inter} from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Cognify | AI-Powered Learning Platform",
    description: "Transform documents into personalized learning experiences",
    icons: {
        icon: [
            { url: "/icon.svg", type: "image/svg+xml" },
        ],
        apple: [
            { url: "/apple-icon.svg", type: "image/svg+xml" },
        ],
    },
};


export default function Home() {
  return (
    <main>
      <Hero />
      <TrustSection/>
      <Feature />
      <About />
      <FeaturesTab />
      <FunFact />
      <Integration />
      <CTA />
      <FAQ />
      <Testimonial />
      <Pricing />
    </main>
  );
}
