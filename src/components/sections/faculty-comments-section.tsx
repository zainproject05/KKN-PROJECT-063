"use client";

import * as React from "react";
import { CircularTestimonials } from "../ui/circular-testimonials";
import { GraduationCap } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { SectionHeader } from "../ui/SectionHeader";

export function FacultyCommentsSection() {
  const { t, lecturerComments } = useLanguage();

  return (
    <section id="member-quotes-section" className="relative w-full overflow-hidden py-24 bg-[#04060a]">
      {/* Absolute high contrast premium scenic vector light spheres */}
      <div aria-hidden="true" className="absolute left-1/4 top-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-indigo-500/5 rounded-full blur-[130px] pointer-events-none" />
      <div aria-hidden="true" className="absolute right-1/4 top-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-cyan-500/5 rounded-full blur-[110px] pointer-events-none" />

      {/* Engineering blueprint coordinates grid overlay */}
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(3,7,18,0.85)_100%)] pointer-events-none z-10" />

      <SectionHeader
        badge={t("faculty.badge", "KKN MEMBER QUOTES")}
        title={t("faculty.title", "Voices of PersyarikatanMu-063")}
        subtitle={t("faculty.subtitle", "Inspiring words from the members of PersyarikatanMu-063, reflecting solidarity, responsibility, teamwork, and the shared spirit of community service throughout the KKN journey.")}
        icon={GraduationCap}
        className="mb-14"
      />

      {/* Full-width carousel marquee block with premium edge-fades */}
      <div className="relative w-full z-20 overflow-visible">
        {/* Left premium luxury fade mask */}
        <div className="absolute left-0 top-0 bottom-0 w-24 md:w-64 bg-gradient-to-r from-[#04060a] via-[#04060a]/80 to-transparent z-30 pointer-events-none" />
        
        {/* Right premium luxury fade mask */}
        <div className="absolute right-0 top-0 bottom-0 w-24 md:w-64 bg-gradient-to-l from-[#04060a] via-[#04060a]/80 to-transparent z-30 pointer-events-none" />

        <CircularTestimonials testimonials={lecturerComments} />
      </div>
    </section>
  );
}

export default FacultyCommentsSection;
