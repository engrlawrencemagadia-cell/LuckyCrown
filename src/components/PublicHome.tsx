/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { HardHat, Compass, Sofa, Building, Facebook } from "lucide-react";

interface PublicHomeProps {
  setActiveTab: (tab: string) => void;
  onPortalReveal?: () => void;
}

export default function PublicHome({ setActiveTab, onPortalReveal }: PublicHomeProps) {
  const [crownClicks, setCrownClicks] = useState(0);

  const handleCrownClick = () => {
    const newClicks = crownClicks + 1;
    setCrownClicks(newClicks);
    if (newClicks >= 5) {
      localStorage.setItem("lcct_portal_revealed", "true");
      if (onPortalReveal) {
        onPortalReveal();
      }
    }
  };

  return (
    <div className="bg-slate-50 text-[#333333] animate-fadeIn" id="home-view-wrapper">
      
      {/* Hero Section Page Banner */}
      <section className="relative h-[85vh] flex flex-col justify-center items-center text-center px-4 overflow-hidden" id="home-hero">
        {/* Background Image of sunset skyscraper architectural skyline */}
        <img 
          src="/images/bg.jpg" 
          alt="Lucky Crown Sunset Skyline Background" 
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
          referrerPolicy="no-referrer"
        />
        {/* Dynamic premium dark gradient overlays to integrate colors and elevate title contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/70 to-slate-950/85"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40"></div>
        {/* Subtle grid accent background */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1.5px)] opacity-10 [background-size:24px_24px]"></div>
        
        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          <span className="text-accent font-mono font-bold tracking-[0.25em] text-[10px] uppercase block bg-white/5 py-1.5 px-4 rounded-full w-fit mx-auto border border-white/10">
            ESTABLISHED 2020 • MANILA, PH
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-sans font-extrabold text-white leading-tight tracking-tight">
            Lucky <span className="text-accent cursor-pointer select-none active:scale-95 transition-transform inline-block" onClick={handleCrownClick}>Crown</span> <br className="hidden sm:inline" />Construction & Trading
          </h1>
          <div className="text-accent font-mono font-bold tracking-[0.35em] text-xs sm:text-sm uppercase py-1 select-none drop-shadow">
            DESIGNERS.ARCHITECTS.ENGINEERS.
          </div>
          <p className="text-zinc-200 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-sans font-light">
            Building the Future, One Project at a Time. Quality Construction Materials and Services You Can Trust.
          </p>
          <div className="pt-6">
            <a
              href="https://www.facebook.com/luckycrownconstruction"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-accent hover:bg-accent-light text-white px-10 py-4 font-sans font-bold text-xs tracking-widest uppercase transition-all shadow-lg hover:-translate-y-0.5 cursor-pointer rounded-full"
            >
              <Facebook className="w-4 h-4" />
              Go To Facebook Page
            </a>
          </div>
        </div>
      </section>

      {/* About Us Company Overview Block */}
      <section className="py-20 lg:py-24 bg-white" id="home-about-us">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16 relative">
            <h2 className="text-3xl font-bold text-primary tracking-tight uppercase relative inline-block pb-3">
              About Us
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-accent"></span>
            </h2>
            <p className="text-zinc-500 text-xs tracking-wider uppercase font-sans mt-3">Our Story, Mission, and Values</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-primary">Company Overview</h3>
              <p className="text-zinc-600 text-sm leading-relaxed text-justify">
                We come from a small company that is determined to provide the best design and build satisfaction to our clients.
              </p>
              <p className="text-zinc-600 text-sm leading-relaxed text-justify">
                With the passion and ability we have, every design we make is created wholeheartedly while still considering the needs and opinions of our clients.
              </p>
              <p className="text-zinc-600 text-sm leading-relaxed text-justify">
                Founded in 2020, our company has overcome the ongoing transition period of the Covid-19 pandemic.
              </p>
              <p className="text-zinc-600 text-sm leading-relaxed text-justify">
                Solid cooperation and mutual trust between team members have made this design & build company excel in the construction industry.
              </p>
              <p className="text-zinc-600 text-sm leading-relaxed text-justify">
                We have established strong relationships with our clients, making us the most reliable and trustworthy construction service partner.
              </p>
            </div>
            
            {/* Mission & Vision sidebar card on right */}
            <div className="space-y-8 p-8 bg-zinc-50 border border-zinc-100 rounded-sm shadow-sm">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-primary font-bold">
                  <span className="w-1.5 h-6 bg-accent block"></span>
                  <h4 className="text-lg uppercase tracking-wide">Our Vision</h4>
                </div>
                <p className="text-zinc-600 text-sm leading-relaxed pl-3 border-l-2 border-zinc-200">
                  To design and realize every client's dream interior with utmost effort.
                </p>
                <p className="text-zinc-600 text-sm leading-relaxed pl-3 border-l-2 border-zinc-200">
                  To build beyond our best to provide excellent satisfaction. And be one of the top construction companies in the Philippines.
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t border-zinc-200">
                <div className="flex items-center space-x-2 text-primary font-bold">
                  <span className="w-1.5 h-6 bg-accent block"></span>
                  <h4 className="text-lg uppercase tracking-wide">Our Mission</h4>
                </div>
                <p className="text-zinc-600 text-sm leading-relaxed pl-3 border-l-2 border-zinc-200">
                  To serve our clients with the best service in the interior design, fit-out and construction services filled with our integrity and professionalism.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Services Section */}
      <section className="py-20 lg:py-24 bg-zinc-50 border-t border-b border-zinc-200" id="home-services">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary tracking-tight uppercase relative inline-block pb-3">
              Our Services
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-accent"></span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature Card 1 */}
            <div className="bg-white p-8 rounded-sm shadow-sm border border-zinc-200 hover:-translate-y-2 hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
                <Building className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-base font-bold text-primary mb-3">Fit Out Construction</h4>
              <p className="text-xs text-zinc-600 leading-relaxed text-justify">
                The process to build takes time depending on how big the project we work on. Carefully and making sure that we deliver the best quality of workmanship that is worth our clients' investment. From construction process to building guidelines and government permits are all provided. Our team is easy and reliable when it comes to warranty and after sales service.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-white p-8 rounded-sm shadow-sm border border-zinc-200 hover:-translate-y-2 hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
                <HardHat className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-base font-bold text-primary mb-3">General Construction</h4>
              <p className="text-xs text-zinc-600 leading-relaxed text-justify">
                We are serious in making our company one of the most reliable construction businesses when it comes to general construction. Specialty works and general construction is one of our main focus. MEPF, PMS and repair and maintenance. Our team are always ready to serve.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-white p-8 rounded-sm shadow-sm border border-zinc-200 hover:-translate-y-2 hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
                <Compass className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-base font-bold text-primary mb-3">Interior Design</h4>
              <p className="text-xs text-zinc-600 leading-relaxed text-justify">
                We put both emotion and purpose when creating an effective design that would help our clients uplift their confidence at their working and residential spaces, putting their personal inputs and requirements. We want to come up with the best and maximize the space area aesthetically, modern yet detailed and comfortable.
              </p>
            </div>

            {/* Feature Card 4 */}
            <div className="bg-white p-8 rounded-sm shadow-sm border border-zinc-200 hover:-translate-y-2 hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
                <Sofa className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-base font-bold text-primary mb-3">Office &amp; Residential Furniture</h4>
              <p className="text-xs text-zinc-600 leading-relaxed text-justify">
                We only provide high quality yet affordable furniture. Our delivery is fast and reasonable. System furniture, residential furniture, restaurant furniture, roller blinds, loose furniture, joineries, metal cabinets, operable walls and more. Safety and comfortability is our main focus.
              </p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
