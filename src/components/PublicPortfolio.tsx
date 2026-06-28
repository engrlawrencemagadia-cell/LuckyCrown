/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Loader2, Briefcase, MapPin, Calendar, User, CornerDownRight, X, Layers, Hammer } from "lucide-react";
import PlaceholderImage from "./PlaceholderImage.tsx";
import { Project } from "../types.ts";

export default function PublicPortfolio() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    async function loadProjects() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/projects");
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        console.error("Failed to load project portfolio records", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProjects();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans" id="portfolio-view-body">
      
      {/* Visual Header Block */}
      <section className="relative text-white py-24 overflow-hidden border-b border-accent/20" id="portfolio-header">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/projects.png" 
            alt="Projects background" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[1px]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1.5px)] opacity-5 [background-size:24px_24px]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <span className="text-accent font-mono text-xs font-bold tracking-[0.25em] uppercase bg-white/5 py-1 px-3 border border-white/10 rounded-sm">OUR BLUEPRINTS</span>
          <h1 className="text-3xl sm:text-5xl font-sans font-extrabold tracking-tight uppercase text-white mt-3">Our Projects & Portfolio</h1>
          <p className="mt-3 text-zinc-200 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Take an in-depth tour of our construction history—showcasing retail interior layups, commercial fit-outs, and customized structural projects.
          </p>
        </div>
      </section>

      {/* Grid gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
            <p className="text-xs font-mono text-slate-400">Syncing database registers...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-sm">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4 stroke-[1.2]" />
            <p className="text-sm text-slate-850 font-bold uppercase tracking-wider">No completed projects in directory yet.</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Our development engineers are actively uploading recent project files. Check back soon for beautiful corporate office rollouts.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" id="portfolio-catalog-grid">
            {projects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => setSelectedProject(proj)}
                className="bg-white border border-slate-200 rounded-sm overflow-hidden hover:border-accent cursor-pointer group shadow-sm transition-all duration-350 flex flex-col justify-between"
                id={`project-card-${proj.id}`}
              >
                {/* Image block */}
                <div className="relative overflow-hidden shrink-0 bg-slate-50">
                  <PlaceholderImage
                    imageUrl={proj.images && proj.images.length > 0 ? proj.images[0] : ""}
                    className="w-full h-56 object-cover transform duration-500 group-hover:scale-103"
                    alt={proj.name}
                  />
                  <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md text-white text-[9px] font-mono px-2.5 py-1 rounded-sm flex items-center gap-1.5 shadow-sm">
                    <MapPin className="w-3 h-3 text-accent" />
                    <span className="truncate max-w-[150px] uppercase font-bold tracking-wider">{proj.location}</span>
                  </div>
                </div>

                {/* Content Block */}
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-1 text-[10px] font-bold font-mono tracking-widest text-accent uppercase">
                      <span>PROJECT ARCHIVE</span>
                    </div>
                    <h3 className="text-base font-sans font-bold text-slate-900 uppercase tracking-wide mt-1 transition group-hover:text-accent truncate">
                      {proj.name}
                    </h3>
                    <p className="mt-2 text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {proj.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      <span>{proj.date}</span>
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent group-hover:underline flex items-center gap-1">
                      <span>Explore Specs</span>
                      <CornerDownRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* Project specs details modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-[100] overflow-y-auto flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn" id="portfolio-modal">
          <div className="relative bg-white max-w-3xl w-full rounded-sm overflow-hidden shadow-2xl border border-slate-200">
            
            {/* Close trigger */}
            <button
              onClick={() => setSelectedProject(null)}
              id="close-project-modal-btn"
              className="absolute top-4 right-4 z-15 p-2 bg-slate-950 hover:bg-accent text-white rounded-sm transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Media Image layout section */}
            <div className="relative h-72 w-full bg-slate-950">
              <PlaceholderImage
                imageUrl={selectedProject.images && selectedProject.images.length > 0 ? selectedProject.images[0] : ""}
                className="w-full h-full object-cover opacity-80"
                alt={selectedProject.name}
              />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950 to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6">
                <span className="bg-accent text-white text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm">
                  Active Blueprint
                </span>
                <h2 className="text-xl font-sans font-bold uppercase text-white mt-1.5 tracking-wider leading-tight">
                  {selectedProject.name}
                </h2>
              </div>
            </div>

            {/* Scope Content list */}
            <div className="p-8 space-y-6 bg-white overflow-y-auto max-h-[60vh]">
              
              {/* Detailed specs horizontal grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-slate-200 pb-5">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-sm">
                    <User className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-mono font-bold text-slate-400">Client Partner</p>
                    <p className="text-xs font-bold text-slate-900 mt-0.5 truncate max-w-[160px]">{selectedProject.client}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-sm">
                    <MapPin className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-mono font-bold text-slate-400">Location Built</p>
                    <p className="text-xs font-bold text-slate-900 mt-0.5 truncate max-w-[160px] text-slate-850">{selectedProject.location}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-sm">
                    <Calendar className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-mono font-bold text-slate-400">Turnover Date</p>
                    <p className="text-xs font-mono font-bold text-slate-900 mt-0.5">{selectedProject.date}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">Structural Scope Of Works</h4>
                <p className="text-xs text-slate-600 leading-relaxed mt-1.5">{selectedProject.description}</p>
              </div>

              {/* Other photos row if present */}
              {selectedProject.images && selectedProject.images.length > 1 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">Project Photos Gallery</h4>
                  <div className="flex space-x-2 overflow-x-auto py-1">
                    {selectedProject.images.map((img, ix) => (
                      <div key={ix} className="w-24 h-16 rounded-sm overflow-hidden border border-slate-200 shrink-0 shadow-sm">
                        <PlaceholderImage imageUrl={img} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <a
                  href="#home-contact"
                  onClick={() => setSelectedProject(null)}
                  className="w-full text-center inline-flex items-center justify-center px-4.5 py-3.5 text-xs font-sans font-bold uppercase tracking-widest text-white bg-primary hover:bg-primary-dark transition cursor-pointer rounded-sm"
                >
                  Consult on Similar Custom Layouts
                </a>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
