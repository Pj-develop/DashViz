"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, X, HelpCircle, Lightbulb, 
  Maximize, Printer, Type, ZoomIn, ZoomOut
} from 'lucide-react';
import { useTheme } from 'next-themes';

interface GenieProps {
  onNavigate: (destination: string) => void;
  onBrowserFeature: (feature: string) => void;
}

export default function GenieAssistant({ onNavigate, onBrowserFeature }: GenieProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'browser'>('dashboard');
  const { theme } = useTheme();
  
  const togglePopup = () => {
    setShowPopup(!showPopup);
  };
  
  return (
    <>
      {/* Fixed button */}
      <motion.button
        className={`fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-lg 
                   ${theme === 'dark' ? 'bg-indigo-600 text-white' : 'bg-indigo-500 text-white'}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={togglePopup}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label="Get assistance"
      >
        <Sparkles size={24} />
        
        {showTooltip && !showPopup && (
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded shadow whitespace-nowrap text-sm">
            Dashboard Assistant
          </div>
        )}
      </motion.button>
      
      {/* Enhanced popup dialog */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md mx-4 border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold flex items-center">
                <Sparkles size={20} className="mr-2 text-indigo-500" />
                Dashboard Assistant
              </h3>
              <button 
                onClick={togglePopup}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Tabs for different assistant features */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-2 px-4 ${
                  activeTab === 'dashboard' 
                    ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Dashboard Help
              </button>
              <button
                onClick={() => setActiveTab('browser')}
                className={`py-2 px-4 ${
                  activeTab === 'browser' 
                    ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Browser Tools
              </button>
            </div>
            
            {/* Content based on active tab */}
            <div className="space-y-4">
              {activeTab === 'dashboard' ? (
                <>
                  <p className="text-gray-600 dark:text-gray-300">
                    How can I help you with the dashboard today?
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    <button 
                      onClick={() => {
                        onNavigate('dashboard');
                        setShowPopup(false);
                      }}
                      className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <HelpCircle size={18} className="mr-2 text-indigo-500" />
                      <span>Explain this dashboard</span>
                    </button>
                    <button 
                      onClick={() => {
                        onNavigate('funnel');
                        setShowPopup(false);
                      }}
                      className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <HelpCircle size={18} className="mr-2 text-indigo-500" />
                      <span>Show sales funnel</span>
                    </button>
                    <button 
                      onClick={() => {
                        onNavigate('3d-viz');
                        setShowPopup(false);
                      }}
                      className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <HelpCircle size={18} className="mr-2 text-indigo-500" />
                      <span>Show 3D visualization</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-gray-600 dark:text-gray-300">
                    Browser tools and accessibility features:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => {
                        onBrowserFeature('zoom-in');
                      }}
                      className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <ZoomIn size={18} className="mr-2 text-indigo-500" />
                      <span>Zoom In</span>
                    </button>
                    <button 
                      onClick={() => {
                        onBrowserFeature('zoom-out');
                      }}
                      className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <ZoomOut size={18} className="mr-2 text-indigo-500" />
                      <span>Zoom Out</span>
                    </button>
                    <button 
                      onClick={() => {
                        onBrowserFeature('reader-mode');
                      }}
                      className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Type size={18} className="mr-2 text-indigo-500" />
                      <span>Reader Mode</span>
                    </button>
                    <button 
                      onClick={() => {
                        onBrowserFeature('print');
                      }}
                      className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Printer size={18} className="mr-2 text-indigo-500" />
                      <span>Print Page</span>
                    </button>
                    <button 
                      onClick={() => {
                        onBrowserFeature('fullscreen');
                      }}
                      className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors col-span-2"
                    >
                      <Maximize size={18} className="mr-2 text-indigo-500" />
                      <span>Toggle Fullscreen</span>
                    </button>
                  </div>
                </>
              )}
            </div>
            
            {/* Tips and keyboard shortcuts */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Lightbulb size={14} className="mr-1 text-yellow-500" />
                <span>
                  <strong>Tip:</strong> Use keyboard shortcuts - Ctrl+P to print, Ctrl+F to find.
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}