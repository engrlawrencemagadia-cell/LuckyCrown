/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Search, Loader2, Sofa, Shield, CornerDownRight, ChevronLeft, ChevronRight } from "lucide-react";
import PlaceholderImage from "./PlaceholderImage.tsx";
import { Product } from "../types.ts";

const ProductCarousel = ({ images, name }: { images: string[]; name: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-[260px] sm:h-[350px] bg-slate-50 border border-slate-200 rounded-sm flex items-center justify-center">
        <PlaceholderImage imageUrl="" className="w-full h-full object-cover rounded-sm" alt={name} />
      </div>
    );
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative group w-full h-[260px] sm:h-[350px] rounded-sm border border-slate-200 bg-white overflow-hidden flex flex-col justify-between">
      {/* Photo viewport */}
      <div className="relative flex-grow flex items-center justify-center p-4 bg-white select-none">
        <PlaceholderImage
          imageUrl={images[currentIndex]}
          className="max-w-full max-h-full object-contain rounded-sm transition-all duration-300"
          alt={`${name} perspective ${currentIndex + 1}`}
        />

        {/* Slide Counter Index label indicator */}
        {images.length > 1 && (
          <span className="absolute top-2.5 right-2.5 text-[8px] font-mono font-black uppercase tracking-widest bg-slate-900/80 text-white px-2 py-0.5 rounded-sm select-none z-10">
            {currentIndex + 1} / {images.length}
          </span>
        )}
      </div>

      {/* Carousel controls positioned relative to the outer container for perfect centering consistency */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            type="button"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-slate-950/70 hover:bg-accent text-white flex items-center justify-center active:scale-90 transition-all shadow-md cursor-pointer select-none"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5 pointer-events-none" />
          </button>
          <button
            onClick={handleNext}
            type="button"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-slate-950/70 hover:bg-accent text-white flex items-center justify-center active:scale-90 transition-all shadow-md cursor-pointer select-none"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5 pointer-events-none" />
          </button>
        </>
      )}

      {/* Selector dots panel */}
      {images.length > 1 && (
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 flex items-center justify-center gap-1.5 min-h-[32px] shrink-0">
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                currentIndex === idx 
                  ? "bg-accent scale-125" 
                  : "bg-slate-300 hover:bg-slate-400"
              }`}
              aria-label={`Show slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function PublicProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const url = `/api/products?category=${encodeURIComponent(selectedCategory)}&search=${encodeURIComponent(searchQuery)}`;
        const res = await fetch(url);
        const data = await res.json();
        setProducts(data);

        const catRes = await fetch("/api/categories/products");
        const catData = await catRes.json();
        setCategories(catData);
      } catch (err) {
        console.error("Failed to load products database", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [selectedCategory, searchQuery]);

  return (
    <div 
      className="min-h-screen text-slate-800 font-sans relative" 
      style={{
        backgroundImage: "url('/images/bg.jpg')",
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      id="products-view-body"
    >
      
      {/* Visual Header Block */}
      <section className="relative text-white py-24 overflow-hidden border-b border-accent/20" id="products-page-panel">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/products.jpg" 
            alt="Products background" 
            className="w-full h-full object-cover object-center animate-pulse-slow"
          />
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[1px]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1.5px)] opacity-5 [background-size:24px_24px]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <span className="text-accent font-mono text-xs font-bold tracking-[0.25em] uppercase bg-white/5 py-1 px-3 border border-white/10 rounded-sm">PRODUCT GALLERY</span>
          <h1 className="text-3xl sm:text-5xl font-sans font-extrabold tracking-tight uppercase text-white mt-3">Our Products Catalog</h1>
          <p className="mt-3 text-zinc-200 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Beautiful spaces start with excellent details. Scroll through our complete commercial and residential custom designs portfolio catalog.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        
        {/* Dynamic Filters Bar */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-sm border border-slate-200/40 flex flex-col md:flex-row justify-between items-center gap-4 mb-12 shadow-sm" id="products-filters-bar">
          
          {/* Search */}
          <div className="relative w-full md:max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search product keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/70 border border-slate-200 rounded-sm pl-10 pr-4 py-2.5 text-xs outline-none focus:border-accent focus:bg-white transition"
              id="product-search-input"
            />
          </div>

          {/* Dynamic Categories Selector */}
          <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 shrink-0">
              CATEGORIES:
            </span>
            <button
              onClick={() => setSelectedCategory("")}
              className={`px-3.5 py-2 rounded-sm text-[10px] font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap transition-all border ${
                selectedCategory === ""
                  ? "bg-accent text-white border-accent"
                  : "bg-white/75 text-slate-600 border-slate-200 hover:bg-white/95"
              }`}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-sm text-[10px] font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap transition-all border ${
                  selectedCategory === cat
                    ? "bg-accent text-white border-accent"
                    : "bg-white/75 text-slate-600 border-slate-200 hover:bg-white/95"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>

        {/* Scrollable feed list */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3 bg-white/70 backdrop-blur-md rounded-sm border border-slate-200/50">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
            <p className="text-xs font-mono text-slate-400">Syncing with Lucky Crown Inventory...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white/85 backdrop-blur-md border border-slate-200/50 rounded-sm shadow-sm">
            <Sofa className="w-12 h-12 text-slate-300 mx-auto mb-4 stroke-[1.2]" />
            <p className="text-sm text-slate-850 font-bold uppercase tracking-wider">No products found.</p>
            <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto">Try editing your search keyword, choosing another category, or contact our team for customized carpentry inquiries.</p>
          </div>
        ) : (
          <div className="space-y-8 lg:space-y-12 md:px-2" id="products-catalog-scroll-feed">
            {products.map((prod, index) => {
              const rotateLayout = index % 2 === 1;
              return (
                <div
                  key={prod.id}
                  className={`flex flex-col ${
                    rotateLayout ? "lg:flex-row-reverse" : "lg:flex-row"
                  } gap-6 lg:gap-12 items-start p-6 sm:p-8 rounded-lg mb-8 border shadow-md transition-all duration-300 ${
                    rotateLayout 
                      ? "bg-slate-950/85 backdrop-blur-[2px] text-white border-slate-900 shadow-black/20" 
                      : "bg-white/80 backdrop-blur-[3px] text-slate-800 border-slate-200/40"
                  }`}
                  id={`product-item-${prod.id}`}
                >
                  
                  {/* Left/Alternating Column (Images Carousel Block) */}
                  <div className="w-full lg:w-1/2 shrink-0">
                    <ProductCarousel images={prod.images || []} name={prod.name} />
                  </div>

                  {/* Right/Alternating Column (Product Name and Spec details block) */}
                  <div className="w-full lg:w-1/2 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold font-mono tracking-widest text-accent uppercase bg-accent/5 px-2 py-0.5 rounded-sm">
                          {prod.category}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${prod.availability === "In Stock" ? "bg-emerald-500" : "bg-amber-500"}`}></span>
                          <span className={`text-[9px] uppercase tracking-wider font-mono font-bold ${
                            rotateLayout ? "text-slate-350" : "text-slate-500"
                          }`}>
                            {prod.availability}
                          </span>
                        </div>
                      </div>

                      <h2 className={`text-xl sm:text-3xl font-sans font-black tracking-tight uppercase mt-2 leading-tight ${
                        rotateLayout ? "text-white" : "text-slate-900"
                      }`}>
                        {prod.name}
                      </h2>

                      {/* Accent design line */}
                      <div className="w-16 h-1 bg-accent mt-3.5 mb-5"></div>

                      <p className={`text-xs sm:text-sm leading-relaxed font-sans max-w-xl ${
                        rotateLayout ? "text-slate-300" : "text-slate-600"
                      }`}>
                        {prod.description}
                      </p>

                      {/* Display specs inline, cleanly list specs list */}
                      {prod.specifications ? (
                        <div className="mt-6">
                          <h4 className={`text-[10px] uppercase font-mono font-bold tracking-widest mb-2.5 block ${
                            rotateLayout ? "text-slate-400" : "text-slate-500"
                          }`}>
                            TECHNICAL SPECIFICATIONS
                          </h4>
                          <div className={`border p-4 rounded-sm shadow-xs max-w-xl ${
                            rotateLayout 
                              ? "bg-slate-900/80 border-slate-800/60 text-slate-200" 
                              : "bg-white/80 border-slate-200/40 text-slate-650 backdrop-blur-[1px]"
                          }`}>
                            <ul className="space-y-2 text-xs font-sans">
                              {prod.specifications.split("\n").filter(line => line.trim()).map((line, ix) => (
                                <li key={ix} className="flex items-start">
                                  <CornerDownRight className="w-3.5 h-3.5 text-accent mr-2 shrink-0 mt-0.5" />
                                  <span className="leading-relaxed">{line}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-5">
                          <p className={`text-xs italic ${
                            rotateLayout ? "text-slate-450" : "text-slate-400"
                          }`}>
                            No custom specifications listed. Standard production variables apply.
                          </p>
                        </div>
                      )}
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
