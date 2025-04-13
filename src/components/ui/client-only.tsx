'use client';
import { useState, useEffect, ReactNode } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
  requiresWebGL?: boolean;
  fallback?: ReactNode;
}

const ClientOnly: React.FC<ClientOnlyProps> = ({
  children,
  requiresWebGL = false,
  fallback = null
}) => {
  const [hasMounted, setHasMounted] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    setHasMounted(true);
    
    // Check WebGL support if required
    if (requiresWebGL) {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        setHasWebGL(!!gl);
      } catch (e) {
        setHasWebGL(false);
        console.error('WebGL not supported:', e);
      }
    }
  }, [requiresWebGL]);

  if (!hasMounted || (requiresWebGL && !hasWebGL)) {
    return fallback || (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          {requiresWebGL && !hasWebGL ? (
            <div>
              <p className="text-red-500">WebGL is not supported in your browser</p>
              <p className="text-sm text-gray-500">Required for 3D visualizations</p>
            </div>
          ) : (
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ClientOnly;