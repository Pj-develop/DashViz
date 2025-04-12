"use client"

import { useEffect, useState } from "react"

export default function ClientOnly({ 
  children,
  fallback = null,
  requiresWebGL = false
}: { 
  children: React.ReactNode,
  fallback?: React.ReactNode,
  requiresWebGL?: boolean
}) {
  const [hasMounted, setHasMounted] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(false);
  
  useEffect(() => {
    setHasMounted(true);
    
    if (requiresWebGL) {
      // Check for WebGL support
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || 
                  canvas.getContext('experimental-webgl');
        setHasWebGL(!!gl);
      } catch (e) {
        setHasWebGL(false);
      }
    }
  }, [requiresWebGL]);

  if (!hasMounted) {
    return <>{fallback}</>;
  }
  
  if (requiresWebGL && !hasWebGL) {
    return (
      <div className="w-full h-[400px] flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
        <span role="img" aria-label="Warning" className="text-5xl mb-4">⚠️</span>
        <h3 className="text-lg font-medium mb-2">WebGL Not Available</h3>
        <p className="text-center text-gray-600 dark:text-gray-400">
          Your browser doesn't support WebGL, which is required for 3D visualizations.
          <br />
          Please try using a modern browser like Chrome, Firefox, or Edge.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}