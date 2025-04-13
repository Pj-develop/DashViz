'use client';
import * as THREE from 'three';
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Chart } from "@/components/ui/chart";
import { 
  Search, 
  BarChart3, 
  LineChart, 
  Table2, 
  SortDesc, 
  SortAsc, 
  Clock, 
  RefreshCw,
  Download,
  Share2
} from "lucide-react"; 
import { TextField, InputAdornment, IconButton, Tooltip } from '@mui/material';
import GenieAssistant from '@/components/ui/genie-assistant';
import { useTheme } from 'next-themes';
import ClientOnly from "@/components/ui/client-only";
import { FunnelChart } from "@/components/ui/funnel-chart";
import dynamic from 'next/dynamic';
import { toast } from '@/hooks/use-toast';

// Dynamically import TabularViewTab to prevent SSR issues with D3
const TabularViewTab = dynamic(
  () => import('./tabular/page'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    )
  }
);

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

/**
 * Main Dashboard Page Component
 * 
 * This component displays a comprehensive sales performance dashboard
 * with multiple visualization options including tabular view, funnel charts,
 * and 3D visualizations. It features responsive design, theme support,
 * and an AI assistant (Genie) for enhanced user interaction.
 */
export default function DashboardPage() {
  // State for data management
  const [territoriesData, setTerritoriesData] = useState<TerritoryItem[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filtering state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [filteredTerritoriesData, setFilteredTerritoriesData] = useState<TerritoryItem[]>([]);
  const [filteredFunnelData, setFilteredFunnelData] = useState<FunnelItem[]>([]);
  
  // UI and visualization state
  const [activeChart, setActiveChart] = useState<'3d-viz' | 'funnel' | 'tabular'>('tabular');
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
  const [sortConfig, setSortConfig] = useState<{field: string, direction: 'asc' | 'desc'} | null>(null);
  
  // Theme management
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // Responsive design helpers
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });
  
  const is4K = windowSize.width >= 3840;
  const isMobile = windowSize.width <= 768;
  
  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    // Set initial size
    handleResize();
    
    // Add event listener for window resize
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /**
   * Fetch dashboard data from API
   * Includes comprehensive error handling and loading states
   */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/data');
        
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.status}`);
        }
        
        const jsonData = await response.json();
        
        if (!jsonData || (!jsonData.territoriesData && !jsonData.funnelData)) {
          throw new Error('Invalid data received from server');
        }
        
        setTerritoriesData(jsonData.territoriesData || []);
        setFilteredTerritoriesData(jsonData.territoriesData || []);
        
        setFunnelData(jsonData.funnelData || []);
        setFilteredFunnelData(jsonData.funnelData || []);
        
        // Success toast notification
        toast({
          title: "Data loaded successfully",
          description: `Loaded ${jsonData.funnelData?.length || 0} pipeline stages and ${jsonData.territoriesData?.length || 0} territories.`,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        setError(errorMessage);
        setTerritoriesData([]);
        setFilteredTerritoriesData([]);
        setFunnelData([]);
        setFilteredFunnelData([]);
        
        // Error toast notification
        toast({
          title: "Failed to load data",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        // Add slight delay so loading state is visible
        setTimeout(() => {
          setLoading(false);
        }, 800);
      }
    };

    fetchData();
    
    // Set theme to a softer white theme
    if (theme === 'light') {
      document.documentElement.classList.add('soft-light');
    }
    
    // For 3D visualization preloading - improves user experience
    if (isFirstLoad) {
      const preload3D = async () => {
        try {
          // Force preload of 3D visualization in background
          const module = await import('@/components/ui/bar-chart-3d');
          setTimeout(() => setIsFirstLoad(false), 2000);
        } catch (error) {
          console.warn("Failed to preload 3D components:", error);
          setIsFirstLoad(false);
        }
      };
      preload3D();
    }
    
    // Add smooth scrolling for better UX
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Cleanup function
    return () => {
      document.documentElement.style.scrollBehavior = '';
      document.documentElement.classList.remove('soft-light');
    };
  }, [theme, isFirstLoad]);
  
  /**
   * Search and filtering effect
   * Updates filtered data whenever search query or sort config changes
   */
  useEffect(() => {
    // Add search to history if not empty and not already in history
    if (searchQuery && !searchHistory.includes(searchQuery)) {
      setSearchHistory(prev => [searchQuery, ...prev.slice(0, 4)]); // Keep last 5 searches
    }
    
    // Filter territories data based on search
    if (territoriesData.length > 0) {
      let results = territoriesData.filter(item =>
        item.Territory.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      // Apply sorting if configured
      if (sortConfig) {
        results = [...results].sort((a: any, b: any) => {
          if (a[sortConfig.field] < b[sortConfig.field]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (a[sortConfig.field] > b[sortConfig.field]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        });
      }
      
      setFilteredTerritoriesData(results);
    }
    
    // Filter funnel data based on search
    if (funnelData.length > 0) {
      let results = funnelData.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      // Apply sorting if configured
      if (sortConfig) {
        results = [...results].sort((a: any, b: any) => {
          const fieldName = sortConfig.field === 'label' ? 'label' : 
                           sortConfig.field === 'count' ? 'count' : 
                           sortConfig.field === 'acv' ? 'acv' : 'diffRate';
                           
          if (a[fieldName] < b[fieldName]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (a[fieldName] > b[fieldName]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        });
      }
      
      setFilteredFunnelData(results);
    }
  }, [searchQuery, territoriesData, funnelData, sortConfig]);

  /**
   * Sort data by specified field
   * Toggles sorting direction if the same field is clicked again
   */
  const handleSort = (field: string) => {
    setSortConfig(current => {
      if (current?.field === field) {
        if (current.direction === 'asc') {
          return { field, direction: 'desc' };
        }
        return null; // Clear sorting if already desc
      }
      return { field, direction: 'asc' };
    });
    
    // Show toast notification for sorting
    toast({
      title: `Sorted by ${field}`,
      description: sortConfig?.field === field && sortConfig?.direction === 'asc' ? 
        `${field} sorted in descending order` : 
        `${field} sorted in ascending order`,
      duration: 2000,
    });
  };

  /**
   * Render funnel data with animations and styling
   */
  const renderFunnelData = useMemo(() => {
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
  }, [filteredFunnelData, loading]);

  /**
   * Enhanced Genie navigation with more useful functions
   */
  const handleGenieNavigation = (destination: string) => {
    switch(destination) {
      case 'dashboard':
        toast({
          title: "Dashboard Assistant",
          description: "How can I help you analyze your sales pipeline today?",
        });
        break;
      case 'funnel':
        setActiveChart('funnel');
        toast({
          title: "Funnel View Activated",
          description: "Showing sales pipeline as a funnel visualization",
        });
        break;
      case '3d-viz':
        setActiveChart('3d-viz');
        toast({
          title: "3D Visualization Activated",
          description: "Showing the interactive 3D view of pipeline metrics",
        });
        break;
      case 'tabular':
        setActiveChart('tabular');
        toast({
          title: "Tabular View Activated",
          description: "Showing detailed tabular data with analytics",
        });
        break;
      case 'export-data':
        handleExportData();
        break;
      case 'refresh-data':
        handleRefreshData();
        break;
      case 'sort-by-stage':
        handleSort('label');
        break;
      case 'sort-by-count':
        handleSort('count');
        break;
      case 'sort-by-acv':
        handleSort('acv');
        break;
      case 'clear-search':
        setSearchQuery('');
        setSortConfig(null);
        toast({
          title: "Filters Cleared",
          description: "Search query and sorting have been reset",
        });
        break;
      case 'toggle-theme':
        setTheme(theme === 'dark' ? 'light' : 'dark');
        toast({
          title: "Theme Changed",
          description: `Dashboard theme set to ${theme === 'dark' ? 'light' : 'dark'} mode`,
        });
        break;
      case 'help':
        // Create an array of commands the Genie understands
        const commands = [
          "View funnel chart", "Show 3D visualization", "Show tabular view",
          "Export data", "Refresh data", "Sort by stage", "Sort by count",
          "Sort by ACV", "Clear search", "Toggle theme", "Help"
        ];
        
        toast({
          title: "Available Commands",
          description: (
            <div className="max-h-[300px] overflow-y-auto">
              <p className="mb-2">You can ask me to:</p>
              <ul className="list-disc pl-5">
                {commands.map((cmd, i) => (
                  <li key={i}>{cmd}</li>
                ))}
              </ul>
            </div>
          ),
          duration: 8000,
        });
        break;
      default:
        toast({
          title: "Command not recognized",
          description: "Try asking for 'help' to see available commands",
          variant: "destructive",
        });
    }
  };

  /**
   * Handle data export functionality
   */
  const handleExportData = () => {
    try {
      // Create a CSV string from the funnel data
      const headers = ["Stage", "Count", "ACV", "Conversion Rate", "Status"];
      const csvRows = [
        headers.join(','),
        ...filteredFunnelData.map(item => [
          item.label,
          item.count,
          item.acv,
          (item.diffRate * 100).toFixed(2) + '%',
          item.status
        ].join(','))
      ];
      
      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      
      // Create a download link and trigger it
      const a = document.createElement('a');
      a.download = `sales-pipeline-data-${new Date().toISOString().slice(0, 10)}.csv`;
      a.href = url;
      a.click();
      
      toast({
        title: "Export Successful",
        description: "Sales pipeline data has been exported as CSV",
      });
    } catch (err) {
      console.error("Export failed:", err);
      toast({
        title: "Export Failed",
        description: err instanceof Error ? err.message : "Could not export data",
        variant: "destructive",
      });
    }
  };

  /**
   * Handle data refresh functionality
   */
  const handleRefreshData = () => {
    setLoading(true);
    setError(null);
    
    // Reuse the data fetch logic from useEffect
    fetch('/api/data')
      .then(response => {
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return response.json();
      })
      .then(jsonData => {
        setTerritoriesData(jsonData.territoriesData || []);
        setFilteredTerritoriesData(jsonData.territoriesData || []);
        setFunnelData(jsonData.funnelData || []);
        setFilteredFunnelData(jsonData.funnelData || []);
        
        toast({
          title: "Data Refreshed",
          description: "Latest pipeline data has been loaded",
        });
      })
      .catch(err => {
        setError(err.message);
        toast({
          title: "Refresh Failed",
          description: err.message,
          variant: "destructive",
        });
      })
      .finally(() => {
        setTimeout(() => setLoading(false), 800);
      });
  };
  
  // For browser functions
  const handleBrowserFeature = (feature: string) => {
    try {
      switch(feature) {
        case 'zoom-in':
          // Use CSS transform for better compatibility
          const currentScale = document.body.style.transform ? 
            parseFloat(document.body.style.transform.replace('scale(', '').replace(')', '')) || 1 : 1;
          document.body.style.transform = `scale(${currentScale * 1.1})`;
          toast({ title: "Zoomed in", duration: 1000 });
          break;
          
        case 'zoom-out':
          const currentOutScale = document.body.style.transform ? 
            parseFloat(document.body.style.transform.replace('scale(', '').replace(')', '')) || 1 : 1;
          document.body.style.transform = `scale(${currentOutScale * 0.9})`;
          toast({ title: "Zoomed out", duration: 1000 });
          break;
          
        case 'reader-mode':
          document.body.classList.toggle('reader-mode');
          toast({ 
            title: document.body.classList.contains('reader-mode') ? 
              "Reader mode enabled" : "Reader mode disabled",
            duration: 2000 
          });
          break;
          
        case 'print':
          window.print();
          break;
          
        case 'fullscreen':
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
              toast({
                title: "Fullscreen Failed",
                description: err.message,
                variant: "destructive",
              });
            });
          } else {
            document.exitFullscreen();
          }
          break;
          
        case 'share':
          if (navigator.share) {
            navigator.share({
              title: 'Sales Performance Dashboard',
              text: 'Check out our sales pipeline metrics',
              url: window.location.href,
            }).catch(err => console.log('Sharing failed:', err));
          } else {
            // Fallback - copy URL to clipboard
            navigator.clipboard.writeText(window.location.href);
            toast({ 
              title: "Link copied to clipboard",
              description: "Share this URL with others to view this dashboard"
            });
          }
          break;
          
        default:
          console.log('Feature not implemented');
      }
    } catch (err) {
      console.error("Browser feature error:", err);
      toast({
        title: "Feature Failed",
        description: err instanceof Error ? err.message : "Browser function could not be executed",
        variant: "destructive",
      });
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 pb-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mb-4 mx-auto"></div>
          <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300">Loading dashboard data...</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Please wait while we prepare your visualizations</p>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 pb-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="text-red-500 text-5xl mb-4 flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <div className="flex justify-center">
            <Button onClick={handleRefreshData} className="flex items-center">
              <RefreshCw size={16} className="mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 pb-8 ${is4K ? 'text-lg' : ''}`}>
      <motion.div 
        className={`mx-auto px-4 sm:px-6 lg:px-8 space-y-8 ${is4K ? 'max-w-[80%]' : 'max-w-7xl'}`}
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
            <h1 className={`text-3xl ${is4K ? 'text-5xl' : ''} font-bold text-gray-900 dark:text-white`}>Sales Performance Dashboard</h1>
            <p className={`mt-1 text-gray-500 dark:text-gray-400 ${is4K ? 'text-xl' : ''}`}>
              Interactive visualization of sales pipeline data
            </p>
          </motion.div>
          
          {/* Action buttons for desktop */}
          {!isMobile && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex space-x-2 mt-4 md:mt-0"
            >
              <Tooltip title="Refresh data">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefreshData}
                  className="flex items-center"
                >
                  <RefreshCw size={16} className="mr-2" />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              </Tooltip>
              
              <Tooltip title="Export to CSV">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExportData}
                  className="flex items-center"
                >
                  <Download size={16} className="mr-2" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </Tooltip>
              
              <Tooltip title="Share dashboard">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBrowserFeature('share')}
                  className="flex items-center"
                >
                  <Share2 size={16} className="mr-2" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
              </Tooltip>
            </motion.div>
          )}
        </div>

        {/* Search and sort controls */}
        <motion.div 
          className="w-full flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* Enhanced search with suggestions */}
          <div className="relative flex-grow">
            <TextField
              fullWidth
              placeholder="Search pipeline stages or territories..."
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white dark:bg-gray-800 rounded-lg"
              sx={{
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                  },
                  '&:hover fieldset': {
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                  },
                },
                '& .MuiInputBase-input': {
                  color: isDarkMode ? '#e0e0e0' : 'inherit',
                },
                '& .MuiInputLabel-root': {
                  color: isDarkMode ? '#e0e0e0' : 'inherit',
                },
                '& .MuiInputAdornment-root': {
                  color: isDarkMode ? '#aaaaaa' : 'inherit',
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton 
                      size="small" 
                      onClick={() => setSearchQuery('')}
                      sx={{ color: isDarkMode ? '#aaaaaa' : 'inherit' }}
                    >
                      ✕
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            {/* Search history suggestions */}
            {searchHistory.length > 0 && !searchQuery && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700">
                <div className="p-2 flex items-center text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <Clock size={14} className="mr-2" />
                  Recent searches
                </div>
                <div>
                  {searchHistory.map((term, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      onClick={() => setSearchQuery(term)}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Sorting options */}
          <div className="flex gap-2">
            <Button 
              variant={sortConfig?.field === 'label' ? 'default' : 'outline'}
              size="sm" 
              onClick={() => handleSort('label')}
              className="flex items-center"
            >
              {sortConfig?.field === 'label' && (
                sortConfig.direction === 'asc' ? <SortAsc size={16} className="mr-2" /> : <SortDesc size={16} className="mr-2" />
              )}
              Stage
            </Button>
            <Button 
              variant={sortConfig?.field === 'count' ? 'default' : 'outline'}
              size="sm" 
              onClick={() => handleSort('count')}
              className="flex items-center"
            >
              {sortConfig?.field === 'count' && (
                sortConfig.direction === 'asc' ? <SortAsc size={16} className="mr-2" /> : <SortDesc size={16} className="mr-2" />
              )}
              Count
            </Button>
            {!isMobile && (
              <Button 
                variant={sortConfig?.field === 'acv' ? 'default' : 'outline'}
                size="sm" 
                onClick={() => handleSort('acv')}
                className="flex items-center"
              >
                {sortConfig?.field === 'acv' && (
                  sortConfig.direction === 'asc' ? <SortAsc size={16} className="mr-2" /> : <SortDesc size={16} className="mr-2" />
                )}
                ACV
              </Button>
            )}
          </div>
        </motion.div>

        {/* Chart Selection Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Tabs defaultValue="tabular" className="w-full" onValueChange={(value) => setActiveChart(value as any)}>
            <TabsList className={`grid ${isMobile ? 'grid-cols-3' : 'grid-cols-3'} w-full max-w-md mx-auto`}>
              <TabsTrigger value="tabular" className="flex items-center space-x-2">
                <Table2 size={is4K ? 24 : 16} />
                <span className={is4K ? 'text-lg' : ''}>Tabular</span>
              </TabsTrigger>
              <TabsTrigger value="funnel" className="flex items-center space-x-2">
                <LineChart size={is4K ? 24 : 16} />
                <span className={is4K ? 'text-lg' : ''}>Funnel</span>
              </TabsTrigger>
              <TabsTrigger value="3d-viz" className="flex items-center space-x-2">
                <BarChart3 size={is4K ? 24 : 16} />
                <span className={is4K ? 'text-lg' : ''}>3D Visualization</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Tabular View Tab - New default tab */}
            <TabsContent value="tabular" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className={is4K ? 'text-3xl' : ''}>Pipeline Performance - Tabular View</CardTitle>
                  <CardDescription className={is4K ? 'text-xl' : ''}>
                    Detailed tabular view showing pipeline metrics with double-sided bar charts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-[600px] w-full" />
                  ) : (
                    <TabularViewTab />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Funnel View Tab */}
            <TabsContent value="funnel" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className={is4K ? 'text-3xl' : ''}>Sales Pipeline Funnel</CardTitle>
                  <CardDescription className={is4K ? 'text-xl' : ''}>
                    Visualize your sales funnel from Suspect to Won
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-[400px] w-full" />
                  ) : (
                    <div>
                      <FunnelChart data={filteredFunnelData} />
                      {renderFunnelData}
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
                    <div className="h-[400px] flex flex-col items-center justify-center gap-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
                      <p className="text-gray-500 dark:text-gray-400">Loading 3D visualization...</p>
                    </div>
                  }
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className={is4K ? 'text-3xl' : ''}>Pipeline Performance - 3D Visualization</CardTitle>
                      <CardDescription className={is4K ? 'text-xl' : ''}>
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
        
        {/* Mobile action buttons */}
        {isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="fixed bottom-20 right-4 flex flex-col space-y-2"
          >
            <Button 
              variant="default" 
              size="icon" 
              onClick={handleRefreshData}
              className="rounded-full shadow-lg"
            >
              <RefreshCw size={20} />
            </Button>
            
            <Button 
              variant="default" 
              size="icon"
              onClick={handleExportData}
              className="rounded-full shadow-lg"
            >
              <Download size={20} />
            </Button>
            
            <Button 
              variant="default" 
              size="icon"
              onClick={() => handleBrowserFeature('share')}
              className="rounded-full shadow-lg"
            >
              <Share2 size={20} />
            </Button>
          </motion.div>
        )}
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