"use client"
import * as THREE from 'three';
import React, { useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { useTheme } from 'next-themes';

// Simplified 3D Bar component with reduced complexity
const Bar3D = ({ position, height, color }: { position: [number, number, number]; height: number; color: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useEffect(() => {
    if (!meshRef.current) return;
    
    // Simple animation without complex calculations
    const mesh = meshRef.current;
    mesh.scale.y = 0;
    
    let animationFrameId: number;
    let startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / 800, 1);
      
      if (mesh) {
        // Linear animation to reduce performance cost
        mesh.scale.y = height * progress;
      }
      
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [height]);
  
  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.8, 1, 0.8]} />
      <meshStandardMaterial color={color} metalness={0.1} roughness={0.2} />
    </mesh>
  );
};

// Simplified text label
const Label3D = ({ position, text, color }: { position: [number, number, number]; text: string; color: string }) => {
  return (
    <Text
      position={position}
      color={color}
      fontSize={0.5}
      maxWidth={2}
      textAlign="center"
      anchorX="center"
      anchorY="middle"
    >
      {text}
    </Text>
  );
};

// Simplified line component
const Line = ({ points, color }: { points: [number, number, number][]; color: string; lineWidth: number }) => {
  return (
    <line>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array(points.flat()), 3]}
          count={points.length}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial attach="material" color={color} />
    </line>
  );
};

// Simpler 3D Bar Chart Component
export const BarChart3D = ({ data }: { data: any[] }) => {
  const { theme, resolvedTheme } = useTheme();
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Use resolved theme to handle system theme preference
  const currentTheme = resolvedTheme || theme || 'light';
  
  // Define colors based on theme - explicit values to avoid undefined issues
  const barColors = {
    suspect: currentTheme === 'dark' ? '#6366f1' : '#4f46e5',
    qualify: currentTheme === 'dark' ? '#10b981' : '#059669',
    won: currentTheme === 'dark' ? '#f59e0b' : '#d97706',
  };
  
  // Safety checks for data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-[400px] bg-gray-100 dark:bg-gray-800 rounded">
        <div className="text-center">
          <span role="img" aria-label="No data" className="text-5xl">📊</span>
          <p className="mt-4 text-gray-600 dark:text-gray-400">No data available to display</p>
        </div>
      </div>
    );
  }
  
  // Calculate max value for scaling (with safety checks)
  const suspectValues = data.map(d => d.Suspect || 0);
  const qualifyValues = data.map(d => d.Qualify || 0);
  const wonValues = data.map(d => d.Won || 0);
  
  const maxValue = Math.max(
    Math.max(...suspectValues),
    Math.max(...qualifyValues),
    Math.max(...wonValues),
    1 // Ensure we don't divide by zero
  ); 
  
  const scale = 3 / maxValue; // Lower scale for better performance
  
  // Handle WebGL errors
  const handleCreationError = () => {
    console.error("Failed to create WebGL context");
    setHasError(true);
  };

  const handleCreationSuccess = () => {
    console.log("WebGL context created successfully");
    setIsLoaded(true);
  };
  
  if (hasError) {
    return (
      <div className="flex items-center justify-center w-full h-[400px] bg-red-50 dark:bg-red-900/20 rounded">
        <div className="text-center">
          <span role="img" aria-label="Error" className="text-5xl">⚠️</span>
          <p className="mt-4 text-red-600 dark:text-red-400">
            Unable to load 3D chart. Your browser may not support WebGL.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full h-[400px] relative">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800 z-10">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mb-4"></div>
            <p>Loading 3D visualization...</p>
          </div>
        </div>
      )}
      
      <Canvas 
        camera={{ position: [8, 8, 8], fov: 45 }}
        gl={{ 
          preserveDrawingBuffer: true, 
          powerPreference: 'default',
          antialias: true,
          alpha: false // Prevent transparency issues
        }}
        onCreated={({gl, scene}) => {
          try {
            // Set background color based on theme
            const bgColor = currentTheme === 'dark' ? '#1f2937' : '#f9fafb';
            gl.setClearColor(bgColor, 1);
            scene.background = new THREE.Color(bgColor);
            handleCreationSuccess();
          } catch (error) {
            console.error("Error in Canvas onCreated:", error);
            handleCreationError();
          }
        }}
        onError={handleCreationError}
        style={{ visibility: isLoaded ? 'visible' : 'hidden' }}
      >
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        
        {/* Reduced number of grid lines */}
        <gridHelper args={[10, 10]} />
        
        {/* Render bars - limit data to first 5 items for better performance */}
        {data.slice(0, 5).map((item, index) => {
          const spacing = 2;
          const xPos = (index - Math.min(data.length, 5) / 2) * spacing;
          
          return (
            <group key={index} position={[xPos, 0, 0]}>
              <Bar3D 
                position={[-0.9, (item.Suspect * scale) / 2, 0]}
                height={item.Suspect * scale} 
                color={barColors.suspect} 
              />
              
              <Bar3D 
                position={[0, (item.Qualify * scale) / 2, 0]}
                height={item.Qualify * scale} 
                color={barColors.qualify} 
              />
              
              <Bar3D 
                position={[0.9, (item.Won * scale) / 2, 0]}
                height={item.Won * scale} 
                color={barColors.won} 
              />
              
              <Label3D 
                position={[0, -0.5, 0]} 
                text={item.Territory} 
                color={currentTheme === 'dark' ? '#ffffff' : '#000000'} 
              />
            </group>
          );
        })}
        
        {/* Simplified legend */}
        <group position={[5, 3, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.4, 0.4, 0.4]} />
            <meshStandardMaterial color={barColors.suspect} />
          </mesh>
          <Label3D position={[1.2, 0, 0]} text="Suspect" color={currentTheme === 'dark' ? '#ffffff' : '#000000'} />
          
          <mesh position={[0, -0.8, 0]}>
            <boxGeometry args={[0.4, 0.4, 0.4]} />
            <meshStandardMaterial color={barColors.qualify} />
          </mesh>
          <Label3D position={[1.2, -0.8, 0]} text="Qualify" color={currentTheme === 'dark' ? '#ffffff' : '#000000'} />
          
          <mesh position={[0, -1.6, 0]}>
            <boxGeometry args={[0.4, 0.4, 0.4]} />
            <meshStandardMaterial color={barColors.won} />
          </mesh>
          <Label3D position={[1.2, -1.6, 0]} text="Won" color={currentTheme === 'dark' ? '#ffffff' : '#000000'} />
        </group>
        
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          dampingFactor={0.1}
          minDistance={5}
          maxDistance={20}
        />
      </Canvas>
    </div>
  );
};

export default BarChart3D;