/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { HardHat, Sofa, Ruler, Paintbrush, Briefcase, LayoutGrid, Hammer, Settings } from "lucide-react";
import { motion } from "motion/react";

interface PlaceholderProps {
  imageUrl: string;
  className?: string;
  alt?: string;
}

export default function PlaceholderImage({ imageUrl, className = "w-full h-48 object-cover", alt = "Lucky Crown Graphic" }: PlaceholderProps) {
  // If it's a real base64 image, actual web URL, or local uploaded file path, render it directly
  if (imageUrl && (
    imageUrl.startsWith("data:") || 
    imageUrl.startsWith("http://") || 
    imageUrl.startsWith("https://") || 
    imageUrl.startsWith("/uploads") || 
    imageUrl.startsWith("/assets")
  )) {
    return (
      <motion.img
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        whileHover={{ scale: 1.05 }}
        transition={{ 
          opacity: { duration: 0.6 },
          scale: { duration: 0.4, ease: "easeOut" }
        }}
        src={imageUrl}
        alt={alt}
        className={`${className} transition-all duration-300`}
        referrerPolicy="no-referrer"
        id={`img-${Math.random().toString(36).substring(7)}`}
      />
    );
  }

  // Otherwise, return a gorgeous, high-end technical blueprint or vector icon drawing relative to our categories to look incredibly high-end.
  const name = imageUrl ? imageUrl.toLowerCase() : "";

  let iconElement = <HardHat className="w-12 h-12 text-amber-500" />;
  let gradientClass = "from-slate-800 to-indigo-950";
  let graphicText = "LUCKY CROWN CONSTRUCTION";
  let tagText = "Est. 2020";

  if (name.includes("workstation") || name.includes("furniture") || name.includes("chair") || name.includes("desk") || name.includes("lounge")) {
    iconElement = <Sofa className="w-12 h-12 text-yellow-500" />;
    gradientClass = "from-slate-900 to-amber-950";
    graphicText = name.includes("workstation") ? "Modular Quad Workstation" : name.includes("chair") ? "AeroMesh Chair Ergonomics" : name.includes("desk") ? "Walnut Veneer Executive Executive" : "Reception Lounge Armchair";
    tagText = "Premium Office Supplies";
  } else if (name.includes("fitout") || name.includes("refurbishment")) {
    iconElement = <Paintbrush className="w-12 h-12 text-amber-500" />;
    gradientClass = "from-slate-900 to-cyan-950";
    graphicText = "Fit Out Construction & Interiors";
    tagText = "Turn-Key Commercial Interiors";
  } else if (name.includes("interior") || name.includes("design") || name.includes("penthouse")) {
    iconElement = <Ruler className="w-12 h-12 text-yellow-400" />;
    gradientClass = "from-slate-900 to-violet-950";
    graphicText = name.includes("penthouse") ? "Penthouse Luxury Interiors" : "Interior Design & Space Architecture";
    tagText = "3D Fine Rendering Plan";
  } else if (name.includes("general") || name.includes("civil")) {
    iconElement = <Hammer className="w-12 h-12 text-amber-500" />;
    gradientClass = "from-slate-800 to-slate-950";
    graphicText = "General Civil & Structural Engineering";
    tagText = "General Construction Works";
  } else if (name.includes("coworking") || name.includes("project")) {
    iconElement = <Briefcase className="w-12 h-12 text-amber-500" />;
    gradientClass = "from-slate-900 to-blue-950";
    graphicText = name.includes("coworking") ? "InnovateHub Ortigas Space" : "Apex Corporate HQ Makati";
    tagText = "Completed Fit-Out Project";
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.5 }}
      className={`relative flex flex-col items-center justify-center bg-gradient-to-br ${gradientClass} ${className} overflow-hidden p-6 text-center select-none border border-slate-800/40 rounded-t-lg shadow-inner`}
    >
      {/* Dynamic Grid Overlay for Tech Blueprint theme */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:14px_14px]" />
      
      {/* Circular glow background ornament */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-xl" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl" />

      {/* Graphic elements */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-2 p-3 bg-slate-900/80 rounded-xl border border-white/5 backdrop-blur-md shadow-lg animate-pulse" style={{ animationDuration: "3s" }}>
          {iconElement}
        </div>
        <p className="text-[10px] font-mono tracking-widest text-amber-400/80 uppercase font-semibold">{tagText}</p>
        <p className="mt-1.5 text-xs font-sans tracking-wide text-zinc-100 font-medium px-2 max-w-xs truncate">{graphicText}</p>
      </div>

      {/* Decorative Blueprint Technical Scale Marks */}
      <div className="absolute bottom-1 left-2 font-mono text-[8px] text-zinc-500 flex items-center space-x-1">
        <span>S.SCALE: 1:25</span>
        <span className="text-zinc-600">|</span>
        <span>A3 BLK</span>
      </div>
      <div className="absolute top-1.5 right-2 flex items-center space-x-1">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
        <span className="font-mono text-[8px] text-zinc-500">LCCT CAD ENGINE</span>
      </div>
    </motion.div>
  );
}
