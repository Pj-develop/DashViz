'use client';
import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, CardHeader, Grid, Tab, Tabs, Typography, Button, useMediaQuery, CircularProgress, Alert } from '@mui/material';
import GridLegacy from '@mui/material/GridLegacy'; // Keep legacy grid import
import * as d3 from 'd3';
import FunnelChart from './FunnelChart';
import PipelineTable from './PipelineTable';
import { useTheme as useMuiTheme } from '@mui/material/styles'; 
import { useTheme } from 'next-themes'; // Add next-themes import

// Interface for the chart data
interface ChartData {
  stage: string;
  count: number;
  percentage: number;
  winRate: number;
}

// Interface for the table data
interface TableData {
  stage: string;
  cameToStage: number | string;
  lostFromStage: number | string;
  movedToNextStage: number | string;
  winRate: number | string;
}

export default function Dashboard() {
  const muiTheme = useMuiTheme();
  const { theme, setTheme } = useTheme(); // Add theme from next-themes
  const isDarkMode = theme === 'dark';
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [countData, setCountData] = useState<ChartData[]>([]);
  const [acvData, setAcvData] = useState<ChartData[]>([]);
  const [tableDataCount, setTableDataCount] = useState<TableData[]>([]);
  const [tableDataACV, setTableDataACV] = useState<TableData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Helper function to find the correct win rate from data
  const getCorrectWinRate = (data: ChartData[]): number => {
    // Look for the "Won" stage specifically
    const wonStage = data.find(item => item.stage === "Won");
    if (wonStage) {
      return wonStage.winRate;
    }
    
    // Fallback to the last item if "Won" not found
    return data.length > 0 ? data[0].winRate : 0;
  };
  
  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/data');
        
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.status}`);
        }
        
        const apiData = await response.json();
        
        // Process the API data to match our component needs
        if (apiData.funnelData) {
          // Map API data to chart data format with correct calculations
          const processedCountData: ChartData[] = apiData.funnelData.map((item: { label: string; count: number; diffRate: number; diffacvRate: number }): ChartData => ({
            stage: item.label,
            count: item.count,
            percentage: Math.round(item.diffRate * 100),
            // Make sure win rates are calculated correctly - using the API's diffacvRate
            winRate: Math.round(item.diffacvRate * 100)
          }));
          
          const processedAcvData: ChartData[] = apiData.funnelData.map((item: { label: string; acv: number; diffacvRate: number; diffRate: number }): ChartData => ({
            stage: item.label,
            count: item.acv,
            percentage: Math.round(item.diffacvRate * 100),
            // Make sure win rates are calculated correctly - using the API's diffRate
            winRate: Math.round(item.diffRate * 100)
          }));
          
          setCountData(processedCountData);
          setAcvData(processedAcvData);
          
          // Generate table data based on the chart data
          const generateTableData = (data: ChartData[], isAcv: boolean): TableData[] => {
            const result: TableData[] = [];
            let totalLost = 0;
            
            for (let i = 0; i < data.length; i++) {
              const current = data[i];
              const next = data[i + 1];
              
              const cameToStage = current.count;
              const movedToNextStage = next ? next.count : 0;
              const lostFromStage = cameToStage - movedToNextStage;
              totalLost += lostFromStage;
              
              result.push({
                stage: current.stage,
                cameToStage: isAcv ? cameToStage.toLocaleString() : cameToStage,
                lostFromStage: isAcv ? lostFromStage.toLocaleString() : lostFromStage,
                movedToNextStage: isAcv ? movedToNextStage.toLocaleString() : movedToNextStage,
                winRate: current.winRate
              });
            }
            
            // Add total row
            result.push({
              stage: 'Total',
              cameToStage: '-',
              lostFromStage: isAcv ? totalLost.toLocaleString() : totalLost,
              movedToNextStage: '-',
              winRate: '-'
            });
            
            return result;
          };
          
          setTableDataCount(generateTableData(processedCountData, false));
          setTableDataACV(generateTableData(processedAcvData, true));
        } else {
          throw new Error('API returned unexpected data format');
        }
      } catch (err) {
        console.error("Error fetching or processing data:", err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        
        // Populate with empty arrays to avoid null errors
        setCountData([]);
        setAcvData([]);
        setTableDataCount([]);
        setTableDataACV([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // Calculate correct win rates for display
  const countWinRate = getCorrectWinRate(countData);
  const acvWinRate = getCorrectWinRate(acvData);
  
  // Render loading state
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        bgcolor: isDarkMode ? '#121212' : '#f5f5f5',
        color: isDarkMode ? '#fff' : 'inherit'
      }}>
        <CircularProgress color={isDarkMode ? "secondary" : "primary"} />
        <Typography sx={{ ml: 2 }}>Loading dashboard data...</Typography>
      </Box>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Box sx={{ 
        p: 3,
        bgcolor: isDarkMode ? '#121212' : '#f5f5f5',
        color: isDarkMode ? '#fff' : 'inherit'
      }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          color={isDarkMode ? "secondary" : "primary"}
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    );
  }
  
  // Empty state check
  if (countData.length === 0) {
    return (
      <Box sx={{ 
        p: 3,
        bgcolor: isDarkMode ? '#121212' : '#f5f5f5',
        color: isDarkMode ? '#fff' : 'inherit'
      }}>
        <Alert severity="info">
          No data available for display. Please check your data source.
        </Alert>
      </Box>
    );
  }
  
  // Main dashboard layout
  return (
    <Box sx={{ 
      padding: isMobile ? 2 : 4, 
      bgcolor: isDarkMode ? '#121212' : '#f5f5f5',
      minHeight: '100vh',
      color: isDarkMode ? '#fff' : 'inherit',
      transition: 'background-color 0.3s, color 0.3s'
    }}>
      {/* Charts row - each chart takes 50% width on desktop */}
      <GridLegacy container spacing={isMobile ? 2 : 3} sx={{ mb: 3 }}>
        {/* Win Rate by Opportunity Count */}
        <GridLegacy item xs={12} md={6}>
          <Card sx={{ 
            height: '100%',
            bgcolor: isDarkMode ? '#1e1e1e' : '#fff',
            color: isDarkMode ? '#fff' : 'inherit',
            transition: 'background-color 0.3s, color 0.3s',
            boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.3)' : undefined
          }}>
            <CardHeader 
              title={`Win Rate by opportunity count: ${countWinRate}%`}
              titleTypographyProps={{ 
                variant: isMobile ? 'subtitle1' : 'h6', 
                fontWeight: 'bold',
                fontSize: isMobile ? '0.9rem' : '1.1rem',
                color: isDarkMode ? '#e0e0e0' : 'inherit'
              }}
            />
            <CardContent>
              {countData.length > 0 ? (
                <FunnelChart data={countData} valueType="count" />
              ) : (
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography>No data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </GridLegacy>
        
        {/* Win Rate by ACV */}
        <GridLegacy item xs={12} md={6}>
          <Card sx={{ 
            height: '100%',
            bgcolor: isDarkMode ? '#1e1e1e' : '#fff',
            color: isDarkMode ? '#fff' : 'inherit',
            transition: 'background-color 0.3s, color 0.3s',
            boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.3)' : undefined
          }}>
            <CardHeader 
              title={`Win Rate by ACV: ${acvWinRate}%`}
              titleTypographyProps={{ 
                variant: isMobile ? 'subtitle1' : 'h6', 
                fontWeight: 'bold',
                fontSize: isMobile ? '0.9rem' : '1.1rem',
                color: isDarkMode ? '#e0e0e0' : 'inherit'
              }}
            />
            <CardContent>
              {acvData.length > 0 ? (
                <FunnelChart data={acvData} valueType="acv" />
              ) : (
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography>No data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </GridLegacy>
      </GridLegacy>
      
      {/* Tables row - separate row for tables */}
      <GridLegacy container spacing={isMobile ? 2 : 3}>
        {/* Table for Opportunity Count */}
        <GridLegacy item xs={12} md={6}>
          <Card sx={{ 
            bgcolor: isDarkMode ? '#1e1e1e' : '#fff',
            color: isDarkMode ? '#fff' : 'inherit',
            transition: 'background-color 0.3s, color 0.3s',
            boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.3)' : undefined
          }}>
            <CardHeader
              title="Pipeline Movement - Count" 
              titleTypographyProps={{ 
                variant: isMobile ? 'subtitle1' : 'h6', 
                fontWeight: 'bold',
                fontSize: isMobile ? '0.9rem' : '1.1rem',
                color: isDarkMode ? '#e0e0e0' : 'inherit'
              }}
            />
            <CardContent>
              {tableDataCount.length > 0 ? (
                <PipelineTable data={tableDataCount} valueType="count" />
              ) : (
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography>No table data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </GridLegacy>
        
        {/* Table for ACV */}
        <GridLegacy item xs={12} md={6}>
          <Card sx={{ 
            bgcolor: isDarkMode ? '#1e1e1e' : '#fff',
            color: isDarkMode ? '#fff' : 'inherit',
            transition: 'background-color 0.3s, color 0.3s',
            boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.3)' : undefined
          }}>
            <CardHeader 
              title="Pipeline Movement - ACV" 
              titleTypographyProps={{ 
                variant: isMobile ? 'subtitle1' : 'h6', 
                fontWeight: 'bold',
                fontSize: isMobile ? '0.9rem' : '1.1rem',
                color: isDarkMode ? '#e0e0e0' : 'inherit'
              }}
            />
            <CardContent>
              {tableDataACV.length > 0 ? (
                <PipelineTable data={tableDataACV} valueType="acv" />
              ) : (
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography>No table data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </GridLegacy>
      </GridLegacy>
    </Box>
  );
}