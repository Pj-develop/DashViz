'use client';
import React from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip } from "@mui/material";
import { 
  RefreshCw,
  Download,
  Share2,
  ZoomIn,
  ZoomOut, 
  Maximize,
  Printer,
  Moon,
  Sun
} from "lucide-react";
import { useAppDispatch } from '@/store/hooks';
import { fetchDashboardData } from '@/store/slices/dataSlice';
import { toast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';

// Export handler functions to make them reusable
export const useActionHandlers = () => {
  const dispatch = useAppDispatch();
  const { theme, setTheme } = useTheme();

  const handleRefreshData = () => {
    dispatch(fetchDashboardData());
    toast({
      title: "Refreshing Data",
      description: "Fetching the latest pipeline data...",
    });
  };

  const handleExportData = () => {
    try {
      // Get data from store
      const state = (window as any).__REDUX_STORE__.getState();
      const { filteredFunnelData } = state.data;
      
      // Create a CSV string from the funnel data
      const headers = ["Stage", "Count", "ACV", "Conversion Rate", "Status"];
      const csvRows = [
        headers.join(','),
        ...filteredFunnelData.map((item: any) => [
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

  const handleShare = () => {
    try {
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
    } catch (err) {
      toast({
        title: "Share Failed",
        description: "Could not share dashboard link",
        variant: "destructive",
      });
    }
  };

  const handleBrowserFeature = (feature: string) => {
    try {
      switch(feature) {
        case 'zoom-in':
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
          
        case 'fullscreen':
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
          } else {
            document.exitFullscreen();
          }
          break;
          
        case 'print':
          window.print();
          break;
          
        default:
          console.log('Feature not implemented');
      }
    } catch (err) {
      console.error("Browser feature error:", err);
      toast({
        title: "Feature Failed",
        description: "Browser function could not be executed",
        variant: "destructive",
      });
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return {
    handleRefreshData,
    handleExportData,
    handleShare,
    handleBrowserFeature,
    toggleTheme,
    currentTheme: theme
  };
};

// Desktop Action Buttons
const DesktopActions: React.FC = () => {
  const { handleRefreshData, handleExportData, handleShare, toggleTheme, currentTheme } = useActionHandlers();
  
  return (
    <div className="flex space-x-2">
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
          onClick={handleShare}
          className="flex items-center"
        >
          <Share2 size={16} className="mr-2" />
          <span className="hidden sm:inline">Share</span>
        </Button>
      </Tooltip>

      <Tooltip title="Toggle theme">
        <Button 
          variant="outline" 
          size="sm"
          onClick={toggleTheme}
          className="flex items-center"
        >
          {currentTheme === 'dark' ? (
            <Sun size={16} className="mr-2" />
          ) : (
            <Moon size={16} className="mr-2" />
          )}
          <span className="hidden sm:inline">Theme</span>
        </Button>
      </Tooltip>
    </div>
  );
};

// Mobile Floating Action Buttons
const MobileActions: React.FC = () => {
  const { handleRefreshData, handleExportData, handleShare, handleBrowserFeature, toggleTheme, currentTheme } = useActionHandlers();
  
  return (
    <div className="fixed bottom-20 right-4 flex flex-col space-y-2">
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
        onClick={handleShare}
        className="rounded-full shadow-lg"
      >
        <Share2 size={20} />
      </Button>

      <Button 
        variant="default" 
        size="icon"
        onClick={toggleTheme}
        className="rounded-full shadow-lg"
      >
        {currentTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </Button>
    </div>
  );
};

const ActionButtons = {
  Desktop: DesktopActions,
  Mobile: MobileActions,
  useActionHandlers
};

export default ActionButtons;