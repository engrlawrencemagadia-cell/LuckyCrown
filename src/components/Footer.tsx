/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { MapPin, Phone, Mail, Facebook, Clock, Building } from "lucide-react";
import BrandLogo from "./BrandLogo";

interface FooterProps {
  setActiveTab: (tab: string) => void;
  isAdminLoggedIn?: boolean;
}

export default function Footer({ setActiveTab, isAdminLoggedIn }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-primary-dark via-primary to-primary-dark text-zinc-300 border-t border-accent/20 font-sans" id="lcct-footer">
      
      {/* Primary Footer Links/Contact Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Column 1: Brand Info */}
          <div className="space-y-4" id="footer-col-brand">
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setActiveTab("home")}>
              <BrandLogo iconSize="w-7 h-7" withWhiteBg className="group-hover:scale-105" />
              <div className="flex flex-col leading-tight">
                <span className="font-sans font-bold text-lg tracking-wider text-white">
                  LUCKY <span className="text-accent">CROWN</span>
                </span>
                <span className="text-[8px] text-accent font-semibold tracking-wider uppercase font-mono">
                  DESIGNERS.ARCHITECTS.ENGINEERS.
                </span>
              </div>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed pt-2">
              Building the Future, One Project at a Time. Quality Construction Materials and Services You Can Trust. Founded in 2020.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://www.facebook.com/luckycrownconstruction"
                target="_blank"
                rel="noopener noreferrer"
                id="footer-fb-link"
                className="p-2 bg-primary-dark hover:bg-accent hover:text-white rounded-sm text-zinc-300 transition-all border border-white/10 hover:border-accent cursor-pointer"
                title="Follow Lucky Crown on Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Our Services Quick Tabs */}
          <div className="space-y-4" id="footer-col-services">
            <h3 className="text-white font-bold tracking-widest uppercase text-xs border-b border-white/15 pb-3">
              Core Expertise
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setActiveTab("services")}
                  className="hover:text-accent transition-all cursor-pointer flex items-center space-x-2 text-zinc-300"
                >
                  <span className="w-1.5 h-1.5 bg-accent rounded-sm" />
                  <span>Fit Out Construction</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("services")}
                  className="hover:text-accent transition-all cursor-pointer flex items-center space-x-2 text-zinc-300"
                >
                  <span className="w-1.5 h-1.5 bg-accent rounded-sm" />
                  <span>General Civil Works</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("services")}
                  className="hover:text-accent transition-all cursor-pointer flex items-center space-x-2 text-zinc-300"
                >
                  <span className="w-1.5 h-1.5 bg-accent rounded-sm" />
                  <span>Interior Concepts Design</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("products")}
                  className="hover:text-accent transition-all cursor-pointer flex items-center space-x-2 text-zinc-300"
                >
                  <span className="w-1.5 h-1.5 bg-accent rounded-sm" />
                  <span>Bespoke Furniture Supply</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Fast navigation link buttons */}
          <div className="space-y-4" id="footer-col-links">
            <h3 className="text-white font-bold tracking-widest uppercase text-xs border-b border-white/15 pb-3">
              Navigation
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <button onClick={() => setActiveTab("home")} className="text-left hover:text-accent cursor-pointer text-zinc-300">Home</button>
              <button onClick={() => setActiveTab("products")} className="text-left hover:text-accent cursor-pointer text-zinc-300">Products</button>
              <button onClick={() => setActiveTab("services")} className="text-left hover:text-accent cursor-pointer text-zinc-300">Services</button>
              <button onClick={() => setActiveTab("portfolio")} className="text-left hover:text-accent cursor-pointer text-zinc-300">Projects</button>
              <button onClick={() => setActiveTab("faqs")} className="text-left hover:text-accent cursor-pointer text-zinc-300">FAQs</button>
              {isAdminLoggedIn && (
                <button onClick={() => setActiveTab("admin")} className="text-left hover:text-accent cursor-pointer text-zinc-350 font-bold">Console</button>
              )}
            </div>
            
            <div className="pt-4 flex items-start space-x-2.5 text-[10px] text-zinc-300 font-sans">
              <Clock className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
              <div>
                <p className="font-bold uppercase tracking-wider text-white">Office Hours:</p>
                <p className="mt-1">Mon - Fri: 8:00 AM - 5:00 PM</p>
                <p>Sat - Sun: Closed</p>
              </div>
            </div>
          </div>

          {/* Column 4: Main Contact Information */}
          <div className="space-y-4" id="footer-col-contact">
            <h3 className="text-white font-bold tracking-widest uppercase text-xs border-b border-white/15 pb-3">
              Direct Contact
            </h3>
            <ul className="space-y-3 text-xs leading-normal">
              <li className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <span className="text-zinc-300">
                  1697 Benitez St., Malate,<br />Manila, Philippines, 1004
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-accent shrink-0" />
                <a href="tel:0286520983" className="hover:text-accent text-zinc-300 transition-all font-mono">02-8652-0983</a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-accent shrink-0" />
                <a href="mailto:luckycrownconstruction@gmail.com" className="hover:text-accent text-zinc-300 transition-all truncate font-mono">
                  luckycrownconstruction@gmail.com
                </a>
              </li>
              <li className="flex items-center space-x-3 text-[10px] text-zinc-400 font-sans">
                <Building className="w-4 h-4 text-accent shrink-0" />
                <span>SEC Registered Entity</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Copyright Disclaimer */}
      <div className="bg-primary-dark/80 border-t border-white/10 py-6" id="footer-copyright-banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-[10px] text-zinc-400 font-mono uppercase tracking-widest">
          <p>© {currentYear} Lucky Crown Construction & Trading.</p>
          <p className="mt-2 sm:mt-0">Malate, Manila, PH | Integrity • Professionalism • Quality</p>
        </div>
      </div>
    </footer>
  );
}
