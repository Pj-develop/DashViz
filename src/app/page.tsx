'use client';
import * as THREE from 'three';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Chart } from "@/components/ui/chart";
import { Search, BarChart3, LineChart } from "lucide-react";
import { TextField, InputAdornment } from '@mui/material';
import GenieAssistant from '@/components/ui/genie-assistant';
import { useTheme } from 'next-themes';
import ClientOnly from "@/components/ui/client-only";
import { FunnelChart } from "@/components/ui/funnel-chart";

// Original data structure for backward compatibility
interface TerritoryItem {
  Territory: string;
  Suspect: number;
  Qualify: number;
  Won: number;
  Lost: number;
  qualifyPercentage: string;
  wonPercentageRounded: number;
  // Optional fields from new data structure
  Demo?: number;
  Proposal?: number;
  Negotiate?: number;
}

// New data structure that matches your JSON
interface FunnelItem {
  label: string;
  acv: number;
  count: number;
  diffRate: number;
  diffacvRate: number;
  percentageFormatted: string;
  diffRateFormatted: string;
  status: "positive" | "neutral" | "negative";
}

export default function DashboardPage() {
  const [territoriesData, setTerritoriesData] = useState<TerritoryItem[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredTerritoriesData, setFilteredTerritoriesData] = useState<TerritoryItem[]>([]);
  const [filteredFunnelData, setFilteredFunnelData] = useState<FunnelItem[]>([]);
  const [activeChart, setActiveChart] = useState<'3d-viz' | 'funnel'>('funnel');
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
  const { theme, setTheme } = useTheme();
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/data');
        
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.status}`);
        }
        
        const jsonData = await response.json();
        
        setTerritoriesData(jsonData.territoriesData || []);
        setFilteredTerritoriesData(jsonData.territoriesData || []);
        
        setFunnelData(jsonData.funnelData || []);
        setFilteredFunnelData(jsonData.funnelData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setTerritoriesData([]);
        setFilteredTerritoriesData([]);
        setFunnelData([]);
        setFilteredFunnelData([]);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };

    fetchData();
    
    // Set theme to a softer white theme
    if (theme === 'light') {
      document.documentElement.classList.add('soft-light');
    }
    
    // For 3D visualization preloading
    if (isFirstLoad) {
      const preload3D = async () => {
        // Force preload of 3D visualization in background
        const module = await import('@/components/ui/bar-chart-3d');
        setTimeout(() => setIsFirstLoad(false), 2000);
      };
      preload3D();
    }
    
    // Add smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
    
    return () => {
      document.documentElement.style.scrollBehavior = '';
      document.documentElement.classList.remove('soft-light');
    };
  }, [theme, isFirstLoad]);
  
  useEffect(() => {
    if (territoriesData.length > 0) {
      const results = territoriesData.filter(item =>
        item.Territory.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTerritoriesData(results);
    }
    
    if (funnelData.length > 0) {
      const results = funnelData.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFunnelData(results);
    }
  }, [searchQuery, territoriesData, funnelData]);

  // Add a component to render the funnel data
  const renderFunnelData = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 gap-4">
        {filteredFunnelData.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className={`border-l-4 ${
              item.status === 'positive' ? 'border-l-green-500' :
              item.status === 'negative' ? 'border-l-red-500' : 'border-l-yellow-400'
            }`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">{item.label}</h3>
                    <p className="text-gray-500 dark:text-gray-400">Count: {item.count}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{(item.diffacvRate * 100).toFixed(1)}%</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Conversion Rate: {item.diffRateFormatted}
                    </p>
                  </div>
                </div>
                <div className="mt-2 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div 
                    className={`h-full ${
                      item.status === 'positive' ? 'bg-green-500' :
                      item.status === 'negative' ? 'bg-red-500' : 'bg-yellow-400'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.diffacvRate * 100}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                  />
                </div>
                <p className="mt-2 text-sm">
                  ACV: <span className="font-semibold">${item.acv.toLocaleString()}</span>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  };

  // Handle navigation from genie
  const handleGenieNavigation = (destination: string) => {
    if (destination === 'dashboard') {
      alert('Welcome to the dashboard! How can I help you?');
    } else if (destination === 'funnel') {
      setActiveChart('funnel');
    } else if (destination === '3d-viz') {
      setActiveChart('3d-viz');
    }
  };
  
  // For browser functions
  const handleBrowserFeature = (feature: string) => {
    switch(feature) {
      case 'zoom-in':
        document.body.style.zoom = "120%"; // Note: only works in some browsers
        break;
      case 'zoom-out':
        document.body.style.zoom = "90%"; // Note: only works in some browsers
        break;
      case 'reader-mode':
        // Simulate reader mode by applying styles
        document.body.classList.toggle('reader-mode');
        break;
      case 'print':
        window.print();
        break;
      case 'fullscreen':
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(err => {
            alert(`Error attempting to enable fullscreen: ${err.message}`);
          });
        } else {
          document.exitFullscreen();
        }
        break;
      default:
        console.log('Feature not implemented');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 pb-8">
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sales Performance Dashboard</h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Interactive visualization of sales pipeline data
            </p>
          </motion.div>
        </div>

        {/* Search */}
        <motion.div 
          className="w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <TextField
            fullWidth
            placeholder="Search..."
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white dark:bg-gray-800 rounded-lg"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search className="text-gray-400" />
                </InputAdornment>
              ),
            }}
          />
        </motion.div>

        {/* Chart Selection Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Tabs defaultValue="funnel" className="w-full" onValueChange={(value) => setActiveChart(value as any)}>
            <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
              <TabsTrigger value="funnel" className="flex items-center space-x-2">
                <LineChart size={16} />
                <span>Funnel</span>
              </TabsTrigger>
              <TabsTrigger value="3d-viz" className="flex items-center space-x-2">
                <BarChart3 size={16} />
                <span>3D Visualization</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Funnel View Tab */}
            <TabsContent value="funnel" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Pipeline Funnel</CardTitle>
                  <CardDescription>
                    Visualize your sales funnel from Suspect to Won
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-[400px] w-full" />
                  ) : (
                    <div>
                      <FunnelChart data={filteredFunnelData} />
                      {renderFunnelData()}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* 3D Visualization */}
            <TabsContent value="3d-viz" className="mt-6">
              {loading ? (
                <Card>
                  <CardHeader>
                    <Skeleton className="h-8 w-1/3" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-[400px] w-full" />
                  </CardContent>
                </Card>
              ) : (
                <ClientOnly 
                  requiresWebGL={true}
                  fallback={
                    <div className="h-[400px] flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
                    </div>
                  }
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Pipeline Performance - 3D Visualization</CardTitle>
                      <CardDescription>
                        Interactive 3D view of pipeline metrics
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Chart 
                        data={filteredTerritoriesData} 
                        type="3d-bar" 
                        title="Pipeline Performance - 3D Visualization"
                      />
                    </CardContent>
                  </Card>
                </ClientOnly>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
      
      <ClientOnly>
        <GenieAssistant 
          onNavigate={handleGenieNavigation}
          onBrowserFeature={handleBrowserFeature}
        />
      </ClientOnly>
    </div>
  );
}

