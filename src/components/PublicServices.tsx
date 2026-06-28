/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Search, Loader2, Wrench, Shield, ArrowRight, Paintbrush, Hammer, ClipboardList, Building2, Sofa, LayoutGrid } from "lucide-react";
import PlaceholderImage from "./PlaceholderImage.tsx";
import { Service } from "../types.ts";

const getServiceIcon = (name: string) => {
  const norm = name.toLowerCase();
  if (norm.includes("interior") || norm.includes("paint") || norm.includes("design") || norm.includes("creative")) {
    return Paintbrush;
  }
  if (norm.includes("fit") || norm.includes("fitout") || norm.includes("refurbish") || norm.includes("turn-key")) {
    return LayoutGrid;
  }
  if (norm.includes("project") || norm.includes("manage") || norm.includes("supervision")) {
    return ClipboardList;
  }
  if (norm.includes("furniture") || norm.includes("carpentry") || norm.includes("wood")) {
    return Sofa;
  }
  if (norm.includes("construction") || norm.includes("civil") || norm.includes("build") || norm.includes("general")) {
    return Building2;
  }
  return Wrench;
};

const getServiceShortName = (name: string) => {
  const norm = name.toLowerCase();
  if (norm.includes("interior") || norm.includes("design")) {
    return "INTERIOR DESIGN";
  }
  if (norm.includes("fit out") || norm.includes("fit-out") || norm.includes("refurbish")) {
    return "FIT OUT CONTRACTOR";
  }
  if (norm.includes("project") || norm.includes("manage")) {
    return "PROJECT MANAGEMENT";
  }
  if (norm.includes("construction") || norm.includes("civil")) {
    return "CIVIL WORKS";
  }
  if (norm.includes("furniture") || norm.includes("carpentry")) {
    return "CUSTOM CARPENTRY";
  }
  return "GENERAL SERVICE";
};

export default function PublicServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadServices() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/services");
        const data = await response.json();
        setServices(data);
      } catch (err) {
        console.error("Failed to load services database records", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadServices();
  }, []);

  // Filter local state based on search query
  const filteredServices = services.filter((svc) => {
    const term = searchQuery.toLowerCase();
    return (
      svc.name.toLowerCase().includes(term) ||
      svc.description.toLowerCase().includes(term)
    );
  });

  return (
    <div 
      className="bg-slate-50 min-h-screen text-slate-800 font-sans relative" 
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1600')",
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      id="services-view-body"
    >
      
      {/* Visual Header Block */}
      <section className="relative text-white py-24 overflow-hidden border-b border-accent/20" id="services-page-panel">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/service.jpg" 
            alt="Services background" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[1px]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1.5px)] opacity-5 [background-size:24px_24px]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <span className="text-accent font-mono text-xs font-bold tracking-[0.25em] uppercase bg-white/5 py-1 px-3 border border-white/10 rounded-sm">OUR EXPERTISE</span>
          <h1 className="text-3xl sm:text-5xl font-sans font-extrabold tracking-tight uppercase mt-3">Our Services</h1>
          <p className="mt-3 text-zinc-200 text-xs sm:text-sm max-w-2xl leading-relaxed">
            From design exploration to site layouts and full commercial build construction, study our custom service offerings below.
          </p>
        </div>
      </section>

      {/* Filter and Content sections wrapper */}
      <div className="w-full">
        
        {/* Search tool block - centered, spacious container with solid backdrop */}
        <div className="w-full bg-slate-50/90 border-b border-slate-200/50 backdrop-blur-md relative z-10 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative w-full max-w-md mx-auto" id="services-filter-box">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search services directory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-sm pl-10 pr-4 py-2.5 text-xs outline-none focus:border-accent shadow-xs text-slate-800 placeholder-slate-400"
                id="service-search-input"
              />
            </div>
          </div>
        </div>

        {/* Services List rendering */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
            <p className="text-xs font-mono text-slate-500">Syncing database operations...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-16 bg-white border border-slate-200 rounded-sm shadow-xs">
              <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-4 stroke-[1.2]" />
              <p className="text-sm text-slate-800 font-bold uppercase tracking-wider">No service matched your description.</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Try editing your search term or contact our Malate builders desk for direct tailored corporate inquiries.</p>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col" id="services-catalog-scroll-feed">
            {filteredServices.map((svc, index) => {
              const rotateLayout = index % 2 === 1;
              const ServiceIcon = getServiceIcon(svc.name);
              const shortName = getServiceShortName(svc.name);

              return (
                <section 
                  key={svc.id} 
                  className={`w-full py-8 sm:py-10 relative overflow-hidden transition-colors duration-300 border-b last:border-b-0 ${
                    rotateLayout 
                      ? "bg-slate-950/85 backdrop-blur-[2px] text-white border-slate-900" 
                      : "bg-white/85 backdrop-blur-[2px] text-slate-800 border-slate-200/50"
                  }`}
                  id={`service-item-${svc.id}`}
                >
                  {rotateLayout && (
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1.5px)] opacity-[0.03] [background-size:24px_24px] pointer-events-none" />
                  )}

                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    
                    <div className={`flex flex-col ${
                      rotateLayout ? "lg:flex-row-reverse" : "lg:flex-row"
                    } gap-6 lg:gap-12 items-center`}>
                      
                      {/* Left/Alternating Column (Image Frame) */}
                      <div className="w-full lg:w-1/2 shrink-0">
                        <div className={`relative overflow-hidden rounded-md border shadow-md h-[180px] sm:h-[220px] lg:h-[240px] max-w-lg mx-auto w-full ${
                          rotateLayout ? "border-slate-800" : "border-slate-200/80"
                        }`}>
                          <PlaceholderImage
                            imageUrl={svc.images && svc.images.length > 0 ? svc.images[0] : ""}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                            alt={svc.name}
                          />
                          <div className="absolute top-4 left-4 z-10">
                            <span className="bg-accent text-white text-[9px] font-bold font-mono px-2.5 py-1 rounded-sm uppercase tracking-widest shadow-md">
                              {svc.availability || "ACTIVE"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right/Alternating Column (Highly Styled Card Component matching requested style) */}
                      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center lg:items-start">
                        
                        {/* Subheading element matching mockup style */}
                        <div className="mb-3 flex items-center gap-2">
                          <span className="text-[10px] font-sans font-bold tracking-wider uppercase text-accent">
                            Spaces that inspire. Designs that work.
                          </span>
                          <span className="w-2 h-2 bg-accent rotate-45 shrink-0" />
                        </div>

                        {/* Custom Card component representing service */}
                        <div className={`border rounded-[1.25rem] sm:rounded-[1.5rem] flex flex-col sm:flex-row items-stretch overflow-hidden shadow-md max-w-xl w-full hover:border-accent/30 hover:shadow-lg transition-all duration-200 ${
                          rotateLayout ? "border-slate-800 bg-slate-900/90" : "border-slate-200/50 bg-white/90"
                        }`}>
                          
                          {/* Card Badge: contains white flat icon and bold title */}
                          <div className="bg-accent/90 text-white flex flex-col items-center justify-center p-5 sm:w-[130px] md:w-[150px] shrink-0 text-center select-none rounded-t-[1.2rem] sm:rounded-t-none sm:p-4">
                            <ServiceIcon className="w-8 h-8 text-white stroke-[1.5] mb-2 animate-pulse" style={{ animationDuration: "3s" }} />
                            <span className="text-[9px] font-black uppercase tracking-[0.15em] leading-snug">
                              {shortName}
                            </span>
                          </div>

                          {/* Card Content & Description */}
                          <div className={`p-5 sm:p-6 flex flex-col justify-center flex-grow ${
                            rotateLayout ? "text-zinc-300 bg-slate-900/95" : "text-slate-700 bg-white/95"
                          }`}>
                            <h3 className={`text-xs sm:text-sm font-extrabold uppercase tracking-wide leading-tight mb-2 ${
                              rotateLayout ? "text-white" : "text-slate-800"
                            }`}>
                              {svc.name}
                            </h3>
                            <p className={`text-[11px] leading-relaxed font-sans font-medium ${
                              rotateLayout ? "text-slate-400" : "text-slate-500"
                            }`}>
                              {svc.description}
                            </p>
                          </div>

                        </div>

                      </div>

                    </div>

                  </div>
                </section>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
