/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Search, ChevronDown, ChevronUp, Loader2, ArrowRight, Sofa, Wrench, Sparkles, HelpCircle, Facebook, Mail } from "lucide-react";
import PlaceholderImage from "./PlaceholderImage.tsx";
import { FAQ, Product, Service } from "../types.ts";

export default function PublicFAQs() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openFAQId, setOpenFAQId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Global Omnibox Search States
  const [globalQuery, setGlobalQuery] = useState<string>("");
  const [searchTriggered, setSearchTriggered] = useState<boolean>(false);
  const [globalResults, setGlobalResults] = useState<{
    faqs: FAQ[];
    products: Product[];
    services: Service[];
  }>({ faqs: [], products: [], services: [] });
  const [searchLoading, setSearchLoading] = useState<boolean>(false);

  // Load standard FAQs list on mount
  useEffect(() => {
    async function loadFaqs() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/faqs");
        const data = await response.json();
        setFaqs(data);
      } catch (err) {
        console.error("Failed to fetch FAQs record set", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadFaqs();
  }, []);

  const toggleFAQ = (id: number) => {
    setOpenFAQId((prev) => (prev === id ? null : id));
  };

  // Perform dynamic global search across products, services, and FAQs
  const handleGlobalSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalQuery.trim()) {
      setSearchTriggered(false);
      return;
    }

    setSearchLoading(true);
    setSearchTriggered(true);

    try {
      // 1. Fetch filtered products match
      const prodRes = await fetch(`/api/products?search=${encodeURIComponent(globalQuery)}`);
      const prodData = await prodRes.json();

      // 2. Fetch services list and filter client-side for match
      const svcRes = await fetch("/api/services");
      const svcData = await svcRes.json();
      const matchedSvc = svcData.filter((s: Service) => 
         s.name.toLowerCase().includes(globalQuery.toLowerCase()) ||
         s.description.toLowerCase().includes(globalQuery.toLowerCase())
      );

      // 3. Filter our state FAQs
      const matchedFaq = faqs.filter((f) => 
        f.question.toLowerCase().includes(globalQuery.toLowerCase()) ||
        f.answer.toLowerCase().includes(globalQuery.toLowerCase())
      );

      setGlobalResults({
        faqs: matchedFaq,
        products: prodData,
        services: matchedSvc
      });
    } catch (err) {
      console.error("Global search error on backend", err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleResetSearch = () => {
    setGlobalQuery("");
    setSearchTriggered(false);
    setGlobalResults({ faqs: [], products: [], services: [] });
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans" id="faqs-view-body">
      
      {/* 1. Global Search & Title Banner */}
      <section className="bg-gradient-to-r from-primary-dark via-primary to-primary-dark text-white py-20 relative overflow-hidden border-b border-accent/20" id="faqs-header">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1.5px)] opacity-10 [background-size:24px_24px]"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="text-accent font-mono text-xs font-bold tracking-[0.25em] uppercase bg-white/5 py-1 px-3 border border-white/10 rounded-sm">LUCKY CROWN HELP DESK</span>
          <h1 className="text-3xl sm:text-5xl font-sans font-extrabold tracking-tight uppercase text-white mt-3">Estimating & Builders FAQs</h1>
          <p className="mt-3 text-zinc-200 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Search our corporate directory knowledge-base on fit-out speeds, customizable office structures, free ocular surveys, and estimate timetables.
          </p>

          {/* Dynamic Global Omnibox Search Form */}
          <form onSubmit={handleGlobalSearch} className="mt-8 max-w-xl mx-auto relative" id="global-search-form">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              <Search className="w-4 h-4 text-accent" />
            </span>
            <input
              type="text"
              placeholder="Search across products, services, and FAQs..."
              value={globalQuery}
              onChange={(e) => setGlobalQuery(e.target.value)}
              className="w-full bg-white text-slate-800 border-none rounded-sm pl-11 pr-32 py-3 text-xs shadow-md focus:outline-none focus:ring-1 focus:ring-accent font-sans"
              id="global-search-query-field"
            />
            <button
              type="submit"
              className="absolute right-2 top-1.5 bg-accent hover:bg-accent-light text-white px-5 py-1.5 rounded-sm text-[10px] font-sans font-bold tracking-widest uppercase transition cursor-pointer border-none shadow-sm"
            >
              Search
            </button>
          </form>

          {searchTriggered && (
            <button
              type="button"
              onClick={handleResetSearch}
              className="mt-3.5 text-[10px] text-accent hover:underline transition font-mono uppercase tracking-widest"
            >
              [ Clear search / Show standard FAQ list ]
            </button>
          )}

        </div>
      </section>

      {/* 2. Global Search Results Render Section */}
      {searchTriggered ? (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="global-search-results-section">
          <div className="flex items-center space-x-2 bg-accent/5 border border-accent/20 p-4 rounded-sm mb-8">
            <Sparkles className="w-5 h-5 text-accent" />
            <p className="text-xs text-slate-650">
              Showing directory search results matching keyword <strong className="text-accent font-bold">"{globalQuery}"</strong>:
            </p>
          </div>

          {searchLoading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-2">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
              <p className="text-xs font-mono text-slate-400">Filtering database tables...</p>
            </div>
          ) : (
            <div className="space-y-12">
              
              {/* Category Group 1: Products */}
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Sofa className="w-4 h-4 text-accent" />
                  <span>Matched furniture pieces ({globalResults.products.length})</span>
                </h3>
                {globalResults.products.length === 0 ? (
                  <p className="text-xs text-slate-400 italic mt-2 pl-4">No matching catalog furniture pieces found.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                    {globalResults.products.map((p) => (
                      <div key={p.id} className="p-4 bg-white border border-slate-200 rounded-sm shadow-sm hover:border-accent transition duration-300">
                        <PlaceholderImage imageUrl={p.images?.[0] || ""} className="w-full h-36 object-cover rounded-sm" />
                        <h4 className="font-sans font-bold text-slate-900 mt-2.5 truncate text-xs uppercase tracking-wide">{p.name}</h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{p.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Category Group 2: Services */}
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mt-6">
                  <Wrench className="w-4 h-4 text-accent" />
                  <span>Matched Building Services ({globalResults.services.length})</span>
                </h3>
                {globalResults.services.length === 0 ? (
                  <p className="text-xs text-slate-400 italic mt-2 pl-4">No matching building services in directory.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                    {globalResults.services.map((s) => (
                      <div key={s.id} className="p-4 bg-white border border-slate-200 rounded-sm shadow-sm flex space-x-3 hover:border-accent transition duration-300">
                        <div className="w-20 h-20 shrink-0 bg-slate-50">
                          <PlaceholderImage imageUrl={s.images?.[0] || ""} className="w-full h-full object-cover rounded-sm" />
                        </div>
                        <div>
                          <h4 className="font-sans font-bold text-slate-900 text-xs uppercase tracking-wide">{s.name}</h4>
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mt-1">{s.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Category Group 3: FAQs */}
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mt-6">
                  <HelpCircle className="w-4 h-4 text-accent" />
                  <span>Matched Help FAQs ({globalResults.faqs.length})</span>
                </h3>
                {globalResults.faqs.length === 0 ? (
                  <p className="text-xs text-slate-400 italic mt-2 pl-4">No FAQ articles matching that term.</p>
                ) : (
                  <div className="space-y-3 mt-4">
                    {globalResults.faqs.map((f) => (
                      <div key={f.id} className="p-5 bg-white border border-slate-200 rounded-sm col-span-3">
                        <h4 className="text-xs font-bold font-sans text-slate-900">Q: {f.question}</h4>
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed pl-3 border-l-2 border-accent">{f.answer}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </section>
      ) : (
        /* 3. Collapsible FAQ Accordion Lists */
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16" id="standard-accordion-section">
          <div className="text-center mb-10">
            <h2 className="text-xl font-sans font-bold text-slate-950 uppercase tracking-widest">Frequently Asked Questions</h2>
            <div className="w-8 h-1 bg-accent mx-auto mt-2" />
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-accent animate-spin" />
            </div>
          ) : faqs.length === 0 ? (
            <p className="text-xs text-slate-450 italic text-center">No FAQ sheets in database yet.</p>
          ) : (
            <div className="space-y-4" id="faq-accordion-container">
              {faqs.map((item) => {
                const isOpen = openFAQId === item.id;
                return (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm transition-all"
                    id={`faq-item-${item.id}`}
                  >
                    {/* Header bar click trigger */}
                    <button
                      onClick={() => toggleFAQ(item.id)}
                      id={`faq-trigger-${item.id}`}
                      className="w-full px-6 py-4 text-left flex items-center justify-between text-slate-900 hover:text-accent transition cursor-pointer"
                    >
                      <span className="font-bold text-xs tracking-wide uppercase text-slate-850">{item.question}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-accent shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {/* Collapsible Content pane */}
                    {isOpen && (
                      <div className="px-6 pb-5 pt-1 text-xs text-slate-500 leading-relaxed border-t border-slate-50 border-dashed" id={`faq-body-${item.id}`}>
                        <p className="pl-3 border-l-2 border-accent">{item.answer}</p>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* 4. Help desk Contact redirect footer CTA */}
      <section className="bg-primary-dark text-white py-14 border-t border-white/10" id="faqs-cta">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h3 className="text-base font-sans font-bold uppercase tracking-widest text-slate-100">Still Have Questions?</h3>
          <p className="text-xs text-zinc-300 max-w-sm mx-auto leading-relaxed">
            Send an inquiry instantly to our construction estimating desk or connect via social lines on Facebook.
          </p>
          <div className="flex justify-center space-x-3 pt-2">
            <a
              href="https://www.facebook.com/luckycrownconstruction"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-sm bg-accent hover:bg-accent-light text-white font-sans font-bold text-[10px] tracking-widest uppercase cursor-pointer transition border border-none shadow-md"
            >
              <Facebook className="w-4 h-4" />
              <span>Facebook Chat</span>
            </a>
            <a
              href="mailto:luckycrownconstruction@gmail.com"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-sm bg-primary hover:bg-primary-dark text-white border border-white/10 font-sans font-bold text-[10px] tracking-widest uppercase cursor-pointer transition"
            >
              <Mail className="w-4 h-4 text-accent" />
              <span>Direct Mail</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
