/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface BrandLogoProps {
  className?: string; // Additional classes for the container
  iconSize?: string;  // Class for the SVG size (e.g. "w-8 h-8")
  withWhiteBg?: boolean; // Whether to wrap it in a rounded-sm white background
}

export default function BrandLogo({ className = "", iconSize = "w-8 h-8", withWhiteBg = false }: BrandLogoProps) {
  // Render the uploaded user logo pointing to the static public folder path
  const logoSrc = "/images/logo.jpg";

  const logoElement = (
    <img
      src={logoSrc}
      alt="Lucky Crown Logo"
      className={`${iconSize} object-contain rounded-sm select-none`}
      referrerPolicy="no-referrer"
      onError={(e) => {
        // Fallback gracefully in case of loading issues
        console.warn("Logo failed to load, keeping placeholder style");
      }}
    />
  );

  if (withWhiteBg) {
    return (
      <div className={`p-0.5 bg-white rounded-sm flex items-center justify-center transform transition-transform duration-300 ${className}`}>
        {logoElement}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {logoElement}
    </div>
  );
}
