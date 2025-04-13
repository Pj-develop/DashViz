'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchDashboardData } from '@/store/slices/dataSlice';

// Import all our modular components
import SearchBar from '@/components/dashboard/SearchBar';
import SortControls from '@/components/dashboard/SortControl';
import TabsContainer from '@/components/dashboard/TabsContainer';
import StatusCards from '@/components/dashboard/StatusCard';
import ActionButtons from '@/components/dashboard/ActionButton';
import GenieAssistant from '@/components/ui/genie-assistant';
import ClientOnly from "@/components/ui/client-only";

/**
 * Main Dashboard Page Component - with Redux and component separation
 * 
 * This component is now much cleaner, with most of the complex logic
 * moved to dedicated components and Redux state management.
 */
export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // Get data from Redux store
  const { loading, error } = useAppSelector(state => state.data);
  const actionHandlers = ActionButtons.useActionHandlers();
  
  // Window size for responsive UI
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });
  
  const is4K = windowSize.width >= 3840;
  const isMobile = windowSize.width <= 768;
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchDashboardData());
    
    // Add smooth scrolling for better UX
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Set theme to a softer light theme if needed
    if (theme === 'light') {
      document.documentElement.classList.add('soft-light');
    }
    
    // Cleanup function
    return () => {
      document.documentElement.style.scrollBehavior = '';
      document.documentElement.classList.remove('soft-light');
    };
  }, [dispatch, theme]);
  
  // Handle loading state
  if (loading) {
    return <StatusCards.Loading />;
  }
  
  // Handle error state
  if (error) {
    return <StatusCards.Error error={error} />;
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
            <h1 className={`text-3xl ${is4K ? 'text-5xl' : ''} font-bold text-gray-900 dark:text-white`}>
              Sales Performance Dashboard
            </h1>
            <p className={`mt-1 text-gray-500 dark:text-gray-400 ${is4K ? 'text-xl' : ''}`}>
              Interactive visualization of sales pipeline data
            </p>
          </motion.div>
          
          {/* Action buttons for desktop */}
          {!isMobile && <ActionButtons.Desktop />}
        </div>

        {/* Search and sort controls */}
        <motion.div 
          className="w-full flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <SearchBar isDarkMode={isDarkMode} />
          <SortControls isMobile={isMobile} />
        </motion.div>

        {/* Chart Selection Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <TabsContainer is4K={is4K} isMobile={isMobile} />
        </motion.div>
        
        {/* Mobile action buttons */}
        {isMobile && <ActionButtons.Mobile />}
      </motion.div>
      
      {/* Genie Assistant */}
      <ClientOnly>
        <GenieAssistant 
          onNavigate={destination => {
            switch(destination) {
              case 'dashboard':
                // Dashboard operations
                break;
              case 'funnel':
              case '3d-viz':
              case 'tabular':
                // View switching operations
                break;
              case 'export-data':
                actionHandlers.handleExportData();
                break;
              case 'refresh-data':
                actionHandlers.handleRefreshData();
                break;
              case 'share':
                actionHandlers.handleShare();
                break;
              case 'toggle-theme':
                actionHandlers.toggleTheme();
                break;
              default:
                console.log('Command not recognized');
            }
          }}
          onBrowserFeature={actionHandlers.handleBrowserFeature}
        />
      </ClientOnly>
    </div>
  );
}