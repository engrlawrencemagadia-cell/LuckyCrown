/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Navbar from "./components/Navbar.tsx";
import Footer from "./components/Footer.tsx";
import PublicHome from "./components/PublicHome.tsx";
import PublicProducts from "./components/PublicProducts.tsx";
import PublicServices from "./components/PublicServices.tsx";
import PublicPortfolio from "./components/PublicPortfolio.tsx";
import PublicFAQs from "./components/PublicFAQs.tsx";
import AdminDashboard from "./components/AdminDashboard.tsx";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(
    Boolean(localStorage.getItem("lcct_admin_token"))
  );

  // Sync scroll positions back to the top when navigating between sections
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col justify-between font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Dynamic Header Component */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isAdminLoggedIn={isAdminLoggedIn} 
      />

      {/* Primary Sub-View Dynamic Content Router */}
      <main className="flex-grow relative overflow-hidden" id="lcct-app-viewport">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="w-full h-full"
          >
            {activeTab === "home" && (
              <PublicHome 
                setActiveTab={setActiveTab} 
                onPortalReveal={() => {
                  setActiveTab("admin");
                }}
              />
            )}
            
            {activeTab === "products" && (
              <PublicProducts />
            )}
            
            {activeTab === "services" && (
              <PublicServices />
            )}
            
            {activeTab === "portfolio" && (
              <PublicPortfolio />
            )}
            
            {activeTab === "faqs" && (
              <PublicFAQs />
            )}
            
            {activeTab === "admin" && (
              <AdminDashboard onLoginStateChange={setIsAdminLoggedIn} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Dynamic Brand Footer - Hidden only when actively on Admin Dashboard management view to give full-width controls space */}
      {activeTab !== "admin" && (
        <Footer setActiveTab={setActiveTab} isAdminLoggedIn={isAdminLoggedIn} />
      )}

    </div>
  );
}

