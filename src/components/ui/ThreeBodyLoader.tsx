
"use client";

import React from 'react';

/**
 * Three-Body Orbital Loader
 * High-fidelity CSS animation matching the Noir aesthetic.
 */
export default function ThreeBodyLoader() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="three-body">
        <div className="three-body__dot"></div>
        <div className="three-body__dot"></div>
        <div className="three-body__dot"></div>
      </div>
    </div>
  );
}
