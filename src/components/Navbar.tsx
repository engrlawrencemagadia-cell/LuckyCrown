/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Menu, X, ShieldAlert, ChevronRight } from "lucide-react";
import BrandLogo from "./BrandLogo";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdminLoggedIn: boolean;
}

export default function Navbar({ activeTab, setActiveTab, isAdminLoggedIn }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: "home", label: "Home" },
    { id: "products", label: "Products" },
    { id: "services", label: "Services" },
    { id: "portfolio", label: "Projects" },
    { id: "faqs", label: "FAQs" },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsMenuOpen(false);
  };

  return (
    <div className="sticky top-0 z-50" id="lcct-nav-container">
      <nav className="bg-gradient-to-r from-primary to-primary-dark text-white h-20 flex items-center justify-between px-4 sm:px-10 border-b border-accent/20 shrink-0 shadow-md" id="lcct-main-nav">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo Brand Brand */}
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => handleTabClick("home")}
          id="nav-brand-logo"
        >
          <BrandLogo iconSize="w-8 h-8" withWhiteBg className="group-hover:scale-105" />
          <div className="flex flex-col leading-tight">
            <span className="font-sans font-bold tracking-wider text-base uppercase text-white">
              LUCKY <span className="text-accent">CROWN</span>
            </span>
            <span className="text-[9px] text-zinc-300 font-normal tracking-wide uppercase">
              CONSTRUCTION AND TRADING
            </span>
            <span className="text-[8px] text-accent font-semibold tracking-wider uppercase mt-0.5 font-mono">
              DESIGNERS.ARCHITECTS.ENGINEERS.
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-6 items-center text-xs font-semibold tracking-wider font-sans" id="nav-desktop-menu">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                id={`nav-item-${item.id}`}
                className={`transition-all cursor-pointer py-1 px-1 border-b-2 hover:text-accent font-medium ${
                  isActive
                    ? "text-accent border-accent"
                    : "text-zinc-100 border-transparent hover:border-accent"
                }`}
              >
                {item.label}
              </button>
            );
          })}

          {/* Admin Console Tab Selector Link */}
          {isAdminLoggedIn && (
            <button
              onClick={() => handleTabClick("admin")}
              id="nav-item-admin"
              className={`flex items-center space-x-2 px-3 py-1.5 border rounded-sm text-[10px] font-bold tracking-widest uppercase transition-all cursor-pointer ${
                activeTab === "admin"
                  ? "bg-accent text-white border-accent"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/25"
              }`}
            >
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
              <span>Console</span>
            </button>
          )}
        </div>

        {/* Mobile hamburger toggle icon button */}
        <div className="flex md:hidden" id="nav-mobile-toggle">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            id="menu-toggle-btn"
            className="inline-flex items-center justify-center p-2 rounded-sm text-zinc-300 hover:text-white focus:outline-none transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>
    </nav>

      {/* Mobile Drawer Navigation Panel */}
      {isMenuOpen && (
        <div className="md:hidden bg-primary-dark border-b border-accent/20 px-4 pt-2 pb-6 space-y-2 animate-fadeIn" id="nav-mobile-drawer">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                id={`mobile-nav-item-${item.id}`}
                className={`w-full text-left px-4 py-3 rounded-sm text-sm font-medium tracking-wide flex items-center justify-between ${
                  isActive
                    ? "bg-accent/25 text-accent border-l-4 border-accent"
                    : "text-zinc-100 hover:text-white hover:bg-primary"
                }`}
              >
                <span>{item.label}</span>
                <ChevronRight className={`w-4 h-4 opacity-50 ${isActive ? "text-accent" : "text-zinc-400"}`} />
              </button>
            );
          })}
          
          {isAdminLoggedIn && (
            <button
              onClick={() => handleTabClick("admin")}
              id="mobile-nav-item-admin"
              className={`w-full mt-4 flex items-center justify-center space-x-2 px-4 py-3 rounded-sm text-center text-xs font-bold uppercase tracking-wider border ${
                activeTab === "admin"
                  ? "bg-accent text-white border-accent"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              }`}
            >
              <span>Manage Admin Console</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
